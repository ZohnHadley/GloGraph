import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { usePresence, type PresencePeer, type Marquee } from '../lib/presence';

/**
 * Presence isolation. `usePresence`'s `peers` state changes on every remote message
 * (cursor moves ~22/s + a 2s heartbeat); if it lived in AppInner the whole app would
 * re-render that often. So presence lives here, split across TWO contexts:
 *
 *  - **Peers** (cursors/marquees/badges) — changes constantly. Only the cursor +
 *    badge layers consume it, so only they re-render on a remote mouse-move.
 *  - **Api** (`remoteSelections` + `sendCursor`) — memoised stable across peer
 *    churn, so GraphCanvas (which reads `remoteSelections` in its node/edge memos)
 *    re-renders only when a *selection* actually changes, never on a cursor move.
 *
 * AppInner wraps its whole tree in <PresenceProvider>; because the provider only
 * supplies context, a peers-driven re-render of the provider reuses the unchanged
 * children element — only the context consumers update.
 */
export interface PresenceApi {
  remoteSelections: Map<string, { color: string; name: string }>;
  sendCursor: (x: number, y: number, marquee?: Marquee | null) => void;
}

const EMPTY_PEERS: PresencePeer[] = [];
const EMPTY_SELECTIONS = new Map<string, { color: string; name: string }>();
const NOOP_API: PresenceApi = { remoteSelections: EMPTY_SELECTIONS, sendCursor: () => {} };

const PresencePeersContext = createContext<PresencePeer[]>(EMPTY_PEERS);
const PresenceApiContext = createContext<PresenceApi>(NOOP_API);

/** Live peer cursors/selections (changes on every presence message). */
export function usePresencePeers(): PresencePeer[] { return useContext(PresencePeersContext); }
/** Stable presence API — remote selection highlights + the cursor/marquee sender. */
export function usePresenceApi(): PresenceApi { return useContext(PresenceApiContext); }

export function PresenceProvider({
  enabled, wsUrl, name, selection, children,
}: {
  enabled: boolean;
  wsUrl: string;
  name: string;
  selection: string[];
  children: ReactNode;
}) {
  const presence = usePresence({ enabled, wsUrl, name, selection });
  const api = useMemo<PresenceApi>(
    () => ({ remoteSelections: presence.remoteSelections, sendCursor: presence.sendCursor }),
    [presence.remoteSelections, presence.sendCursor],
  );
  return (
    <PresenceApiContext.Provider value={api}>
      <PresencePeersContext.Provider value={presence.peers}>
        {children}
      </PresencePeersContext.Provider>
    </PresenceApiContext.Provider>
  );
}
