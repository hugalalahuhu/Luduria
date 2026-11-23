import { redis } from '@devvit/web/server';
import type { Conversation, Profile, UserId } from '../shared/types.ts';

export type User = { id: UserId; balance: number; convId: string | null };

const readJson = async <T>(key: string): Promise<T | undefined> => {
  const raw = await redis.get(key);
  if (!raw) return undefined;
  const value: T = JSON.parse(raw);
  return value;
};

const writeJson = (key: string, value: unknown) => redis.set(key, JSON.stringify(value));

export async function loadUser(id: UserId): Promise<User> {
  return (await readJson<User>(`user:${id}`)) ?? { id, balance: 0, convId: null };
}
export const saveUser = (user: User) => writeJson(`user:${user.id}`, user);

export const loadConv = (id: string) => readJson<Conversation>(`conv:${id}`);
export const saveConv = (conv: Conversation) => writeJson(`conv:${conv.id}`, conv);

export async function loadQueue(): Promise<UserId[]> {
  return (await readJson<UserId[]>('queue')) ?? [];
}
export const saveQueue = (queue: UserId[]) => writeJson('queue', queue);

export async function loadProfile(username: UserId): Promise<Profile> {
  return (await readJson<Profile>(`profile:${username}`)) ?? { status: '', avatar: null, showAccount: false };
}
export const saveProfile = (username: UserId, profile: Profile) =>
  writeJson(`profile:${username}`, profile);
