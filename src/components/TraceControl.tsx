import { ArrowRight, ArrowLeft, X, Network } from 'lucide-react';
import type { TraceDirection } from '../lib/trace';

interface TraceControlProps {
  seedLabel: string;
  direction: TraceDirection;
  /** Reached nodes, excluding the seed. */
  reachedCount: number;
  maxHop: number;
  onSetDirection: (direction: TraceDirection) => void;
  onExit: () => void;
}

/**
 * Floating control for the ephemeral impact-trace overlay. Lets the user flip
 * direction and read how far the cascade reaches, then exit back to the normal
 * view. Nothing here is persisted — closing it clears the overlay.
 */
export default function TraceControl({
  seedLabel,
  direction,
  reachedCount,
  maxHop,
  onSetDirection,
  onExit,
}: TraceControlProps) {
  const verb = direction === 'downstream' ? 'affects' : 'depends on';
  return (
    <div className="trace-control" role="region" aria-label="Impact trace">
      <div className="trace-control__head">
        <Network size={13} className="trace-control__icon" aria-hidden />
        <span className="trace-control__title" title={seedLabel}>{seedLabel}</span>
        <button className="trace-control__close" onClick={onExit} title="Exit trace (Esc)" aria-label="Exit trace">
          <X size={13} />
        </button>
      </div>

      <div className="trace-control__dirs" role="group" aria-label="Trace direction">
        <button
          className={`trace-control__dir${direction === 'downstream' ? ' trace-control__dir--active' : ''}`}
          onClick={() => onSetDirection('downstream')}
          title="What this node leads to (follows arrows)"
        >
          <ArrowRight size={13} /> Downstream
        </button>
        <button
          className={`trace-control__dir${direction === 'upstream' ? ' trace-control__dir--active' : ''}`}
          onClick={() => onSetDirection('upstream')}
          title="What leads to this node (against arrows)"
        >
          <ArrowLeft size={13} /> Upstream
        </button>
      </div>

      <p className="trace-control__stat">
        {reachedCount === 0 ? (
          <>No nodes {direction === 'downstream' ? 'downstream' : 'upstream'} — this node {verb} nothing it's linked to.</>
        ) : (
          <>This node {verb} <strong>{reachedCount}</strong> node{reachedCount === 1 ? '' : 's'}, up to <strong>{maxHop}</strong> hop{maxHop === 1 ? '' : 's'} away.</>
        )}
      </p>
    </div>
  );
}
