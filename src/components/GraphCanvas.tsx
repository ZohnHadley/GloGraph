import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Connection,
  ConnectionMode,
  SelectionMode,
  Node,
  Edge,
  OnConnect,
  BackgroundVariant,
  Viewport,
  ViewportPortal,
  useStore,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BringToFront, Copy, Lock, Minus, Network, Plus, SendToBack, Square, Trash2, Unlock, ArrowRight, ArrowLeft } from 'lucide-react';
import NodeCard from './NodeCard';
import RegionCard from './RegionCard';
import EdgeLine from './EdgeLine';
import EdgeWeightLegend from './EdgeWeightLegend';
import ApiStatusBadge from './ApiStatusBadge';
import { GloNode, GloEdge, GloRegion, NodePosition, WaypointPoint } from '../types';
import type { TraceDirection } from '../lib/trace';
import type { Marquee } from '../lib/presence';
import { usePresencePeers, usePresenceApi } from '../context/PresenceContext';

// Live Share presence overlay: remote participants' cursors, drawn in flow space
// (so they track pan) but counter-scaled by zoom (so they stay a constant size).
// Also captures the local cursor over the canvas and reports it (in flow coords).
function PresenceLayer() {
  const remoteCursors = usePresencePeers();
  const { sendCursor: onCursorMove } = usePresenceApi();
  const { screenToFlowPosition } = useReactFlow();
  const zoom = useStore(s => s.transform[2]);
  const lastPos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    // The local drag-select box: read React Flow's live selection rectangle from the
    // DOM and convert it to flow coords, so peers see our marquee in real time. Null
    // when not selecting (no element, or zero-size).
    function readMarquee(): Marquee | null {
      const sel = document.querySelector('.react-flow__selection') as HTMLElement | null;
      if (!sel) return null;
      const r = sel.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      const tl = screenToFlowPosition({ x: r.left, y: r.top });
      const br = screenToFlowPosition({ x: r.right, y: r.bottom });
      return { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y };
    }
    function onMove(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t || !t.closest || !t.closest('.react-flow')) return; // only over the canvas
      const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      lastPos.current = { x: p.x, y: p.y };
      onCursorMove?.(p.x, p.y, readMarquee());
    }
    // On release the selection box is gone — broadcast the clear immediately (the
    // throttle is bypassed at the marquee null boundary) so no ghost box lingers.
    function onUp() { onCursorMove?.(lastPos.current.x, lastPos.current.y, null); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [onCursorMove, screenToFlowPosition]);
  return (
    <ViewportPortal>
      {/* Remote peers' live drag-select boxes (flow-space rects, so they scale with the canvas). */}
      {remoteCursors.map(c => c.marquee && (
        <div
          key={`${c.id}-marquee`}
          className="presence-marquee"
          style={{
            transform: `translate(${c.marquee.x}px, ${c.marquee.y}px)`,
            width: c.marquee.w,
            height: c.marquee.h,
            borderColor: c.color,
            background: `${c.color}1f`,
          }}
        />
      ))}
      {remoteCursors.map(c => (
        <div key={c.id} className="presence-cursor" style={{ transform: `translate(${c.x}px, ${c.y}px) scale(${1 / zoom})`, transformOrigin: '0 0' }}>
          <svg width="16" height="22" viewBox="0 0 16 22" aria-hidden>
            <path d="M1 1 L1 16 L5 12.5 L8 20 L10.5 19 L7.5 11.5 L13 11.5 Z" fill={c.color} stroke="#0c0c0c" strokeWidth="1" />
          </svg>
          <span className="presence-cursor__name" style={{ background: c.color }}>{c.name}</span>
        </div>
      ))}
    </ViewportPortal>
  );
}

// Overlay remote peers on the minimap, read from its SVG viewBox (React Flow has no
// minimap-overlay API). Degrades gracefully — nothing renders if the minimap DOM
// isn't found; re-reads on cursor moves and viewport (pan/zoom) changes.
function MinimapCursors() {
  const peers = usePresencePeers();
  const transform = useStore(s => s.transform);
  const [dots, setDots] = useState<{ id: string; color: string; x: number; y: number }[]>([]);
  useEffect(() => {
    const mm = document.querySelector('.react-flow__minimap') as HTMLElement | null;
    const svg = mm?.querySelector('svg') as SVGSVGElement | null;
    if (!mm || !svg || !svg.viewBox.baseVal.width || !svg.viewBox.baseVal.height) {
      setDots(d => (d.length ? [] : d));
      return;
    }
    const vb = svg.viewBox.baseVal;
    const rect = mm.getBoundingClientRect();
    const next: { id: string; color: string; x: number; y: number }[] = [];
    for (const p of peers) {
      const fx = (p.x - vb.x) / vb.width;
      const fy = (p.y - vb.y) / vb.height;
      if (fx < 0 || fx > 1 || fy < 0 || fy > 1) continue; // outside the minimap's extent
      next.push({ id: p.id, color: p.color, x: rect.left + fx * rect.width, y: rect.top + fy * rect.height });
    }
    setDots(next);
  }, [peers, transform]);
  if (!dots.length) return null;
  return createPortal(
    <>
      {dots.map(d => (
        <div key={d.id} className="minimap-cursor" style={{ left: d.x, top: d.y, background: d.color }} />
      ))}
    </>,
    document.body,
  );
}

import { useSettings } from '../context/SettingsContext';
import GraphStateContext, { type RegionDragOffset, LOD_FULL, zoomToLodTier } from '../context/GraphStateContext';
import { NODE_W, NODE_H } from '../lib/regionMembership';
import { GraphObject, NodeObject, RegionObject } from '../lib/graphObject';
import { computeHierarchy, subtreeOf } from '../lib/containerHierarchy';

const REGION_HEADER_H = 28;

const nodeTypes = { gloNode: NodeCard, region: RegionCard };
const edgeTypes = { gloEdge: EdgeLine };

// Stable empty set for the `highlightedNodeIds` fallback — `?? new Set()` would
// allocate a fresh set every render and defeat the GraphStateContext value memo.
const EMPTY_NODE_SET: Set<string> = new Set();

// Reports the discrete LOD tier up to GraphCanvas. The store selector returns the
// *tier* (not raw zoom), so this re-renders only when the tier changes — never on
// every zoom tick. Must render inside <ReactFlow> to read its store.
function LodController({ onTier }: { onTier: (tier: number) => void }) {
  const tier = useStore(s => zoomToLodTier(s.transform[2]));
  useEffect(() => { onTier(tier); }, [tier, onTier]);
  return null;
}

// Resizable graph-item kinds and their default canvas size (used until the user
// drags to resize, at which point an explicit width/height is persisted).
const RESIZABLE_KINDS = new Set(['image', 'video', 'note', 'file']);
const DEFAULT_ITEM_SIZE: Record<string, { width: number; height: number }> = {
  image: { width: 220, height: 160 },
  video: { width: 260, height: 168 },
  note:  { width: 220, height: 120 },
  file:  { width: 200, height: 150 },
};

function toRFNode(n: GloNode): Node {
  const node: Node = {
    id: n.id,
    type: 'gloNode',
    position: { x: n.x, y: n.y },
    data: n as unknown as Record<string, unknown>,
  };
  // Resizable items get an explicit RF box so NodeResizer can drive their size;
  // standard nodes stay content-sized (no style).
  if (n.kind && RESIZABLE_KINDS.has(n.kind)) {
    const def = DEFAULT_ITEM_SIZE[n.kind];
    node.style = { width: n.width ?? def.width, height: n.height ?? def.height };
  }
  return node;
}

function toRFEdge(
  e: GloEdge,
  onWaypointsChange?: (id: string, waypoints: WaypointPoint[] | null) => void,
  onHoverChange?: (id: string, hovered: boolean) => void,
  onEdgeLabelChange?: (id: string, label: string | null) => void,
): Edge {
  return {
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
    type: 'gloEdge',
    data: { ...e, onWaypointsChange, onHoverChange, onEdgeLabelChange } as unknown as Record<string, unknown>,
  };
}

function toRFRegion(
  r: GloRegion,
  isMinimized: boolean,
  isLocked: boolean,
  onMinimize: (id: string, minimized: boolean) => void,
  onResize: (id: string, x: number, y: number, w: number, h: number) => void,
  onLock: (id: string, locked: boolean) => void,
): Node {
  return {
    id: r.id,
    type: 'region',
    position: { x: r.x, y: r.y },
    style: {
      width: r.width,
      height: isMinimized ? REGION_HEADER_H : r.height,
    },
    zIndex: -1,
    data: { ...r, isMinimized, isLocked, onMinimize, onResize, onLock } as unknown as Record<string, unknown>,
  };
}

// Snapshot which nodes are inside a region's body at the moment of minimization.
// Used by computeNodeRegionMap so that only pre-minimization members are hidden —
// nodes dropped into the ghost body area afterward are not absorbed.
function snapshotMinimizedMembers(nodes: GloNode[], region: GloRegion): Set<string> {
  const members = new Set<string>();
  const rbL = region.x;
  const rbT = region.y + REGION_HEADER_H;
  const rbR = region.x + region.width;
  const rbB = region.y + region.height;
  for (const node of nodes) {
    const iL = Math.max(node.x, rbL);
    const iT = Math.max(node.y, rbT);
    const iR = Math.min(node.x + NODE_W, rbR);
    const iB = Math.min(node.y + NODE_H, rbB);
    if (iR > iL && iB > iT && (iR - iL) * (iB - iT) / (NODE_W * NODE_H) >= 0.75) {
      members.add(node.id);
    }
  }
  return members;
}

function computeNodeRegionMap(
  nodes: GloNode[],
  minimizedMembership: Map<string, Set<string>>,
): Map<string, string> {
  const map = new Map<string, string>();
  const nodeIds = new Set(nodes.map(n => n.id));
  for (const [regionId, members] of minimizedMembership) {
    for (const nodeId of members) {
      if (nodeIds.has(nodeId) && !map.has(nodeId)) {
        map.set(nodeId, regionId);
      }
    }
  }
  return map;
}

// Remap edges whose endpoints are hidden inside minimized regions
function computeVisualEdges(
  edges: GloEdge[],
  nodeRegionMap: Map<string, string>,
): GloEdge[] {
  const result: GloEdge[] = [];
  for (const edge of edges) {
    const srcRegion = nodeRegionMap.get(edge.sourceId);
    const tgtRegion = nodeRegionMap.get(edge.targetId);
    // Both endpoints in same minimized region — drop
    if (srcRegion && tgtRegion && srcRegion === tgtRegion) continue;
    // No remapping needed
    if (!srcRegion && !tgtRegion) { result.push(edge); continue; }
    result.push({
      ...edge,
      id: `${edge.id}__remap`,
      sourceId: srcRegion ?? edge.sourceId,
      targetId: tgtRegion ?? edge.targetId,
    });
  }
  return result;
}

function ContextMenu({
  pos,
  onClose,
  onOpenCreatePicker,
  onCreateRegion,
}: {
  pos: { x: number; y: number };
  onClose: () => void;
  onOpenCreatePicker: (screen: { x: number; y: number }, flow: { x: number; y: number }, regionId?: string) => void;
  onCreateRegion: (flowPos: { x: number; y: number }) => void;
}) {
  const { screenToFlowPosition } = useReactFlow();
  const flowPos = () => screenToFlowPosition({ x: pos.x, y: pos.y });

  return createPortal(
    <>
      <div className="context-menu-overlay" onClick={onClose} onContextMenu={e => e.preventDefault()} />
      <div
        className="canvas-context-menu"
        style={{ left: pos.x, top: pos.y }}
        onContextMenu={e => e.preventDefault()}
      >
        <button
          className="context-menu-item"
          onClick={e => { e.stopPropagation(); onOpenCreatePicker(pos, flowPos()); onClose(); }}
        >
          <Plus size={13} />
          Add node here…
        </button>
        <hr className="context-menu-separator" />
        <button
          className="context-menu-item"
          onClick={e => { e.stopPropagation(); onCreateRegion(flowPos()); onClose(); }}
        >
          <Square size={13} />
          Add node region here
        </button>
      </div>
    </>,
    document.body
  );
}

function RegionContextMenu({
  pos,
  regionId,
  isLocked,
  isMinimized,
  onClose,
  onLock,
  onMinimize,
  onBringToFront,
  onSendToBack,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenCreatePicker,
}: {
  pos: { x: number; y: number };
  regionId: string;
  isLocked: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onLock: (id: string, locked: boolean) => void;
  onMinimize: (id: string, minimized: boolean) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onOpenCreatePicker: (screen: { x: number; y: number }, flow: { x: number; y: number }, regionId?: string) => void;
}) {
  const { screenToFlowPosition } = useReactFlow();
  return createPortal(
    <>
      <div className="context-menu-overlay" onClick={onClose} onContextMenu={e => e.preventDefault()} />
      <div
        className="canvas-context-menu"
        style={{ left: pos.x, top: pos.y }}
        onContextMenu={e => e.preventDefault()}
      >
        <button
          className="context-menu-item"
          onClick={() => { onOpenCreatePicker(pos, screenToFlowPosition({ x: pos.x, y: pos.y }), regionId); onClose(); }}
        >
          <Plus size={13} /> Add node here…
        </button>
        <hr className="context-menu-separator" />
        <button className="context-menu-item" onClick={() => { onLock(regionId, !isLocked); onClose(); }}>
          {isLocked ? <><Unlock size={13} /> Unlock Region</> : <><Lock size={13} /> Lock Region</>}
          {!isLocked && isMinimized && <span className="context-menu-item__note">expands first</span>}
        </button>
        <button className="context-menu-item" onClick={() => { onMinimize(regionId, !isMinimized); onClose(); }}>
          {isMinimized ? <><Plus size={13} /> Expand</> : <><Minus size={13} /> Minimize</>}
          {!isMinimized && isLocked && <span className="context-menu-item__note">unlocks first</span>}
        </button>
        <hr className="context-menu-separator" />
        <button className="context-menu-item" onClick={() => { onBringToFront(regionId); onClose(); }}>
          <BringToFront size={13} /> Bring to Front
        </button>
        <button className="context-menu-item" onClick={() => { onSendToBack(regionId); onClose(); }}>
          <SendToBack size={13} /> Send to Back
        </button>
        <hr className="context-menu-separator" />
        <button className="context-menu-item" onClick={() => { onEdit(regionId); onClose(); }}>
          Edit Region…
        </button>
        {onDuplicate && (
          <button className="context-menu-item" onClick={() => { onDuplicate(regionId); onClose(); }}>
            <Copy size={13} /> Duplicate Region
          </button>
        )}
        <hr className="context-menu-separator" />
        <button className="context-menu-item context-menu-item--danger" onClick={() => { onDelete(regionId); onClose(); }}>
          <Trash2 size={13} /> Delete Region
        </button>
      </div>
    </>,
    document.body
  );
}

function NodeContextMenu({
  pos,
  nodeId,
  onClose,
  onFindRelated,
  onTrace,
  onBringToFront,
  onSendToBack,
  onDuplicate,
  onDelete,
  selectionCount = 1,
}: {
  pos: { x: number; y: number };
  nodeId: string;
  onClose: () => void;
  onFindRelated: (nodeId: string) => void;
  onTrace?: (nodeId: string, direction: TraceDirection) => void;
  onBringToFront?: (nodeId: string) => void;
  onSendToBack?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  selectionCount?: number;
}) {
  return createPortal(
    <>
      <div className="context-menu-overlay" onClick={onClose} onContextMenu={e => e.preventDefault()} />
      <div
        className="canvas-context-menu"
        style={{ left: pos.x, top: pos.y }}
        onContextMenu={e => e.preventDefault()}
      >
        <button className="context-menu-item" onClick={() => { onFindRelated(nodeId); onClose(); }}>
          <Network size={13} />
          Select Connected
        </button>
        {onTrace && (
          <>
            <button className="context-menu-item" onClick={() => { onTrace(nodeId, 'downstream'); onClose(); }}>
              <ArrowRight size={13} />
              Trace impact (downstream)
            </button>
            <button className="context-menu-item" onClick={() => { onTrace(nodeId, 'upstream'); onClose(); }}>
              <ArrowLeft size={13} />
              Trace causes (upstream)
            </button>
          </>
        )}
        <hr className="context-menu-separator" />
        {onBringToFront && (
          <button className="context-menu-item" onClick={() => { onBringToFront(nodeId); onClose(); }}>
            <BringToFront size={13} />
            Bring to Front
          </button>
        )}
        {onSendToBack && (
          <button className="context-menu-item" onClick={() => { onSendToBack(nodeId); onClose(); }}>
            <SendToBack size={13} />
            Send to Back
          </button>
        )}
        {(onDuplicate || onDelete) && <hr className="context-menu-separator" />}
        {onDuplicate && (
          <button className="context-menu-item" onClick={() => { onDuplicate(nodeId); onClose(); }}>
            <Copy size={13} />
            {selectionCount > 1 ? `Duplicate (${selectionCount})` : 'Duplicate'}
          </button>
        )}
        {onDelete && (
          <button className="context-menu-item context-menu-item--danger" onClick={() => { onDelete(nodeId); onClose(); }}>
            <Trash2 size={13} />
            {selectionCount > 1 ? `Delete (${selectionCount})` : 'Delete'}
          </button>
        )}
      </div>
    </>,
    document.body
  );
}

function EdgeContextMenu({
  pos,
  edgeId,
  hasWaypoints,
  onClose,
  onDelete,
  onClearWaypoints,
}: {
  pos: { x: number; y: number };
  edgeId: string;
  hasWaypoints: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onClearWaypoints: (id: string) => void;
}) {
  return createPortal(
    <>
      <div className="context-menu-overlay" onClick={onClose} onContextMenu={e => e.preventDefault()} />
      <div
        className="canvas-context-menu"
        style={{ left: pos.x, top: pos.y }}
        onContextMenu={e => e.preventDefault()}
      >
        {hasWaypoints && (
          <>
            <button className="context-menu-item" onClick={() => { onClearWaypoints(edgeId); onClose(); }}>
              Clear Waypoints
            </button>
            <hr className="context-menu-separator" />
          </>
        )}
        <button className="context-menu-item context-menu-item--danger" onClick={() => { onDelete(edgeId); onClose(); }}>
          <Trash2 size={13} />
          Delete Edge
        </button>
      </div>
    </>,
    document.body
  );
}

function SelectAllTrigger({ trigger }: { trigger: number }) {
  const { setNodes, setEdges } = useReactFlow();
  const prevTrigger = useRef(trigger);
  useEffect(() => {
    if (trigger === prevTrigger.current) return;
    prevTrigger.current = trigger;
    setNodes(nds => nds.map(n => ({ ...n, selected: true })));
    setEdges(eds => eds.map(e => ({ ...e, selected: true })));
  }, [trigger, setNodes, setEdges]);
  return null;
}

function SelectRegionMembersTrigger({
  trigger,
  regionId,
  nodes,
  regions,
}: {
  trigger: number;
  regionId: string | undefined;
  nodes: GloNode[];
  regions: GloRegion[];
}) {
  const { setNodes } = useReactFlow();
  const prevRef = useRef(trigger);
  useEffect(() => {
    if (trigger === prevRef.current) return;
    prevRef.current = trigger;
    if (!regionId) return;
    const region = regions.find(r => r.id === regionId);
    if (!region) return;
    const regionEl = new RegionObject(region);
    const memberIds = new Set(
      nodes.filter(n => regionEl.contains(new NodeObject(n))).map(n => n.id)
    );
    setNodes(nds => nds.map(n => ({ ...n, selected: memberIds.has(n.id) })));
  }, [trigger, regionId, nodes, regions, setNodes]);
  return null;
}

function ZoomToSelectionTrigger({ trigger }: { trigger: number }) {
  const { fitView, getNodes } = useReactFlow();
  const prevRef = useRef(trigger);
  useEffect(() => {
    if (trigger === prevRef.current) return;
    prevRef.current = trigger;
    const selected = getNodes().filter(n => n.selected && n.type !== 'region');
    if (selected.length > 0) {
      fitView({ nodes: selected, padding: 0.25, duration: 400 });
    } else {
      fitView({ padding: 0.15, duration: 400 });
    }
  }, [trigger, fitView, getNodes]);
  return null;
}

function ViewportSync({
  targetViewport,
  onTargetConsumed,
}: {
  targetViewport?: Viewport | null;
  onTargetConsumed: () => void;
}) {
  const { setViewport } = useReactFlow();
  const prevTarget = useRef<Viewport | null>(null);
  useEffect(() => {
    if (!targetViewport || targetViewport === prevTarget.current) return;
    prevTarget.current = targetViewport;
    setViewport(targetViewport, { duration: 400 });
    onTargetConsumed();
  }, [targetViewport, setViewport, onTargetConsumed]);
  return null;
}

function PaneDblClickHandler({ onPaneDoubleClick }: { onPaneDoubleClick: (pos: { x: number; y: number }) => void }) {
  const { screenToFlowPosition } = useReactFlow();
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!(e.target as HTMLElement).classList.contains('react-flow__pane')) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      onPaneDoubleClick(pos);
    }
    document.addEventListener('dblclick', handler);
    return () => document.removeEventListener('dblclick', handler);
  }, [onPaneDoubleClick, screenToFlowPosition]);
  return null;
}

// Publishes React Flow's own screen→flow projection to a ref so code outside
// the <ReactFlow> tree (App.tsx) can place elements in graph coordinates.
function ScreenToFlowPublisher({ targetRef }: { targetRef: React.MutableRefObject<((p: { x: number; y: number }) => { x: number; y: number }) | null> }) {
  const { screenToFlowPosition } = useReactFlow();
  useEffect(() => {
    targetRef.current = screenToFlowPosition;
    return () => { targetRef.current = null; };
  }, [targetRef, screenToFlowPosition]);
  return null;
}

function FitViewTrigger({ trigger }: { trigger: number }) {
  const { fitView } = useReactFlow();
  const prevRef = useRef(trigger);
  useEffect(() => {
    if (trigger !== prevRef.current) {
      prevRef.current = trigger;
      fitView({ duration: 400, padding: 0.15 });
    }
  }, [trigger, fitView]);
  return null;
}

function ScrollToNode({ pos, onDone }: { pos: { x: number; y: number }; onDone: () => void }) {
  const { setCenter } = useReactFlow();
  useEffect(() => {
    const timer = setTimeout(() => {
      setCenter(pos.x, pos.y, { duration: 500, zoom: 1.1 });
      onDone();
    }, 80);
    return () => clearTimeout(timer);
  }, [pos.x, pos.y, setCenter, onDone]);
  return null;
}

interface GraphCanvasProps {
  nodes: GloNode[];
  edges: GloEdge[];
  regions: GloRegion[];
  minimizedRegionIds: Set<string>;
  lockedRegionIds: Set<string>;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  selectedRegionId?: string;
  onNodeSelect: (node: GloNode | null) => void;
  onEdgeSelect: (edge: GloEdge | null) => void;
  onRegionSelect: (region: GloRegion | null) => void;
  onConnect: (sourceId: string, targetId: string, sourceHandle?: string | null, targetHandle?: string | null) => void;
  onEdgeReconnect: (id: string, sourceId: string, targetId: string, sourceHandle?: string | null, targetHandle?: string | null) => void;
  onEdgeDelete: (id: string) => void;
  onNodeMove: (positions: NodePosition[], draggedNodeIds?: string[]) => void;
  onNodeDoubleClick: (node: GloNode) => void;
  onRegionMinimize: (id: string, minimized: boolean) => void;
  onRegionLock: (id: string, locked: boolean) => void;
  onRegionMove: (id: string, x: number, y: number) => void;
  onRegionResize: (id: string, x: number, y: number, w: number, h: number) => void;
  onEdgeWaypointsChange: (id: string, waypoints: WaypointPoint[] | null) => void;
  onEdgeLabelChange?: (id: string, label: string | null) => void;
  onPaneClick: () => void;
  onPaneDoubleClick?: (pos: { x: number; y: number }) => void;
  /** View-only guest: disable node drag/connect + create-on-double-click. */
  readOnly?: boolean;
  onContextMenuCreateRegion: (pos: { x: number; y: number }) => void;
  /** Open the create-type picker at a screen point. `flow` is the create
   *  position; `regionId` is set when opened from inside a region, so the new
   *  node is centred on the click and lands inside that region. */
  onOpenCreatePicker: (screen: { x: number; y: number }, flow: { x: number; y: number }, regionId?: string) => void;
  onSelectionChange?: (nodeIds: string[], edgeIds: string[]) => void;
  onMultiSelectionOrderChange?: (orderedIds: string[]) => void;
  onSelectionDragVector?: (dx: number, dy: number) => void;
  onViewportChange?: (zoom: number) => void;
  onFindRelated?: (nodeId: string) => void;
  onTrace?: (nodeId: string, direction: TraceDirection) => void;
  traceNodeIds?: Set<string>;
  traceEdgeIds?: Set<string>;
  traceSeedId?: string | null;
  onNodeBringToFront?: (nodeId: string) => void;
  onNodeSendToBack?: (nodeId: string) => void;
  onNodeDuplicate?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  scrollToPos?: { x: number; y: number } | null;
  onScrolled?: () => void;
  fitViewTrigger?: number;
  selectAllTrigger?: number;
  zoomToSelectionTrigger?: number;
  viewportRef?: React.MutableRefObject<Viewport>;
  screenToFlowRef?: React.MutableRefObject<((p: { x: number; y: number }) => { x: number; y: number }) | null>;
  targetViewport?: Viewport | null;
  onTargetViewportConsumed?: () => void;
  highlightedNodeIds?: Set<string>;
  flashingNodeId?: string | null;
  onRegionEdit?: (regionId: string) => void;
  onRegionDelete?: (id: string) => void;
  onRegionDuplicate?: (id: string) => void;
  onRegionBringToFront?: (id: string) => void;
  onRegionSendToBack?: (id: string) => void;
  selectRegionTrigger?: number;
  pinnedNodeIds?: Set<string>;
  pinnedExpandIds?: Set<string>;
  expandOverrides?: Map<string, boolean>;
  onTogglePinnedExpand?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onNoteChange?: (id: string, text: string) => void;
  onToggleRenderMarkdown?: (id: string) => void;
  onToggleShowThumbnail?: (id: string) => void;
  onNodeResize?: (id: string, x: number, y: number, width: number, height: number) => void;
  /** Live Share: render the presence cursor/marquee layer (peers + sender come from PresenceContext). */
  inSession?: boolean;
}

export default function GraphCanvas({
  nodes,
  edges,
  regions,
  minimizedRegionIds,
  lockedRegionIds,
  selectedNodeId,
  selectedEdgeId,
  selectedRegionId,
  onNodeSelect,
  onEdgeSelect,
  onRegionSelect,
  onConnect: onConnectExternal,
  onEdgeReconnect,
  onEdgeDelete,
  onEdgeWaypointsChange,
  onEdgeLabelChange,
  onNodeMove,
  onNodeDoubleClick,
  onRegionMinimize,
  onRegionLock,
  onRegionMove,
  onRegionResize,
  onPaneClick,
  onPaneDoubleClick,
  readOnly,
  onContextMenuCreateRegion,
  onOpenCreatePicker,
  onSelectionChange,
  onMultiSelectionOrderChange,
  onSelectionDragVector,
  onViewportChange,
  onFindRelated,
  onTrace,
  traceNodeIds = new Set(),
  traceEdgeIds = new Set(),
  traceSeedId = null,
  onNodeBringToFront,
  onNodeSendToBack,
  onNodeDuplicate,
  onNodeDelete,
  scrollToPos,
  onScrolled,
  fitViewTrigger = 0,
  selectAllTrigger = 0,
  zoomToSelectionTrigger = 0,
  viewportRef,
  screenToFlowRef,
  targetViewport,
  onTargetViewportConsumed,
  highlightedNodeIds,
  flashingNodeId,
  onRegionEdit,
  onRegionDelete,
  onRegionDuplicate,
  onRegionBringToFront,
  onRegionSendToBack,
  selectRegionTrigger = 0,
  pinnedNodeIds = new Set(),
  pinnedExpandIds: pinnedExpandIdsProp = new Set(),
  expandOverrides = new Map(),
  onTogglePinnedExpand,
  onTogglePin,
  onNoteChange,
  onToggleRenderMarkdown,
  onToggleShowThumbnail,
  onNodeResize,
  inSession,
}: GraphCanvasProps) {
  const { getNodeColor, snapToGrid } = useSettings();
  // Remote shared-selection highlights, stable across cursor churn (PresenceContext).
  const { remoteSelections } = usePresenceApi();

  // Tracks nodes/regions explicitly added to multi-selection via Shift+click.
  // We own this state (rather than relying on RF internal selection) so that
  // setDisplayNodes(allRFNodes) via the sync useEffect never wipes the selection.
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(new Set());

  // When an external single-select happens (sidebar, double-click, edge click),
  // exit multi-select mode so the single selection is visually correct.
  // Use functional update so we only trigger a re-render when there's actually something to clear.
  useEffect(() => {
    if (selectedNodeId || selectedEdgeId || selectedRegionId) {
      setMultiSelectedIds(prev => prev.size > 0 ? new Set() : prev);
    }
  }, [selectedNodeId, selectedEdgeId, selectedRegionId]);

  // Emit ordered selection so parent can auto-wire in click order.
  const onMultiSelectionOrderChangeRef = useRef(onMultiSelectionOrderChange);
  onMultiSelectionOrderChangeRef.current = onMultiSelectionOrderChange;
  useEffect(() => {
    onMultiSelectionOrderChangeRef.current?.(Array.from(multiSelectedIds));
  }, [multiSelectedIds]);

  // Track drag-select direction: emit the screen-space vector from mousedown to mouseup.
  const dragStartScreenRef = useRef<{ x: number; y: number } | null>(null);
  const onSelectionDragVectorRef = useRef(onSelectionDragVector);
  onSelectionDragVectorRef.current = onSelectionDragVector;
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      dragStartScreenRef.current = { x: e.clientX, y: e.clientY };
    }
    function onMouseUp(e: MouseEvent) {
      const start = dragStartScreenRef.current;
      if (!start) return;
      onSelectionDragVectorRef.current?.(e.clientX - start.x, e.clientY - start.y);
      dragStartScreenRef.current = null;
    }
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Ref-based stable callbacks: always call the latest prop without recreating every render.
  // This prevents rfRegions from changing on every App.tsx re-render, which would reset RF selection.
  const onRegionMinimizeRef = useRef(onRegionMinimize);
  onRegionMinimizeRef.current = onRegionMinimize;
  const onRegionResizeRef = useRef(onRegionResize);
  onRegionResizeRef.current = onRegionResize;
  const onRegionLockRef = useRef(onRegionLock);
  onRegionLockRef.current = onRegionLock;

  // Always-current refs so stable callbacks don't capture stale closures
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const regionsRef = useRef(regions);
  regionsRef.current = regions;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const lockedRegionIdsRef = useRef(lockedRegionIds);
  lockedRegionIdsRef.current = lockedRegionIds;
  const minimizedRegionIdsRef = useRef(minimizedRegionIds);
  minimizedRegionIdsRef.current = minimizedRegionIds;

  // Snapshot of which nodes were inside each region at the moment it was minimized.
  // Only nodes in this snapshot are hidden — nodes dropped into the ghost body afterward are not absorbed.
  const [minimizedMembership, setMinimizedMembership] = useState<Map<string, Set<string>>>(new Map());

  // regionId → Set<nodeId>. Single source of truth for both drag behavior and visual indicator.
  // Only locked regions have entries; cleared on unlock.
  const membershipRef = useRef<Map<string, Set<string>>>(new Map());

  // Live subtree of the region currently being dragged (computed once at
  // drag-start from the container hierarchy, cleared on drag-stop). Drives which
  // elements follow a locked-region drag — see `handleNodeDrag`/`handleNodeDragStop`.
  const regionDragRef = useRef<{ id: string; members: Set<string> } | null>(null);

  // The "captured" set drives the lock-badge indicator and captured-region
  // z-index. An element is captured by its **immediate** (smallest-area)
  // containing region only — and only when that region is locked (and not
  // minimized). So a node nested in an inner region is NOT shown captured by a
  // larger locked *ancestor*; movement, by contrast, is transitive (the flat
  // `membershipRef` subtree drives dragging, below). Recomputed from live
  // geometry whenever positions / lock / minimize change (see the effect after
  // `flushCaptured`), so it stays correct as elements are dragged in and out.
  const [capturedIds, setCapturedNodeIds] = useState<Set<string>>(new Set());

  const capturedEdgeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [, members] of membershipRef.current) {
      for (const edge of edges) {
        if (members.has(edge.sourceId) && members.has(edge.targetId)) {
          ids.add(edge.id);
        }
      }
    }
    return ids;
  }, [capturedIds, edges]);

  // Recompute `capturedIds` from immediate-parent ownership. For each element,
  // find the smallest-area region that geometrically contains it; mark it
  // captured iff that immediate region is locked and not minimized.
  const flushCaptured = useCallback(() => {
    const { parentOf } = computeHierarchy(nodesRef.current, regionsRef.current);
    const lockedSet = lockedRegionIdsRef.current;
    const minimizedSet = minimizedRegionIdsRef.current;
    const ids = new Set<string>();
    for (const [id, parent] of parentOf) {
      if (parent && lockedSet.has(parent) && !minimizedSet.has(parent)) ids.add(id);
    }
    setCapturedNodeIds(ids);
  }, []);

  // Authoritative recompute: positions/lock/minimize are settled in props here,
  // so this corrects the badge set after any drag, lock toggle, or edit (the
  // imperative `flushCaptured()` calls during handlers can see a mid-drag node's
  // pre-commit position; this runs once props update).
  useEffect(() => { flushCaptured(); }, [nodes, regions, lockedRegionIds, minimizedRegionIds, flushCaptured]);

  // When lockedRegionIds prop changes externally (e.g. paste, graph reload):
  // evict stale entries and snapshot members for newly locked regions.
  useEffect(() => {
    let changed = false;
    for (const rid of [...membershipRef.current.keys()]) {
      if (!lockedRegionIds.has(rid)) {
        membershipRef.current.delete(rid);
        changed = true;
      }
    }
    for (const rid of lockedRegionIds) {
      if (!membershipRef.current.has(rid)) {
        const region = regionsRef.current.find(r => r.id === rid);
        if (region) {
          const regionEl = new RegionObject(region);
          const members = new Set<string>();
          for (const n of nodesRef.current) {
            if (regionEl.contains(new NodeObject(n))) members.add(n.id);
          }
          for (const r of regionsRef.current) {
            if (regionEl.contains(new RegionObject(r))) members.add(r.id);
          }
          membershipRef.current.set(rid, members);
          changed = true;
        }
      }
    }
    if (changed) flushCaptured();
  }, [lockedRegionIds, flushCaptured]);

  // Keep minimizedMembership in sync when minimizedRegionIds changes externally (e.g. paste).
  useEffect(() => {
    setMinimizedMembership(prev => {
      let changed = false;
      const next = new Map(prev);
      for (const rid of [...next.keys()]) {
        if (!minimizedRegionIds.has(rid)) { next.delete(rid); changed = true; }
      }
      for (const rid of minimizedRegionIds) {
        if (!next.has(rid)) {
          const region = regionsRef.current.find(r => r.id === rid);
          if (region) { next.set(rid, snapshotMinimizedMembers(nodesRef.current, region)); changed = true; }
        }
      }
      return changed ? next : prev;
    });
  }, [minimizedRegionIds]);

  // Prune stale IDs from membershipRef and minimizedMembership when entities are deleted.
  useEffect(() => {
    const nodeIdSet = new Set(nodes.map(n => n.id));
    const regionIdSet = new Set(regions.map(r => r.id));
    const validIds = new Set([...nodeIdSet, ...regionIdSet]);
    let membershipChanged = false;
    for (const [, members] of membershipRef.current) {
      for (const memberId of [...members]) {
        if (!validIds.has(memberId)) { members.delete(memberId); membershipChanged = true; }
      }
    }
    if (membershipChanged) flushCaptured();
    setMinimizedMembership(prev => {
      let changed = false;
      const next = new Map<string, Set<string>>();
      for (const [rid, members] of prev) {
        const pruned = new Set<string>();
        for (const memberId of members) {
          if (nodeIdSet.has(memberId)) { pruned.add(memberId); } else { changed = true; }
        }
        next.set(rid, pruned);
      }
      return changed ? next : prev;
    });
  }, [nodes, regions, flushCaptured]);

  const stableOnMinimize = useCallback((id: string, minimized: boolean) => {
    if (minimized) {
      // Auto-unlock if currently locked — a locked minimized region is invisible but still drags members
      if (lockedRegionIdsRef.current.has(id)) {
        const next = new Map(membershipRef.current);
        next.delete(id);
        membershipRef.current = next;
        flushCaptured();
        onRegionLockRef.current(id, false);
      }
      const region = regionsRef.current.find(r => r.id === id);
      if (region) {
        const members = snapshotMinimizedMembers(nodesRef.current, region);
        setMinimizedMembership(prev => new Map(prev).set(id, members));
      }
    } else {
      setMinimizedMembership(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }
    onRegionMinimizeRef.current(id, minimized);
  }, [flushCaptured]);

  const stableOnResize = useCallback((id: string, x: number, y: number, w: number, h: number) => {
    if (lockedRegionIdsRef.current.has(id)) {
      const regionEl = new RegionObject({ id, x, y, width: w, height: h } as GloRegion);
      const members = new Set<string>();
      for (const n of nodesRef.current) {
        if (regionEl.contains(new NodeObject(n))) members.add(n.id);
      }
      for (const r of regionsRef.current) {
        if (regionEl.contains(new RegionObject(r))) members.add(r.id);
      }
      membershipRef.current = new Map(membershipRef.current).set(id, members);
      flushCaptured();
    }
    onRegionResizeRef.current(id, x, y, w, h);
  }, [flushCaptured]);

  const stableOnLock = useCallback((id: string, locked: boolean) => {
    if (locked) {
      // Auto-restore minimize — a locked minimized region is invisible but still drags members
      if (minimizedRegionIdsRef.current.has(id)) {
        setMinimizedMembership(prev => { const n = new Map(prev); n.delete(id); return n; });
        onRegionMinimizeRef.current(id, false);
      }
      const region = regionsRef.current.find(r => r.id === id);
      if (region) {
        const regionEl = new RegionObject(region);
        const members = new Set<string>();
        for (const n of nodesRef.current) {
          if (regionEl.contains(new NodeObject(n))) members.add(n.id);
        }
        for (const r of regionsRef.current) {
          if (regionEl.contains(new RegionObject(r))) members.add(r.id);
        }
        membershipRef.current = new Map(membershipRef.current).set(id, members);
      }
    } else {
      const next = new Map(membershipRef.current);
      next.delete(id);
      membershipRef.current = next;
    }
    flushCaptured();
    onRegionLockRef.current(id, locked);
  }, [flushCaptured]);

  const [snapBackNodeIds, setSnapBackNodeIds] = useState<Set<string>>(new Set());
  const snapBackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The most-recently clicked/dragged node floats to the front so interacting with
  // a node always surfaces it above overlapping cards (independent of the panel /
  // selection, which a drag doesn't change).
  const [frontNodeId, setFrontNodeId] = useState<string | null>(null);

  const nodeRegionMap = useMemo(
    () => computeNodeRegionMap(nodes, minimizedMembership),
    [nodes, minimizedMembership]
  );

  const rfNodes = useMemo(
    () => nodes.map(n => {
      const selected = multiSelectedIds.size > 0 ? multiSelectedIds.has(n.id) : n.id === selectedNodeId;
      const base = toRFNode(n);
      const remoteSel = remoteSelections?.get(n.id); // a peer has this selected
      return {
        ...base,
        selected,
        // View-only guests can't drag at all; otherwise pinned nodes stay locked.
        // (Per-node `draggable` overrides ReactFlow's global `nodesDraggable`, so
        // this is where read-only must be enforced too.)
        draggable: !readOnly && !pinnedNodeIds.has(n.id),
        className: [snapBackNodeIds.has(n.id) ? 'node--snap-back' : '', remoteSel ? 'node--remote-selected' : ''].filter(Boolean).join(' '),
        style: remoteSel ? ({ ...base.style, '--remote-sel-color': remoteSel.color } as React.CSSProperties) : base.style,
        // All nodes sit above all regions (regions use negative `regionZ`). Base
        // 1000 + manual `zOrder` (bring-to-front/back) keeps even sent-to-back nodes
        // above regions. The most-recently *touched* node (clicked or dragged →
        // `frontNodeId`) lifts highest (100001); a merely-selected node lifts to
        // 100000. The two used to share 100000, so dragging node B while node A was
        // selected made a tie the selected node won on DOM order — B never surfaced.
        // Now the dragged node wins and stays front until another node is touched
        // (`frontNodeId` persists). Selection/zOrder-driven only — NOT capturedIds,
        // which used to re-sort the whole list and flicker region stacking.
        zIndex: n.id === frontNodeId ? 100001 : selected ? 100000 : 1000 + (n.zOrder ?? 0),
      };
    }),
    [nodes, selectedNodeId, multiSelectedIds, pinnedNodeIds, snapBackNodeIds, frontNodeId, readOnly, remoteSelections]
  );
  const onEdgeWaypointsChangeRef = useRef(onEdgeWaypointsChange);
  onEdgeWaypointsChangeRef.current = onEdgeWaypointsChange;
  const stableOnEdgeWaypointsChange = useCallback(
    (id: string, waypoints: WaypointPoint[] | null) => onEdgeWaypointsChangeRef.current(id, waypoints),
    []
  );
  const onEdgeLabelChangeRef = useRef(onEdgeLabelChange);
  onEdgeLabelChangeRef.current = onEdgeLabelChange;
  const stableOnEdgeLabelChange = useCallback(
    (id: string, label: string | null) => onEdgeLabelChangeRef.current?.(id, label),
    []
  );

  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const pinnedExpandIds = pinnedExpandIdsProp;
  const togglePinnedExpand = useCallback((id: string) => {
    onTogglePinnedExpand?.(id);
  }, [onTogglePinnedExpand]);

  const togglePin = useCallback((id: string) => {
    onTogglePin?.(id);
  }, [onTogglePin]);

  const updateNoteText = useCallback((id: string, text: string) => {
    onNoteChange?.(id, text);
  }, [onNoteChange]);

  const toggleRenderMarkdown = useCallback((id: string) => {
    onToggleRenderMarkdown?.(id);
  }, [onToggleRenderMarkdown]);

  const toggleShowThumbnail = useCallback((id: string) => {
    onToggleShowThumbnail?.(id);
  }, [onToggleShowThumbnail]);

  const resizeNode = useCallback((id: string, x: number, y: number, width: number, height: number) => {
    onNodeResize?.(id, x, y, width, height);
  }, [onNodeResize]);
  const stableOnEdgeHoverChange = useCallback(
    (id: string, hovered: boolean) => setHoveredEdgeId(hovered ? id : null),
    []
  );

  const rfEdges = useMemo(
    () => edges.map(e => ({ ...toRFEdge(e, stableOnEdgeWaypointsChange, stableOnEdgeHoverChange, stableOnEdgeLabelChange), selected: e.id === selectedEdgeId })),
    [edges, selectedEdgeId, stableOnEdgeWaypointsChange, stableOnEdgeHoverChange, stableOnEdgeLabelChange]
  );

  // Larger regions render further back so smaller / nested regions stay on top
  // and clickable — a big region can never fully cover and trap a smaller one.
  // All regions sit below nodes (which are z ≥ 1).
  const regionZ = useMemo(() => {
    const ordered = [...regions].sort((a, b) => {
      // Manual front/back order wins (persisted zOrder); higher = front.
      if (a.zOrder !== b.zOrder) return a.zOrder - b.zOrder;
      // Then larger area → further back, so smaller / nested regions stay clickable.
      const byArea = b.width * b.height - a.width * a.height;
      if (byArea !== 0) return byArea;
      // Same size & order: the selected region wins the tie and comes forward, so
      // clicking either of two identical regions brings the clicked one forward.
      if (a.id === selectedRegionId) return 1;
      if (b.id === selectedRegionId) return -1;
      return 0; // otherwise keep stable creation order
    });
    const z = new Map<string, number>();
    ordered.forEach((r, i) => z.set(r.id, i - ordered.length)); // largest → −N … smallest → −1
    return z;
  }, [regions, selectedRegionId]);

  const rfRegions = useMemo(
    () => regions.map(r => {
      const reg = toRFRegion(r, minimizedRegionIds.has(r.id), lockedRegionIds.has(r.id), stableOnMinimize, stableOnResize, stableOnLock);
      const remoteSel = remoteSelections?.get(r.id);
      return {
        ...reg,
        selected: multiSelectedIds.size > 0 ? multiSelectedIds.has(r.id) : r.id === selectedRegionId,
        className: remoteSel ? 'region--remote-selected' : undefined,
        style: remoteSel ? ({ ...reg.style, '--remote-sel-color': remoteSel.color } as React.CSSProperties) : reg.style,
        zIndex: regionZ.get(r.id) ?? -1,
      };
    }),
    [regions, minimizedRegionIds, lockedRegionIds, stableOnMinimize, stableOnResize, stableOnLock, multiSelectedIds, selectedRegionId, regionZ, remoteSelections]
  );

  const hiddenNodeIds = useMemo(() => new Set(nodeRegionMap.keys()), [nodeRegionMap]);

  const allRFNodes = useMemo(
    () => [...rfRegions, ...rfNodes.filter(n => !hiddenNodeIds.has(n.id))],
    [rfRegions, rfNodes, hiddenNodeIds]
  );

  const allVisualEdges = useMemo(() => {
    const base = nodeRegionMap.size === 0
      ? rfEdges
      : computeVisualEdges(edges, nodeRegionMap).map(e => ({
          ...toRFEdge(e, stableOnEdgeWaypointsChange, stableOnEdgeHoverChange, stableOnEdgeLabelChange),
          selected: false as const,
          reconnectable: !e.id.endsWith('__remap'),
        }));
    // Tag edges a peer has selected with their colour (matching the real id, since
    // region-routed edges carry a `__remap` suffix). Done last so it survives both
    // edge pipelines.
    if (!remoteSelections || remoteSelections.size === 0) return base;
    return base.map(e => {
      const rs = remoteSelections.get(e.id.replace(/__remap$/, ''));
      return rs ? { ...e, data: { ...e.data, remoteSelColor: rs.color } } : e;
    });
  }, [edges, rfEdges, nodeRegionMap, stableOnEdgeWaypointsChange, stableOnEdgeHoverChange, stableOnEdgeLabelChange, remoteSelections]);

  const edgeCountByNodeId = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of edges) {
      map.set(e.sourceId, (map.get(e.sourceId) ?? 0) + 1);
      map.set(e.targetId, (map.get(e.targetId) ?? 0) + 1);
    }
    return map;
  }, [edges]);

  const hoveredEndpointIds = useMemo(() => {
    if (!hoveredEdgeId) return new Set<string>();
    const realId = hoveredEdgeId.replace(/__remap$/, '');
    const edge = edges.find(e => e.id === realId);
    if (!edge) return new Set<string>();
    return new Set([edge.sourceId, edge.targetId]);
  }, [hoveredEdgeId, edges]);

  const [displayNodes, setDisplayNodes, onNodesChange] = useNodesState(allRFNodes);
  const [displayEdges, setDisplayEdges, onEdgesChange] = useEdgesState(allVisualEdges);
  const [regionDragOffset, setRegionDragOffset] = useState<RegionDragOffset | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [edgeContextMenu, setEdgeContextMenu] = useState<{ x: number; y: number; edgeId: string; hasWaypoints: boolean } | null>(null);
  const [regionContextMenu, setRegionContextMenu] = useState<{ x: number; y: number; regionId: string } | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{ x: number; y: number; nodeId: string; selectionCount: number } | null>(null);

  // Sync external graph + selection state into React Flow's node state. When the
  // app's SELECTION inputs changed (click / sidebar / pane-clear / shift-multiselect),
  // the recomputed `selected` in allRFNodes is authoritative. When only DATA changed
  // (a remote-edit reload, a pin / z-order / front-float change, presence, …) preserve
  // RF's live `selected` flags — otherwise a drag-box MARQUEE selection, which lives
  // only in RF's internal state (not in selectedNodeId/multiSelectedIds), gets wiped by
  // the replacement (the Live Share "selection drops on a remote edit").
  const prevSelInputs = useRef({ selectedNodeId, selectedRegionId, multiSelectedIds });
  useEffect(() => {
    const p = prevSelInputs.current;
    const selectionChanged =
      selectedNodeId !== p.selectedNodeId ||
      selectedRegionId !== p.selectedRegionId ||
      multiSelectedIds !== p.multiSelectedIds;
    prevSelInputs.current = { selectedNodeId, selectedRegionId, multiSelectedIds };
    if (selectionChanged) {
      setDisplayNodes(allRFNodes);
    } else {
      setDisplayNodes(cur => {
        const selById = new Map(cur.map(n => [n.id, n.selected]));
        return allRFNodes.map(n => {
          const s = selById.get(n.id);
          return s === undefined || s === n.selected ? n : { ...n, selected: s };
        });
      });
    }
  }, [allRFNodes]);
  useEffect(() => setDisplayEdges(allVisualEdges), [allVisualEdges]);

  const handleConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        onConnectExternal(params.source, params.target, params.sourceHandle, params.targetHandle);
      }
    },
    [onConnectExternal]
  );

  const reconnectSucceeded = useRef(false);

  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      reconnectSucceeded.current = true;
      if (!newConnection.source || !newConnection.target) return;
      const realId = oldEdge.id.replace(/__remap$/, '');
      onEdgeReconnect(realId, newConnection.source, newConnection.target, newConnection.sourceHandle, newConnection.targetHandle);
    },
    [onEdgeReconnect]
  );

  const handleReconnectStart = useCallback(() => {
    reconnectSucceeded.current = false;
  }, []);

  const handleReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!reconnectSucceeded.current) {
        onEdgeDelete(edge.id.replace(/__remap$/, ''));
      }
    },
    [onEdgeDelete]
  );

  // Real-time visual following: move member nodes and captured edge waypoints during a locked region drag
  const handleNodeDrag = useCallback(
    (_event: React.MouseEvent, draggedNode: Node) => {
      if (draggedNode.type !== 'region' || !lockedRegionIdsRef.current.has(draggedNode.id)) return;
      const region = regionsRef.current.find(r => r.id === draggedNode.id);
      if (!region) return;
      const dx = draggedNode.position.x - region.x;
      const dy = draggedNode.position.y - region.y;
      // Move the region's live container subtree (transitive descendants), not a
      // frozen geometric snapshot. Computed once at drag-start and reused.
      if (!regionDragRef.current || regionDragRef.current.id !== draggedNode.id) {
        const regionIds = new Set(regionsRef.current.map(r => r.id));
        const h = computeHierarchy(nodesRef.current, regionsRef.current);
        regionDragRef.current = { id: draggedNode.id, members: subtreeOf(draggedNode.id, h, regionIds) };
      }
      const members = regionDragRef.current.members;
      if (!members.size) return;
      setDisplayNodes(prev => prev.map(n => {
        if (!members.has(n.id)) return n;
        const gn = nodesRef.current.find(g => g.id === n.id);
        if (gn) return { ...n, position: { x: gn.x + dx, y: gn.y + dy } };
        const gr = regionsRef.current.find(r => r.id === n.id);
        if (gr) return { ...n, position: { x: gr.x + dx, y: gr.y + dy } };
        return n;
      }));
      // Communicate drag offset to EdgeLine via context so it can visually translate
      // captured edge waypoints without mutating RF edge state during drag.
      setRegionDragOffset({ dx, dy, memberIds: members });
    },
    []
  );

  // Unified base behavior shared by every graph element: after an element moves,
  // recompute whether it belongs to each locked region, using the containment
  // rule for its type (nodes: 75% area, regions: 50% area). Minimized locked
  // regions don't accept members (their body is collapsed). Returns whether any
  // membership changed. This is what makes a region dragged out of a locked
  // parent behave like a node — released, not stuck "captured".
  const updateElementMembership = useCallback((elementId: string, x: number, y: number): boolean => {
    const region = regionsRef.current.find(r => r.id === elementId);
    const node = region ? undefined : nodesRef.current.find(n => n.id === elementId);
    const moved: GraphObject | undefined = region
      ? new RegionObject(region)
      : node ? new NodeObject(node) : undefined;
    if (!moved) return false;
    let changed = false;
    for (const locked of regionsRef.current) {
      if (locked.id === elementId) continue;
      if (!lockedRegionIdsRef.current.has(locked.id)) continue;
      if (minimizedRegionIdsRef.current.has(locked.id)) continue;
      const members = new Set(membershipRef.current.get(locked.id) ?? new Set<string>());
      const inside = new RegionObject(locked).contains(moved, { x, y });
      const wasMember = members.has(elementId);
      if (inside !== wasMember) {
        if (inside) members.add(elementId); else members.delete(elementId);
        membershipRef.current = new Map(membershipRef.current).set(locked.id, members);
        changed = true;
      }
    }
    return changed;
  }, []);

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
      setRegionDragOffset(null);
      regionDragRef.current = null;
      const nodePosUpdates: NodePosition[] = [];
      const snappedBackIds: string[] = [];
      let membershipChanged = false;

      // Container hierarchy from live geometry — a locked region moves its
      // transitive subtree (direct members + descendants via child regions),
      // never a stale/flat geometric snapshot. `regionSubtree` memoises per id.
      const hierarchy = computeHierarchy(nodesRef.current, regionsRef.current);
      const regionIds = new Set(regionsRef.current.map(r => r.id));
      const subtreeCache = new Map<string, Set<string>>();
      const regionSubtree = (id: string): Set<string> => {
        let s = subtreeCache.get(id);
        if (!s) { s = subtreeOf(id, hierarchy, regionIds); subtreeCache.set(id, s); }
        return s;
      };

      // Collect locked regions being dragged and the union of their subtrees.
      const draggedLockedRegions = draggedNodes.filter(
        n => n.type === 'region' && lockedRegionIdsRef.current.has(n.id)
      );
      const lockedMemberIds = new Set<string>();
      for (const r of draggedLockedRegions) {
        for (const id of regionSubtree(r.id)) lockedMemberIds.add(id);
      }

      for (const n of draggedNodes) {
        if (n.type === 'region') {
          if (lockedRegionIdsRef.current.has(n.id)) {
            // Locked region dragged: move its container subtree (nodes + nested
            // regions, transitively) with it.
            const members = regionSubtree(n.id);
            const region = regionsRef.current.find(r => r.id === n.id);
            if (region && members.size) {
              const dx = n.position.x - region.x;
              const dy = n.position.y - region.y;
              for (const memberId of members) {
                const gn = nodesRef.current.find(g => g.id === memberId);
                if (gn) {
                  nodePosUpdates.push({ id: gn.id, x: gn.x + dx, y: gn.y + dy });
                } else {
                  const gr = regionsRef.current.find(r => r.id === memberId);
                  if (gr) onRegionMove(gr.id, gr.x + dx, gr.y + dy);
                }
              }
              // Translate stored waypoints of edges captured inside this region.
              for (const edge of edgesRef.current) {
                if (members.has(edge.sourceId) && members.has(edge.targetId) && edge.waypoints?.length) {
                  const translated = edge.waypoints.map(wp => ({ x: wp.x + dx, y: wp.y + dy }));
                  onEdgeWaypointsChangeRef.current(edge.id, translated);
                }
              }
            }
          } else if (draggedLockedRegions.length > 0 && !lockedMemberIds.has(n.id)) {
            // Unlocked region dragged alongside a locked region it isn't a member
            // of → snap back; it shouldn't have moved.
            const gr = regionsRef.current.find(r => r.id === n.id);
            if (gr) {
              setDisplayNodes(prev =>
                prev.map(dn => dn.id === n.id ? { ...dn, position: { x: gr.x, y: gr.y } } : dn)
              );
            }
            continue; // skip onRegionMove — position unchanged
          }
          // Unified base behavior: recompute this region's membership in every
          // locked region — exactly like a node — so a region dragged OUT of a
          // locked parent is released (and one dragged IN is captured), instead
          // of staying captured forever.
          if (updateElementMembership(n.id, n.position.x, n.position.y)) membershipChanged = true;
          onRegionMove(n.id, n.position.x, n.position.y);
        } else {
          // Node dragged alongside a locked region it isn't a member of → snap back.
          if (draggedLockedRegions.length > 0 && !lockedMemberIds.has(n.id)) {
            const gn = nodesRef.current.find(g => g.id === n.id);
            if (gn) {
              setDisplayNodes(prev =>
                prev.map(dn => dn.id === n.id ? { ...dn, position: { x: gn.x, y: gn.y } } : dn)
              );
              snappedBackIds.push(n.id);
            }
            continue;
          }
          // Same unified membership recompute as regions.
          if (updateElementMembership(n.id, n.position.x, n.position.y)) membershipChanged = true;
          // Skip position save if this node was moved as part of a locked region drag above.
          if (!lockedMemberIds.has(n.id)) {
            nodePosUpdates.push({ id: n.id, x: n.position.x, y: n.position.y });
          }
        }
      }
      if (membershipChanged) flushCaptured();
      if (nodePosUpdates.length) {
        // The directly-dragged (non-region) nodes are brought to the front
        // permanently — see App.handleNodeMove. Member nodes moved by a locked
        // region drag aren't in `draggedNodes`, so they don't reorder.
        const draggedNodeIds = draggedNodes.filter(n => n.type !== 'region').map(n => n.id);
        onNodeMove(nodePosUpdates, draggedNodeIds);
      }
      if (snappedBackIds.length) {
        setSnapBackNodeIds(new Set(snappedBackIds));
        if (snapBackTimeoutRef.current) clearTimeout(snapBackTimeoutRef.current);
        snapBackTimeoutRef.current = setTimeout(() => setSnapBackNodeIds(new Set()), 400);
      }
    },
    [onNodeMove, onRegionMove, flushCaptured, updateElementMembership]
  );

  function handlePaneContextMenu(event: React.MouseEvent | MouseEvent) {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }

  function handlePaneClick() {
    setContextMenu(null);
    setEdgeContextMenu(null);
    setRegionContextMenu(null);
    setNodeContextMenu(null);
    setMultiSelectedIds(prev => prev.size > 0 ? new Set() : prev);
    setFrontNodeId(null); // deselecting drops the front-floated node back to its zOrder
    onPaneClick();
  }

  // LOD tier (set by <LodController> from the live zoom). Discrete, so it changes
  // rarely — re-rendering all cards at a threshold crossing is acceptable.
  const [lodTier, setLodTier] = useState(LOD_FULL);

  // Memoize the context value so consumers (every NodeCard/EdgeLine subscribes to
  // GraphStateContext) only re-render when one of these fields actually changes —
  // not on every GraphCanvas render (context bypasses the components' `memo`).
  const graphStateValue = useMemo(() => ({
    capturedIds, capturedEdgeIds, regionDragOffset,
    highlightedNodeIds: highlightedNodeIds ?? EMPTY_NODE_SET,
    traceNodeIds, traceEdgeIds, traceSeedId, edgeCountByNodeId,
    hoveredEndpointIds, pinnedNodeIds, connectingFromNodeId, pinnedExpandIds,
    expandOverrides, togglePinnedExpand, togglePin,
    flashingNodeId: flashingNodeId ?? null, updateNoteText, toggleRenderMarkdown, toggleShowThumbnail, resizeNode, lodTier,
    readOnly: !!readOnly,
  }), [
    capturedIds, capturedEdgeIds, regionDragOffset, highlightedNodeIds,
    traceNodeIds, traceEdgeIds, traceSeedId, edgeCountByNodeId,
    hoveredEndpointIds, pinnedNodeIds, connectingFromNodeId, pinnedExpandIds,
    expandOverrides, togglePinnedExpand, togglePin, flashingNodeId,
    updateNoteText, toggleRenderMarkdown, toggleShowThumbnail, resizeNode, lodTier, readOnly,
  ]);

  return (
    <GraphStateContext.Provider value={graphStateValue}>
    <div className="graph-canvas">
      {nodes.length === 0 && regions.length === 0 && (
        <div className="canvas-empty">
          <p>Double-click the canvas or press <strong>N</strong> to add a node · right-click for more</p>
        </div>
      )}
      <ReactFlow
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onConnectStart={(_e, params) => setConnectingFromNodeId(params.nodeId ?? null)}
        onConnectEnd={() => setConnectingFromNodeId(null)}
        onReconnect={handleReconnect}
        onReconnectStart={handleReconnectStart}
        onReconnectEnd={handleReconnectEnd}
        selectionMode={SelectionMode.Partial}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={(event, node) => {
          setContextMenu(null);
          if (event.shiftKey || event.ctrlKey || event.metaKey) {
            const anchorId = selectedNodeId ?? selectedRegionId;
            setMultiSelectedIds(prev => {
              const next = new Set(prev);
              // On first modifier+click, pull the currently single-selected item into multi-select
              if (next.size === 0 && anchorId) next.add(anchorId);
              if (next.has(node.id)) next.delete(node.id);
              else next.add(node.id);
              return next;
            });
            return;
          }
          setMultiSelectedIds(prev => prev.size > 0 ? new Set() : prev);
          if (node.type === 'region') {
            const region = regions.find(r => r.id === node.id);
            if (region) onRegionSelect(region);
          } else {
            setFrontNodeId(node.id);
            const gloNode = nodes.find(n => n.id === node.id);
            if (gloNode) onNodeSelect(gloNode);
          }
        }}
        onNodeDragStart={(_event, node) => {
          // Float the dragged node to the front (regions stay behind nodes).
          if (node.type !== 'region') setFrontNodeId(node.id);
          // Dragging an element selects it (nodes + regions) — opens its panel,
          // and for graph items / regions surfaces resize handles. Skipped when
          // the grabbed element is part of an existing multi-selection (a group
          // drag), so that selection isn't collapsed to one.
          const selectedCount = displayNodes.filter(n => n.selected).length;
          if (selectedCount > 1 && node.selected) return;
          setMultiSelectedIds(prev => (prev.size > 0 ? new Set() : prev));
          if (node.type === 'region') {
            const region = regions.find(r => r.id === node.id);
            if (region) onRegionSelect(region);
          } else {
            const gloNode = nodes.find(n => n.id === node.id);
            if (gloNode) onNodeSelect(gloNode);
          }
        }}
        onNodeDoubleClick={(_event, node) => {
          if (node.type === 'region') return;
          const gloNode = nodes.find(n => n.id === node.id);
          if (gloNode) onNodeDoubleClick(gloNode);
        }}
        onEdgeClick={(event, edge) => {
          setContextMenu(null);
          if (event.shiftKey) return;
          const realId = edge.id.replace(/__remap$/, '');
          const gloEdge = edges.find(e => e.id === realId);
          if (gloEdge) onEdgeSelect(gloEdge);
        }}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          setContextMenu(null);
          setEdgeContextMenu(null);
          setNodeContextMenu(null);
          if (node.type === 'region') {
            setRegionContextMenu({ x: event.clientX, y: event.clientY, regionId: node.id });
          } else if (onFindRelated) {
            // Selection-aware: if the right-clicked node is part of a multi-selection,
            // duplicate/delete act on the whole selection (the count reflects that).
            const selCount = displayNodes.filter(n => n.selected && n.type !== 'region').length;
            setNodeContextMenu({
              x: event.clientX, y: event.clientY, nodeId: node.id,
              selectionCount: node.selected && selCount > 1 ? selCount : 1,
            });
          }
        }}
        onEdgeContextMenu={(event, edge) => {
          event.preventDefault();
          setContextMenu(null);
          setRegionContextMenu(null);
          const realId = edge.id.replace(/__remap$/, '');
          const gloEdge = edges.find(e => e.id === realId);
          setEdgeContextMenu({
            x: event.clientX,
            y: event.clientY,
            edgeId: realId,
            hasWaypoints: !!(gloEdge?.waypoints?.length),
          });
        }}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onSelectionChange={({ nodes: sn, edges: se }) =>
          onSelectionChange?.(sn.map(n => n.id), se.map(e => e.id))
        }
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        isValidConnection={(c) => {
          if (c.source === c.target) return false;
          const src = displayNodes.find(n => n.id === c.source);
          const tgt = displayNodes.find(n => n.id === c.target);
          return src?.type !== 'region' && tgt?.type !== 'region';
        }}
        selectionOnDrag={true}
        elevateNodesOnSelect={false}
        // Only mount nodes/edges within the viewport — big win at scale (renders
        // the ~dozens in view, not all N). Note: PNG export captures the DOM, so a
        // full-graph export must fit-view first; export currently snapshots the
        // visible canvas regardless, so behavior is unchanged there.
        onlyRenderVisibleElements
        panOnDrag={[1, 2]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'gloEdge', reconnectable: true }}
        deleteKeyCode={null}
        snapToGrid={snapToGrid}
        snapGrid={[24, 24]}
        onMoveEnd={(_e, vp) => { if (viewportRef) viewportRef.current = vp; onViewportChange?.(vp.zoom); }}
        onMove={(_e, vp) => { if (viewportRef) viewportRef.current = vp; onViewportChange?.(vp.zoom); }}
      >
        {contextMenu && (
          <ContextMenu
            pos={contextMenu}
            onClose={() => setContextMenu(null)}
            onOpenCreatePicker={onOpenCreatePicker}
            onCreateRegion={onContextMenuCreateRegion}
          />
        )}
        {edgeContextMenu && (
          <EdgeContextMenu
            pos={edgeContextMenu}
            edgeId={edgeContextMenu.edgeId}
            hasWaypoints={edgeContextMenu.hasWaypoints}
            onClose={() => setEdgeContextMenu(null)}
            onDelete={onEdgeDelete}
            onClearWaypoints={id => onEdgeWaypointsChange(id, null)}
          />
        )}
        {regionContextMenu && (() => {
          const rc = regionContextMenu;
          return (
            <RegionContextMenu
              pos={rc}
              regionId={rc.regionId}
              isLocked={lockedRegionIds.has(rc.regionId)}
              isMinimized={minimizedRegionIds.has(rc.regionId)}
              onClose={() => setRegionContextMenu(null)}
              onOpenCreatePicker={onOpenCreatePicker}
              onLock={stableOnLock}
              onMinimize={stableOnMinimize}
              onBringToFront={id => { onRegionBringToFront?.(id); }}
              onSendToBack={id => { onRegionSendToBack?.(id); }}
              onEdit={id => { onRegionEdit?.(id); }}
              onDelete={id => { onRegionDelete?.(id); }}
              onDuplicate={onRegionDuplicate ? id => { onRegionDuplicate(id); } : undefined}
            />
          );
        })()}
        {nodeContextMenu && onFindRelated && (
          <NodeContextMenu
            pos={nodeContextMenu}
            nodeId={nodeContextMenu.nodeId}
            onClose={() => setNodeContextMenu(null)}
            onFindRelated={onFindRelated}
            onTrace={onTrace}
            onBringToFront={onNodeBringToFront}
            onSendToBack={onNodeSendToBack}
            onDuplicate={onNodeDuplicate}
            onDelete={onNodeDelete}
            selectionCount={nodeContextMenu.selectionCount}
          />
        )}
        {inSession && <PresenceLayer />}
        {inSession && <MinimapCursors />}
        <FitViewTrigger trigger={fitViewTrigger} />
        <LodController onTier={setLodTier} />
        {screenToFlowRef && <ScreenToFlowPublisher targetRef={screenToFlowRef} />}
        {!readOnly && onPaneDoubleClick && <PaneDblClickHandler onPaneDoubleClick={onPaneDoubleClick} />}
        <SelectAllTrigger trigger={selectAllTrigger} />
        <ZoomToSelectionTrigger trigger={zoomToSelectionTrigger} />
        <SelectRegionMembersTrigger trigger={selectRegionTrigger} regionId={selectedRegionId} nodes={nodes} regions={regions} />
        <ViewportSync
          targetViewport={targetViewport}
          onTargetConsumed={onTargetViewportConsumed ?? (() => {})}
        />
        {scrollToPos && onScrolled && (
          <ScrollToNode pos={scrollToPos} onDone={onScrolled} />
        )}
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#282828" />
        <Controls />
        <MiniMap
          nodeColor={node => {
            if (node.type === 'region') {
              const region = regions.find(r => r.id === node.id);
              return region?.color ?? '#333333';
            }
            const gloNode = nodes.find(n => n.id === node.id);
            return gloNode ? getNodeColor(gloNode) : '#484848';
          }}
          maskColor="rgba(15,15,15,0.85)"
          style={{ background: '#1a1a1a', border: '1px solid #484848' }}
        />
      </ReactFlow>
      <EdgeWeightLegend edges={edges} />
      <ApiStatusBadge />
    </div>
    </GraphStateContext.Provider>
  );
}
