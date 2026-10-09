import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  /** Header title (rendered uppercase per the modal-header style). */
  title: string;
  onClose: () => void;
  /** `sm` → 400px panel; `md` (default) → 640px panel. */
  size?: 'sm' | 'md';
  /**
   * Everything below the header — typically a `.modal-body` (and optional
   * `.modal-footer`), or a `<form>` wrapping both. Callers own this so the base
   * stays compatible with tabbed modals, forms, and error banners alike.
   */
  children: ReactNode;
}

/**
 * Base modal shell shared by every dialog-class modal (Graph Settings, New
 * Project, New Graph, About, …). It owns the structural chrome
 * (`.modal-backdrop` → `.modal-panel` → `.modal-header`) and the base
 * behaviors every modal must share:
 *   - Escape closes
 *   - clicking the backdrop (outside the panel) closes
 *   - a header title + ✕ close button
 *
 * Command-palette overlays (QuickFind/QuickConnect) and the fullscreen media
 * viewer are intentionally bespoke and are not built on this shell.
 */
// Stack of mounted modals (by identity). Only the topmost handles Escape, so a
// nested modal (e.g. a prompt opened from Settings) closes itself without also
// dismissing the modal behind it.
const modalStack: symbol[] = [];

export default function Modal({ title, onClose, size = 'md', children }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<symbol>(Symbol('modal'));

  // Register in the stack for mount lifetime only, so ordering stays stable.
  useEffect(() => {
    const id = idRef.current;
    modalStack.push(id);
    return () => {
      const i = modalStack.indexOf(id);
      if (i >= 0) modalStack.splice(i, 1);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && modalStack[modalStack.length - 1] === idRef.current) onClose();
    }
    // Capture phase (third arg `true`): the canvas keydown path (React Flow /
    // useKeyboardShortcuts) handles a *bubbling* Escape first, which prevented this
    // listener from ever seeing Escape — so menu-opened modals didn't close on it.
    // Capturing runs before those bubble handlers, making Escape-to-close reliable.
    // The modal-stack guard still ensures only the topmost modal closes.
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onMouseDown={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className={`modal-panel${size === 'sm' ? ' modal-panel--sm' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
