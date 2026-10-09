import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Scissors, ClipboardPaste, TextSelect } from 'lucide-react';
import { readText as pluginReadText, writeText as pluginWriteText } from '@tauri-apps/plugin-clipboard-manager';

// Read/write the system clipboard through the Tauri clipboard-manager plugin
// (Rust-side, no webview permission prompt). In the web demo the plugin's invoke
// isn't backed, so both fall back to the Web Clipboard API.
async function readClipboardText(): Promise<string> {
  try {
    const t = await pluginReadText();
    if (typeof t === 'string') return t;
  } catch { /* plugin unavailable (web demo) — fall through */ }
  try { return await navigator.clipboard.readText(); } catch { return ''; }
}

async function writeClipboardText(text: string): Promise<void> {
  try { await pluginWriteText(text); return; }
  catch { /* plugin unavailable (web demo) — fall through */ }
  try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
}

/**
 * One app-wide right-click menu (Copy / Cut / Paste / Select All) for editable
 * text fields — the inline note editor on the canvas AND the panel inputs. A
 * single capture-phase `contextmenu` listener handles both: it runs before React
 * Flow's synthetic `onNodeContextMenu` (which listens at the app root), so
 * stopPropagation keeps the canvas node menu from also opening over a note, and
 * preventDefault suppresses the bare webview menu.
 *
 * Clipboard mechanics use `document.execCommand` (copy/cut/insertText): it keeps
 * React's controlled inputs in sync (it dispatches real `input` events) and needs
 * no write permission for a user-initiated copy. Paste reads via the Web Clipboard
 * API (same `navigator.clipboard` the Mermaid/DOT export already uses) then
 * insertText — execCommand('paste') is blocked by the engine.
 */
type TextField = HTMLInputElement | HTMLTextAreaElement;

// Input types whose selection API (selectionStart/End, execCommand) is reliable.
// number/email/etc. expose no selection range in Chromium, so we leave them alone.
const TEXT_INPUT_TYPES = new Set(['text', 'search', 'url', 'tel', 'password', '']);

function isEditableTextField(el: EventTarget | null): el is TextField {
  if (el instanceof HTMLTextAreaElement) return !el.disabled && !el.readOnly;
  if (el instanceof HTMLInputElement) {
    return !el.disabled && !el.readOnly && TEXT_INPUT_TYPES.has(el.type);
  }
  return false;
}

interface MenuState {
  x: number;
  y: number;
  target: TextField;
}

export default function TextFieldContextMenu() {
  const [menu, setMenu] = useState<MenuState | null>(null);

  useEffect(() => {
    function onContextMenu(e: MouseEvent) {
      if (!isEditableTextField(e.target)) return; // canvas/node/region menus handle the rest
      e.preventDefault();
      e.stopPropagation();
      setMenu({ x: e.clientX, y: e.clientY, target: e.target });
    }
    document.addEventListener('contextmenu', onContextMenu, true);
    return () => document.removeEventListener('contextmenu', onContextMenu, true);
  }, []);

  // Dismiss on scroll / resize / Escape (outside-click is handled by the overlay).
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setMenu(null); } };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [menu]);

  if (!menu) return null;
  const { target } = menu;
  const hasSelection = target.selectionStart != null && target.selectionStart !== target.selectionEnd;

  // Buttons use onMouseDown + preventDefault so focus/selection never leaves the
  // field. Clipboard WRITES go through the plugin (writeClipboardText); the DOM
  // edit for Cut uses execCommand('delete') so the controlled input stays in sync.
  function selectedText(): string {
    const s = target.selectionStart ?? 0;
    const e = target.selectionEnd ?? 0;
    return target.value.slice(s, e);
  }

  function run(fn: () => void) {
    target.focus();
    fn();
    setMenu(null);
  }

  function copy() {
    void writeClipboardText(selectedText());
    setMenu(null);
  }
  function cut() {
    void writeClipboardText(selectedText());
    target.focus();
    document.execCommand('delete'); // remove the selection, keep the controlled input in sync
    setMenu(null);
  }
  const selectAll = () => run(() => target.select());
  function paste() {
    target.focus();
    readClipboardText()
      .then(text => { if (text) { target.focus(); document.execCommand('insertText', false, text); } })
      .finally(() => setMenu(null));
  }

  const style: CSSProperties = {
    left: Math.max(4, Math.min(menu.x, window.innerWidth - 184)),
    top: Math.max(4, Math.min(menu.y, window.innerHeight - 140)),
  };

  return createPortal(
    <>
      <div className="context-menu-overlay" onMouseDown={() => setMenu(null)} onContextMenu={e => e.preventDefault()} />
      <div className="canvas-context-menu" style={style} onContextMenu={e => e.preventDefault()}>
        <button className="context-menu-item" disabled={!hasSelection} onMouseDown={e => { e.preventDefault(); copy(); }}>
          <Copy size={13} /> Copy
        </button>
        <button className="context-menu-item" disabled={!hasSelection} onMouseDown={e => { e.preventDefault(); cut(); }}>
          <Scissors size={13} /> Cut
        </button>
        <button className="context-menu-item" onMouseDown={e => { e.preventDefault(); paste(); }}>
          <ClipboardPaste size={13} /> Paste
        </button>
        <hr className="context-menu-separator" />
        <button className="context-menu-item" onMouseDown={e => { e.preventDefault(); selectAll(); }}>
          <TextSelect size={13} /> Select All
        </button>
      </div>
    </>,
    document.body
  );
}
