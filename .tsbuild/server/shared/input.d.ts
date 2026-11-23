import type { Choice } from './types.ts';
export type SendInput = {
    text: string;
    choice: Choice;
};
export type ProfileInput = {
    status: string;
    avatar: string | null;
    showAccount: boolean;
};
export declare function parseSendInput(raw: unknown): SendInput;
export declare function parseProfileInput(raw: unknown): ProfileInput;
