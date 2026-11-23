export type Choice = 'stay' | 'skip';
export type UserId = string;

export type OpenMessage = {
  id: string;
  sender: UserId;
  text: string;
  choice: Choice;
  deadline: number;
};

export type PostedMessage = {
  id: string;
  sender: UserId;
  text: string;
  postedAt: number;
};

export type RoundResult = {
  id: string;
  deltas: Record<UserId, number>;
};

export type Conversation = {
  id: string;
  players: [UserId, UserId];
  status: 'active' | 'ended';
  messageCount: number;
  messages: PostedMessage[];
  open: Record<UserId, OpenMessage[]>;
  results: RoundResult[];
};

export type SendOutcome = {
  results: RoundResult[];
  posted: boolean;
};

// A player's own profile, as stored.
export type Profile = {
  status: string;
  avatar: string | null;
  showAccount: boolean;
};

// What the other player may see. Hidden profiles show nothing except that a stranger exists.
export type PublicProfile = {
  shown: boolean;
  name: string | null;
  status: string;
  avatar: string | null;
};

// Choices are never included, only point changes.
export type WindowView = { id: string; remainingMs: number };

export type ConversationView = {
  status: 'active' | 'ended';
  messages: { id: string; mine: boolean; text: string }[];
  incoming: WindowView[];
  outgoing: WindowView[];
  nextWindowMs: number;
  results: { id: string; delta: number }[];
  partner: PublicProfile;
};

export type GameState =
  | { status: 'idle'; balance: number }
  | { status: 'queued'; balance: number }
  | { status: 'matched'; balance: number; conversation: ConversationView };
