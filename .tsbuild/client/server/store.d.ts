import type { Conversation, Profile, UserId } from '../shared/types.ts';
export type User = {
    id: UserId;
    balance: number;
    convId: string | null;
};
export declare function loadUser(id: UserId): Promise<User>;
export declare const saveUser: (user: User) => Promise<string>;
export declare const loadConv: (id: string) => Promise<Conversation | undefined>;
export declare const saveConv: (conv: Conversation) => Promise<string>;
export declare function loadQueue(): Promise<UserId[]>;
export declare const saveQueue: (queue: UserId[]) => Promise<string>;
export declare function loadProfile(username: UserId): Promise<Profile>;
export declare const saveProfile: (username: UserId, profile: Profile) => Promise<string>;
