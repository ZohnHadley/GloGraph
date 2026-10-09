import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import Modal from './Modal';
import { api } from '../lib/api';
import { generateUsername } from '../lib/username';
import { generateJoinToken } from '../lib/token';

export type SessionRole = 'read-only' | 'editor';

interface HostSessionDialogProps {
  onConfirm: (info: { name: string; token: string; role: SessionRole; fingerprint: string }) => void;
  onCancel: () => void;
}

const MAX_LEN = 40;

/**
 * Host-side gate. Step 1 collects display name, join token, and access level.
 * On "Start hosting" it actually starts the (TLS) session — which generates the
 * cert — then Step 2 shows the **shareable address (with the cert fingerprint
 * folded in as `ip:port#fingerprint`)** plus the token for the host to hand out.
 * Guests need both; the fingerprint lets them pin the host's self-signed cert.
 */
export default function HostSessionDialog({ onConfirm, onCancel }: HostSessionDialogProps) {
  const [name, setName] = useState('');
  const [token, setToken] = useState(generateJoinToken());
  const [role, setRole] = useState<SessionRole>('read-only');
  const [address, setAddress] = useState('…');
  const [copied, setCopied] = useState<'token' | 'address' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Step 2: set once the session is started; the address here includes the fp.
  const [shareAddress, setShareAddress] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    api.getDisplayName()
      .then(n => { if (!cancelled) setName(n && n.trim() ? n : generateUsername()); })
      .catch(() => { if (!cancelled) setName(generateUsername()); });
    api.getLanAddress()
      .then(a => { if (!cancelled && a) setAddress(a); })
      .catch(() => { if (!cancelled) setAddress('unavailable'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { nameRef.current?.focus(); nameRef.current?.select(); }, 10);
    return () => clearTimeout(t);
  }, []);

  async function copy(value: string, which: 'token' | 'address') {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(c => (c === which ? null : c)), 1500);
    } catch { /* ignore */ }
  }

  const trimmedName = name.trim();
  const valid = trimmedName.length > 0 && trimmedName.length <= MAX_LEN && token.trim().length > 0;

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try { await api.setDisplayName(trimmedName); } catch { /* best-effort */ }
    try {
      const { fingerprint: fp } = await api.startHostSession(token.trim(), role);
      setFingerprint(fp);
      setShareAddress(`${address}#${fp}`);
    } catch (err) {
      setError(`${err}`);
      setBusy(false);
    }
  }

  function handleDone() {
    onConfirm({ name: trimmedName, token: token.trim(), role, fingerprint });
  }

  // ── Step 2: session started, show what to share ──
  if (shareAddress) {
    return (
      <Modal title="Session started" size="sm" onClose={handleDone}>
        <div className="modal-body">
          <p className="form-hint" style={{ marginTop: 0 }}>
            Hosting over TLS. Send a guest the address and token below — they need both to join, and the
            address carries the certificate fingerprint that secures the connection.
          </p>
          <div className="form-group">
            <label>Address to share</label>
            <div className="field-row">
              <input className="input--mono" value={shareAddress} readOnly spellCheck={false} />
              <button type="button" className="icon-btn" title={copied === 'address' ? 'Copied!' : 'Copy address'} onClick={() => copy(shareAddress, 'address')}>
                {copied === 'address' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Join token</label>
            <div className="field-row">
              <input className="input--mono" value={token} readOnly spellCheck={false} />
              <button type="button" className="icon-btn" title={copied === 'token' ? 'Copied!' : 'Copy token'} onClick={() => copy(token, 'token')}>
                {copied === 'token' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn--primary btn--sm" onClick={handleDone}>Done</button>
        </div>
      </Modal>
    );
  }

  // ── Step 1: setup ──
  return (
    <Modal title="Host a session" size="sm" onClose={onCancel}>
      <form onSubmit={handleStart}>
        <div className="modal-body">
          {error && <div className="modal-error">{error}</div>}
          <div className="form-group">
            <label>Display name</label>
            <div className="field-row">
              <input
                ref={nameRef}
                placeholder="e.g. Alex"
                value={name}
                maxLength={MAX_LEN}
                onChange={e => setName(e.target.value)}
                spellCheck={false}
              />
              <button type="button" className="icon-btn" title="Suggest another name" onClick={() => setName(generateUsername())}>
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Join token</label>
            <div className="field-row">
              <input className="input--mono" value={token} onChange={e => setToken(e.target.value)} spellCheck={false} />
              <button type="button" className="icon-btn" title="Generate a new token" onClick={() => setToken(generateJoinToken())}>
                <RefreshCw size={14} />
              </button>
            </div>
            <p className="form-hint">You'll get a shareable address (with the security fingerprint) once you start.</p>
          </div>

          <div className="form-group">
            <label>Access</label>
            <select value={role} onChange={e => setRole(e.target.value as SessionRole)}>
              <option value="read-only">View only — guests watch live</option>
              <option value="editor">Everyone can edit — guests can change the graph</option>
            </select>
            <p className="form-hint">
              {role === 'editor'
                ? 'Guests can add, move, edit and delete. Their changes write straight to your project.'
                : 'Guests see your graph update live but cannot change it.'}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn--primary btn--sm" disabled={!valid || busy}>
            {busy ? 'Starting…' : 'Start hosting'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
