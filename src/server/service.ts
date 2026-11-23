import { TRPCError } from '@trpc/server';
import { createConversation, expireMessages, sendMessage, viewFor } from '../shared/game';
import type { ProfileInput } from '../shared/input';
import type { Choice, GameState, Profile, PublicProfile, RoundResult, UserId } from '../shared/types';
import {
  loadConv,
  loadProfile,
  loadQueue,
  loadUser,
  saveConv,
  saveProfile,
  saveQueue,
  saveUser,
} from './store';

const round2 = (n: number) => Math.round(n * 100) / 100;

// Add each resolved round's point changes to the players' balances.
async function creditResults(results: RoundResult[]): Promise<void> {
  for (const result of results) {
    for (const [playerId, delta] of Object.entries(result.deltas)) {
      const user = await loadUser(playerId);
      user.balance = round2(user.balance + delta);
      await saveUser(user);
    }
  }
}

// Other players only see what the owner has chosen to share.
async function publicProfileOf(userId: UserId): Promise<PublicProfile> {
  const profile = await loadProfile(userId);
  if (!profile.showAccount) return { shown: false, name: null, status: '', avatar: null };
  return { shown: true, name: userId, status: profile.status, avatar: profile.avatar };
}

async function stateFor(userId: UserId): Promise<GameState> {
  const user = await loadUser(userId);
  if (!user.convId) {
    const queued = (await loadQueue()).includes(userId);
    return { status: queued ? 'queued' : 'idle', balance: user.balance };
  }

  const conv = await loadConv(user.convId);
  if (!conv) return { status: 'idle', balance: user.balance };

  const now = Date.now();
  const results = expireMessages(conv, now);
  await creditResults(results);
  await saveConv(conv);

  const partnerId = conv.players.find(p => p !== userId);
  const partner = partnerId ? await publicProfileOf(partnerId) : undefined;

  const { balance } = await loadUser(userId);
  return { status: 'matched', balance, conversation: viewFor(conv, userId, now, partner) };
}

export function getState(userId: UserId): Promise<GameState> {
  return stateFor(userId);
}

export async function joinQueue(userId: UserId): Promise<GameState> {
  const user = await loadUser(userId);
  if (user.convId) {
    const current = await loadConv(user.convId);
    if (current?.status === 'active') return stateFor(userId);
    user.convId = null; // previous conversation is over
    await saveUser(user);
  }

  const queue = await loadQueue();
  const partnerId = queue.find(id => id !== userId);
  if (!partnerId) {
    if (!queue.includes(userId)) queue.push(userId);
    await saveQueue(queue);
    return stateFor(userId);
  }

  await saveQueue(queue.filter(id => id !== partnerId && id !== userId));
  const partner = await loadUser(partnerId);
  const conv = createConversation(partnerId, userId);
  partner.convId = conv.id;
  user.convId = conv.id;
  await saveConv(conv);
  await saveUser(partner);
  await saveUser(user);
  return stateFor(userId);
}

export async function leaveQueue(userId: UserId): Promise<GameState> {
  await saveQueue((await loadQueue()).filter(id => id !== userId));
  return stateFor(userId);
}

export async function send(
  userId: UserId,
  text: string,
  choice: Choice,
): Promise<GameState & { posted: boolean }> {
  const user = await loadUser(userId);
  const conv = user.convId ? await loadConv(user.convId) : undefined;
  if (!conv) throw new TRPCError({ code: 'CONFLICT', message: 'You are not in a conversation.' });

  const { results, posted } = sendMessage(conv, userId, text, choice, Date.now());
  await creditResults(results);
  await saveConv(conv);

  const state = await stateFor(userId);
  return { ...state, posted };
}

export async function getProfile(userId: UserId): Promise<Profile> {
  return loadProfile(userId);
}

export async function setProfile(userId: UserId, input: ProfileInput): Promise<Profile> {
  const profile: Profile = {
    status: input.status,
    avatar: input.avatar,
    showAccount: input.showAccount,
  };
  await saveProfile(userId, profile);
  return profile;
}
