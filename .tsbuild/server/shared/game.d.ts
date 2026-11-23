import type { Choice, Conversation, ConversationView, PublicProfile, RoundResult, SendOutcome, UserId } from './types.ts';
export declare function createConversation(a: UserId, b: UserId): Conversation;
export declare function expireMessages(conv: Conversation, now: number): RoundResult[];
export declare function sendMessage(conv: Conversation, sender: UserId, text: string, choice: Choice, now: number): SendOutcome;
export declare function viewFor(conv: Conversation, userId: UserId, now: number, partner?: PublicProfile): ConversationView;
