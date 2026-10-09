import { useEffect, useState } from 'react';
import { Plus, FolderOpen, ChevronRight, AlertTriangle, FolderSearch, X } from 'lucide-react';
import { open as nativeOpenDialog } from '@tauri-apps/plugin-dialog';
import { api } from '../lib/api';
import { useTabs } from '../context/TabsContext';
import GlographMark from './GlographMark';

interface Props {
  onNewProject: () => void;
  onImport: () => void;
}

interface RecentProject {
  name: string;
  path: string;
  /** Set by the backend when the file no longer exists on disk. */
  missing?: boolean;
}

export default function StartScreen({ onNewProject, onImport }: Props) {
  const { tabs, switchTab } = useTabs();
  const [recent, setRecent] = useState<RecentProject[]>([]);
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  useEffect(() => {
    api.getRecentProjects().then(setRecent).catch(() => {});
  }, []);

  const openTabs = tabs.filter(t => t.savePath);

  async function handleOpenRecent(r: RecentProject) {
    if (openingPath || r.missing) return;   // can't open a file that's gone
    setOpeningPath(r.path);
    try {
      await api.openPathAsTab(r.path);
    } catch {
      setOpeningPath(null);
    }
  }

  // Drop a recent entry from the list (the file stays on disk if it exists; this
  // only forgets the shortcut). Stays on the Start screen and updates locally.
  async function handleClearRecent(r: RecentProject) {
    if (openingPath) return;
    try { await api.removeRecentProject(r.path); } catch { /* best-effort */ }
    setRecent(prev => prev.filter(x => x.path !== r.path));
  }

  // Re-point a missing entry at the moved file: pick the new location, open it
  // (which records the new path in recents), then forget the stale entry. On
  // success the app switches to the new tab and the Start screen unmounts.
  async function handleRepathRecent(r: RecentProject) {
    if (openingPath) return;
    const selected = await nativeOpenDialog({
      filters: [{ name: 'GloGraph Project', extensions: ['glograph'] }],
      multiple: false,
    });
    if (typeof selected !== 'string') return;
    setOpeningPath(r.path);
    try {
      await api.openPathAsTab(selected);
      await api.removeRecentProject(r.path);
    } catch {
      setOpeningPath(null);
    }
  }

  const hasRecent = recent.length > 0 || openTabs.length > 0;
  const missingCount = recent.filter(r => r.missing && !openTabs.some(t => t.savePath === r.path)).length;

  return (
    <div className="start-screen">
      <div className="start-screen__panel">

        <div className="start-screen__panel-header">
          <GlographMark size={14} className="start-screen__logo-mark" />
          <span className="start-screen__panel-title">GloGraph</span>
        </div>

        <div className="start-screen__body">

          <section className="start-screen__col">
            <div className="start-screen__col-header">Start</div>
            <div className="start-screen__col-body">
              <button className="start-screen__btn start-screen__btn--primary" onClick={onNewProject}>
                <Plus size={13} />
                New Project
              </button>
              <button className="start-screen__btn" onClick={onImport}>
                <FolderOpen size={13} />
                Open Project…
              </button>
            </div>
          </section>

          <div className="start-screen__separator" />

          <section className="start-screen__col start-screen__col--recent">
            <div className="start-screen__col-header">Recent</div>
            <div className="start-screen__col-body">
              {!hasRecent ? (
                <span className="start-screen__empty">No recent projects</span>
              ) : (
                <ul className="start-screen__recent-list">
                  {openTabs.map(t => (
                    <li key={t.id}>
                      <button className="start-screen__recent-row start-screen__recent-row--open" onClick={() => switchTab(t.id)}>
                        <span className="start-screen__recent-dot" />
                        <span className="start-screen__recent-name">{t.name}</span>
                        <span className="start-screen__recent-path">{t.savePath}</span>
                        <ChevronRight size={11} className="start-screen__recent-chevron" />
                      </button>
                    </li>
                  ))}
                  {recent
                    .filter(r => !openTabs.some(t => t.savePath === r.path))
                    .map(r => (
                      <li key={r.path} className="start-screen__recent-li">
                        <button
                          className={`start-screen__recent-row${openingPath === r.path ? ' start-screen__recent-row--loading' : ''}${r.missing ? ' start-screen__recent-row--missing' : ''}`}
                          onClick={() => handleOpenRecent(r)}
                          disabled={openingPath !== null || r.missing}
                          title={r.missing ? `File not found: ${r.path}` : r.path}
                        >
                          <span className={`start-screen__recent-dot start-screen__recent-dot--dim${r.missing ? ' start-screen__recent-dot--missing' : ''}`} />
                          <span className="start-screen__recent-name">{r.name}</span>
                          {r.missing
                            ? <span className="start-screen__recent-badge"><AlertTriangle size={10} />Not found</span>
                            : <span className="start-screen__recent-path">{r.path}</span>}
                          {!r.missing && <ChevronRight size={11} className="start-screen__recent-chevron" />}
                        </button>
                        <div className={`start-screen__recent-actions${r.missing ? ' start-screen__recent-actions--missing' : ''}`}>
                          {r.missing && (
                            <button
                              className="start-screen__recent-action"
                              onClick={() => handleRepathRecent(r)}
                              disabled={openingPath !== null}
                              title="Locate the moved file"
                              aria-label="Locate the moved file"
                            >
                              <FolderSearch size={12} />
                            </button>
                          )}
                          <button
                            className="start-screen__recent-action"
                            onClick={() => handleClearRecent(r)}
                            disabled={openingPath !== null}
                            title="Remove from recents"
                            aria-label="Remove from recents"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
              {missingCount > 0 && (
                <div className="start-screen__recent-missing-note">
                  <AlertTriangle size={11} />
                  {missingCount === 1
                    ? '1 recent project could not be found (moved or deleted).'
                    : `${missingCount} recent projects could not be found (moved or deleted).`}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
