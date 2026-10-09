import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Modal from './Modal';
import { api } from '../lib/api';
import { generateUsername } from '../lib/username';

interface DisplayNamePromptProps {
  /** Header title — e.g. "Host a session" / "Join a session". */
  title?: string;
  /** One-line context shown under the field. */
  description?: string;
  confirmLabel?: string;
  /** Pre-fill (defaults to the saved display name if omitted). */
  initialName?: string;
  /** Called with the trimmed name after it's been persisted as the default. */
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

const MAX_LEN = 40;

/**
 * Reusable "what's your name?" gate. A display name is required — there are no
 * anonymous participants — so this is the prompt the Phase-1 host/join flows
 * render before connecting. Persists the chosen name as the per-machine default
 * (so it's pre-filled next time) and hands it back via `onConfirm`.
 */
export default function DisplayNamePrompt({
  title = 'Your display name',
  description = 'Shown to others in shared sessions. You can change it anytime.',
  confirmLabel = 'Save',
  initialName,
  onConfirm,
  onCancel,
}: DisplayNamePromptProps) {
  const [name, setName] = useState(initialName ?? '');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // When no initial name is supplied, seed from the saved default — or, if none
  // is saved, suggest a generated one so the field is never blank (the user keeps
  // or edits it). This is the "username is generated at the start" behaviour.
  useEffect(() => {
    let cancelled = false;
    if (initialName === undefined) {
      api.getDisplayName()
        .then(n => { if (!cancelled) setName(n && n.trim() ? n : generateUsername()); })
        .catch(() => { if (!cancelled) setName(generateUsername()); });
    }
    return () => { cancelled = true; };
  }, [initialName]);

  useEffect(() => {
    const t = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
    return () => clearTimeout(t);
  }, []);

  const trimmed = name.trim();
  const valid = trimmed.length > 0 && trimmed.length <= MAX_LEN;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    try {
      await api.setDisplayName(trimmed);
    } catch {
      // Persisting the default is best-effort; still proceed with the name.
    } finally {
      setBusy(false);
    }
    onConfirm(trimmed);
  }

  return (
    <Modal title={title} size="sm" onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label>Display name</label>
            <div className="field-row">
              <input
                ref={inputRef}
                placeholder="e.g. Alex"
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
            <p className="form-hint">{description}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary btn--sm" disabled={!valid || busy}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
