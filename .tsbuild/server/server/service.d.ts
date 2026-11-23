import type { ProfileInput } from '../shared/input';
import type { Choice, GameState, Profile, UserId } from '../shared/types';
export declare function getState(userId: UserId): Promise<GameState>;
export declare function joinQueue(userId: UserId): Promise<GameState>;
export declare function leaveQueue(userId: UserId): Promise<GameState>;
export declare function send(userId: UserId, text: string, choice: Choice): Promise<GameState & {
    posted: boolean;
}>;
export declare function getProfile(userId: UserId): Promise<Profile>;
export declare function setProfile(userId: UserId, input: ProfileInput): Promise<Profile>;
