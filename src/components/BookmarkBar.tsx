import { useState } from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

export interface CanvasBookmark {
  id: string;
  name: string;
  x: number;
  y: number;
  zoom: number;
}

interface BookmarkBarProps {
  bookmarks: CanvasBookmark[];
  onRestore: (b: CanvasBookmark) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}

export default function BookmarkBar({ bookmarks, onRestore, onSave, onDelete }: BookmarkBarProps) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  function handleSave() {
    const n = name.trim() || `View ${bookmarks.length + 1}`;
    onSave(n);
    setName('');
    setNaming(false);
  }

  function handlePrev() {
    if (!bookmarks.length) return;
    const next = activeIdx === null ? bookmarks.length - 1 : (activeIdx - 1 + bookmarks.length) % bookmarks.length;
    setActiveIdx(next);
    onRestore(bookmarks[next]);
  }

  function handleNext() {
    if (!bookmarks.length) return;
    const next = activeIdx === null ? 0 : (activeIdx + 1) % bookmarks.length;
    setActiveIdx(next);
    onRestore(bookmarks[next]);
  }

  return (
    <div className="bookmark-bar">
      <span className="bookmark-bar__label">
        <Bookmark size={9} />
        Bookmarks
      </span>
      {bookmarks.length > 1 && (
        <button className="icon-btn bookmark-bar__nav" onClick={handlePrev} title="Previous bookmark">
          <ChevronLeft size={10} />
        </button>
      )}
      {bookmarks.map((b, i) => (
        <div key={b.id} className={`bookmark-chip${activeIdx === i ? ' bookmark-chip--active' : ''}`}>
          <button className="bookmark-chip__name" onClick={() => { setActiveIdx(i); onRestore(b); }} title={`Jump to "${b.name}"`}>
            {b.name}
          </button>
          <button
            className="bookmark-chip__del"
            onClick={e => { e.stopPropagation(); onDelete(b.id); if (activeIdx === i) setActiveIdx(null); }}
            title="Delete bookmark"
          >
            <X size={8} />
          </button>
        </div>
      ))}
      {bookmarks.length > 1 && (
        <button className="icon-btn bookmark-bar__nav" onClick={handleNext} title="Next bookmark">
          <ChevronRight size={10} />
        </button>
      )}
      {naming ? (
        <div className="bookmark-add-row">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
              if (e.key === 'Escape') { setNaming(false); setName(''); }
            }}
            placeholder="Bookmark name…"
            className="bookmark-add-input"
          />
          <button className="btn" style={{ padding: '0 8px', fontSize: 10, minHeight: 18 }} onClick={handleSave}>Save</button>
          <button className="icon-btn" onClick={() => { setNaming(false); setName(''); }} style={{ padding: '2px' }}>
            <X size={10} />
          </button>
        </div>
      ) : (
        <button
          className="icon-btn bookmark-bar__add"
          onClick={() => setNaming(true)}
          title="Save current viewport as bookmark (Ctrl+B)"
        >
          <Plus size={11} />
        </button>
      )}
    </div>
  );
}
