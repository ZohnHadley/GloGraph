import { useMemo } from 'react';
import type { GloNode } from '../types';
import { useSettings } from '../context/SettingsContext';

interface TimelinePanelProps {
  nodes: GloNode[];
  onNodeClick: (node: GloNode) => void;
}

export default function TimelinePanel({ nodes, onNodeClick }: TimelinePanelProps) {
  const { getNodeColor } = useSettings();

  const dated = useMemo(() =>
    nodes
      .filter(n => n.eventDate)
      .sort((a, b) => (a.eventDate! < b.eventDate! ? -1 : a.eventDate! > b.eventDate! ? 1 : 0)),
    [nodes]
  );

  if (dated.length === 0) {
    return (
      <div className="timeline-panel timeline-panel--empty">
        <span>No nodes with event dates to show</span>
      </div>
    );
  }

  return (
    <div className="timeline-panel">
      <div className="timeline-track">
        <div className="timeline-line" />
        {dated.map(node => (
          <button
            key={node.id}
            className="timeline-node"
            onClick={() => onNodeClick(node)}
            title={`${node.eventDate} — ${node.title}`}
          >
            <div className="timeline-node__dot" style={{ background: getNodeColor(node) }} />
            <div className="timeline-node__label">
              <span className="timeline-node__date">{node.eventDate}</span>
              <span className="timeline-node__title">{node.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
