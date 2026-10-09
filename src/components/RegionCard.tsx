import { memo, useCallback } from 'react';
import { Handle, NodeProps, NodeResizer, Position } from '@xyflow/react';
import { Lock, Minus, Plus, Unlock, Link2 } from 'lucide-react';
import type { GloRegion } from '../types';
import { useGraphState } from '../context/GraphStateContext';

export type RegionNodeData = GloRegion & {
  isMinimized: boolean;
  isLocked: boolean;
  onMinimize: (id: string, minimized: boolean) => void;
  onResize: (id: string, x: number, y: number, w: number, h: number) => void;
  onLock: (id: string, locked: boolean) => void;
};

type RegionCardProps = NodeProps & { data: RegionNodeData };

function RegionCard({ id, data, selected }: RegionCardProps) {
  const { capturedIds, readOnly } = useGraphState();
  const { title, color, isMinimized, isLocked, onMinimize, onResize, onLock } = data;
  const captured = capturedIds.has(id);

  const handleMinimize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMinimize(id, !isMinimized);
  }, [id, isMinimized, onMinimize]);

  const handleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLock(id, !isLocked);
  }, [id, isLocked, onLock]);

  const accentColor = color ?? '#484848';

  return (
    <div
      className={`region-card${isMinimized ? ' region-card--minimized' : ''}${selected ? ' region-card--selected' : ''}`}
      style={{ '--region-color': accentColor } as React.CSSProperties}
    >
      {!readOnly && (
        <NodeResizer
          isVisible={selected && !isMinimized}
          minWidth={120}
          minHeight={60}
          onResizeEnd={(_evt, params) => {
            onResize(id, params.x, params.y, params.width, params.height);
          }}
        />
      )}

      <div className="region-card__header">
        <span className="region-card__title">{title || 'Node Region'}</span>
        {captured && (
          <span className="region-captured-badge" title="Captured by locked region">
            <Link2 size={9} />
          </span>
        )}
        <button
          className={`region-lock-btn${isLocked ? ' region-lock-btn--active' : ''}`}
          onClick={handleLock}
          title={isLocked ? 'Unlock nodes from region' : (isMinimized ? 'Lock — expands the region first' : 'Lock nodes to region')}
        >
          {isLocked ? <Lock size={10} /> : <Unlock size={10} />}
        </button>
        <button
          className="region-minimize-btn"
          onClick={handleMinimize}
          title={isMinimized ? 'Expand' : (isLocked ? 'Minimize — unlocks the region first' : 'Minimize')}
        >
          {isMinimized ? <Plus size={11} /> : <Minus size={11} />}
        </button>
      </div>

      {!isMinimized && (
        <div
          className="region-card__body"
          style={color ? { background: color + '18' } : undefined}
        />
      )}

      <Handle type="source" id="top"    position={Position.Top}    className="node-handle" style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" id="bottom" position={Position.Bottom} className="node-handle" style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" id="left"   position={Position.Left}   className="node-handle" style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" id="right"  position={Position.Right}  className="node-handle" style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

export default memo(RegionCard);
