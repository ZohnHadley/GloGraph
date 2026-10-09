import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Modal from './Modal';
import { api } from '../lib/api';
import { generateUsername } from '../lib/username';

interface JoinSessionDialogProps {
  onConfirm: (info: { address: string; token: string; name: string }) => void;
  onCancel: () => void;
}

const MAX_LEN = 40;

/**
 * The join-side gate. Like hosting, joining requires a display name — generated
 * and pre-filled, kept or edited — and additionally the host's address + join
 * token to connect to. `onConfirm` hands back address + token + name so the
 * caller can open the live session against the host.
 */
export default function JoinSessionDialog({ onConfirm, onCancel }: JoinSessionDialogProps) {
  const [address, setAddress] = useState('');
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const addrRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    api.getDisplayName()
      .then(n => { if (!cancelled) setName(n && n.trim() ? n : generateUsername()); })
      .catch(() => { if (!cancelled) setName(generateUsername()); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => addrRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, []);

  const trimmedName = name.trim();
  const trimmedAddr = address.trim();
  const trimmedToken = token.trim();
  const valid = trimmedAddr.length > 0 && trimmedToken.length > 0 && trimmedName.length > 0 && trimmedName.length <= MAX_LEN;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    try { await api.setDisplayName(trimmedName); } catch { /* best-effort */ }
    onConfirm({ address: trimmedAddr, token: trimmedToken, name: trimmedName });
  }

  return (
    <Modal title="Join a session" size="sm" onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label>Session address or code</label>
            <input
              ref={addrRef}
              placeholder="e.g. 192.168.1.42:57400#a1b2…"
              value={address}
              onChange={e => setAddress(e.target.value)}
              spellCheck={false}
            />
            <p className="form-hint">Paste the full address the host shared — it includes the security fingerprint after the “#”.</p>
          </div>
          <div className="form-group">
            <label>Join token</label>
            <input
              className="input--mono"
              placeholder="Code from the host, e.g. K7P2-9XQ4-MN3R"
              value={token}
              onChange={e => setToken(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="form-group">
            <label>Display name</label>
            <div className="field-row">
              <input
                value={name}
                maxLength={MAX_LEN}
                onChange={e => setName(e.target.value)}
                spellCheck={false}
              />
              <button
                type="button"
                className="icon-btn"
                title="Suggest another name"
                onClick={() => setName(generateUsername())}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn--primary btn--sm" disabled={!valid}>Join</button>
        </div>
      </form>
    </Modal>
  );
}
