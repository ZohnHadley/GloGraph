import { useEffect, useRef, useState } from 'react';
import { save as nativeSaveDialog } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { api } from '../lib/api';
import type { ProjectTab } from '../types';

interface AppQuitFlowDeps {
  tabs: ProjectTab[];
  switchTab: (id: string) => Promise<void>;
  setTabSavePath: (id: string, path: string | null) => Promise<void>;
  markTabClean: (id: string) => Promise<void>;
}

/**
 * App-quit flow: when the window is closing with unsaved projects, prompt to save
 * each one in turn before letting the window go. Extracted from AppInner.
 *
 * Tab data lives in its own DB and survives a launch, so "save" here writes the
 * project's `.glograph` file; "discard" just skips that export (the DB keeps the
 * changes). The window close is held (`event.preventDefault()`) until every dirty
 * project is handled, then `destroy()` actually quits. The caller renders the
 * per-step prompt from the returned `quitTab`/progress/handlers.
 */
export function useAppQuitFlow({ tabs, switchTab, setTabSavePath, markTabClean }: AppQuitFlowDeps) {
  const [quitQueue, setQuitQueue] = useState<string[] | null>(null);
  const [quitIndex, setQuitIndex] = useState(0);
  const [quitBusy, setQuitBusy] = useState(false);
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const quitActiveRef = useRef(false);
  quitActiveRef.current = quitQueue !== null;
  const quitTab = quitQueue ? (tabs.find(t => t.id === quitQueue[quitIndex]) ?? null) : null;

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    getCurrentWindow().onCloseRequested(event => {
      // A quit flow already running, or nothing unsaved → let the window close.
      if (quitActiveRef.current) return;
      const dirtyIds = tabsRef.current.filter(t => t.dirty).map(t => t.id);
      if (dirtyIds.length === 0) return;
      event.preventDefault();           // hold the close; we'll destroy() when done
      setQuitIndex(0);
      setQuitQueue(dirtyIds);
    }).then(fn => { unlisten = fn; }).catch(() => {});
    return () => { unlisten?.(); };
  }, []);

  // Advance to the next unsaved project, or actually quit once all are handled.
  // (Each quit step is a fresh render, so the closure's quitQueue/quitIndex are current.)
  function advanceQuit() {
    if (!quitQueue) return;
    const next = quitIndex + 1;
    if (next >= quitQueue.length) {
      setQuitQueue(null);
      getCurrentWindow().destroy();
    } else {
      setQuitIndex(next);
    }
  }

  async function handleQuitSave() {
    if (!quitTab || quitBusy) return;   // ignore re-entry (double-click / Enter mash)
    setQuitBusy(true);
    try {
      let dest = quitTab.savePath ?? null;
      if (!dest) {
        const baseName = (quitTab.name || 'My Graph').replace(/[\\/:*?"<>|]/g, '_').trim() || 'My Graph';
        const chosen = await nativeSaveDialog({
          title: 'Save Graph',
          defaultPath: `${baseName}.glograph`,
          filters: [{ name: 'GloGraph', extensions: ['glograph'] }],
        });
        if (!chosen) return;            // cancelled Save As → keep this prompt up
        dest = chosen.endsWith('.glograph') ? chosen : `${chosen}.glograph`;
      }
      // Make this project's DB the active connection before exporting it.
      await switchTab(quitTab.id);
      await api.saveGraphToPath(dest);
      await api.recordRecentProject(quitTab.name, dest);
      await setTabSavePath(quitTab.id, dest);
      await markTabClean(quitTab.id);
      advanceQuit();
    } catch (err) {
      console.error('Save before quit failed:', err);
    } finally {
      setQuitBusy(false);
    }
  }

  // Don't write this project's file. Its DB keeps the changes for next launch, so
  // nothing is destroyed — we just skip the export and move on.
  function handleQuitDiscard() { if (!quitBusy) advanceQuit(); }

  // Abort the whole quit — window stays open. (Blocked while a save is in flight.)
  function handleQuitCancel() { if (!quitBusy) setQuitQueue(null); }

  return { quitTab, quitQueue, quitIndex, quitBusy, handleQuitSave, handleQuitDiscard, handleQuitCancel };
}
