import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Plus, StickyNote, Image as ImageIcon, Film, Music2, File as FileIcon } from 'lucide-react';
import type { NodeKind } from '../types';

/**
 * Keyboard-driven "what kind of graph object?" picker. Opened by the N shortcut
 * and by the canvas / region right-click "Add node here…" item. Node is the
 * default (Enter), and each type has a single-letter mnemonic — so the fast path
 * is N → Enter for a plain node, or one keystroke (T/I/V/A) for an item.
 *
 * Positioned at a screen point; the caller owns the flow-coordinate placement and
 * decides what each kind does (plain node = create-on-Save panel; note/media item
 * = create-immediately-then-edit). See App.tsx `handlePickCreateType`.
 */
interface CreateOption {
  kind: NodeKind;
  label: string;
  key: string; // single-letter mnemonic (uppercase for display)
  icon: ReactNode;
}

const OPTIONS: CreateOption[] = [
  { kind: 'standard', label: 'Node', key: 'N', icon: <Plus size={13} /> },
  { kind: 'note', label: 'Note', key: 'T', icon: <StickyNote size={13} /> },
  { kind: 'image', label: 'Image', key: 'I', icon: <ImageIcon size={13} /> },
  { kind: 'video', label: 'Video', key: 'V', icon: <Film size={13} /> },
  { kind: 'audio', label: 'Audio', key: 'A', icon: <Music2 size={13} /> },
  { kind: 'file', label: 'File', key: 'F', icon: <FileIcon size={13} /> },
];

interface CreateTypePickerProps {
  /** Screen-space anchor (clientX/Y of the originating click, or viewport centre for N). */
  pos: { x: number; y: number };
  onPick: (kind: NodeKind) => void;
  onClose: () => void;
}

export default function CreateTypePicker({ pos, onPick, onClose }: CreateTypePickerProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Capture phase so the picker's keys win over the app-wide keydown handler
    // (`useKeyboardShortcuts`, a bubble-phase document listener) — otherwise N
    // would re-open the picker, R would cycle routing, etc. stopPropagation in
    // the capture phase prevents the bubble listener on `document` from firing.
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); return; }
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onPick(OPTIONS[active].kind); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); setActive(a => (a + 1) % OPTIONS.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); setActive(a => (a - 1 + OPTIONS.length) % OPTIONS.length); return; }
      const idx = OPTIONS.findIndex(o => o.key.toLowerCase() === e.key.toLowerCase());
      if (idx >= 0) { e.preventDefault(); e.stopPropagation(); onPick(OPTIONS[idx].kind); }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [active, onPick, onClose]);

  // Clamp within the viewport so the menu never opens off-screen.
  const style: CSSProperties = {
    left: Math.max(4, Math.min(pos.x, window.innerWidth - 184)),
    top: Math.max(4, Math.min(pos.y, window.innerHeight - 176)),
  };

  return createPortal(
    <>
      <div className="context-menu-overlay" onClick={onClose} onContextMenu={e => e.preventDefault()} />
      <div
        className="canvas-context-menu create-type-picker"
        style={style}
        onContextMenu={e => e.preventDefault()}
      >
        <div className="create-type-picker__header">Add graph object</div>
        {OPTIONS.map((o, i) => (
          <button
            key={o.kind}
            className={`context-menu-item create-type-picker__item${i === active ? ' create-type-picker__item--active' : ''}`}
            onMouseEnter={() => setActive(i)}
            onClick={() => onPick(o.kind)}
          >
            {o.icon}
            <span>{o.label}</span>
            <kbd className="create-type-picker__key">{o.key}</kbd>
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}
