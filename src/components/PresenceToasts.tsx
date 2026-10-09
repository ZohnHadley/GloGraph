import { useCallback, useEffect, useRef, useState } from 'react';
import { usePresencePeers } from '../context/PresenceContext';

/**
 * Transient "X joined / X left" awareness toasts for a Live Share session, derived
 * from presence peer-set deltas. Self-expiring; consumes the peers context so it
 * (not the app) re-renders. The initial peer set is seeded silently — you only get
 * toasts for joins/leaves that happen after you're in. (Host-ended is surfaced
 * separately by the guest health-ping in App.)
 */
export default function PresenceToasts() {
  const peers = usePresencePeers();
  const prevRef = useRef<Map<string, string>>(new Map());
  const seededRef = useRef(false);
  const idRef = useRef(0);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const push = useCallback((msg: string) => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  useEffect(() => {
    const cur = new Map(peers.map(p => [p.id, p.name] as const));
    if (!seededRef.current) { seededRef.current = true; prevRef.current = cur; return; }
    for (const [id, name] of cur) if (!prevRef.current.has(id)) push(`${name} joined`);
    for (const [id, name] of prevRef.current) if (!cur.has(id)) push(`${name} left`);
    prevRef.current = cur;
  }, [peers, push]);

  if (!toasts.length) return null;
  return (
    <div className="presence-toasts" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className="presence-toast">{t.msg}</div>
      ))}
    </div>
  );
}
