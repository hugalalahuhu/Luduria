import {
  MAX_MESSAGES_KEPT,
  MAX_RESULTS_KEPT,
  MAX_RESULTS_SHOWN,
  PAYOFF,
  windowMsFor,
} from './rules.ts';
import type {
  Choice,
  Conversation,
  ConversationView,
  OpenMessage,
  PublicProfile,
  RoundResult,
  SendOutcome,
  UserId,
  WindowView,
} from './types.ts';

// A round is one message plus its reply. If no reply arrives in the window,
// the silent player is treated as having chosen Skip.
// Every message opens a window for the other player. A new message answers the
// oldest open message from the other player (first in, first out).

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function createConversation(a: UserId, b: UserId): Conversation {
  return {
    id: crypto.randomUUID(),
    players: [a, b],
    status: 'active',
    messageCount: 0,
    messages: [],
    open: { [a]: [], [b]: [] },
    results: [],
  };
}

function otherPlayer(conv: Conversation, userId: UserId): UserId {
  const other = conv.players.find(p => p !== userId);
  if (!other) throw new Error('Conversation has no second player');
  return other;
}

function resolveRound(
  conv: Conversation,
  opener: OpenMessage,
  replierId: UserId,
  replierChoice: Choice,
): RoundResult {
  conv.open[opener.sender] = conv.open[opener.sender].filter(m => m.id !== opener.id);

  const result: RoundResult = {
    id: crypto.randomUUID(),
    deltas: {
      [opener.sender]: round2(PAYOFF[opener.choice][replierChoice]),
      [replierId]: round2(PAYOFF[replierChoice][opener.choice]),
    },
  };
  conv.results = [...conv.results, result].slice(-MAX_RESULTS_KEPT);

  if (opener.choice === 'skip' && replierChoice === 'skip') {
    conv.status = 'ended';
    conv.open = { [conv.players[0]]: [], [conv.players[1]]: [] };
  }
  return result;
}

// Resolve every window that has closed. Each timeout counts as a Skip.
export function expireMessages(conv: Conversation, now: number): RoundResult[] {
  const expired = conv.players
    .flatMap(p => conv.open[p])
    .filter(m => m.deadline <= now)
    .sort((x, y) => x.deadline - y.deadline);

  const results: RoundResult[] = [];
  for (const m of expired) {
    if (conv.status !== 'active') break;
    results.push(resolveRound(conv, m, otherPlayer(conv, m.sender), 'skip'));
  }
  return results;
}

// Post a message. It answers the oldest open message from the other player, if any,
// and then opens its own reply window.
export function sendMessage(
  conv: Conversation,
  sender: UserId,
  text: string,
  choice: Choice,
  now: number,
): SendOutcome {
  const results = expireMessages(conv, now);
  if (conv.status !== 'active') return { results, posted: false };

  const other = otherPlayer(conv, sender);
  conv.messageCount += 1;
  const msg: OpenMessage = {
    id: crypto.randomUUID(),
    sender,
    text,
    choice,
    deadline: now + windowMsFor(conv.messageCount),
  };
  conv.messages = [...conv.messages, { id: msg.id, sender, text, postedAt: now }].slice(
    -MAX_MESSAGES_KEPT,
  );

  const oldest = conv.open[other][0];
  if (oldest) results.push(resolveRound(conv, oldest, sender, choice));

  if (conv.status === 'active') conv.open[sender] = [...conv.open[sender], msg];
  return { results, posted: true };
}

export function viewFor(
  conv: Conversation,
  userId: UserId,
  now: number,
  partner: PublicProfile = { shown: false, name: null, status: '', avatar: null },
): ConversationView {
  const other = otherPlayer(conv, userId);
  const toWindow = (m: OpenMessage): WindowView => ({
    id: m.id,
    remainingMs: Math.max(0, m.deadline - now),
  });

  return {
    status: conv.status,
    messages: conv.messages.map(m => ({ id: m.id, mine: m.sender === userId, text: m.text })),
    incoming: conv.open[other].map(toWindow),
    outgoing: conv.open[userId].map(toWindow),
    nextWindowMs: windowMsFor(conv.messageCount + 1),
    results: conv.results
      .slice(-MAX_RESULTS_SHOWN)
      .map(r => ({ id: r.id, delta: r.deltas[userId] ?? 0 })),
    partner,
  };
}