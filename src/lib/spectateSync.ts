/**
 * Identity-preserving reconcile for an authoritative refetch (used by
 * `useGraph.reload`): merge a server entity list into the local one so a reload
 * re-renders only what actually changed — unchanged entities keep their object
 * reference — while optionally protecting in-flight optimistic edits from snapping
 * back to the host's not-yet-updated state. Pure + unit-tested.
 *
 * Host mode passes no protection set (the server is authoritative for everything);
 * a Live Share **guest** passes its optimistic-mode protection set so its own
 * just-made edits aren't clobbered mid-flight (see LIVE_SHARE_SPEC §8.6, where the
 * optimism itself lives inline in `useGraph`).
 *
 * History: this module also held an `EditAction` / `applyLocal` / `invertAction` /
 * `mergeGraph` optimistic engine (for the old `SpectateView`). Guest optimism moved
 * inline into `useGraph`, so that engine — and its `remoteWrite.ts` companion — were
 * retired (2026-06-05). The retired `invertAction` (per-action inverse) in git
 * history is the reference if/when per-user **undo/redo** for Live Share is built.
 */

function mergeList<T extends { id: string }>(local: T[], server: T[], protectedIds: Set<string>): T[] {
  const localById = new Map(local.map(e => [e.id, e]));
  const serverIds = new Set(server.map(e => e.id));
  const out: T[] = [];
  for (const s of server) {
    const l = localById.get(s.id);
    if (l && protectedIds.has(s.id)) { out.push(l); continue; }          // protect in-flight local edit
    if (l && JSON.stringify(l) === JSON.stringify(s)) { out.push(l); continue; } // unchanged → keep ref (no re-render)
    out.push(s);                                                          // remote change / new entity
  }
  for (const l of local) if (!serverIds.has(l.id) && protectedIds.has(l.id)) out.push(l); // pending local creates
  return out;
}

const EMPTY_SET: Set<string> = new Set();

/**
 * Merge a server list into a local one, preserving object identity for unchanged
 * entities (so React Flow re-renders only what changed). `protectedIds` (optimistic
 * guest mode) keeps in-flight local edits from snapping back; omit it (host /
 * pessimistic mode) and the server is authoritative for every entity.
 */
export function mergeById<T extends { id: string }>(local: T[], server: T[], protectedIds: Set<string> = EMPTY_SET): T[] {
  return mergeList(local, server, protectedIds);
}
