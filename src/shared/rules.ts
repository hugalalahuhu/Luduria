import type { Choice } from './types.ts';

// Game constants. Change timing and payoffs here.

export const CHOICES: readonly Choice[] = ['stay', 'skip'];

export function isChoice(value: unknown): value is Choice {
  return typeof value === 'string' && CHOICES.some(c => c === value);
}

// PAYOFF[mine][theirs] = points for the player who chose `mine`.
export const PAYOFF: Record<Choice, Record<Choice, number>> = {
  stay: { stay: 3, skip: -5 },
  skip: { stay: 5, skip: 1 },
};

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_MESSAGES_KEPT = 200;
export const MAX_RESULTS_KEPT = 50;
export const MAX_RESULTS_SHOWN = 5;

// Reply window for the Nth message in a conversation (N starts at 1).
// Placeholder: 3s for the first message, +1s each message, capped at 30s.
// Replace with the final schedule (growing, shrinking after 5, or random).
export function windowMsFor(messageIndex: number): number {
  return Math.min(3 + (messageIndex - 1), 30) * 1000;
}

export const MAX_STATUS_LENGTH = 60;
// Base64 length cap for the picture. A 96x96 JPEG is usually well under this.
export const MAX_AVATAR_CHARS = 20000;
