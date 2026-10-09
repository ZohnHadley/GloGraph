import { createContext, useContext } from 'react';

// ── Level of detail (LOD) ───────────────────────────────────────────────────
// Discrete zoom tiers so the canvas renders cheaper cards when zoomed out:
// FULL = today's card; COMPACT = title + chrome, no media; MINIMAL = a bare
// rectangle (content hidden via CSS). Discrete (not raw zoom) so cards re-render
// only when crossing a threshold, never on every zoom tick.
export const LOD_MINIMAL = 0;
export const LOD_COMPACT = 1;
export const LOD_FULL = 2;

export function zoomToLodTier(zoom: number): number {
  // Media stays visible down to 0.2 (hides only when farther out); below 0.1 the
  // card thins toward a rectangle. Lower FULL = media hidden at a greater distance.
  // (Thresholds halved from 0.4/0.2 so media survives to ~2x the zoom-out distance.)
  if (zoom >= 0.2) return LOD_FULL;
  if (zoom >= 0.1) return LOD_COMPACT;
  return LOD_MINIMAL;
}

export interface RegionDragOffset {
  dx: number;
  dy: number;
  memberIds: Set<string>;
}

interface GraphStateContextValue {
  capturedIds: Set<string>;
  capturedEdgeIds: Set<string>;
  regionDragOffset: RegionDragOffset | null;
  highlightedNodeIds: Set<string>;
  /** Ephemeral impact-trace overlay: nodes the seed reaches (or is reached by). */
  traceNodeIds: Set<string>;
  /** Edge ids participating in the active trace. */
  traceEdgeIds: Set<string>;
  /** The node the trace originates from (gets a distinct accent). */
  traceSeedId: string | null;
  edgeCountByNodeId: Map<string, number>;
  hoveredEndpointIds: Set<string>;
  pinnedNodeIds: Set<string>;
  connectingFromNodeId: string | null;
  pinnedExpandIds: Set<string>;
  /** Ephemeral per-node expand override from the Expand/Collapse shortcut applied
   *  to a selection: id→true (force expanded) / id→false (force collapsed). Absent
   *  means "follow the global Expand-nodes-by-default preference". */
  expandOverrides: Map<string, boolean>;
  togglePinnedExpand: (id: string) => void;
  /** Toggle a node's position pin (non-draggable) from its card header. */
  togglePin: (id: string) => void;
  flashingNodeId: string | null;
  /** Commit inline-edited note text (note items are edited directly on the card). */
  updateNoteText: (id: string, text: string) => void;
  /** Toggle whether a note's body renders as markdown (vs raw plain text). */
  toggleRenderMarkdown: (id: string) => void;
  /** Toggle whether a file node shows its thumbnail/first-page preview (vs an icon). */
  toggleShowThumbnail: (id: string) => void;
  /** Persist a resized item's new position + size (from its NodeResizer). */
  resizeNode: (id: string, x: number, y: number, width: number, height: number) => void;
  /** Current level-of-detail tier (LOD_FULL/COMPACT/MINIMAL), derived from zoom. */
  lodTier: number;
  /** View-only guest: hide resize handles (and any other in-card mutation affordances). */
  readOnly: boolean;
}

const GraphStateContext = createContext<GraphStateContextValue>({
  capturedIds: new Set(),
  capturedEdgeIds: new Set(),
  regionDragOffset: null,
  highlightedNodeIds: new Set(),
  traceNodeIds: new Set(),
  traceEdgeIds: new Set(),
  traceSeedId: null,
  edgeCountByNodeId: new Map(),
  hoveredEndpointIds: new Set(),
  pinnedNodeIds: new Set(),
  connectingFromNodeId: null,
  pinnedExpandIds: new Set(),
  expandOverrides: new Map(),
  togglePinnedExpand: () => {},
  togglePin: () => {},
  flashingNodeId: null,
  updateNoteText: () => {},
  toggleRenderMarkdown: () => {},
  toggleShowThumbnail: () => {},
  resizeNode: () => {},
  lodTier: LOD_FULL,
  readOnly: false,
});

export function useGraphState() {
  return useContext(GraphStateContext);
}

export default GraphStateContext;
