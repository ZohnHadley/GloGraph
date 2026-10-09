import { usePresencePeers } from '../context/PresenceContext';

/**
 * "Who's here" for a Live Share session: a chip per participant (you + each peer)
 * showing a colour dot + their name. Peer chips are buttons — click to jump the
 * viewport to that user's cursor. Reads peers from PresenceContext so it (not the
 * whole app) re-renders as cursors update.
 */
export default function PresenceBadges({ meLabel = 'You', onJumpTo }: { meLabel?: string; onJumpTo?: (x: number, y: number) => void }) {
  const peers = usePresencePeers();
  return (
    <span className="presence-badges">
      <span className="presence-chip presence-chip--me">
        <span className="presence-chip__dot" style={{ background: 'var(--text-muted)' }} />
        <span className="presence-chip__name">{meLabel}</span>
      </span>
      {peers.map(p => (
        <button
          key={p.id}
          type="button"
          className="presence-chip presence-chip--peer"
          style={{ borderColor: p.color }}
          title={`Jump to ${p.name}`}
          onClick={() => onJumpTo?.(p.x, p.y)}
        >
          <span className="presence-chip__dot" style={{ background: p.color }} />
          <span className="presence-chip__name">{p.name}</span>
        </button>
      ))}
    </span>
  );
}
