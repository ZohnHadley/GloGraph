import type { GloNode, GloRegion } from '../types';
import { isNodeInRegion, isRegionInRegion } from './regionMembership';

/**
 * The container forest for the graph. Every node and region has at most one
 * **immediate parent** = the *smallest-area* region that geometrically contains
 * it (nodes by center-point, regions by ≥50%-area into a strictly-larger
 * region). This is the single model behind region ownership and locking:
 *
 *   - **Ownership / lock badge** uses `parentOf` — an element is owned by its
 *     immediate region only, never by a larger ancestor.
 *   - **Drag / movement** uses `subtreeOf` — locking and dragging a container
 *     moves its whole nested subtree (descendants via child regions), even inner
 *     regions that aren't themselves locked.
 *
 * Computed from live geometry (not frozen at lock time), so it never goes stale
 * when elements are dragged in and out.
 */
export interface Hierarchy {
  /** element id → immediate parent region id (or null when top-level). */
  parentOf: Map<string, string | null>;
  /** region id → ids of elements whose immediate parent is this region. */
  childrenOf: Map<string, string[]>;
}

export function computeHierarchy(nodes: GloNode[], regions: GloRegion[]): Hierarchy {
  const area = (r: GloRegion) => r.width * r.height;
  const parentOf = new Map<string, string | null>();
  const childrenOf = new Map<string, string[]>();
  const addChild = (pid: string, cid: string) => {
    const arr = childrenOf.get(pid);
    if (arr) arr.push(cid); else childrenOf.set(pid, [cid]);
  };
  // Smallest-area region for which `test(r)` holds, excluding the element itself.
  const smallestContainer = (selfId: string, test: (r: GloRegion) => boolean): string | null => {
    let best: GloRegion | null = null;
    for (const r of regions) {
      if (r.id === selfId || !test(r)) continue;
      if (!best || area(r) < area(best)) best = r;
    }
    return best ? best.id : null;
  };
  for (const n of nodes) {
    const p = smallestContainer(n.id, r => isNodeInRegion(n, r));
    parentOf.set(n.id, p);
    if (p) addChild(p, n.id);
  }
  for (const reg of regions) {
    const p = smallestContainer(reg.id, r => isRegionInRegion(reg, r));
    parentOf.set(reg.id, p);
    if (p) addChild(p, reg.id);
  }
  return { parentOf, childrenOf };
}

/**
 * All transitive descendant ids of `regionId` (nodes + nested regions) — the set
 * that moves when the region is dragged. `regionIds` lets us recurse only into
 * region descendants.
 */
export function subtreeOf(regionId: string, h: Hierarchy, regionIds: Set<string>): Set<string> {
  const out = new Set<string>();
  const stack = [regionId];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const child of h.childrenOf.get(cur) ?? []) {
      if (out.has(child)) continue;
      out.add(child);
      if (regionIds.has(child)) stack.push(child);
    }
  }
  return out;
}
