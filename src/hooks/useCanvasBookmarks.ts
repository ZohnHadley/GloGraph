import { useEffect, useState } from 'react';
import type { Viewport } from '@xyflow/react';
import { api } from '../lib/api';
import type { CanvasBookmark } from '../components/BookmarkBar';

interface CanvasBookmarksDeps {
  viewportRef: { current: Viewport };
  markDirty: () => void;
}

/**
 * Canvas bookmarks (saved viewports), extracted from AppInner. Persisted to
 * `app_settings.canvas_bookmarks` and seeded once per mount. Saving captures the
 * current viewport (`viewportRef`); restoring sets `targetViewport`, which the
 * caller hands to GraphCanvas to animate to (and clears via `clearTargetViewport`
 * once consumed). Any change marks the tab dirty.
 */
export function useCanvasBookmarks({ viewportRef, markDirty }: CanvasBookmarksDeps) {
  const [bookmarks, setBookmarks] = useState<CanvasBookmark[]>([]);
  const [targetViewport, setTargetViewport] = useState<Viewport | null>(null);

  // Load persisted bookmarks once per mount (each tab remounts AppInner via key=).
  useEffect(() => {
    api.getAppSetting('canvas_bookmarks').then(raw => {
      if (raw) {
        try { setBookmarks(JSON.parse(raw)); } catch (e) { console.warn('Failed to parse bookmarks', e); }
      }
    });
  }, []);

  function saveBookmarks(next: CanvasBookmark[]) {
    setBookmarks(next);
    api.setAppSetting('canvas_bookmarks', JSON.stringify(next));
    markDirty();
  }

  function handleSaveBookmark(name: string) {
    const vp = viewportRef.current;
    const bm: CanvasBookmark = { id: crypto.randomUUID(), name, ...vp };
    saveBookmarks([...bookmarks, bm]);
  }

  function handleDeleteBookmark(id: string) {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  }

  // Restore = ask the canvas to animate to the saved viewport (GraphCanvas consumes it).
  function handleRestoreBookmark(b: CanvasBookmark) {
    setTargetViewport({ x: b.x, y: b.y, zoom: b.zoom });
  }
  const clearTargetViewport = () => setTargetViewport(null);

  return {
    bookmarks,
    saveBookmarks,
    handleSaveBookmark,
    handleDeleteBookmark,
    handleRestoreBookmark,
    targetViewport,
    clearTargetViewport,
  };
}
