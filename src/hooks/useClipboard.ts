import { useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { NodeObject, RegionObject, partitionIds } from '../lib/graphObject';
import type { GloNode, GloEdge, GloRegion } from '../types';
import { useGraph } from './useGraph';
import type { HistoryEntry } from './useHistory';
import type { ClipboardPayload, KeyboardShortcutState } from './useKeyboardShortcuts';

interface ClipboardDeps {
  graph: ReturnType<typeof useGraph>;
  gapi: {
    setNodePinned: (id: string, pinned: boolean) => Promise<unknown>;
    setNodeExpandPinned: (id: string, pinned: boolean) => Promise<unknown>;
  };
  history: { push: (entry: HistoryEntry) => void };
  keyStateRef: { current: KeyboardShortcutState };
  rfSelectionRef: { current: { nodeIds: string[]; edgeIds: string[] } };
  setPinnedNodeIds: Dispatch<SetStateAction<Set<string>>>;
  setPinnedExpandIds: Dispatch<SetStateAction<Set<string>>>;
  setLockedRegionIds: Dispatch<SetStateAction<Set<string>>>;
  setMinimizedRegionIds: Dispatch<SetStateAction<Set<string>>>;
  /** Apply a region's locked / minimized transient state (AppInner's region handlers). */
  applyRegionLock: (id: string, locked: boolean) => void;
  applyRegionMinimize: (id: string, minimized: boolean) => void;
  /** Set while pasting so the region handlers don't push their own history entries. */
  suppressRegionHistoryRef: { current: boolean };
}

// Pasted items land at this offset from the source so they don't sit exactly on top.
const OFFSET = 40;

/**
 * Copy / paste / duplicate, extracted from AppInner. Owns the in-memory clipboard
 * and the two functions that read and write it:
 *
 * - `buildClipboardPayload()` resolves the current selection (RF multi-select or a
 *   single click-select) into a portable payload — explicit nodes + members of
 *   selected regions, the edges among them, and the relevant view-state — or null
 *   when nothing is copyable. Shared by Copy, Duplicate, and their shortcuts so the
 *   entry points can't drift.
 * - `handlePaste(clip)` recreates that payload (offset, with new ids), copying
 *   links/media/size/region-state, and pushes one undo/redo entry for the batch.
 *
 * Paste is intrinsically cross-cutting (nodes, edges, regions, view-state, history,
 * region locking), which is why the dep surface is wide — this hook is the single
 * home for that orchestration rather than a decoupling of it.
 */
export function useClipboard(deps: ClipboardDeps) {
  const {
    graph, gapi, history, keyStateRef, rfSelectionRef,
    setPinnedNodeIds, setPinnedExpandIds, setLockedRegionIds, setMinimizedRegionIds,
    applyRegionLock, applyRegionMinimize, suppressRegionHistoryRef,
  } = deps;

  const clipboardRef = useRef<ClipboardPayload | null>(null);

  // `overrideIds` builds the payload from an explicit id set (used by the
  // right-click Duplicate, which targets the clicked element ± the selection)
  // instead of resolving the live selection refs.
  function buildClipboardPayload(overrideIds?: string[]): ClipboardPayload | null {
    const {
      nodes, edges, regions, selectedNodeId, selectedRegionId,
      pinnedNodeIds: pnIds, pinnedExpandIds: peIds,
      lockedRegionIds: lrIds, minimizedRegionIds: mrIds,
    } = keyStateRef.current;
    const rfSel = rfSelectionRef.current;
    const baseIds = overrideIds ?? (rfSel.nodeIds.length
      ? rfSel.nodeIds
      : [...(selectedNodeId ? [selectedNodeId] : []), ...(selectedRegionId ? [selectedRegionId] : [])]);
    const { nodeIds: explicitNodeIds, regionIds: selRegionIds } = partitionIds({ nodes, edges, regions }, baseIds);
    const selRegions = regions.filter(r => selRegionIds.includes(r.id));
    const memberIds = new Set<string>();
    for (const r of selRegions) {
      const rEl = new RegionObject(r);
      nodes.forEach(n => { if (rEl.contains(new NodeObject(n))) memberIds.add(n.id); });
    }
    const nodeSet = new Set([...explicitNodeIds, ...memberIds]);
    if (!nodeSet.size && !selRegions.length) return null;
    return {
      nodes: nodes.filter(n => nodeSet.has(n.id)),
      edges: edges.filter(e => nodeSet.has(e.sourceId) && nodeSet.has(e.targetId)),
      regions: selRegions,
      pinnedNodeIds: new Set([...nodeSet].filter(id => pnIds?.has(id))),
      pinnedExpandIds: new Set([...nodeSet].filter(id => peIds?.has(id))),
      lockedRegionIds: new Set(selRegionIds.filter(id => lrIds?.has(id))),
      minimizedRegionIds: new Set(selRegionIds.filter(id => mrIds?.has(id))),
    };
  }

  async function handlePaste(clip: {
    nodes: GloNode[];
    edges: GloEdge[];
    regions: GloRegion[];
    pinnedNodeIds?: Set<string>;
    pinnedExpandIds?: Set<string>;
    lockedRegionIds?: Set<string>;
    minimizedRegionIds?: Set<string>;
  }) {
    const idMap = new Map<string, string>();

    // Phase 1: create base nodes
    const baseNewNodes = await Promise.all(
      clip.nodes.map(n =>
        graph.addNode({
          title: n.title,
          description: n.description,
          eventDate: n.eventDate,
          x: n.x + OFFSET,
          y: n.y + OFFSET,
          color: n.color,
          confidence: n.confidence,
          impactMagnitude: n.impactMagnitude,
          tags: n.tags,
          // Carry the graph-item variant so a pasted note/image/video/audio
          // stays that kind (not a plain node). Size is re-applied below.
          kind: n.kind,
          paramValues: n.paramValues.map(pv => ({
            paramDefId: pv.paramDefId,
            value: pv.value,
            isEnabled: pv.isEnabled,
            showOnCard: pv.showOnCard,
          })),
        })
      )
    );
    clip.nodes.forEach((old, i) => idMap.set(old.id, baseNewNodes[i].id));

    // Phase 2: copy links and media per node, build full node objects for history
    const fullNewNodes = await Promise.all(
      clip.nodes.map(async (srcNode, i) => {
        const newNodeId = baseNewNodes[i].id;
        const links = await Promise.all(
          srcNode.links.map(l =>
            graph.addLink({ nodeId: newNodeId, url: l.url, label: l.label })
          )
        );
        const media = await Promise.all(
          srcNode.media.map(m =>
            graph.addMedia({
              nodeId: newNodeId,
              label: m.label,
              src: m.src,
              srcType: m.srcType,
              mediaType: m.mediaType,
              showOnCard: m.showOnCard,
            })
          )
        );
        // Re-apply a resized item's size so pasted image/video/note keep it.
        let sized = baseNewNodes[i];
        if (srcNode.width != null || srcNode.height != null) {
          sized = await graph.setNodeSize(newNodeId, srcNode.width ?? null, srcNode.height ?? null);
        }
        // Carry a note's markdown-styling toggle (new nodes default on).
        if (srcNode.renderMarkdown === false) {
          await graph.setNodeRenderMarkdown(newNodeId, false);
          sized = { ...sized, renderMarkdown: false };
        }
        return { ...sized, links, media };
      })
    );

    // Phase 3: create edges between new nodes
    const newEdges = await Promise.all(
      clip.edges
        .filter(e => idMap.has(e.sourceId) && idMap.has(e.targetId))
        .map(e =>
          graph.addEdge({
            sourceId: idMap.get(e.sourceId)!,
            targetId: idMap.get(e.targetId)!,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            paramValues: e.paramValues.map(pv => ({
              paramDefId: pv.paramDefId,
              value: pv.value,
              isEnabled: pv.isEnabled,
            })),
          })
        )
    );

    // Phase 4: create regions
    const newRegions = await Promise.all(
      clip.regions.map(r =>
        graph.addRegion({
          title: r.title,
          x: r.x + OFFSET,
          y: r.y + OFFSET,
          width: r.width,
          height: r.height,
          color: r.color,
        })
      )
    );

    // Phase 5: apply transient states to pasted items
    clip.nodes.forEach((srcNode, i) => {
      const newId = baseNewNodes[i].id;
      if (clip.pinnedNodeIds?.has(srcNode.id)) {
        setPinnedNodeIds(prev => { const n = new Set(prev); n.add(newId); return n; });
        gapi.setNodePinned(newId, true).catch(() => {});
      }
      if (clip.pinnedExpandIds?.has(srcNode.id)) {
        setPinnedExpandIds(prev => { const n = new Set(prev); n.add(newId); return n; });
        gapi.setNodeExpandPinned(newId, true).catch(() => {});
      }
    });
    suppressRegionHistoryRef.current = true;
    clip.regions.forEach((srcRegion, i) => {
      const newId = newRegions[i].id;
      if (clip.lockedRegionIds?.has(srcRegion.id)) applyRegionLock(newId, true);
      if (clip.minimizedRegionIds?.has(srcRegion.id)) applyRegionMinimize(newId, true);
    });
    suppressRegionHistoryRef.current = false;

    history.push({
      undo: async () => {
        // Clean up region transient states before deleting
        if (newRegions.length) {
          setLockedRegionIds(prev => { const n = new Set(prev); newRegions.forEach(r => n.delete(r.id)); return n; });
          setMinimizedRegionIds(prev => { const n = new Set(prev); newRegions.forEach(r => n.delete(r.id)); return n; });
        }
        await Promise.all(newRegions.map(r => graph.deleteRegion(r.id)));
        await Promise.all(newEdges.map(e => graph.deleteEdge(e.id)));
        await Promise.all(fullNewNodes.map(n => graph.deleteNode(n.id)));
      },
      redo: async () => {
        await Promise.all(fullNewNodes.map(n => graph.restoreNode(n)));
        await Promise.all(newEdges.map(e => graph.restoreEdge(e)));
        await Promise.all(newRegions.map(r => graph.restoreRegion(r)));
        // Re-apply region states (pin states re-apply automatically via preserved IDs)
        clip.regions.forEach((srcRegion, i) => {
          const newId = newRegions[i].id;
          if (clip.lockedRegionIds?.has(srcRegion.id)) applyRegionLock(newId, true);
          if (clip.minimizedRegionIds?.has(srcRegion.id)) applyRegionMinimize(newId, true);
        });
      },
    });
  }

  return { clipboardRef, buildClipboardPayload, handlePaste };
}
