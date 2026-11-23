import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { MAX_STATUS_LENGTH } from '../shared/rules';
import { trpc } from './trpc';

const AVATAR_PX = 96;

function messageOf(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong.';
}

// Crops to a square, scales to 96x96, and returns a small JPEG data URL.
// The original file never leaves the device.
function toAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = AVATAR_PX;
      canvas.height = AVATAR_PX;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Image editing is not supported here.'));
        return;
      }
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_PX, AVATAR_PX);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
  });
}

export function Profile({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    trpc.profile.get
      .query()
      .then(p => {
        if (!alive) return;
        setStatus(p.status);
        setAvatar(p.avatar);
        setShowAccount(p.showAccount);
        setLoaded(true);
      })
      .catch((e: unknown) => {
        if (alive) setMessage(messageOf(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatar(await toAvatarDataUrl(file));
      setMessage(null);
    } catch (err) {
      setMessage(messageOf(err));
    }
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      await trpc.profile.save.mutate({ status: status.trim(), avatar, showAccount });
      setMessage('Saved.');
    } catch (e) {
      setMessage(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <div className="row">
        {avatar ? (
          <img className="avatar avatar-lg" src={avatar} alt="Your picture" />
        ) : (
          <div className="avatar avatar-lg" />
        )}
        <div className="grow">
          <input type="file" accept="image/*" onChange={onFile} />
          <div className="muted">Cropped and resized to 96×96 on your device.</div>
        </div>
      </div>

      <label className="muted">
        Status ({status.length}/{MAX_STATUS_LENGTH})
      </label>
      <input
        className="field"
        maxLength={MAX_STATUS_LENGTH}
        value={status}
        placeholder="A short status"
        onChange={e => setStatus(e.target.value)}
      />

      <label className="row">
        <input
          type="checkbox"
          checked={showAccount}
          onChange={e => setShowAccount(e.target.checked)}
        />
        Show my account to strangers (name, status, picture)
      </label>

      <div className="row">
        <button className="btn btn-primary grow" disabled={!loaded || busy} onClick={() => void save()}>
          Save
        </button>
        <button className="btn" onClick={onBack}>
          Back
        </button>
      </div>

      {message && <div className="muted">{message}</div>}
    </div>
  );
}
