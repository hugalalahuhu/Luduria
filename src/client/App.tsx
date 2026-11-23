import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Chat } from './Chat';
import { Profile } from './Profile';
import { trpc } from './trpc';
import type { GameState } from '../shared/types';

const POLL_MS = 1000;

type Screen = 'home' | 'profile';

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong.';
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<GameState | null>(null);
  const [receivedAt, setReceivedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = useCallback((next: GameState) => {
    setState(next);
    setReceivedAt(Date.now());
    setError(null);
  }, []);

  // Polling also moves the game forward: the server resolves expired reply
  // windows on every read, so a silent opponent's round closes here.
  useEffect(() => {
    let alive = true;
    const poll = () =>
      trpc.game.state
        .query()
        .then(next => {
          if (alive) apply(next);
        })
        .catch((e: unknown) => {
          if (alive) setError(messageOf(e));
        });
    void poll();
    const id = setInterval(() => void poll(), POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [apply]);

  async function run<T extends GameState>(action: () => Promise<T>): Promise<T | undefined> {
    setBusy(true);
    try {
      const next = await action();
      apply(next);
      return next;
    } catch (e) {
      setError(messageOf(e));
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  let body: ReactNode;
  if (screen === 'profile') {
    body = <Profile onBack={() => setScreen('home')} />;
  } else if (!state) {
    body = <p className="muted">Connecting…</p>;
  } else if (state.status === 'idle') {
    body = (
      <div className="panel">
        <div className="muted">Balance: {state.balance.toFixed(2)} pts</div>
        <div className="row">
          <button
            className="btn btn-primary grow"
            disabled={busy}
            onClick={() => void run(() => trpc.game.join.mutate())}
          >
            Find a stranger
          </button>
          <button className="btn" onClick={() => setScreen('profile')}>
            Profile
          </button>
        </div>
      </div>
    );
  } else if (state.status === 'queued') {
    body = (
      <div className="panel">
        <div className="muted">Waiting for a stranger…</div>
        <button
          className="btn"
          disabled={busy}
          onClick={() => void run(() => trpc.game.leave.mutate())}
        >
          Cancel
        </button>
      </div>
    );
  } else {
    body = (
      <Chat
        conversation={state.conversation}
        balance={state.balance}
        receivedAt={receivedAt}
        busy={busy}
        onSend={(text, choice) => run(() => trpc.game.send.mutate({ text, choice }))}
        onNext={() => void run(() => trpc.game.join.mutate())}
      />
    );
  }

  return (
    <div className="app">
      <div className="title">
        <span>Luduria</span>
      </div>
      {error && <div className="error">{error}</div>}
      {body}
    </div>
  );
}