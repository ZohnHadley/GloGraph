import { createContext, useContext, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { api } from '../lib/api';
import type { ProjectTab } from '../types';

interface TabsContextValue {
  tabs: ProjectTab[];
  activeTab: ProjectTab | null;
  loading: boolean;
  switchTab: (id: string) => Promise<void>;
  createTab: (name: string, presetId: string) => Promise<void>;
  closeTab: (id: string, deleteDb?: boolean) => Promise<void>;
  renameTab: (id: string, name: string) => Promise<void>;
  setTabSavePath: (id: string, path: string | null) => Promise<void>;
  markTabDirty: (id: string) => Promise<void>;
  markTabClean: (id: string) => Promise<void>;
  /** Ask the backend to recompute the active tab's dirty flag from a content
   *  fingerprint (clears the unsaved dot when edits are undone back to baseline). */
  recomputeActiveTabDirty: () => Promise<void>;
  /** Tab whose close was requested but needs a save/discard prompt. */
  closeRequestId: string | null;
  requestCloseTab: (id: string) => void;
  clearCloseRequest: () => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<ProjectTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [closeRequestId, setCloseRequestId] = useState<string | null>(null);

  useEffect(() => {
    api.getTabs()
      .then(t => { setTabs(t); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unlisten = listen<ProjectTab[]>('tabs:changed', event => {
      setTabs(event.payload);
    });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  const activeTab = tabs.find(t => t.isActive) ?? null;

  // These commands emit `tabs:changed`, which the listener above applies. We
  // intentionally don't also setTabs from the return value — that double-rendered
  // the tab bar with identical data.
  async function switchTab(id: string) {
    await api.switchTab(id);
  }

  async function createTab(name: string, presetId: string) {
    await api.createTab(name, presetId);
  }

  async function closeTab(id: string, deleteDb = false) {
    await api.closeTab(id, deleteDb);
  }

  async function renameTab(id: string, name: string) {
    await api.renameTab(id, name);
  }

  async function setTabSavePath(id: string, path: string | null) {
    await api.setTabSavePath(id, path);
  }

  // `set_tab_dirty` deliberately does NOT emit `tabs:changed` (avoids a re-render
  // storm on every edit), so the dirty toggles apply the returned metas directly.
  async function markTabDirty(id: string) {
    const updated = await api.setTabDirty(id, true);
    setTabs(updated);
  }

  async function markTabClean(id: string) {
    const updated = await api.setTabDirty(id, false);
    setTabs(updated);
  }

  async function recomputeActiveTabDirty() {
    const updated = await api.recomputeActiveTabDirty();
    setTabs(updated);
  }

  function requestCloseTab(id: string) { setCloseRequestId(id); }
  function clearCloseRequest() { setCloseRequestId(null); }

  return (
    <TabsContext.Provider value={{ tabs, activeTab, loading, switchTab, createTab, closeTab, renameTab, setTabSavePath, markTabDirty, markTabClean, recomputeActiveTabDirty, closeRequestId, requestCloseTab, clearCloseRequest }}>
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within TabsProvider');
  return ctx;
}
