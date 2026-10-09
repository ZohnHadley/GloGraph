import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import type { GloNode } from '../types';
import { useSettings } from '../context/SettingsContext';
import { nodeDisplayLabel } from '../lib/nodeDisplay';

interface QuickFindDialogProps {
  nodes: GloNode[];
  onSelect: (node: GloNode) => void;
  onClose: () => void;
}

export default function QuickFindDialog({ nodes, onSelect, onClose }: QuickFindDialogProps) {
  const { getNodeColor } = useSettings();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape closes regardless of focus (shared modal behavior).
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes.slice(0, 12);
    return nodes
      .filter(n =>
        nodeDisplayLabel(n).toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.eventDate?.includes(q)
      )
      .slice(0, 12);
  }, [nodes, query]);

  useEffect(() => { setActiveIdx(0); }, [results]);

  function commit(node: GloNode) {
    onSelect(node);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[activeIdx]) commit(results[activeIdx]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  return createPortal(
    <>
      <div className="quick-find-overlay" onClick={onClose} />
      <div className="quick-find-dialog" role="dialog" aria-modal="true" aria-label="Quick find">
        <div className="quick-find-input-row">
          <Search size={13} className="quick-find-icon" />
          <input
            ref={inputRef}
            className="quick-find-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Find node…"
            autoComplete="off"
          />
        </div>
        {results.length > 0 && (
          <div ref={listRef} className="quick-find-list">
            {results.map((node, i) => (
              <button
                key={node.id}
                className={`quick-find-item${i === activeIdx ? ' quick-find-item--active' : ''}`}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => commit(node)}
              >
                <span className="quick-find-dot" style={{ background: getNodeColor(node) }} />
                <span className="quick-find-title">{nodeDisplayLabel(node)}</span>
                {node.eventDate && (
                  <span className="quick-find-date">{node.eventDate}</span>
                )}
              </button>
            ))}
          </div>
        )}
        {results.length === 0 && query.trim() && (
          <div className="quick-find-empty">No matches</div>
        )}
      </div>
    </>,
    document.body
  );
}
