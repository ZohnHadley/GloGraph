import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Live Share presence. A thin client over the session's `/ws` relay: each
// participant broadcasts its cursor (in flow coordinates) + current selection;
// the SERVER assigns each connection an id + colour and stamps them onto every
// message (anti-spoof — a client can't claim another peer's identity), and tells
// us our own id via a `welcome` so we can drop our own echo.

/** Live drag-select marquee rectangle, in flow coordinates. */
export interface Marquee { x: number; y: number; w: number; h: number }

export interface PresencePeer {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  /** Graph element ids this peer currently has selected (shared selection). */
  sel: string[];
  /** This peer's in-progress drag-select box (flow coords), or null when idle. */
  marquee: Marquee | null;
  /** last-seen timestamp (ms) for pruning. */
  t: number;
}

// Distinct, legible hues — deliberately NOT the amber accent (that's local
// selection). Mirrors PALETTE in src-tauri/src/http_api.rs (`presence_color`).
const PALETTE = ['#e0566a', '#4ea1d3', '#5fb878', '#c98bdb', '#e0934e', '#56c2c2', '#b0b04e', '#d36aa1'];

export function colorForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/**
 * Connect to a session's presence relay while `enabled`. Returns the live peer
 * cursors, a map of which graph element each peer has selected (for shared
 * selection highlighting), and a throttled `sendCursor(x, y)`.
 */
export function usePresence(opts: { enabled: boolean; wsUrl: string; name: string; selection?: string[] }) {
  const { enabled, wsUrl, name, selection } = opts;
  const [peers, setPeers] = useState<Map<string, PresencePeer>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  // Our id, used only to drop our own echo. Server overwrites it via `welcome`;
  // a local fallback covers the brief window before that arrives.
  const idRef = useRef<string>(crypto.randomUUID ? crypto.randomUUID() : 'u' + Math.random().toString(16).slice(2));
  const lastSentRef = useRef(0);
  // Last cursor position, re-broadcast as a heartbeat so an idle peer (not moving
  // the mouse) stays present instead of being pruned. Presence = the open socket,
  // not mouse activity.
  const lastPosRef = useRef({ x: 0, y: 0 });
  const nameRef = useRef(name); nameRef.current = name;
  const selRef = useRef<string[]>(selection ?? []);
  const marqueeRef = useRef<Marquee | null>(null);

  const rawSend = useCallback((x: number, y: number) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    // id/colour are stamped by the server; we only send name + cursor + selection
    // + the live drag-select marquee. (The relay forwards arbitrary fields, so no
    // backend change is needed; older clients ignore `marquee`.)
    ws.send(JSON.stringify({ name: nameRef.current, x, y, sel: selRef.current, marquee: marqueeRef.current }));
  }, []);

  useEffect(() => {
    if (!enabled || !wsUrl) return;
    let cancelled = false;
    let reconnect: ReturnType<typeof setTimeout> | null = null;
    const connect = () => {
      if (cancelled) return;
      let ws: WebSocket;
      try { ws = new WebSocket(wsUrl); } catch { reconnect = setTimeout(connect, 1500); return; }
      wsRef.current = ws;
      // Announce immediately on connect so we appear before the first mouse move.
      ws.onopen = () => rawSend(lastPosRef.current.x, lastPosRef.current.y);
      ws.onmessage = (e) => {
        try {
          const p = JSON.parse(e.data);
          if (!p) return;
          if (p.type === 'welcome') { idRef.current = p.id; return; } // our server-assigned id
          if (p.id === idRef.current) return; // ignore our own echo
          setPeers(m => {
            const n = new Map(m);
            n.set(p.id, { id: p.id, name: p.name || 'Guest', color: p.color || '#888', x: p.x, y: p.y, sel: Array.isArray(p.sel) ? p.sel : [], marquee: p.marquee ?? null, t: Date.now() });
            return n;
          });
        } catch { /* ignore malformed */ }
      };
      // Auto-reconnect if the socket drops (WebView2 can drop idle/background WS).
      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
        if (!cancelled) reconnect = setTimeout(connect, 1500);
      };
      ws.onerror = () => { try { ws.close(); } catch { /* onclose handles reconnect */ } };
    };
    connect();
    return () => {
      cancelled = true;
      if (reconnect) clearTimeout(reconnect);
      const ws = wsRef.current;
      if (ws) { try { ws.close(); } catch { /* ignore */ } }
      wsRef.current = null;
      setPeers(new Map());
    };
  }, [enabled, wsUrl, rawSend]);

  // Broadcast immediately when our selection changes (so peers see it without
  // waiting for a mouse move or the heartbeat). `selection` should be a stable
  // reference (memoized by the caller) or this fires every render.
  useEffect(() => {
    selRef.current = selection ?? [];
    if (enabled) rawSend(lastPosRef.current.x, lastPosRef.current.y);
  }, [selection, enabled, rawSend]);

  // Heartbeat: re-broadcast our presence every 2s (well under the prune window) so
  // we stay visible while idle, and prune peers that truly went silent. The 10s
  // window tolerates a reconnect + a few throttled (backgrounded) heartbeats.
  useEffect(() => {
    if (!enabled) return;
    const iv = setInterval(() => {
      rawSend(lastPosRef.current.x, lastPosRef.current.y);
      setPeers(m => {
        const now = Date.now();
        let changed = false;
        const n = new Map(m);
        for (const [k, v] of n) if (now - v.t > 10000) { n.delete(k); changed = true; }
        return changed ? n : m;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [enabled, rawSend]);

  const sendCursor = useCallback((x: number, y: number, marquee: Marquee | null = null) => {
    lastPosRef.current = { x, y };
    // A marquee start/stop (crossing the null boundary) must broadcast immediately so
    // peers don't see a ghost box; continuous resizing rides the cursor throttle.
    const marqueeBoundary = (marquee == null) !== (marqueeRef.current == null);
    marqueeRef.current = marquee;
    const now = Date.now();
    if (!marqueeBoundary && now - lastSentRef.current < 45) return; // ~22/s throttle
    lastSentRef.current = now;
    rawSend(x, y);
  }, [rawSend]);

  const peersArr = useMemo(() => Array.from(peers.values()), [peers]);
  // Signature of just the selection *content* (ids + colour + name), independent of
  // cursor positions. `peers` changes reference on every presence message (cursor
  // moves at ~22/s), so keying `remoteSelections` on `[peers]` handed React Flow a
  // new Map every mouse-move — and since `remoteSelections` feeds rfNodes/rfRegions/
  // edges, that cascaded into a full node/edge REPLACEMENT each time (canvas flicker
  // + dropped drag-box selection). Deriving from this signature keeps the Map
  // reference stable until a selection actually changes.
  const selSig = useMemo(() => {
    const parts: string[] = [];
    for (const p of peers.values()) for (const id of p.sel) parts.push(`${id}:${p.color}:${p.name}`);
    return parts.sort().join('|');
  }, [peers]);
  // element id → the peer (colour + name) selecting it. First peer wins on overlap.
  const remoteSelections = useMemo(() => {
    const m = new Map<string, { color: string; name: string }>();
    for (const p of peers.values()) {
      for (const id of p.sel) if (!m.has(id)) m.set(id, { color: p.color, name: p.name });
    }
    return m;
    // Intentionally keyed on the content signature, not `peers` — see selSig above.
  }, [selSig]); // eslint-disable-line react-hooks/exhaustive-deps

  return { peers: peersArr, sendCursor, remoteSelections };
}
