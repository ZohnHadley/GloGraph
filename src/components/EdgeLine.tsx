import { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  EdgeProps,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
  Position,
} from '@xyflow/react';
import { Lock } from 'lucide-react';
import type { GloEdge, WaypointPoint } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useGraphState } from '../context/GraphStateContext';

type EdgeData = GloEdge & {
  onWaypointsChange?: (id: string, waypoints: WaypointPoint[] | null) => void;
  onHoverChange?: (id: string, hovered: boolean) => void;
  onEdgeLabelChange?: (id: string, label: string | null) => void;
};

function positionToAngle(pos: Position): number {
  switch (pos) {
    case 'left':   return 0;
    case 'right':  return Math.PI;
    case 'top':    return Math.PI / 2;
    case 'bottom': return -Math.PI / 2;
    default:       return 0;
  }
}

function distToSegment(p: WaypointPoint, a: WaypointPoint, b: WaypointPoint): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

// Smooth curve through a set of points (Catmull-Rom → cubic Bézier). Used for
// waypoint routing so multi-bend edges flow as smooth curves instead of sharp
// polyline corners. Endpoints are duplicated so the curve starts/ends cleanly.
function smoothSplinePath(pts: WaypointPoint[]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function EdgeLine({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const { getEdgeColor, getEdgeStyle, getEdgeWidth, getEdgeArrow, getEdgeLabel, edgeRoutingMode } = useSettings();
  const { capturedEdgeIds, regionDragOffset, traceNodeIds, traceEdgeIds } = useGraphState();
  const { screenToFlowPosition } = useReactFlow();

  const edgeData = data as unknown as EdgeData | undefined;
  const edge = edgeData as GloEdge | undefined;
  const realId = id.replace(/__remap$/, '');
  const captured = capturedEdgeIds.has(realId);
  // Trace overlay: edges on the cascade glow, the rest fade back.
  const traceActive = traceNodeIds.size > 0;
  const onTrace = traceActive && traceEdgeIds.has(realId);
  const traceDimmed = traceActive && !onTrace;

  const showArrow = getEdgeArrow(edge);
  const baseColor = getEdgeColor(edge);
  // Live Share shared selection: a peer selecting this edge tints + thickens it in
  // their cursor colour (local selection's amber still wins for our own selection).
  const remoteSelColor = (edgeData as { remoteSelColor?: string } | undefined)?.remoteSelColor;
  const remoteSelected = !!remoteSelColor && !selected;
  const strokeColor = selected ? '#ffb000' : (remoteSelColor ?? baseColor);
  const strengthVal = getEdgeWidth(edge);
  const strokeWidth = (strengthVal <= 3 ? 0.8 : strengthVal <= 7 ? 1.5 : 2.5) * (remoteSelected ? 1.8 : 1);
  const styleVal = getEdgeStyle(edge);
  const strokeDasharray =
    styleVal === 'step' ? '8 4' :
    styleVal === 'smoothstep' ? '3 3' :
    styleVal === 'straight' ? '6 3' :
    undefined;
  const paramLabel = getEdgeLabel(edge);
  const onWaypointsChange = edgeData?.onWaypointsChange;
  const onHoverChange = edgeData?.onHoverChange;
  const onEdgeLabelChange = edgeData?.onEdgeLabelChange;
  const quickNote = edge?.label;

  const [hovered, setHovered] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const labelInputRef = useRef<HTMLInputElement>(null);
  const [localWaypoints, setLocalWaypoints] = useState<WaypointPoint[]>(edgeData?.waypoints ?? []);
  const localWaypointsRef = useRef(localWaypoints);
  localWaypointsRef.current = localWaypoints;
  const isDragging = useRef(false);
  const dragIndex = useRef(-1);

  const dataWps = edgeData?.waypoints;
  const waypointsKey = dataWps ? dataWps.map(p => `${p.x},${p.y}`).join(';') : '';
  useEffect(() => {
    if (!isDragging.current) setLocalWaypoints(dataWps ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypointsKey]);

  // Apply region drag offset visually — localWaypoints hold the real DB coords,
  // visualWaypoints are what gets rendered while the drag is in flight.
  const edgeInDrag = regionDragOffset != null
    && regionDragOffset.memberIds.has(edge?.sourceId ?? '')
    && regionDragOffset.memberIds.has(edge?.targetId ?? '');
  const visualWaypoints = edgeInDrag
    ? localWaypoints.map(wp => ({ x: wp.x + regionDragOffset!.dx, y: wp.y + regionDragOffset!.dy }))
    : localWaypoints;

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // ── Default bezier ────────────────────────────────────────────────────
  const [defaultBezierPath, defaultLabelX, defaultLabelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  // ── Bezier mode ────────────────────────────────────────────────────────
  const hasBezierCP = visualWaypoints.length > 0;
  const cpX = visualWaypoints[0]?.x ?? defaultLabelX;
  const cpY = visualWaypoints[0]?.y ?? defaultLabelY;
  const bezierPath = hasBezierCP
    ? `M ${sourceX} ${sourceY} Q ${cpX} ${cpY} ${targetX} ${targetY}`
    : defaultBezierPath;
  const bezierLabelX = hasBezierCP ? 0.25 * sourceX + 0.5 * cpX + 0.25 * targetX : defaultLabelX;
  const bezierLabelY = hasBezierCP ? 0.25 * sourceY + 0.5 * cpY + 0.25 * targetY : defaultLabelY;

  // ── Waypoints mode ────────────────────────────────────────────────────
  const hasWaypoints = visualWaypoints.length > 0;
  const allPoints = [{ x: sourceX, y: sourceY }, ...visualWaypoints, { x: targetX, y: targetY }];
  const waypointPath = hasWaypoints
    ? smoothSplinePath(allPoints)
    : defaultBezierPath;
  const midSegIdx = Math.max(0, Math.floor((allPoints.length - 1) / 2));
  const wpLabelX = hasWaypoints ? (allPoints[midSegIdx].x + allPoints[midSegIdx + 1].x) / 2 : defaultLabelX;
  const wpLabelY = hasWaypoints ? (allPoints[midSegIdx].y + allPoints[midSegIdx + 1].y) / 2 : defaultLabelY;

  // ── Orthogonal mode ────────────────────────────────────────────────────
  const isHorizPrimary = sourcePosition === 'right' || sourcePosition === 'left';
  const bendX = visualWaypoints[0]?.x ?? midX;
  const bendY = visualWaypoints[0]?.y ?? midY;
  const [defaultOrthoPath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 0,
  });
  let orthoPath: string;
  if (visualWaypoints.length === 0) {
    orthoPath = defaultOrthoPath;
  } else if (visualWaypoints.length === 1) {
    orthoPath = isHorizPrimary
      ? `M ${sourceX} ${sourceY} L ${bendX} ${sourceY} L ${bendX} ${targetY} L ${targetX} ${targetY}`
      : `M ${sourceX} ${sourceY} L ${sourceX} ${bendY} L ${targetX} ${bendY} L ${targetX} ${targetY}`;
  } else {
    const pts: WaypointPoint[] = [{ x: sourceX, y: sourceY }, ...visualWaypoints, { x: targetX, y: targetY }];
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      if (i === 1 && !isHorizPrimary) {
        d += ` L ${prev.x} ${curr.y} L ${curr.x} ${curr.y}`;
      } else {
        d += ` L ${curr.x} ${prev.y} L ${curr.x} ${curr.y}`;
      }
    }
    orthoPath = d;
  }
  const orthoHandleX = isHorizPrimary ? bendX : midX;
  const orthoHandleY = isHorizPrimary ? midY : bendY;

  // ── Active path + label position ─────────────────────────────────────
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (edgeRoutingMode === 'orthogonal') {
    edgePath = orthoPath;
    if (visualWaypoints.length >= 2) {
      const allPts = [{ x: sourceX, y: sourceY }, ...visualWaypoints, { x: targetX, y: targetY }];
      const mi = Math.floor((allPts.length - 1) / 2);
      labelX = (allPts[mi].x + allPts[mi + 1].x) / 2;
      labelY = (allPts[mi].y + allPts[mi + 1].y) / 2;
    } else {
      labelX = orthoHandleX; labelY = orthoHandleY;
    }
  } else if (edgeRoutingMode === 'bezier') {
    edgePath = bezierPath; labelX = bezierLabelX; labelY = bezierLabelY;
  } else {
    edgePath = waypointPath; labelX = wpLabelX; labelY = wpLabelY;
  }

  // ── Arrow angle — computed from path geometry, not SVG marker ────────
  let arrowAngleDeg = 0;
  if (showArrow) {
    let raw: number;
    if (edgeRoutingMode === 'bezier') {
      raw = hasBezierCP
        ? Math.atan2(targetY - cpY, targetX - cpX)
        : positionToAngle(targetPosition);
    } else if (edgeRoutingMode === 'waypoints') {
      if (hasWaypoints) {
        const prev = visualWaypoints[visualWaypoints.length - 1];
        raw = Math.atan2(targetY - prev.y, targetX - prev.x);
      } else {
        raw = positionToAngle(targetPosition);
      }
    } else {
      if (localWaypoints.length === 0) {
        raw = positionToAngle(targetPosition);
      } else if (localWaypoints.length === 1) {
        raw = isHorizPrimary
          ? (targetX >= bendX ? 0 : Math.PI)
          : (targetY >= bendY ? Math.PI / 2 : -Math.PI / 2);
      } else {
        const lastWP = localWaypoints[localWaypoints.length - 1];
        if (Math.abs(targetY - lastWP.y) > 0.5) {
          raw = targetY > lastWP.y ? Math.PI / 2 : -Math.PI / 2;
        } else {
          raw = targetX >= lastWP.x ? 0 : Math.PI;
        }
      }
    }
    arrowAngleDeg = raw * 180 / Math.PI;
  }

  // ── Drag handlers ─────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent, index: number) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragIndex.current = index;
  }, []);

  const handleWaypointMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || dragIndex.current < 0) return;
    const fp = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const idx = dragIndex.current;
    setLocalWaypoints(prev => { const next = [...prev]; next[idx] = fp; return next; });
  }, [screenToFlowPosition]);

  const handleBezierCPMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const fp = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setLocalWaypoints([fp]);
  }, [screenToFlowPosition]);

  const handleOrthoMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const fp = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setLocalWaypoints(isHorizPrimary
      ? [{ x: fp.x, y: midY }]
      : [{ x: midX, y: fp.y }]
    );
  }, [screenToFlowPosition, isHorizPrimary, midX, midY]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    isDragging.current = false;
    dragIndex.current = -1;
    const wps = localWaypointsRef.current;
    onWaypointsChange?.(id, wps.length > 0 ? wps : null);
  }, [id, onWaypointsChange]);

  const handleWaypointDblClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setLocalWaypoints(prev => {
      const next = prev.filter((_, i) => i !== index);
      onWaypointsChange?.(id, next.length > 0 ? next : null);
      return next;
    });
  }, [id, onWaypointsChange]);

  const handlePathClick = useCallback((e: React.MouseEvent) => {
    if (!selected) return;
    e.stopPropagation();
    const fp = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    // Don't add a waypoint if the click lands on an existing one
    const tooClose = localWaypointsRef.current.some(wp => Math.hypot(fp.x - wp.x, fp.y - wp.y) < 12);
    if (tooClose) return;
    const points = [{ x: sourceX, y: sourceY }, ...localWaypointsRef.current, { x: targetX, y: targetY }];
    let bestSeg = 0, bestDist = Infinity;
    for (let i = 0; i < points.length - 1; i++) {
      const d = distToSegment(fp, points[i], points[i + 1]);
      if (d < bestDist) { bestDist = d; bestSeg = i; }
    }
    setLocalWaypoints(prev => {
      const next = [...prev];
      next.splice(bestSeg, 0, fp);
      onWaypointsChange?.(id, next);
      return next;
    });
  }, [id, onWaypointsChange, screenToFlowPosition, selected, sourceX, sourceY, targetX, targetY]);

  // In orthogonal (≤1 wp) and bezier (no custom CP) the label midpoint is
  // identical to the drag-handle position. Push the label down 20px so the
  // handle div doesn't sit on top of it or intercept double-clicks.
  const labelCollidesWithHandle =
    selected && (
      (edgeRoutingMode === 'orthogonal' && localWaypoints.length <= 1) ||
      (edgeRoutingMode === 'bezier' && !hasBezierCP)
    );
  const labelRenderY = labelCollidesWithHandle ? labelY + 20 : labelY;

  useEffect(() => {
    if (editingLabel) labelInputRef.current?.focus();
  }, [editingLabel]);

  const startLabelEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLabelDraft(quickNote ?? '');
    setEditingLabel(true);
  }, [quickNote]);

  const commitLabel = useCallback(() => {
    setEditingLabel(false);
    const trimmed = labelDraft.trim();
    onEdgeLabelChange?.(id, trimmed || null);
  }, [id, labelDraft, onEdgeLabelChange]);

  const cancelLabel = useCallback(() => {
    setEditingLabel(false);
  }, []);

  // Shared inline style for drag handle divs rendered in EdgeLabelRenderer.
  // Using HTML divs instead of SVG transparent shapes avoids SVG pointer-events
  // inconsistencies and React Flow's native canvas listeners interfering.
  const handleDivBase: React.CSSProperties = {
    position: 'absolute',
    width: 24,
    height: 24,
    touchAction: 'none',
    userSelect: 'none',
    pointerEvents: 'all',
  };

  return (
    <>
      {/* Wide invisible hit area — also drives hover state */}
      <path
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => { setHovered(true); onHoverChange?.(id, true); }}
        onMouseLeave={() => { setHovered(false); onHoverChange?.(id, false); }}
      />

      {/* Visible edge path + arrowhead, brightened on hover. A trace overlay
          fades non-cascade edges and glows the ones carrying the cascade. */}
      <g style={{
        ...(hovered && !selected ? { filter: 'brightness(1.7)' } : undefined),
        ...(traceDimmed ? { opacity: 0.1 } : undefined),
        ...(onTrace ? { filter: 'brightness(1.5) drop-shadow(0 0 3px rgba(255,176,0,0.7))' } : undefined),
      }}>
        <path
          id={id}
          className="react-flow__edge-path"
          d={edgePath}
          fill="none"
          // Inline style (not the stroke/strokeWidth attributes) so our colour and
          // width-tier win over React Flow's base `.react-flow__edge-path` CSS rule —
          // SVG presentation attributes are overridden by any stylesheet.
          style={{ stroke: strokeColor, strokeWidth, strokeDasharray }}
        />

        {/* Arrowhead polygon — angle computed explicitly so it's always correct */}
        {showArrow && (
          <polygon
            points="0,0 -8,-4 -8,4"
            style={{ fill: strokeColor }}
            transform={`translate(${targetX},${targetY}) rotate(${arrowAngleDeg})`}
          />
        )}
      </g>

      {/* ── Waypoints mode: click-to-add strip + visual dots (no pointer events) ── */}
      {edgeRoutingMode === 'waypoints' && selected && (
        <>
          {!captured && (
            <path
              d={hasWaypoints ? waypointPath : defaultBezierPath}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              style={{ pointerEvents: 'stroke', cursor: 'crosshair' }}
              onPointerDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
              onClick={handlePathClick}
            />
          )}
          {visualWaypoints.map((wp, i) => (
            <circle key={i} cx={wp.x} cy={wp.y} r={5} className="edge-handle" style={{ pointerEvents: 'none' }} />
          ))}
        </>
      )}

      {/* ── Bezier mode: guide lines + visual CP dot (no pointer events) ── */}
      {edgeRoutingMode === 'bezier' && selected && (
        <>
          {hasBezierCP && (
            <>
              <line x1={sourceX} y1={sourceY} x2={cpX} y2={cpY} stroke={strokeColor} strokeWidth={0.6} strokeDasharray="4 3" opacity={0.4} />
              <line x1={targetX} y1={targetY} x2={cpX} y2={cpY} stroke={strokeColor} strokeWidth={0.6} strokeDasharray="4 3" opacity={0.4} />
            </>
          )}
          <circle cx={cpX} cy={cpY} r={5} className="edge-handle edge-handle-bezier" style={{ pointerEvents: 'none' }} />
        </>
      )}

      {/* ── Orthogonal mode: click-to-add strip ── */}
      {edgeRoutingMode === 'orthogonal' && selected && !captured && (
        <path
          d={orthoPath}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          style={{ pointerEvents: 'stroke', cursor: 'crosshair' }}
          onPointerDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
          onClick={handlePathClick}
        />
      )}

      {/* ── Orthogonal mode: visual knobs (no pointer events) ── */}
      {edgeRoutingMode === 'orthogonal' && selected && (
        localWaypoints.length <= 1 ? (
          <rect
            className="edge-handle edge-handle-ortho"
            x={orthoHandleX - 5} y={orthoHandleY - 5}
            width={10} height={10} rx={2}
            style={{ pointerEvents: 'none' }}
          />
        ) : (
          <>
            {localWaypoints.map((wp, i) => (
              <rect
                key={i}
                className="edge-handle edge-handle-ortho"
                x={wp.x - 5} y={wp.y - 5}
                width={10} height={10} rx={2}
                style={{ pointerEvents: 'none' }}
              />
            ))}
          </>
        )
      )}

      {/* ── All drag handles + label live in EdgeLabelRenderer as HTML divs.
           HTML divs sidestep SVG pointer-event inconsistencies and React
           Flow's native canvas listeners completely. ── */}
      <EdgeLabelRenderer>
        {edgeRoutingMode === 'waypoints' && selected && !captured && localWaypoints.map((wp, i) => (
          <div
            key={`wp-${id}-${i}`}
            className="nopan nodrag"
            style={{
              ...handleDivBase,
              transform: `translate(-50%, -50%) translate(${wp.x}px, ${wp.y}px)`,
              cursor: 'move',
            }}
            onPointerDown={(e) => handlePointerDown(e, i)}
            onPointerMove={handleWaypointMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={(e) => handleWaypointDblClick(e, i)}
          />
        ))}

        {edgeRoutingMode === 'bezier' && selected && !captured && (
          <div
            className="nopan nodrag"
            style={{
              ...handleDivBase,
              transform: `translate(-50%, -50%) translate(${cpX}px, ${cpY}px)`,
              cursor: 'move',
            }}
            onPointerDown={(e) => handlePointerDown(e, 0)}
            onPointerMove={handleBezierCPMove}
            onPointerUp={handlePointerUp}
          />
        )}

        {edgeRoutingMode === 'orthogonal' && selected && !captured && (
          localWaypoints.length <= 1 ? (
            <div
              className="nopan nodrag"
              style={{
                ...handleDivBase,
                transform: `translate(-50%, -50%) translate(${orthoHandleX}px, ${orthoHandleY}px)`,
                cursor: isHorizPrimary ? 'ew-resize' : 'ns-resize',
              }}
              onPointerDown={(e) => handlePointerDown(e, 0)}
              onPointerMove={handleOrthoMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={(e) => handleWaypointDblClick(e, 0)}
            />
          ) : (
            <>
              {localWaypoints.map((wp, i) => (
                <div
                  key={`ortho-${id}-${i}`}
                  className="nopan nodrag"
                  style={{
                    ...handleDivBase,
                    transform: `translate(-50%, -50%) translate(${wp.x}px, ${wp.y}px)`,
                    cursor: 'move',
                  }}
                  onPointerDown={(e) => handlePointerDown(e, i)}
                  onPointerMove={handleWaypointMove}
                  onPointerUp={handlePointerUp}
                  onDoubleClick={(e) => handleWaypointDblClick(e, i)}
                />
              ))}
            </>
          )
        )}

        {editingLabel ? (
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelRenderY}px)`,
              pointerEvents: 'all',
            }}
          >
            <input
              ref={labelInputRef}
              className="edge-label-input"
              value={labelDraft}
              onChange={e => setLabelDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={e => {
                if (e.key === 'Enter') commitLabel();
                else if (e.key === 'Escape') cancelLabel();
                e.stopPropagation();
              }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        ) : (
          <div
            className="edge-label nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelRenderY}px)`,
              pointerEvents: selected || quickNote ? 'all' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              cursor: selected ? 'text' : 'default',
            }}
            onDoubleClick={selected ? startLabelEdit : undefined}
          >
            {paramLabel && <span style={{ pointerEvents: 'none' }}>{paramLabel}</span>}
            {quickNote && (
              <span className="edge-quick-note" style={{ pointerEvents: 'none' }}>{quickNote}</span>
            )}
            {captured && (
              <span className="edge-captured-badge" title="Both endpoints captured by a locked region" style={{ pointerEvents: 'none' }}>
                <Lock size={9} />
              </span>
            )}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(EdgeLine);
