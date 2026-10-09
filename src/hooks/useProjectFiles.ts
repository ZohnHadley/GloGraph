import { save as nativeSaveDialog, open as nativeOpenDialog } from '@tauri-apps/plugin-dialog';
import { api } from '../lib/api';
import type { ProjectTab } from '../types';

type SaveToast = { msg: string; ok: boolean } | null;

interface ProjectFilesDeps {
  currentSavePath: string | null;
  setCurrentSavePath: (path: string | null) => void;
  activeTab: ProjectTab | null;
  markTabClean: (id: string) => Promise<void>;
  setTabSavePath: (id: string, path: string | null) => Promise<void>;
  renameTab: (id: string, name: string) => Promise<void>;
  setSaveToast: (toast: SaveToast) => void;
}

/**
 * AppInner's project-file operations, extracted from the orchestrator: Save / Save
 * As / Open. Each writes or reads a `.glograph` file and keeps the active tab's
 * metadata (save path, name, dirty flag, recents) in sync.
 *
 * - `triggerSave` — Ctrl+S: overwrite the linked file in place if there is one,
 *   else fall through to `openSaveDialog`.
 * - `openSaveDialog` — Save As: native dialog (default name = tab name), then point
 *   the tab at the new path and rename it to match (clearing dirty first so a late
 *   `tabs:changed` can't re-flip the unsaved dot).
 * - `handleOpenProject` — Ctrl+O: native open dialog → `open_path_as_tab` (opens the
 *   file as a path-linked tab; the `tabs:changed` event remounts AppInner with it).
 */
export function useProjectFiles({
  currentSavePath, setCurrentSavePath, activeTab,
  markTabClean, setTabSavePath, renameTab, setSaveToast,
}: ProjectFilesDeps) {
  async function openSaveDialog() {
    // Default the filename to the active tab/project name (sanitised for the FS).
    const baseName = (activeTab?.name ?? 'My Graph').replace(/[\\/:*?"<>|]/g, '_').trim() || 'My Graph';
    const chosen = await nativeSaveDialog({
      title: 'Save Graph',
      defaultPath: `${baseName}.glograph`,
      filters: [{ name: 'GloGraph', extensions: ['glograph'] }],
    });
    if (!chosen) return;
    const dest = chosen.endsWith('.glograph') ? chosen : `${chosen}.glograph`;
    try {
      await api.saveGraphToPath(dest);
      setCurrentSavePath(dest);
      if (activeTab) {
        const id = activeTab.id;
        // The tab name follows the saved filename (matches the open-file convention).
        const tabName = (dest.split(/[\\/]/).pop() ?? dest).replace(/\.glograph$/i, '');
        // Clear dirty FIRST so the subsequent (event-emitting) rename/path updates
        // all carry dirty=false — otherwise a late `tabs:changed` event could flip
        // the unsaved dot back on.
        await markTabClean(id);
        await setTabSavePath(id, dest);
        await renameTab(id, tabName);
        api.recordRecentProject(tabName, dest);
      }
      const filename = dest.split(/[\\/]/).pop() ?? dest;
      setSaveToast({ msg: `Saved: ${filename}`, ok: true });
      setTimeout(() => setSaveToast(null), 2500);
    } catch (err) {
      setSaveToast({ msg: `Save failed: ${err}`, ok: false });
      setTimeout(() => setSaveToast(null), 4000);
    }
  }

  function triggerSave() {
    if (currentSavePath) {
      api.saveGraphToPath(currentSavePath)
        .then(async path => {
          if (activeTab) {
            await setTabSavePath(activeTab.id, path);
            await markTabClean(activeTab.id);
            api.recordRecentProject(activeTab.name, path);
          }
          const filename = path.split(/[\\/]/).pop() ?? path;
          setSaveToast({ msg: `Saved: ${filename}`, ok: true });
          setTimeout(() => setSaveToast(null), 2500);
        })
        .catch(err => {
          setSaveToast({ msg: `Save failed: ${err}`, ok: false });
          setTimeout(() => setSaveToast(null), 4000);
        });
    } else {
      openSaveDialog();
    }
  }

  async function handleOpenProject() {
    const chosen = await nativeOpenDialog({
      multiple: false,
      directory: false,
      filters: [{ name: 'GloGraph', extensions: ['glograph'] }],
    });
    if (typeof chosen !== 'string') return;
    try {
      // Opens the file as a path-linked tab so subsequent saves overwrite it
      // in place (Save As makes a copy). activeTabId changes via the
      // tabs:changed event → AppInner remounts, reloading all data.
      await api.openPathAsTab(chosen);
    } catch (err) {
      console.error('Open project failed:', err);
      setSaveToast({ msg: `Failed to open project: ${err}`, ok: false });
      setTimeout(() => setSaveToast(null), 4000);
    }
  }

  return { openSaveDialog, triggerSave, handleOpenProject };
}
