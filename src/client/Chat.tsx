import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { MAX_MESSAGE_LENGTH } from '../shared/rules';
import type { Choice, ConversationView, WindowView } from '../shared/types';

type Props = {
  conversation: ConversationView;
  balance: number;
  receivedAt: number;
  busy: boolean;
  onSend: (text: string, choice: Choice) => Promise<{ posted: boolean } | undefined>;
  onNext: () => void;
};

const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
const secs = (ms: number) => (ms / 1000).toFixed(1);

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function Chat({ conversation, balance, receivedAt, busy, onSend, onNext }: Props) {
  const [text, setText] = useState('');
  const now = useNow(100);
  const elapsed = now - receivedAt;
  const left = (w: WindowView) => Math.max(0, w.remainingMs - elapsed);

  const ended = conversation.status === 'ended';
  const incoming = conversation.incoming[0];
  const outgoing = conversation.outgoing[0];
  const partner = conversation.partner;

  let status = 'Send a message to start a round.';
  if (ended) status = 'Conversation ended.';
  else if (incoming) status = `Reply within ${secs(left(incoming))}s`;
  else if (outgoing) status = `Waiting on their reply · ${secs(left(outgoing))}s`;

  async function send(choice: Choice) {
    const body = text.trim();
    if (!body || busy) return;
    const res = await onSend(body, choice);
    if (res?.posted) setText('');
  }

  // Enter = send + Stay, Esc = send + Skip, Shift+Enter = new line.
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send('stay');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      void send('skip');
    }
  }

  return (
    <div className="app" style={{ padding: 0, minHeight: 0 }}>
      <div className="row">
        {partner.shown && partner.avatar && (
          <img className="avatar" src={partner.avatar} alt="" />
        )}
        <div className="grow">
          <div>{partner.shown ? partner.name : 'Stranger'}</div>
          {partner.shown && partner.status && <div className="muted">{partner.status}</div>}
        </div>
        <span>{balance.toFixed(2)} pts</span>
      </div>

      <div className="status-line">{status}</div>

      <div className="log">
        {conversation.messages.map(m => (
          <div key={m.id} className={`bubble ${m.mine ? 'mine' : 'theirs'}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="results">
        {conversation.results.map(r => (
          <span key={r.id} className={r.delta > 0 ? 'good' : 'bad'}>
            {fmt(r.delta)}
          </span>
        ))}
      </div>

      {ended ? (
        <button className="btn btn-primary" disabled={busy} onClick={onNext}>
          Find another stranger
        </button>
      ) : (
        <div className="panel">
          <textarea
            className="field"
            value={text}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Say something"
            onChange={e => setText(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="row">
            <button
              className="btn btn-primary grow"
              disabled={!text.trim() || busy}
              onClick={() => void send('stay')}
            >
              Stay
            </button>
            <button
              className="btn grow"
              disabled={!text.trim() || busy}
              onClick={() => void send('skip')}
            >
             Skip
            </button>
          </div>
          <div className="muted">
            Enter: Stay · Esc: Skip · Shift+Enter: new line · next window{' '}
            {secs(conversation.nextWindowMs)}s
          </div>
        </div>
      )}
    </div>
  );
}
