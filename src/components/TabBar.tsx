import { useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useTabs } from '../context/TabsContext';
import type { ProjectTab } from '../types';

interface TabBarProps {
  onNewTab: () => void;
}

export default function TabBar({ onNewTab }: TabBarProps) {
  const { tabs, switchTab, closeTab, renameTab, requestCloseTab } = useTabs();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  function handleTabClick(tab: ProjectTab) {
    if (tab.isActive) return;
    switchTab(tab.id);
  }

  function handleCloseClick(e: React.MouseEvent, tab: ProjectTab) {
    e.stopPropagation();
    // Prompt only when there are unsaved changes — `dirty` becomes true on the
    // first edit after load, so a new project with work (never saved) prompts,
    // while an empty/untouched tab (saved or not) closes immediately. The prompt
    // switches to the target tab first so Save targets the right project's DB.
    if (!tab.dirty) { closeTab(tab.id, !tab.savePath); return; }
    if (!tab.isActive) switchTab(tab.id).then(() => requestCloseTab(tab.id));
    else requestCloseTab(tab.id);
  }

  function handleDoubleClick(e: React.MouseEvent, tab: ProjectTab) {
    e.preventDefault();
    setRenamingId(tab.id);
    setRenameValue(tab.name);
    setTimeout(() => renameInputRef.current?.select(), 10);
  }

  function commitRename() {
    if (!renamingId) return;
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== tabs.find(t => t.id === renamingId)?.name) {
      renameTab(renamingId, trimmed);
    }
    setRenamingId(null);
  }

  function handleRenameKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setRenamingId(null);
  }

  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab-bar__tab${tab.isActive ? ' tab-bar__tab--active' : ''}`}
          onClick={() => handleTabClick(tab)}
          onDoubleClick={e => handleDoubleClick(e, tab)}
          title={tab.savePath ?? tab.name}
        >
          {renamingId === tab.id ? (
            <input
              ref={renameInputRef}
              className="tab-bar__rename-input"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleRenameKey}
              onClick={e => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span className="tab-bar__tab-name">{tab.name}</span>
          )}
          {tab.dirty && <span className="tab-bar__dirty" title="Unsaved changes">●</span>}
          <button
            className="tab-bar__close"
            onClick={e => handleCloseClick(e, tab)}
            title="Close tab"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button className="tab-bar__new" onClick={onNewTab} title="New project">
        <Plus size={13} />
      </button>
    </div>
  );
}
