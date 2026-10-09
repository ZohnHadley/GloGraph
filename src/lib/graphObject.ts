import type { GloNode, GloEdge, GloRegion, NodeMedia, NodeKind } from '../types';
import { NODE_W, NODE_H, isNodeInRegion, isRegionInRegion } from './regionMembership';
import { nodeDisplayLabel } from './nodeDisplay';

// React Flow stores nodes and regions in the same id-space (both are RF
// "nodes"), so selection sets mix their ids freely — this module is the one
// place that untangles them and the canonical model for graph-object behavior.
export type GraphObjectKind = 'node' | 'edge' | 'region';

export interface Bounds { x: number; y: number; width: number; height: number }

export interface GraphData {
  nodes: GloNode[];
  edges: GloEdge[];
  regions: GloRegion[];
}

/**
 * Behavior hierarchy for every graph object drawn on the canvas.
 *
 * These are thin wrappers around the plain data objects that live in React
 * state — created on demand for behavior queries, **never stored in state**, so
 * they don't interfere with React's data flow or serialization.
 *
 * The base class defines behaviors shared by every object; subclasses override
 * per-kind specifics; regions add their own behaviors (locking / containing
 * other objects).
 */
export abstract class GraphObject {
  abstract readonly kind: GraphObjectKind;
  abstract readonly id: string;

  /** Axis-aligned bounds in flow coordinates, or null if not positionable. */
  abstract bounds(graph: GraphData): Bounds | null;
  /** Human-readable label for menus, search, toasts. */
  abstract label(): string;

  // ── Base behaviors shared by every object (overridable per kind) ──
  isSelectable(): boolean { return true; }
  isDeletable(): boolean { return true; }
  /** Whether this object can lock/contain other objects. Only regions can. */
  canLock(): boolean { return false; }
}

/**
 * How a node draws on the canvas. The object *subtype* owns this — the view
 * asks the object rather than switching on `kind` itself.
 */
export type NodeCardLayout = 'standard' | 'text-first' | 'media-first' | 'file';

/**
 * Base node object ("graph_node"). The graph-item variants (note / image /
 * video / audio) are subclasses below that override the visual representation
 * and content accessors. They all remain `instanceof NodeObject`, so
 * containment / bounds / selection treat every node uniformly — only the
 * *presentation* and content differ, which is the whole point of the split.
 */
export class NodeObject extends GraphObject {
  readonly kind = 'node' as const;
  constructor(readonly data: GloNode) { super(); }
  get id(): string { return this.data.id; }
  bounds(): Bounds {
    return {
      x: this.data.x, y: this.data.y,
      width: this.data.width ?? NODE_W, height: this.data.height ?? NODE_H,
    };
  }
  label(): string { return this.displayLabel(); }

  /** The node-variant discriminator (`standard` by default). */
  get nodeKind(): NodeKind { return (this.data.kind ?? 'standard') as NodeKind; }
  /** Canvas layout for this object type (standard nodes are compact-by-default). */
  cardLayout(): NodeCardLayout { return 'standard'; }
  /** The single media rendered as primary content (media items only). */
  primaryMedia(): NodeMedia | undefined { return undefined; }
  /** Display label with the untitled fallback (shared helper is the source of truth). */
  displayLabel(): string { return nodeDisplayLabel(this.data); }
}

/** Free-text note — renders text-first, content shown at rest. */
export class NoteObject extends NodeObject {
  cardLayout(): NodeCardLayout { return 'text-first'; }
}

/** Shared base for the single-media items — renders media-first. */
export abstract class MediaNodeObject extends NodeObject {
  cardLayout(): NodeCardLayout { return 'media-first'; }
  primaryMedia(): NodeMedia | undefined {
    const media = this.data.media ?? [];
    return media.find(m => m.showOnCard !== false) ?? media[0];
  }
}

export class ImageObject extends MediaNodeObject {}
export class VideoObject extends MediaNodeObject {}
export class AudioObject extends MediaNodeObject {}

/**
 * A file attachment (any local file or URL) — renders a type-appropriate preview
 * (thumbnail for pdf/text/office/image) or a file icon, with the filename as the
 * title. Holds its reference in the single `node_media` row (srcType file|url,
 * mediaType 'file'), like the media items.
 */
export class FileObject extends NodeObject {
  cardLayout(): NodeCardLayout { return 'file'; }
  primaryMedia(): NodeMedia | undefined {
    const media = this.data.media ?? [];
    return media.find(m => m.mediaType === 'file') ?? media[0];
  }
}

/** Construct the NodeObject subclass matching a node's `kind`. */
export function nodeObjectFor(node: GloNode): NodeObject {
  switch (node.kind) {
    case 'note':  return new NoteObject(node);
    case 'image': return new ImageObject(node);
    case 'video': return new VideoObject(node);
    case 'audio': return new AudioObject(node);
    case 'file':  return new FileObject(node);
    default:      return new NodeObject(node);
  }
}

export class EdgeObject extends GraphObject {
  readonly kind = 'edge' as const;
  constructor(readonly data: GloEdge) { super(); }
  get id(): string { return this.data.id; }
  bounds(graph: GraphData): Bounds | null {
    const s = graph.nodes.find(n => n.id === this.data.sourceId);
    const t = graph.nodes.find(n => n.id === this.data.targetId);
    if (!s || !t) return null;
    return {
      x: Math.min(s.x, t.x),
      y: Math.min(s.y, t.y),
      width: Math.abs(s.x - t.x) + NODE_W,
      height: Math.abs(s.y - t.y) + NODE_H,
    };
  }
  label(): string { return this.data.label ?? 'Edge'; }
}

export class RegionObject extends GraphObject {
  readonly kind = 'region' as const;
  constructor(readonly data: GloRegion) { super(); }
  get id(): string { return this.data.id; }
  bounds(): Bounds {
    return { x: this.data.x, y: this.data.y, width: this.data.width, height: this.data.height };
  }
  label(): string { return this.data.title || 'Region'; }

  // ── Region-specific behavior: locking / containment ──
  canLock(): boolean { return true; }

   /**
   * Whether `obj` is a member of this region per the lock/containment rule —
   * nodes use the center-point test (`isNodeInRegion`), regions the ≥50%-area
   * test which also requires this region to be strictly larger than `obj`
   * (`isRegionInRegion`, so a child can't capture its bigger parent), edges
   * never. Pass `at` to test a hypothetical position (e.g. mid-drag) rather than
   * the object's stored position.
   */
  contains(obj: GraphObject, at?: { x: number; y: number }): boolean {
    if (obj.id === this.id) return false;
    if (obj instanceof NodeObject) {
      return isNodeInRegion(
        { x: at?.x ?? obj.data.x, y: at?.y ?? obj.data.y, width: obj.data.width, height: obj.data.height },
        this.data,
      );
    }
    if (obj instanceof RegionObject) {
      const x = at?.x ?? obj.data.x;
      const y = at?.y ?? obj.data.y;
      return isRegionInRegion({ x, y, width: obj.data.width, height: obj.data.height }, this.data);
    }
    return false;
  }
}

// ── Factory / resolution ──────────────────────────────────────────────────

/** Resolve an id to its graph-object wrapper, or `undefined` if it isn't on the graph. */
export function resolveObject(graph: GraphData, id: string): GraphObject | undefined {
  const n = graph.nodes.find(x => x.id === id); if (n) return nodeObjectFor(n);
  const r = graph.regions.find(x => x.id === id); if (r) return new RegionObject(r);
  const e = graph.edges.find(x => x.id === id); if (e) return new EdgeObject(e);
  return undefined;
}

export function objectKind(graph: GraphData, id: string): GraphObjectKind | undefined {
  return resolveObject(graph, id)?.kind;
}

/** Resolve a list of ids to graph-object wrappers, dropping any that no longer exist. */
export function resolveObjects(graph: GraphData, ids: Iterable<string>): GraphObject[] {
  const out: GraphObject[] = [];
  for (const id of ids) {
    const obj = resolveObject(graph, id);
    if (obj) out.push(obj);
  }
  return out;
}

/**
 * Split a mixed id list (the form selection sets hold) into typed buckets.
 * Replaces the ad-hoc `new Set(regions.map(...))` / `.filter(...)` dance that
 * was duplicated across delete / copy / duplicate handlers.
 */
export function partitionIds(graph: GraphData, ids: Iterable<string>): {
  nodeIds: string[];
  edgeIds: string[];
  regionIds: string[];
} {
  const regionIdSet = new Set(graph.regions.map(r => r.id));
  const edgeIdSet = new Set(graph.edges.map(e => e.id));
  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  const regionIds: string[] = [];
  for (const id of ids) {
    if (regionIdSet.has(id)) regionIds.push(id);
    else if (edgeIdSet.has(id)) edgeIds.push(id);
    else nodeIds.push(id);
  }
  return { nodeIds, edgeIds, regionIds };
}
