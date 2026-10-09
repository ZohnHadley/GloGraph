import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { save as nativeSaveDialog, open as nativeOpenDialog } from '@tauri-apps/plugin-dialog';
import { Clock, Plus, Square, StickyNote, Image as ImageIcon, Film, Music2, File as FileIcon } from 'lucide-react';
import { Viewport } from '@xyflow/react';
import { partitionIds } from './lib/graphObject';
import { NODE_W, NODE_H } from './lib/regionMembership';
import { nodeDisplayLabel } from './lib/nodeDisplay';
import { useGraph } from './hooks/useGraph';
import { useHistory } from './hooks/useHistory';
import GraphCanvas from './components/GraphCanvas';
import TraceControl from './components/TraceControl';
import HostSessionDialog from './components/HostSessionDialog';
import JoinSessionDialog from './components/JoinSessionDialog';
import PresenceBadges from './components/PresenceBadges';
import PresenceToasts from './components/PresenceToasts';
import { PresenceProvider } from './context/PresenceContext';
import { IS_DEMO } from './lib/env';
import { useImpactTrace } from './hooks/useImpactTrace';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAppQuitFlow } from './hooks/useAppQuitFlow';
import { useClipboard } from './hooks/useClipboard';
import { useGraphExport } from './hooks/useGraphExport';
import { useProjectFiles } from './hooks/useProjectFiles';
import { useCanvasBookmarks } from './hooks/useCanvasBookmarks';
import { useRegionActions } from './hooks/useRegionActions';
import { useEdgeActions } from './hooks/useEdgeActions';
import { useNodeActions } from './hooks/useNodeActions';
import { useGraphArrange } from './hooks/useGraphArrange';
import type { KeyboardShortcutState } from './hooks/useKeyboardShortcuts';
import GlographMark from './components/GlographMark';
import GraphSettingsModal from './components/GraphSettings';
import NewProjectDialog from './components/NewProjectDialog';
import TabBar from './components/TabBar';
import MenuBar, { MenuGroup } from './components/MenuBar';
import Modal from './components/Modal';
import CloseTabDialog from './components/CloseTabDialog';
import NodePanel from './components/NodePanel';
import EdgePanel from './components/EdgePanel';
import RegionPanel from './components/RegionPanel';
import Sidebar from './components/Sidebar';
import BookmarkBar from './components/BookmarkBar';
import StatusBar from './components/StatusBar';
import QuickConnectDialog from './components/QuickConnectDialog';
import QuickFindDialog from './components/QuickFindDialog';
import CreateTypePicker from './components/CreateTypePicker';
import TextFieldContextMenu from './components/TextFieldContextMenu';
import { useMediaDrop } from './hooks/useMediaDrop';
import BulkEditPanel from './components/BulkEditPanel';
import TimelinePanel from './components/TimelinePanel';
import StartScreen from './components/StartScreen';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { TabsProvider, useTabs } from './context/TabsContext';
import { SessionProvider, useSession, guestEndpoints } from './context/SessionContext';
import { setRemoteMedia } from './lib/remoteMedia';
import { createRemoteApi } from './lib/remoteApi';
import { api } from './lib/api';
import {
  GloNode,
  GloEdge,
  GloRegion,
  UpdateNodeInput,
  NodeKind,
  GraphSettings,
  PanelState,
} from './types';
import './App.css';

// Derived from the canonical node dimensions so membership math can't drift.
const NODE_HALF_W = NODE_W / 2;
const NODE_HALF_H = NODE_H / 2;

// Shown in Preferences ▸ About. Keep in sync with package.json / tauri.conf.json.
const APP_VERSION = '0.9.13'; // fallback; the live value comes from get_build_info

function AppInner() {
  // Live Share: a guest runs this very editor against the remote host (graph +
  // settings + writes all routed to the session server); host/solo stays local.
  const { session, setSession } = useSession();
  const guest = guestEndpoints(session);
  const isGuest = !!guest;
  // A view-only guest can read/navigate/filter/trace + view media, but cannot
  // mutate. Backend already rejects its writes (no mutation routes in a read-only
  // session); this disables the UI so nothing appears-then-reverts.
  const readOnly = isGuest && session?.access === 'read-only';
  const remoteGapi = useMemo(() => (guest ? createRemoteApi(guest.base, guest.token) : undefined), [guest?.base, guest?.token]);
  // Direct (non-useGraph) graph writes route here too, so a guest hits the host.
  const gapi = remoteGapi ?? api;
  // Guests (remote api) run in optimistic mode so node edits/drags/deletes apply
  // instantly instead of waiting on the host round-trip; the host stays pessimistic.
  const graph = useGraph(remoteGapi, !!remoteGapi);
  const history = useHistory();
  // Bumped after an external (HTTP-API/SDK) reload so the element view-state
  // effect below re-seeds the pin/lock/minimize Sets from the reloaded graph.
  const [reloadSeq, setReloadSeq] = useState(0);

  // External (HTTP-API/SDK) writes each emit `api:graph-changed`. A script that
  // streams data fires this rapidly, so coalesce a burst into one reload (~5/s)
  // instead of a full graph re-fetch per write — otherwise streaming thrashes the UI.
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const COALESCE_MS = 100; // lower latency for Live Share (host sees guest edits sooner)
    const unlisten = listen('api:graph-changed', () => {
      if (reloadTimer.current != null) return;  // a reload is already pending in this window
      reloadTimer.current = setTimeout(() => {
        reloadTimer.current = null;
        graph.reload().then(() => setReloadSeq(s => s + 1));
      }, COALESCE_MS);
    });
    return () => {
      if (reloadTimer.current != null) { clearTimeout(reloadTimer.current); reloadTimer.current = null; }
      unlisten.then(fn => fn());
    };
  }, [graph.reload]);

  // Phase-1 Live Share: mirror every local graph change (GUI edits included) onto
  // the SSE stream (`publish_change` → GET /api/events) so subscribers and a future
  // spectate client see the host's edits, not just HTTP-API writes. Debounced; the
  // initial load is skipped.
  const publishMounted = useRef(false);
  const publishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isGuest) return; // a guest's edits already went to the host; nothing to publish locally
    if (!publishMounted.current) { publishMounted.current = true; return; }
    if (publishTimer.current != null) clearTimeout(publishTimer.current);
    publishTimer.current = setTimeout(() => {
      publishTimer.current = null;
      api.publishChange().catch(() => {});
    }, 60); // low latency for Live Share; a change event is just an SSE ping
    return () => { if (publishTimer.current != null) { clearTimeout(publishTimer.current); publishTimer.current = null; } };
  }, [graph.nodes, graph.edges, graph.regions, isGuest]);

  // Live Share guest: subscribe to the host's change stream and reload (merged, so
  // only changed entities re-render) — this is how a guest sees the host's + other
  // guests' edits. (A host instead gets local `api:graph-changed` events.)
  useEffect(() => {
    if (!guest) return;
    const es = new EventSource(`${guest.base}/api/events?token=${encodeURIComponent(guest.token)}`);
    let timer: ReturnType<typeof setTimeout> | null = null;
    es.onmessage = () => {
      if (timer != null) return;
      timer = setTimeout(() => { timer = null; graph.reload().then(() => setReloadSeq(s => s + 1)); }, 40);
    };
    return () => { es.close(); if (timer != null) clearTimeout(timer); };
  }, [guest?.base, guest?.token, graph.reload]);

  // While a guest, render file media by streaming it from the host (over the
  // loopback TLS bridge); clear when not a guest (host/solo uses the local asset
  // protocol). This is what lets a guest SEE the host's local images/video/audio.
  useEffect(() => {
    setRemoteMedia(guest ? guest.base : null, guest?.token ?? '');
    return () => setRemoteMedia(null);
  }, [guest?.base, guest?.token]);

  const { activeParamDefs, activeEdgeParamDefs, edgeRoutingMode, setEdgeRoutingMode, expandNodesByDefault, setExpandNodesByDefault } = useSettings();
  const tabsCtx = useTabs();
  const [panel, setPanel] = useState<PanelState>({ kind: 'none' });
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>();
  const [selectedRegionId, setSelectedRegionId] = useState<string>();
  const [minimizedRegionIds, setMinimizedRegionIds] = useState<Set<string>>(new Set());
  const [lockedRegionIds, setLockedRegionIds] = useState<Set<string>>(new Set());
  const [scrollToPos, setScrollToPos] = useState<{ x: number; y: number } | null>(null);
  const [searchFocusTrigger, setSearchFocusTrigger] = useState(0);
  const [graphSettingsOpen, setGraphSettingsOpen] = useState(false);
  const [graphSettingsTab, setGraphSettingsTab] = useState<'presets' | 'shortcuts'>('presets');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [buildInfo, setBuildInfo] = useState<{ version: string; buildDate: string } | null>(null);
  const [newTabDialogOpen, setNewTabDialogOpen] = useState(false);
  const [currentSavePath, setCurrentSavePath] = useState<string | null>(tabsCtx.activeTab?.savePath ?? null);
  const [saveToast, setSaveToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [fitViewTrigger, setFitViewTrigger] = useState(0);
  const [selectAllTrigger, setSelectAllTrigger] = useState(0);
  const [zoomToSelectionTrigger, setZoomToSelectionTrigger] = useState(0);
  const [selectRegionTrigger, setSelectRegionTrigger] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [pinnedNodeIds, setPinnedNodeIds] = useState<Set<string>>(new Set());
  const [pinnedExpandIds, setPinnedExpandIds] = useState<Set<string>>(new Set());
  // Ephemeral per-node expand/collapse overrides set by the Expand/Collapse (E)
  // shortcut when nodes are selected; cleared when toggling the global default.
  const [expandOverrides, setExpandOverrides] = useState<Map<string, boolean>>(new Map());
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set());
  const [flashingNodeId, setFlashingNodeId] = useState<string | null>(null);
  // Ephemeral impact-trace overlay (seed/direction/result + fetching). Not
  // persisted — cleared on Escape (below), tab switch, or seed deletion. A trace
  // is its own focus mode, so starting one drops the Select-Connected highlight.
  const {
    traceSeedId, trace, traceNodeIds, traceEdgeIds,
    handleTrace, clearTrace, setTraceDirection,
  } = useImpactTrace(graph.nodes, graph.edges, () => setHighlightedNodeIds(new Set()));
  // Share/collaboration flows (STUB — networking not wired yet). The host and join
  // gates open their respective dialogs; `session` holds the single active preview
  // session (you're either hosting or joined, never both).
  const [hostPromptOpen, setHostPromptOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  // `session` / `setSession` now live in SessionContext (above SettingsProvider).
  // End the active session: a host tears down the LAN session server; both roles
  // tear down their loopback TLS bridge (guest → host, host → its own server).
  const endSession = useCallback(async () => {
    if (session?.role === 'host') { try { await api.stopHostSession(); } catch { /* ignore */ } }
    try { await api.stopGuestBridge(); } catch { /* ignore */ }
    setSession(null);
  }, [session, setSession]);

  // Detect the host ending the session: ping it through the bridge; after a few
  // consecutive failures (aborting the host server makes the forwarded ping fail),
  // tell the guest and disconnect them back to their own local workspace.
  useEffect(() => {
    if (!guest) return;
    let fails = 0;
    let stopped = false;
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`${guest.base}/api/ping`, { headers: { Authorization: `Bearer ${guest.token}` } });
        fails = r.ok ? 0 : fails + 1;
      } catch { fails += 1; }
      if (fails >= 3 && !stopped) {
        stopped = true;
        clearInterval(iv);
        setSaveToast({ msg: 'The host ended the session.', ok: false });
        setTimeout(() => setSaveToast(null), 5000);
        endSession();
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [guest?.base, guest?.token, endSession]);
  // Presence covers host AND guest. The session server is WSS now and neither
  // webview can trust the self-signed cert directly, so BOTH roles reach the
  // presence relay through the loopback TLS bridge (`session.localBase`): the host
  // bridges to its own server, the guest to the host's. One `presence` drives the
  // cursors + "N here" badge for both.
  const inSession = !!session;
  const presenceWs = session?.localBase
    ? `${session.localBase.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(session.token ?? '')}`
    : '';
  // The full React Flow selection (node + edge ids), kept reactive so the live
  // selection — single or multi (drag-box / shift / ctrl) — can be shared via presence.
  const [rfSelectedIds, setRfSelectedIds] = useState<string[]>([]);
  // What we currently have selected, shared so peers can highlight it in our colour.
  // Union of the live RF selection (covers multi-select: drag-box / shift / ctrl,
  // nodes + edges) and the single-select ids (belt-and-suspenders for any path that
  // doesn't flow through RF selection).
  const presenceSelection = useMemo(() => {
    const ids = new Set<string>(rfSelectedIds);
    if (selectedNodeId) ids.add(selectedNodeId);
    if (selectedEdgeId) ids.add(selectedEdgeId);
    if (selectedRegionId) ids.add(selectedRegionId);
    return Array.from(ids);
  }, [rfSelectedIds, selectedNodeId, selectedEdgeId, selectedRegionId]);
  // Presence (peer cursors/marquees/selections) lives in <PresenceProvider> wrapping
  // the whole return — so its ~22/s `peers` updates re-render only the cursor/badge
  // layers, not AppInner. The provider's inputs are below; consumers read it via
  // usePresencePeers()/usePresenceApi().
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // When true, region lock/minimize toggles don't push history (used during paste,
  // which records its own single undo entry for the whole operation).
  const suppressRegionHistoryRef = useRef(false);
  const [quickConnectSourceId, setQuickConnectSourceId] = useState<string | null>(null);
  const viewportRef = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });
  // Canvas bookmarks (saved viewports) + the bookmark-restore target viewport.
  // See hooks/useCanvasBookmarks. (markDirty is a hoisted declaration below.)
  const {
    bookmarks, saveBookmarks,
    handleSaveBookmark, handleDeleteBookmark, handleRestoreBookmark,
    targetViewport, clearTargetViewport,
  } = useCanvasBookmarks({ viewportRef, markDirty });
  // React Flow's own screen→flow projection, published from inside <ReactFlow>.
  const screenToFlowRef = useRef<((p: { x: number; y: number }) => { x: number; y: number }) | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [graphNotes, setGraphNotes] = useState('');
  const graphNotesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rfSelectionSize, setRfSelectionSize] = useState(0);
  const [ctrlSelectionSize, setCtrlSelectionSize] = useState(0);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [quickFindOpen, setQuickFindOpen] = useState(false);
  // The "what kind of graph object?" picker (N shortcut / "Add node here…").
  // `screen` anchors the menu, `flow` is the create position, `regionId` is set
  // when opened from inside a region (centres the node so it joins that region).
  const [createPicker, setCreatePicker] = useState<{
    screen: { x: number; y: number };
    flow: { x: number; y: number };
    regionId?: string;
  } | null>(null);
  const orderedSelectionRef = useRef<string[]>([]);
  const dragVectorRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    api.getAppSetting('graph_notes').then(raw => {
      if (raw) setGraphNotes(raw);
    });
  }, []);

  useEffect(() => {
    api.getBuildInfo().then(setBuildInfo).catch(() => {});
  }, []);

  // Seed the element view-state Sets from persisted DB columns once the graph
  // has loaded. Runs once per mount (each tab remounts AppInner via key=), so
  // lock/minimize/pin survive restart, tab switch and import.
  const seededStatesRef = useRef(false);
  function seedViewStateFromGraph() {
    setPinnedNodeIds(new Set(graph.nodes.filter(n => n.isPinned).map(n => n.id)));
    setPinnedExpandIds(new Set(graph.nodes.filter(n => n.isExpandPinned).map(n => n.id)));
    setLockedRegionIds(new Set(graph.regions.filter(r => r.isLocked).map(r => r.id)));
    setMinimizedRegionIds(new Set(graph.regions.filter(r => r.isMinimized).map(r => r.id)));
  }
  useEffect(() => {
    if (graph.loading || seededStatesRef.current) return;
    seededStatesRef.current = true;
    seedViewStateFromGraph();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph.loading, graph.nodes, graph.regions]);

  // Re-seed after an external (HTTP-API/SDK) reload so element view-state
  // reflects what the API wrote (e.g. an imported graph's locked regions).
  // Skipped on first render (reloadSeq 0); the effect above does the initial seed.
  useEffect(() => {
    if (reloadSeq === 0 || graph.loading) return;
    seedViewStateFromGraph();
    // External (HTTP-API/SDK) writes change the DB out-of-band (not via local
    // mutations), so recheck dirty too — content-fingerprint based, so an API write
    // that lands identical content won't falsely flag the tab.
    scheduleDirtyRecheck();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadSeq]);

  // Authoritative dirty recheck (debounced). After edits settle, ask the backend
  // whether the project's content actually differs from its clean baseline (a
  // content fingerprint of the last save / open / create). This is what CLEARS the
  // unsaved dot when the user undoes back to the saved/initial state — dirty
  // reflects real difference, not "an edit happened." Debounced past the
  // graph-notes DB write (250ms) so a notes-only change is already persisted when
  // the backend reads it.
  const recheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function scheduleDirtyRecheck() {
    if (isGuest) return;
    if (recheckTimer.current != null) clearTimeout(recheckTimer.current);
    recheckTimer.current = setTimeout(() => {
      recheckTimer.current = null;
      tabsCtx.recomputeActiveTabDirty().catch(() => {});
    }, 400);
  }

  // Mark the active tab dirty (unsaved file changes). Sets the dot instantly on the
  // first edit (optimistic), then ALWAYS schedules the authoritative recheck above
  // — including when already dirty — so undoing back to baseline can clear it.
  // Cleared on save (openSaveDialog / triggerSave) and by the recheck. Per-mount
  // via key={activeTabId}, and only the active tab is editable, so this is the only
  // writer of any tab's flag. Called for EVERY kind of project change: node/edge/
  // region content (the effect below), graph notes, bookmarks, and node-pin /
  // region-lock-minimize toggles — all of which travel in the .glograph export.
  function markDirty() {
    if (isGuest) return; // a guest edits the host's graph, not its own (hidden) tab
    const id = tabsCtx.activeTab?.id;
    if (!id) return;
    if (!tabsCtx.activeTab?.dirty) tabsCtx.markTabDirty(id);
    scheduleDirtyRecheck();
  }

  // Content changes. `mutationSeq` only increments on real mutations (never on
  // the initial load or `reload()`), so opening/loading a project never marks it
  // dirty — only an actual edit does. Starts at 0; the first bump → 1 fires this.
  useEffect(() => {
    if (graph.mutationSeq > 0) markDirty();
  }, [graph.mutationSeq]);

  function handleNotesChange(notes: string) {
    setGraphNotes(notes);
    if (graphNotesDebounceRef.current) clearTimeout(graphNotesDebounceRef.current);
    graphNotesDebounceRef.current = setTimeout(() => {
      api.setAppSetting('graph_notes', notes);
    }, 250); // < the 400ms dirty recheck, so notes are persisted before it reads the DB
    markDirty();
  }

  const rfSelectionRef = useRef<{ nodeIds: string[]; edgeIds: string[] }>({
    nodeIds: [],
    edgeIds: [],
  });

  // keyStateRef holds the latest app state the keyboard handler reads; its shape
  // lives in useKeyboardShortcuts (single source of truth) and is refreshed every
  // render below, near the useKeyboardShortcuts() call.
  const keyStateRef = useRef<KeyboardShortcutState>({} as KeyboardShortcutState);

  // Copy / paste / duplicate: clipboard + payload builder + paste orchestration.
  // See hooks/useClipboard. (handleRegionLock/Minimize are hoisted declarations.)
  const { clipboardRef, buildClipboardPayload, handlePaste } = useClipboard({
    graph, gapi, history, keyStateRef, rfSelectionRef,
    setPinnedNodeIds, setPinnedExpandIds, setLockedRegionIds, setMinimizedRegionIds,
    applyRegionLock: handleRegionLock, applyRegionMinimize: handleRegionMinimize,
    suppressRegionHistoryRef,
  });

  // Node create/edit/delete/move + per-node media/link mutations — extracted to keep
  // AppInner focused. Behaviour-identical; deps are injected. Placed here (before
  // useMediaDrop, which consumes handleAddMedia) so the destructured handlers precede
  // their uses. The create-flow UI helpers below call handleCreateItem. See useNodeActions.
  const {
    handleCreateItem,
    handleInlineNoteChange,
    handleToggleRenderMarkdown,
    handleToggleShowThumbnail,
    handleNodeResize,
    handleAddMedia,
    handleRemoveMedia,
    handleReorderMedia,
    handleAddLink,
    handleRemoveLink,
    handleNodeBringToFront,
    handleNodeSendToBack,
    handleSaveNode,
    handleDeleteNode,
    handleDeleteMultiple,
    handleNodeMove,
    handleQuickConnect,
  } = useNodeActions({
    graph, history, readOnly, activeEdgeParamDefs,
    quickConnectSourceId, setQuickConnectSourceId,
    setPanel, setSelectedNodeId, setSelectedEdgeId, setSelectedRegionId, setScrollToPos,
  });

  // Right-click → Duplicate / Delete. Selection-aware: if the clicked node is part
  // of a multi-selection, act on the whole selection; otherwise just the clicked
  // element. Reuse the existing undoable clipboard/delete paths.
  function contextNodeIds(nodeId: string): string[] {
    const sel = rfSelectionRef.current.nodeIds;
    return sel.includes(nodeId) && sel.length > 1 ? sel : [nodeId];
  }
  function handleContextDuplicateNode(nodeId: string) {
    const payload = buildClipboardPayload(contextNodeIds(nodeId));
    if (payload) void handlePaste(payload);
  }
  function handleContextDeleteNode(nodeId: string) {
    handleDeleteMultiple(contextNodeIds(nodeId), []);
  }
  function handleContextDuplicateRegion(regionId: string) {
    // Duplicate the region (and its member nodes, matching Ctrl+D on a region).
    const payload = buildClipboardPayload([regionId]);
    if (payload) void handlePaste(payload);
  }

  // Drag-and-drop media: files (Tauri native drop → absolute paths) and media URLs
  // (HTML5 drop) → attach to the node under the cursor, or create an image/video/
  // audio item on empty canvas / inside a region. Routes through graph.addMedia, so
  // a Live Share guest's local file uploads to the host automatically (remoteApi
  // seam). Disabled for view-only guests. See hooks/useMediaDrop.
  const { dropActive } = useMediaDrop({
    enabled: !readOnly,
    screenToFlowRef,
    nodes: graph.nodes,
    regions: graph.regions,
    addNode: graph.addNode,
    addMedia: graph.addMedia,
    attachMedia: handleAddMedia,
    deleteNode: graph.deleteNode,
    restoreNode: graph.restoreNode,
    pushHistory: history.push,
    toast: (msg, ok) => setSaveToast({ msg, ok }),
  });

  // Global keyboard shortcuts are registered by useKeyboardShortcuts(), wired
  // below once keyStateRef is populated (it needs bookmarksRef + clearTrace, which
  // are set up later in the component body).

  // ── Helpers ──────────────────────────────────────────────────────────

  // ── Handlers ────────────────────────────────────────────────────────

  // Graph-coordinate point that visually centers a node in the current viewport.
  // Uses React Flow's own screen→flow projection (the authority on the live
  // transform); falls back to the centroid of existing nodes if unavailable.
  function viewportCenterNodePos(): { x: number; y: number } {
    const canvas = document.querySelector('.graph-canvas') as HTMLElement | null;
    const project = screenToFlowRef.current;
    if (canvas && project) {
      const rect = canvas.getBoundingClientRect();
      // Project the canvas's on-screen center into graph space, then offset by
      // half the node so the card is centered, not anchored by its top-left.
      const center = project({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      return { x: center.x - NODE_HALF_W, y: center.y - NODE_HALF_H };
    }
    let cx = 0, cy = 0;
    if (graph.nodes.length > 0) {
      cx = graph.nodes.reduce((s, n) => s + n.x, 0) / graph.nodes.length;
      cy = graph.nodes.reduce((s, n) => s + n.y, 0) / graph.nodes.length;
    }
    return { x: cx, y: cy };
  }

  function openCreateNode() {
    if (readOnly) return;
    setPanel({ kind: 'createNode', pos: viewportCenterNodePos() });
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    setSelectedRegionId(undefined);
  }

  // Open the create-type picker (Node default + note/image/video/audio). The N
  // shortcut anchors it at the viewport centre; the canvas/region right-click
  // "Add node here…" anchors it at the cursor (with the region's id, below).
  function openCreatePickerCenter() {
    if (readOnly) return;
    setCreatePicker({
      screen: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      flow: viewportCenterNodePos(),
    });
  }

  // A type was chosen in the picker. A plain node opens the create-on-Save panel;
  // a note/media item is created immediately (handleCreateItem). When the picker
  // was opened from inside a region, the new node is centred on the click so its
  // centre lands inside that region — locked-region capture then follows from
  // live geometry (no membership write needed; see GraphCanvas flushCaptured).
  function handlePickCreateType(kind: NodeKind) {
    const p = createPicker;
    setCreatePicker(null);
    if (!p || readOnly) return;
    const pos = p.regionId
      ? { x: p.flow.x - NODE_HALF_W, y: p.flow.y - NODE_HALF_H }
      : p.flow;
    if (kind === 'standard') {
      setPanel({ kind: 'createNode', pos });
      setSelectedNodeId(undefined);
      setSelectedEdgeId(undefined);
      setSelectedRegionId(undefined);
    } else {
      void handleCreateItem(kind, pos);
    }
  }

  function openCreateRegion() {
    let cx = 0, cy = 0;
    if (graph.nodes.length > 0) {
      cx = graph.nodes.reduce((s, n) => s + n.x, 0) / graph.nodes.length;
      cy = graph.nodes.reduce((s, n) => s + n.y, 0) / graph.nodes.length;
    }
    setPanel({ kind: 'createRegion', pos: { x: cx - 160, y: cy - 110 } });
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    setSelectedRegionId(undefined);
  }

  function handleContextMenuCreate(pos: { x: number; y: number }) {
    if (readOnly) return;
    setPanel({ kind: 'createNode', pos });
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    setSelectedRegionId(undefined);
  }

  function handleCreateItemAtCenter(kind: NodeKind) {
    void handleCreateItem(kind, viewportCenterNodePos());
  }

  function handleContextMenuCreateRegion(pos: { x: number; y: number }) {
    if (readOnly) return;
    setPanel({ kind: 'createRegion', pos });
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    setSelectedRegionId(undefined);
  }

  function handleNodeSelect(node: GloNode | null) {
    if (!node) { setSelectedNodeId(undefined); return; }
    setSelectedNodeId(node.id);
    setSelectedEdgeId(undefined);
    setSelectedRegionId(undefined);
    setPanel({ kind: 'editNode', node });
  }

  function handleEdgeSelect(edge: GloEdge | null) {
    if (!edge) { setSelectedEdgeId(undefined); return; }
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(undefined);
    setSelectedRegionId(undefined);
    setPanel({ kind: 'editEdge', edge });
  }

  function handleRegionSelect(region: GloRegion | null) {
    if (!region) { setSelectedRegionId(undefined); return; }
    setSelectedRegionId(region.id);
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    setPanel({ kind: 'editRegion', region });
  }

  function handleNodeDoubleClick(node: GloNode) {
    setPanel({ kind: 'editNode', node });
    setSelectedNodeId(node.id);
  }

  function flashNode(nodeId: string) {
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    setFlashingNodeId(nodeId);
    flashTimeoutRef.current = setTimeout(() => setFlashingNodeId(null), 1200);
  }

  function handleSidebarSelect(node: GloNode) {
    setPanel({ kind: 'editNode', node });
    setSelectedNodeId(node.id);
    setSelectedRegionId(undefined);
    setScrollToPos({ x: node.x, y: node.y });
    flashNode(node.id);
  }

  function handleSidebarSelectRegion(region: GloRegion) {
    setPanel({ kind: 'editRegion', region });
    setSelectedRegionId(region.id);
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    setScrollToPos({ x: region.x + region.width / 2, y: region.y + region.height / 2 });
  }

  function handlePaneClick() {
    if (panel.kind === 'none') return;
    setSelectedNodeId(undefined);
    setSelectedEdgeId(undefined);
    setSelectedRegionId(undefined);
    setPanel({ kind: 'none' });
  }

  function handleSelectionChange(nodeIds: string[], edgeIds: string[]) {
    rfSelectionRef.current = { nodeIds, edgeIds };
    setRfSelectionSize(nodeIds.length);
    // Idempotent: React Flow fires onSelectionChange on plain re-renders too, so a
    // fresh array every call never bails out of setState → infinite render loop
    // (React #185, blank screen). Only update when the selected set actually changed.
    setRfSelectedIds(prev => {
      const next = [...nodeIds, ...edgeIds];
      return prev.length === next.length && next.every(id => prev.includes(id)) ? prev : next;
    });
    // A drag-select has a significant screen-space vector; a Ctrl+Click is a near-zero click.
    // Only clear the Ctrl+Click order when this is genuinely a drag-select, so both modes
    // preserve their intended direction independently.
    const v = dragVectorRef.current;
    const isDragSelect = nodeIds.length > 1 && !!v && (Math.abs(v.dx) > 10 || Math.abs(v.dy) > 10);
    if (isDragSelect || nodeIds.length === 0) {
      orderedSelectionRef.current = [];
      setCtrlSelectionSize(0);
    }
  }

  function applyRegionMinimized(id: string, minimized: boolean) {
    setMinimizedRegionIds(prev => {
      const next = new Set(prev);
      if (minimized) next.add(id);
      else next.delete(id);
      return next;
    });
    gapi.setRegionMinimized(id, minimized).catch(() => {});
  }

  function applyRegionLocked(id: string, locked: boolean) {
    setLockedRegionIds(prev => {
      const next = new Set(prev);
      if (locked) next.add(id);
      else next.delete(id);
      return next;
    });
    gapi.setRegionLocked(id, locked).catch(() => {});
  }

  function handleRegionMinimize(id: string, minimized: boolean) {
    const was = minimizedRegionIds.has(id);
    applyRegionMinimized(id, minimized);
    markDirty();
    if (!suppressRegionHistoryRef.current && was !== minimized) {
      history.push({
        undo: async () => { applyRegionMinimized(id, was); },
        redo: async () => { applyRegionMinimized(id, minimized); },
      });
    }
  }

  function handleRegionLock(id: string, locked: boolean) {
    const was = lockedRegionIds.has(id);
    applyRegionLocked(id, locked);
    markDirty();
    if (!suppressRegionHistoryRef.current && was !== locked) {
      history.push({
        undo: async () => { applyRegionLocked(id, was); },
        redo: async () => { applyRegionLocked(id, locked); },
      });
    }
  }

  // Region create/edit/delete/arrange handlers (move/resize, bring-to-front /
  // send-to-back, save, delete, wrap-selection, auto-fit) — extracted to keep
  // AppInner focused. Behaviour-identical; deps are injected. See useRegionActions.
  const {
    handleRegionMove,
    handleRegionResize,
    handleRegionBringToFront,
    handleRegionSendToBack,
    handleSaveRegion,
    handleDeleteRegion,
    handleWrapSelectionInRegion,
    handleRegionAutoFit,
  } = useRegionActions({
    graph, history, readOnly, selectedNodeId, rfSelectionRef,
    setPanel, setSelectedNodeId, setSelectedEdgeId, setSelectedRegionId,
    setScrollToPos, setMinimizedRegionIds, setLockedRegionIds,
  });

  // Edge create/edit/delete handlers (connect, delete, flip, reconnect, save,
  // label, waypoints) — extracted to keep AppInner focused. Behaviour-identical;
  // deps are injected. See useEdgeActions.
  const {
    handleConnect,
    handleDeleteEdge,
    handleFlipEdge,
    handleEdgeReconnect,
    handleSaveEdge,
    handleEdgeLabelChange,
    handleEdgeWaypointsChange,
  } = useEdgeActions({
    graph, history, readOnly, activeEdgeParamDefs,
    setPanel, setSelectedNodeId, setSelectedEdgeId, setSelectedRegionId,
  });

  // Save / Save As / Open — project-file operations + active-tab metadata sync.
  // See hooks/useProjectFiles.
  const { openSaveDialog, triggerSave, handleOpenProject } = useProjectFiles({
    currentSavePath,
    setCurrentSavePath,
    activeTab: tabsCtx.activeTab,
    markTabClean: tabsCtx.markTabClean,
    setTabSavePath: tabsCtx.setTabSavePath,
    renameTab: tabsCtx.renameTab,
    setSaveToast,
  });


  // Graph-wide arrange operations (Auto-Wire selected nodes in order, dagre
  // Auto-Layout + fit-view) — extracted to keep AppInner focused. Behaviour-
  // identical; deps are injected. See useGraphArrange.
  const { handleAutoWire, handleAutoLayout } = useGraphArrange({
    graph, history, readOnly, activeEdgeParamDefs,
    orderedSelectionRef, rfSelectionRef, dragVectorRef,
    lockedRegionIds, setFitViewTrigger,
  });

  // Keep refs fresh so stable keyboard handler always sees current values
  const bookmarksRef = useRef(bookmarks);
  bookmarksRef.current = bookmarks;
  const saveBookmarksRef = useRef(saveBookmarks);
  saveBookmarksRef.current = saveBookmarks;

  keyStateRef.current.selectedNodeId = selectedNodeId;
  keyStateRef.current.selectedEdgeId = selectedEdgeId;
  keyStateRef.current.selectedRegionId = selectedRegionId;
  keyStateRef.current.nodes = graph.nodes;
  keyStateRef.current.edges = graph.edges;
  keyStateRef.current.regions = graph.regions;
  keyStateRef.current.openCreatePicker = openCreatePickerCenter;
  keyStateRef.current.handleDeleteMultiple = handleDeleteMultiple;
  keyStateRef.current.handleDeleteRegion = handleDeleteRegion;
  keyStateRef.current.handlePaste = handlePaste;
  keyStateRef.current.pinnedNodeIds = pinnedNodeIds;
  keyStateRef.current.pinnedExpandIds = pinnedExpandIds;
  keyStateRef.current.toggleExpand = handleToggleExpand;
  keyStateRef.current.lockedRegionIds = lockedRegionIds;
  keyStateRef.current.minimizedRegionIds = minimizedRegionIds;
  keyStateRef.current.triggerSave = triggerSave;
  keyStateRef.current.openSaveAs = openSaveDialog;
  keyStateRef.current.openNewTab = () => setNewTabDialogOpen(true);
  // Ctrl/Cmd+W closes the active tab — same rule as the tab bar's close button:
  // a clean tab closes immediately (deleting its DB if never saved), a dirty tab
  // routes through the save/discard prompt. No-op on the last tab so the shortcut
  // can't drop the user to an empty Start screen (the tab bar's X still can).
  keyStateRef.current.closeActiveTab = () => {
    if (tabsCtx.tabs.length <= 1) return;
    const tab = tabsCtx.activeTab;
    if (!tab) return;
    if (!tab.dirty) tabsCtx.closeTab(tab.id, !tab.savePath);
    else tabsCtx.requestCloseTab(tab.id);
  };
  keyStateRef.current.openProject = handleOpenProject;
  keyStateRef.current.undo = history.undo;
  keyStateRef.current.redo = history.redo;
  keyStateRef.current.cycleRoutingMode = () => {
    const modes: ('bezier' | 'waypoints' | 'orthogonal')[] = ['bezier', 'waypoints', 'orthogonal'];
    const idx = modes.indexOf(edgeRoutingMode);
    setEdgeRoutingMode(modes[(idx + 1) % modes.length]);
  };
  keyStateRef.current.openQuickFind = () => setQuickFindOpen(true);
  keyStateRef.current.autoWire = handleAutoWire;
  keyStateRef.current.readOnly = readOnly;

  // Register the global keyboard shortcuts now that keyStateRef + the bookmark
  // refs are populated. Every dep is stable (refs / useState setters / hoisted
  // callbacks), so the listener mounts once. See hooks/useKeyboardShortcuts.
  useKeyboardShortcuts({
    keyStateRef, rfSelectionRef, orderedSelectionRef, clipboardRef,
    viewportRef, bookmarksRef, saveBookmarksRef,
    setPanel, setSelectedNodeId, setSelectedEdgeId, setSelectedRegionId,
    setSearchFocusTrigger, setSelectAllTrigger, setSelectRegionTrigger,
    setZoomToSelectionTrigger, setFocusMode, setQuickConnectSourceId,
    clearTrace, buildClipboardPayload,
  });

  // Graph exporters (PNG / CSV / Mermaid / DOT) — read-only serialization to a
  // file or the clipboard. See hooks/useGraphExport.
  const { handleExportCsv, handleExportPng, handleExportMermaid, handleExportDot } = useGraphExport({
    nodes: graph.nodes,
    edges: graph.edges,
    activeParamDefs,
    projectName: tabsCtx.activeTab?.name,
    setSaveToast,
  });

  function handleHighlight(nodeIds: string[]) {
    setHighlightedNodeIds(nodeIds.length > 0 ? new Set(nodeIds) : new Set());
  }

  function handleFindRelated(nodeId: string) {
    const neighbors = new Set<string>([nodeId]);
    graph.edges.forEach(e => {
      if (e.sourceId === nodeId) neighbors.add(e.targetId);
      if (e.targetId === nodeId) neighbors.add(e.sourceId);
    });
    handleHighlight([...neighbors]);
  }

  function handleTogglePin(nodeId: string) {
    const pinned = !pinnedNodeIds.has(nodeId);
    setPinnedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
    gapi.setNodePinned(nodeId, pinned).catch(() => {});
    markDirty();
  }

  function handleTogglePinnedExpand(nodeId: string) {
    const pinned = !pinnedExpandIds.has(nodeId);
    setPinnedExpandIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
    gapi.setNodeExpandPinned(nodeId, pinned).catch(() => {});
    markDirty();
  }

  // Expand/Collapse shortcut (E). No selection: flip the global "Expand nodes by
  // default" preference (expand all / collapse all) and drop per-node overrides.
  // With a selection: toggle ONLY the selected nodes via ephemeral overrides that
  // win over the global default in NodeCard (any collapsed → expand all, else
  // collapse all). View-only state, so it isn't persisted or marked dirty.
  function handleToggleExpand() {
    const rfSel = rfSelectionRef.current;
    const ids = rfSel.nodeIds.length ? rfSel.nodeIds : (selectedNodeId ? [selectedNodeId] : []);
    if (!ids.length) {
      setExpandNodesByDefault(!expandNodesByDefault);
      setExpandOverrides(new Map());
      return;
    }
    const isExpanded = (id: string) => {
      const o = expandOverrides.get(id);
      return o !== undefined ? o : (pinnedExpandIds.has(id) || expandNodesByDefault);
    };
    const target = ids.some(id => !isExpanded(id));
    setExpandOverrides(prev => {
      const next = new Map(prev);
      ids.forEach(id => next.set(id, target));
      return next;
    });
  }

  function buildMenus(): MenuGroup[] {
    const hasSelection = !!(
      rfSelectionRef.current.nodeIds.length ||
      rfSelectionRef.current.edgeIds.length ||
      selectedNodeId ||
      selectedEdgeId ||
      selectedRegionId
    );
    const hasNodeSelection = !!(rfSelectionRef.current.nodeIds.length || selectedNodeId);
    const hasClipboard = !!(clipboardRef.current?.nodes.length || clipboardRef.current?.regions.length);

    return [
      {
        label: 'File',
        items: [
          { label: 'New Project', shortcut: 'Ctrl+N', action: () => setNewTabDialogOpen(true) },
          { label: 'Close Tab', shortcut: 'Ctrl+W', action: () => keyStateRef.current.closeActiveTab?.(), disabled: tabsCtx.tabs.length <= 1 },
          { sep: true },
          { label: currentSavePath ? 'Save' : 'Save…', shortcut: 'Ctrl+S', action: triggerSave },
          { label: 'Save As…', shortcut: 'Ctrl+Shift+S', action: openSaveDialog },
          { label: 'Open Project…', shortcut: 'Ctrl+O', action: handleOpenProject },
          { sep: true },
          { label: 'Export as PNG…', action: handleExportPng },
          { label: 'Export as CSV…', action: handleExportCsv, disabled: !graph.nodes.length },
          { label: 'Copy as Mermaid', action: handleExportMermaid, disabled: !graph.nodes.length },
          { label: 'Copy as DOT (Graphviz)', action: handleExportDot, disabled: !graph.nodes.length },
        ],
      },
      {
        label: 'Graph Objects',
        items: [
          { label: 'Add Node', shortcut: 'N', action: openCreateNode, icon: <Plus size={13} /> },
          { sep: true },
          { label: 'Add Note', action: () => handleCreateItemAtCenter('note'), icon: <StickyNote size={13} /> },
          { label: 'Add Image', action: () => handleCreateItemAtCenter('image'), icon: <ImageIcon size={13} /> },
          { label: 'Add Video', action: () => handleCreateItemAtCenter('video'), icon: <Film size={13} /> },
          { label: 'Add Audio', action: () => handleCreateItemAtCenter('audio'), icon: <Music2 size={13} /> },
          { label: 'Add File', action: () => handleCreateItemAtCenter('file'), icon: <FileIcon size={13} /> },
          { sep: true },
          { label: 'Add Region', action: openCreateRegion, icon: <Square size={13} /> },
          { label: 'Wrap Selection in Region', action: hasNodeSelection ? handleWrapSelectionInRegion : undefined, disabled: !hasNodeSelection },
        ],
      },
      {
        label: 'Edit',
        items: [
          { label: 'Copy', shortcut: 'Ctrl+C', action: hasSelection ? () => {
            const payload = buildClipboardPayload();
            if (payload) clipboardRef.current = payload;
          } : undefined, disabled: !hasSelection },
          { label: 'Paste', shortcut: 'Ctrl+V', action: hasClipboard ? () => {
            const clip = clipboardRef.current;
            if (clip && (clip.nodes.length || clip.regions.length)) keyStateRef.current.handlePaste?.(clip);
          } : undefined, disabled: !hasClipboard },
          { label: 'Duplicate', shortcut: 'Ctrl+D', action: hasSelection ? () => {
            const payload = buildClipboardPayload();
            if (payload) keyStateRef.current.handlePaste?.(payload);
          } : undefined, disabled: !hasSelection },
          { sep: true },
          { label: 'Auto Layout ↕', action: () => handleAutoLayout('TB'), disabled: !graph.nodes.length },
          { label: 'Auto Layout ↔', action: () => handleAutoLayout('LR'), disabled: !graph.nodes.length },
          { label: 'Zoom to Selection', shortcut: 'Ctrl+Shift+F', action: hasSelection ? () => setZoomToSelectionTrigger(t => t + 1) : undefined, disabled: !hasSelection },
          { sep: true },
          { label: 'Delete Selected', shortcut: 'Del', action: hasSelection ? () => {
            const { selectedNodeId, selectedEdgeId, selectedRegionId, nodes, edges, regions, handleDeleteMultiple, handleDeleteRegion } = keyStateRef.current;
            const rfSel = rfSelectionRef.current;
            const allIds = rfSel.nodeIds.length ? rfSel.nodeIds : [
              ...(selectedNodeId ? [selectedNodeId] : []),
              ...(selectedRegionId ? [selectedRegionId] : []),
            ];
            const explicitEdgeIds = rfSel.edgeIds.length ? rfSel.edgeIds : selectedEdgeId ? [selectedEdgeId] : [];
            const { nodeIds: nIds, regionIds: rIds } = partitionIds({ nodes, edges, regions }, allIds);
            if (nIds.length || explicitEdgeIds.length) handleDeleteMultiple?.(nIds, explicitEdgeIds);
            for (const id of rIds) handleDeleteRegion?.(id);
          } : undefined, disabled: !hasSelection },
        ],
      },
      {
        label: 'Share',
        items: IS_DEMO
          ? [
              // Live Share is a desktop-app feature — greyed out in the web demo.
              { label: 'Host Session… (desktop app)', action: undefined, disabled: true },
              { label: 'Join Session… (desktop app)', action: undefined, disabled: true },
            ]
          : session
          ? [
              { label: session.role === 'host' ? 'Stop Hosting' : 'Leave Session', action: () => { endSession(); } },
            ]
          : [
              { label: 'Host Session…', action: () => setHostPromptOpen(true) },
              { label: 'Join Session…', action: () => setJoinDialogOpen(true) },
            ],
      },
      {
        label: 'Preferences',
        items: [
          { label: 'Graph Settings…', action: () => { setGraphSettingsTab('presets'); setGraphSettingsOpen(true); } },
          { label: 'Keyboard Shortcuts…', action: () => { setGraphSettingsTab('shortcuts'); setGraphSettingsOpen(true); } },
          { sep: true },
          { label: 'About GloGraph', action: () => setAboutOpen(true) },
        ],
      },
    ];
  }

  // (Live Share guests now render this same editor — `useGraph`/settings are routed
  // to the remote host — instead of a separate spectate view.)

  if (graph.loading) {
    return (
      <div className="app-loading">
        <span>Loading GloGraph…</span>
      </div>
    );
  }

  if (graph.loadError) {
    return (
      <div className="app-loading app-loading--error">
        <span>Failed to load graph data: {graph.loadError}</span>
      </div>
    );
  }

  return (
    <PresenceProvider enabled={inSession && !!presenceWs} wsUrl={presenceWs} name={session?.name ?? 'User'} selection={presenceSelection}>
    <div className={`app${focusMode ? ' app--focus' : ''}`}>
      <Sidebar
        nodes={graph.nodes}
        edges={graph.edges}
        regions={graph.regions}
        selectedNodeId={selectedNodeId}
        selectedRegionId={selectedRegionId}
        onSelectNode={handleSidebarSelect}
        onSelectRegion={handleSidebarSelectRegion}
        onHighlight={handleHighlight}
        onScrollToNode={handleSidebarSelect}
        searchFocusTrigger={searchFocusTrigger}
        graphNotes={graphNotes}
        onNotesChange={handleNotesChange}
      />

      <div className="app__main">
        <MenuBar
          menus={buildMenus()}
          quickActions={
            <button className="btn btn--ghost btn--sm" onClick={() => setTimelineOpen(o => !o)} title="Toggle timeline">
              <Clock size={13} /> Timeline
            </button>
          }
          stat={[
            `${graph.nodes.length} nodes`,
            `${graph.regions.length} regions`,
            `${graph.edges.length} edges`,
            ...(history.undoCount > 0 ? [`↩ ${history.undoCount}`] : []),
          ].join(' · ')}
        />
        {!isGuest && <TabBar onNewTab={() => setNewTabDialogOpen(true)} />}
        <BookmarkBar
          bookmarks={bookmarks}
          onRestore={handleRestoreBookmark}
          onSave={handleSaveBookmark}
          onDelete={handleDeleteBookmark}
        />

        <div className="canvas-region">
        <GraphCanvas
          nodes={graph.nodes}
          edges={graph.edges}
          regions={graph.regions}
          minimizedRegionIds={minimizedRegionIds}
          lockedRegionIds={lockedRegionIds}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          selectedRegionId={selectedRegionId}
          onNodeSelect={handleNodeSelect}
          onEdgeSelect={handleEdgeSelect}
          onRegionSelect={handleRegionSelect}
          onConnect={handleConnect}
          onEdgeReconnect={handleEdgeReconnect}
          onEdgeDelete={handleDeleteEdge}
          onEdgeWaypointsChange={handleEdgeWaypointsChange}
          onEdgeLabelChange={handleEdgeLabelChange}
          onNodeMove={handleNodeMove}
          onNodeDoubleClick={handleNodeDoubleClick}
          onRegionMinimize={handleRegionMinimize}
          onRegionLock={handleRegionLock}
          onRegionMove={handleRegionMove}
          onRegionResize={handleRegionResize}
          onPaneClick={handlePaneClick}
          readOnly={readOnly}
          onPaneDoubleClick={handleContextMenuCreate}
          onViewportChange={setCurrentZoom}
          onFindRelated={handleFindRelated}
          onTrace={handleTrace}
          traceNodeIds={traceNodeIds}
          traceEdgeIds={traceEdgeIds}
          traceSeedId={traceSeedId}
          onNodeBringToFront={handleNodeBringToFront}
          onNodeSendToBack={handleNodeSendToBack}
          onNodeDuplicate={readOnly ? undefined : handleContextDuplicateNode}
          onNodeDelete={readOnly ? undefined : handleContextDeleteNode}
          onContextMenuCreateRegion={handleContextMenuCreateRegion}
          onOpenCreatePicker={(screen, flow, regionId) => { if (!readOnly) setCreatePicker({ screen, flow, regionId }); }}
          onSelectionChange={handleSelectionChange}
          onMultiSelectionOrderChange={ids => { orderedSelectionRef.current = ids; setCtrlSelectionSize(ids.length); }}
          onSelectionDragVector={(dx, dy) => { dragVectorRef.current = { dx, dy }; }}
          scrollToPos={scrollToPos}
          onScrolled={() => setScrollToPos(null)}
          fitViewTrigger={fitViewTrigger}
          selectAllTrigger={selectAllTrigger}
          zoomToSelectionTrigger={zoomToSelectionTrigger}
          viewportRef={viewportRef}
          screenToFlowRef={screenToFlowRef}
          targetViewport={targetViewport}
          onTargetViewportConsumed={clearTargetViewport}
          highlightedNodeIds={highlightedNodeIds}
          flashingNodeId={flashingNodeId}
          onRegionEdit={regionId => {
            const region = graph.regions.find(r => r.id === regionId);
            if (region) handleRegionSelect(region);
          }}
          onRegionDelete={handleDeleteRegion}
          onRegionDuplicate={readOnly ? undefined : handleContextDuplicateRegion}
          onRegionBringToFront={handleRegionBringToFront}
          onRegionSendToBack={handleRegionSendToBack}
          selectRegionTrigger={selectRegionTrigger}
          pinnedNodeIds={pinnedNodeIds}
          pinnedExpandIds={pinnedExpandIds}
          expandOverrides={expandOverrides}
          onTogglePinnedExpand={handleTogglePinnedExpand}
          onTogglePin={handleTogglePin}
          onNoteChange={handleInlineNoteChange}
          onToggleRenderMarkdown={handleToggleRenderMarkdown}
          onToggleShowThumbnail={handleToggleShowThumbnail}
          onNodeResize={handleNodeResize}
          inSession={inSession}
        />
        {trace && (() => {
          const seedNode = graph.nodes.find(n => n.id === trace.seedId);
          if (!seedNode) return null; // seed just deleted; cleanup effect will clear
          return (
            <TraceControl
              seedLabel={nodeDisplayLabel(seedNode)}
              direction={trace.direction}
              reachedCount={trace.reachedCount}
              maxHop={trace.maxHop}
              onSetDirection={setTraceDirection}
              onExit={clearTrace}
            />
          );
        })()}
        {dropActive && (
          <div className="canvas-drop-overlay">
            <div className="canvas-drop-overlay__label">Drop image, video, or audio to add</div>
          </div>
        )}
        </div>
        {session && (
          <div className="host-banner" role="status">
            <span className="host-banner__dot" aria-hidden />
            <span className="host-banner__text">
              {session.role === 'host'
                ? <>Hosting as <strong>{session.name}</strong>{session.token ? <> · code <code className="host-banner__code">{session.token}</code></> : null}</>
                : <>Joined <strong>{session.address}</strong> as <strong>{session.name}</strong></>}
            </span>
            {session.access && (
              <span className={`host-banner__access host-banner__access--${session.access === 'editor' ? 'editor' : 'view'}`}>
                {session.role === 'host'
                  ? (session.access === 'editor' ? 'Guests: Editor' : 'Guests: View only')
                  : (session.access === 'editor' ? 'Editing' : 'View only')}
              </span>
            )}
            <PresenceBadges meLabel={session.name} onJumpTo={(x, y) => setScrollToPos({ x, y })} />
            <button className="host-banner__stop" onClick={() => { endSession(); }}>
              {session.role === 'host' ? 'Stop' : 'Leave'}
            </button>
          </div>
        )}
        {inSession && <PresenceToasts />}
        <StatusBar
          nodeCount={graph.nodes.length}
          edgeCount={graph.edges.length}
          regionCount={graph.regions.length}
          savePath={currentSavePath}
          undoCount={history.undoCount}
          zoom={currentZoom}
        />
        {timelineOpen && (
          <TimelinePanel
            nodes={graph.nodes}
            onNodeClick={handleSidebarSelect}
          />
        )}
      </div>

      {(panel.kind === 'createNode' || panel.kind === 'editNode') && (
        <NodePanel
          node={panel.kind === 'editNode' ? panel.node : undefined}
          defaultPosition={panel.kind === 'createNode' ? panel.pos : undefined}
          onClose={() => setPanel({ kind: 'none' })}
          onSave={handleSaveNode}
          onDelete={handleDeleteNode}
          onAddLink={handleAddLink}
          onRemoveLink={handleRemoveLink}
          onAddMedia={handleAddMedia}
          onUpdateMedia={readOnly ? undefined : graph.updateMedia}
          onUpdateMediaShowOnCard={readOnly ? undefined : graph.updateMediaShowOnCard}
          onReorderMedia={handleReorderMedia}
          onRemoveMedia={handleRemoveMedia}
          edges={graph.edges}
          allNodes={graph.nodes}
          onNavigateToNode={handleSidebarSelect}
          isPinned={panel.kind === 'editNode' ? pinnedNodeIds.has(panel.node.id) : undefined}
          onTogglePin={panel.kind === 'editNode' ? () => handleTogglePin(panel.node.id) : undefined}
          readOnly={readOnly}
        />
      )}

      {panel.kind === 'editEdge' && (
        <EdgePanel
          edge={panel.edge}
          nodes={graph.nodes}
          onClose={() => setPanel({ kind: 'none' })}
          onSave={handleSaveEdge}
          onDelete={handleDeleteEdge}
          onFlipEdge={handleFlipEdge}
          onSelectNode={handleSidebarSelect}
          readOnly={readOnly}
        />
      )}

      {(panel.kind === 'createRegion' || panel.kind === 'editRegion') && (
        <RegionPanel
          region={panel.kind === 'editRegion' ? panel.region : undefined}
          nodes={graph.nodes}
          defaultPosition={panel.kind === 'createRegion' ? panel.pos : undefined}
          onClose={() => setPanel({ kind: 'none' })}
          onSave={handleSaveRegion}
          onDelete={handleDeleteRegion}
          onAutoFit={handleRegionAutoFit}
          readOnly={readOnly}
        />
      )}

      {(rfSelectionSize > 1 || ctrlSelectionSize > 1) && panel.kind === 'none' && (
        <BulkEditPanel
          nodeIds={orderedSelectionRef.current.length > 1 ? orderedSelectionRef.current : rfSelectionRef.current.nodeIds}
          onSaveAll={async (paramDefId, value) => {
            const bulkIds = orderedSelectionRef.current.length > 1 ? orderedSelectionRef.current : rfSelectionRef.current.nodeIds;
            const nodes = graph.nodes.filter(n => bulkIds.includes(n.id));
            await Promise.all(nodes.map(n => {
              const input: UpdateNodeInput = {
                id: n.id,
                title: n.title,
                description: n.description,
                eventDate: n.eventDate,
                x: n.x, y: n.y,
                color: n.color,
                confidence: n.confidence,
                impactMagnitude: n.impactMagnitude,
                paramValues: n.paramValues.map(pv => ({
                  paramDefId: pv.paramDefId,
                  value: pv.paramDefId === paramDefId ? value : (pv.value ?? null),
                  isEnabled: pv.isEnabled,
                  showOnCard: pv.showOnCard,
                })),
              };
              return graph.updateNode(input);
            }));
          }}
          onAutoWire={handleAutoWire}
        />
      )}

      {quickConnectSourceId && (() => {
        const source = graph.nodes.find(n => n.id === quickConnectSourceId);
        return source ? (
          <QuickConnectDialog
            sourceTitle={source.title}
            onConfirm={handleQuickConnect}
            onCancel={() => setQuickConnectSourceId(null)}
          />
        ) : null;
      })()}

      {quickFindOpen && (
        <QuickFindDialog
          nodes={graph.nodes}
          onSelect={handleSidebarSelect}
          onClose={() => setQuickFindOpen(false)}
        />
      )}

      {createPicker && (
        <CreateTypePicker
          pos={createPicker.screen}
          onPick={handlePickCreateType}
          onClose={() => setCreatePicker(null)}
        />
      )}

      <TextFieldContextMenu />

      {graphSettingsOpen && (
        <GraphSettingsModal nodeCount={graph.nodes.length} initialTab={graphSettingsTab} onClose={() => setGraphSettingsOpen(false)} />
      )}

      {hostPromptOpen && (
        <HostSessionDialog
          // The dialog starts the session itself (so it can show the shareable
          // address WITH the TLS fingerprint), then hands back name/token/role +
          // fingerprint. We also stand up the host's OWN loopback TLS bridge (to
          // 127.0.0.1:57400, pinning its own cert) so the host's presence socket
          // can reach its now-WSS relay — without it, cursors + the "N here" count
          // don't work for anyone.
          onConfirm={async info => {
            setHostPromptOpen(false);
            let localBase: string | undefined;
            try { localBase = await api.startGuestBridge('127.0.0.1:57400', info.fingerprint); }
            catch { /* presence degrades to off; hosting still works */ }
            setSession({ role: 'host', name: info.name, token: info.token, access: info.role, fingerprint: info.fingerprint, localBase });
          }}
          onCancel={() => setHostPromptOpen(false)}
        />
      )}

      {joinDialogOpen && (
        <JoinSessionDialog
          onConfirm={async info => {
            setJoinDialogOpen(false);
            // The shared address carries the host's cert fingerprint as
            // "ip:port#fingerprint". Split it, then stand up the loopback TLS
            // bridge (pins the cert) before the editor talks to the host.
            const hashIdx = info.address.indexOf('#');
            const host = (hashIdx >= 0 ? info.address.slice(0, hashIdx) : info.address).trim();
            const fp = hashIdx >= 0 ? info.address.slice(hashIdx + 1).trim() : '';
            try {
              const localBase = await api.startGuestBridge(host, fp);
              // Discover our access level (view-only vs editor) from the host.
              let access: 'read-only' | 'editor' = 'read-only';
              try {
                const r = await fetch(`${localBase}/api/session?token=${encodeURIComponent(info.token)}`);
                if (r.ok) { const j = await r.json(); if (j.role === 'editor') access = 'editor'; }
              } catch { /* default to the safe read-only */ }
              setSession({ role: 'guest', name: info.name, address: host, token: info.token, fingerprint: fp, localBase, access });
            } catch (err) {
              setSaveToast({ msg: `Couldn't connect securely: ${err}`, ok: false });
              setTimeout(() => setSaveToast(null), 4000);
            }
          }}
          onCancel={() => setJoinDialogOpen(false)}
        />
      )}

      {aboutOpen && (
        <Modal title="About GloGraph" size="sm" onClose={() => setAboutOpen(false)}>
          <div className="modal-body about-body">
            <GlographMark size={40} className="about-body__mark" />
            <span className="about-body__name">GloGraph</span>
            <span className="about-body__version">
              Version {buildInfo?.version ?? APP_VERSION}
              {buildInfo?.buildDate ? ` · Built ${buildInfo.buildDate}` : ''}
            </span>
            <p className="about-body__tagline">
              A local-first, scriptable workspace for building typed relational and causal
              graphs — map how events, concepts, and systems connect.
            </p>
          </div>
        </Modal>
      )}

      {newTabDialogOpen && (
        <NewProjectDialog
          onConfirm={async (name, presetId) => {
            setNewTabDialogOpen(false);
            try {
              await tabsCtx.createTab(name, presetId);
            } catch (err) {
              setSaveToast({ msg: `Failed to create project: ${err}`, ok: false });
              setTimeout(() => setSaveToast(null), 4000);
            }
          }}
          onCancel={() => setNewTabDialogOpen(false)}
        />
      )}

      {saveToast && (
        <div className={`save-toast${saveToast.ok ? '' : ' save-toast--error'}`}>
          {saveToast.msg}
        </div>
      )}

    </div>
    </PresenceProvider>
  );
}

function AppWithTabs() {
  const { activeTab, tabs, loading, createTab, closeRequestId, clearCloseRequest, closeTab, switchTab, setTabSavePath, markTabClean } = useTabs();
  const [newTabDialogOpen, setNewTabDialogOpen] = useState(false);
  const [closeBusy, setCloseBusy] = useState(false);
  const closingTab = tabs.find(t => t.id === closeRequestId) ?? null;

  // App-quit flow: prompt to save each unsaved project before the window closes.
  // See hooks/useAppQuitFlow.
  const {
    quitTab, quitQueue, quitIndex, quitBusy,
    handleQuitSave, handleQuitDiscard, handleQuitCancel,
  } = useAppQuitFlow({ tabs, switchTab, setTabSavePath, markTabClean });

  // Save the tab being closed, then close it. The close was routed through the
  // target tab (TabBar switches to it first), so it is the active tab and
  // save_graph_to_path targets the right project DB. A never-saved tab goes
  // through Save As; cancelling that dialog leaves the close prompt open.
  async function handleSaveAndClose() {
    if (!closingTab || closeBusy) return;
    setCloseBusy(true);
    try {
      let dest = closingTab.savePath ?? null;
      if (!dest) {
        const baseName = (closingTab.name || 'My Graph').replace(/[\\/:*?"<>|]/g, '_').trim() || 'My Graph';
        const chosen = await nativeSaveDialog({
          title: 'Save Graph',
          defaultPath: `${baseName}.glograph`,
          filters: [{ name: 'GloGraph', extensions: ['glograph'] }],
        });
        if (!chosen) return;
        dest = chosen.endsWith('.glograph') ? chosen : `${chosen}.glograph`;
      }
      await api.saveGraphToPath(dest);
      await api.recordRecentProject(closingTab.name, dest);
      await setTabSavePath(closingTab.id, dest);
      await markTabClean(closingTab.id);
      clearCloseRequest();
      await closeTab(closingTab.id, false);
    } catch (err) {
      console.error('Save before close failed:', err);
    } finally {
      setCloseBusy(false);
    }
  }

  async function handleDiscardAndClose() {
    if (!closingTab || closeBusy) return;
    const deleteDb = !closingTab.savePath; // never-saved → delete the orphaned DB
    clearCloseRequest();
    await closeTab(closingTab.id, deleteDb);
  }

  async function handleOpenProject() {
    const chosen = await nativeOpenDialog({
      multiple: false,
      directory: false,
      filters: [{ name: 'GloGraph', extensions: ['glograph'] }],
    });
    if (typeof chosen !== 'string') return;
    try {
      await api.openPathAsTab(chosen);
    } catch (err) {
      console.error('Open project failed:', err);
    }
  }

  // ── Live Share guest: render the SAME base editor against the remote host ──
  const { session } = useSession();
  const guest = guestEndpoints(session);
  const [guestSettings, setGuestSettings] = useState<GraphSettings | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  useEffect(() => {
    if (!guest) { setGuestSettings(null); setGuestError(null); return; }
    let cancelled = false;
    fetch(`${guest.base}/api/graph`, { headers: { Authorization: `Bearer ${guest.token}` } })
      .then(r => {
        if (!r.ok) {
          // Translate the bare status into something a joiner can act on. 401 is by
          // far the most common: the join token doesn't match the host's.
          const msg = r.status === 401
            ? 'Join token rejected — double-check the code from the host (it’s case-sensitive, and a fresh one is generated if they re-open the Host dialog).'
            : r.status === 403
              ? 'The host blocked the connection.'
              : `Couldn’t load the session (HTTP ${r.status}).`;
          throw new Error(msg);
        }
        return r.json();
      })
      .then(g => { if (!cancelled) { setGuestSettings(g.settings); setGuestError(null); } })
      .catch(e => { if (!cancelled) setGuestError(String(e)); });
    return () => { cancelled = true; };
  }, [guest?.base, guest?.token]);

  // Seed SettingsProvider with the HOST's settings (so colours/param-defs are the
  // host's, not this machine's) and run the real AppInner remotely. The key forces
  // a clean remount on join/leave so useGraph re-inits with the right data source.
  if (guest) {
    if (!guestSettings) {
      return <div className="app-loading"><span>Connecting to {session!.address}…{guestError ? ` — ${guestError}` : ''}</span></div>;
    }
    return (
      <SettingsProvider key={`guest:${guest.base}`} seed={guestSettings}>
        <AppInner />
      </SettingsProvider>
    );
  }

  if (loading) {
    return <div className="app-loading"><span>Loading GloGraph…</span></div>;
  }

  if (activeTab === null) {
    return (
      <>
        <StartScreen
          onNewProject={() => setNewTabDialogOpen(true)}
          onImport={handleOpenProject}
        />
        {newTabDialogOpen && (
          <NewProjectDialog
            onConfirm={async (name, presetId) => {
              setNewTabDialogOpen(false);
              await createTab(name, presetId);
            }}
            onCancel={() => setNewTabDialogOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SettingsProvider key={activeTab.id}>
        <AppInner />
      </SettingsProvider>
      {closingTab && !quitTab && (
        <CloseTabDialog
          tab={closingTab}
          busy={closeBusy}
          onSave={handleSaveAndClose}
          onDiscard={handleDiscardAndClose}
          onCancel={() => { if (!closeBusy) clearCloseRequest(); }}
        />
      )}
      {quitTab && quitQueue && (
        <CloseTabDialog
          tab={quitTab}
          quitting
          progress={{ index: quitIndex, total: quitQueue.length }}
          busy={quitBusy}
          onSave={handleQuitSave}
          onDiscard={handleQuitDiscard}
          onCancel={handleQuitCancel}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <TabsProvider>
      <SessionProvider>
        <AppWithTabs />
      </SessionProvider>
    </TabsProvider>
  );
}
