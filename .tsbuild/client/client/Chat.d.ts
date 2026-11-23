import type { Choice, ConversationView } from '../shared/types';
type Props = {
    conversation: ConversationView;
    balance: number;
    receivedAt: number;
    busy: boolean;
    onSend: (text: string, choice: Choice) => Promise<{
        posted: boolean;
    } | undefined>;
    onNext: () => void;
};
export declare function Chat({ conversation, balance, receivedAt, busy, onSend, onNext }: Props): import("react").JSX.Element;
export {};
