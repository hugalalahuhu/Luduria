import { isChoice, MAX_AVATAR_CHARS, MAX_MESSAGE_LENGTH, MAX_STATUS_LENGTH } from './rules.ts';
import type { Choice } from './types.ts';

export type SendInput = { text: string; choice: Choice };
export type ProfileInput = { status: string; avatar: string | null; showAccount: boolean };

// Validates untrusted input from the client. Throws on bad input.
export function parseSendInput(raw: unknown): SendInput {
  if (typeof raw !== 'object' || raw === null || !('text' in raw) || !('choice' in raw)) {
    throw new Error('Expected { text, choice }');
  }
  const { text, choice } = raw;
  if (typeof text !== 'string') throw new Error('Message must be text.');

  const trimmed = text.trim();
  if (trimmed === '') throw new Error('Write a message first.');
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Keep messages under ${MAX_MESSAGE_LENGTH} characters.`);
  }
  if (!isChoice(choice)) throw new Error('Choose Stay or Skip.');

  return { text: trimmed, choice };
}

const AVATAR_PATTERN = /^data:image\/(jpeg|png);base64,/;

export function parseProfileInput(raw: unknown): ProfileInput {
  if (
    typeof raw !== 'object' ||
    raw === null ||
    !('status' in raw) ||
    !('avatar' in raw) ||
    !('showAccount' in raw)
  ) {
    throw new Error('Expected { status, avatar, showAccount }');
  }
  const { status, avatar, showAccount } = raw;

  if (typeof status !== 'string') throw new Error('Status must be text.');
  const trimmedStatus = status.trim();
  if (trimmedStatus.length > MAX_STATUS_LENGTH) {
    throw new Error(`Status must be ${MAX_STATUS_LENGTH} characters or fewer.`);
  }

  let safeAvatar: string | null = null;
  if (avatar !== null) {
    if (typeof avatar !== 'string' || !AVATAR_PATTERN.test(avatar) || avatar.length > MAX_AVATAR_CHARS) {
      throw new Error('Picture must be a small JPEG or PNG.');
    }
    safeAvatar = avatar;
  }

  if (typeof showAccount !== 'boolean') throw new Error('showAccount must be true or false.');

  return { status: trimmedStatus, avatar: safeAvatar, showAccount };
}
