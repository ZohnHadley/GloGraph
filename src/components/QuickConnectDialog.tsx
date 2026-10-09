import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Zap, X } from 'lucide-react';

interface QuickConnectDialogProps {
  sourceTitle: string;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}

export default function QuickConnectDialog({ sourceTitle, onConfirm, onCancel }: QuickConnectDialogProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Escape closes regardless of where focus is (shared modal behavior).
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onCancel(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  function handleConfirm() {
    const t = title.trim();
    if (!t) return;
    onConfirm(t);
  }

  return createPortal(
    <div className="quick-connect-backdrop" onClick={onCancel}>
      <div className="quick-connect-dialog" onClick={e => e.stopPropagation()}>
        <div className="quick-connect-dialog__header">
          <Zap size={12} style={{ color: 'var(--accent)' }} />
          <span>
            Connect from <span className="quick-connect-dialog__source">{sourceTitle}</span>
          </span>
          <button className="icon-btn" onClick={onCancel} style={{ marginLeft: 'auto' }}>
            <X size={14} />
          </button>
        </div>
        <div className="quick-connect-dialog__body">
          <input
            ref={inputRef}
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); }
              if (e.key === 'Escape') onCancel();
            }}
            placeholder="New node title…"
          />
        </div>
        <div className="quick-connect-dialog__footer">
          <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn--primary" onClick={handleConfirm} disabled={!title.trim()}>
            <Zap size={11} /> Create + Connect
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
