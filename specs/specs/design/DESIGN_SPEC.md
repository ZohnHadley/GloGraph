# GloGraph — Design Specification

## Purpose

GloGraph is a desktop application for building visual, typed relational/causal graphs. It is
**general-purpose**: a "node" can be any entity (event, person, concept, task, system component) and
an edge any classified relationship between them. The built-in presets (Macro Economics, System
Behavior, Knowledge Map, Project Tracker) are **example starter templates, not the foundation** — the
schema bends to the user's domain via the preset system. (Macro analysis was the original inspiration
and remains one example preset; the macro-first framing is retired — keep copy preset-neutral.)

---

## Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Sidebar (220px)  │  Toolbar                         │  Detail Panel       │
│                  ├──────────────────────────────────┤  (300px, contextual)│
│ Brand            │  Canvas (React Flow)              │                     │
│ Search           │                                   │  NodePanel or       │
│ Category filters │  • Nodes (draggable cards)        │  EdgePanel          │
│ Node list        │  • Edges (typed, weighted arrows) │                     │
│ Count            │  • MiniMap  • Controls            │                     │
└──────────────────┴───────────────────────────────────┴─────────────────────┘
```

- **Sidebar**: fixed 220 px, always visible. Search + category filter chips + scrollable node list.
- **Canvas**: fills remaining width. React Flow with force-friendly manual drag layout.
- **Detail Panel**: slides in from the right (300 px) when a node or edge is selected. Hidden when nothing is selected.
- **Toolbar**: thin header bar above the canvas. Primary action buttons + graph stats.

---

## Visual Design System

> **Stale token table removed.** This section used to duplicate the colour/typography/spacing rules
> using the *pre-amber* blue palette (`#0d1117` background, `#58a6ff` accent), which no longer matches
> the app. The canonical visual reference is **[AESTHETIC_SPEC.md](AESTHETIC_SPEC.md)** — warm-neutral
> charcoal surfaces, amber `#ffb000` accent, 4-value bevel borders, `0–2px` radius, and a dense 4px
> grid. Built-in **category colours** (the Macro Economics preset) are documented in
> **[NODE_SPEC.md](../architecture/NODE_SPEC.md)**.

---

## Component Inventory

| Component          | File                                   | Role                                            |
|--------------------|----------------------------------------|-------------------------------------------------|
| `App`              | `../../GloGraphDesktopApplication/src/App.tsx`                          | Root wrapper (`SettingsProvider` + `AppInner`)  |
| `AppInner`         | `../../GloGraphDesktopApplication/src/App.tsx`                          | Owns panel/selection state and orchestrates. Cross-cutting concerns are composed in via custom hooks (impact trace, keyboard shortcuts, clipboard, quit flow, and the node/edge/region/arrange action-hooks — listed below). |
| `Sidebar`          | `../../GloGraphDesktopApplication/src/components/Sidebar.tsx`           | Node list, search, category filter chips        |
| `MenuBar`          | `../../GloGraphDesktopApplication/src/components/MenuBar.tsx`           | Dropdown menu bar (File, Edit, Preferences)     |
| `Modal`            | `../../GloGraphDesktopApplication/src/components/Modal.tsx`             | Shared base for every dialog-class modal — owns `.modal-backdrop`/`.modal-panel`/`.modal-header` and the base behaviors (Escape closes, backdrop-click closes). Used by GraphSettings, NewProject, About, CloseTab. |
| `CloseTabDialog`   | `../../GloGraphDesktopApplication/src/components/CloseTabDialog.tsx`    | Unsaved-changes prompt on tab close (Save / Don't Save / Cancel), on `Modal` |
| `CreateTypePicker` | `../../GloGraphDesktopApplication/src/components/CreateTypePicker.tsx`  | Keyboard-driven "what kind of graph object?" menu (Node/Note/Image/Video/Audio; Node default). Opened by `N` and the canvas/region "Add node here…" items. |
| `TextFieldContextMenu` | `../../GloGraphDesktopApplication/src/components/TextFieldContextMenu.tsx` | App-wide Copy/Cut/Paste/Select All for editable text fields (inline note editor + panel inputs), via one capture-phase `contextmenu` listener; `execCommand` keeps controlled inputs in sync, paste reads `navigator.clipboard`. |
| `GraphCanvas`      | `../../GloGraphDesktopApplication/src/components/GraphCanvas.tsx`       | React Flow wrapper. Emits events upward. Hosts the Live Share presence sublayers — `PresenceLayer` (remote cursors + drag-select marquees) and `MinimapCursors` (peers on the minimap), both gated by `inSession` and reading PresenceContext. |
| `NodeCard`         | `../../GloGraphDesktopApplication/src/components/NodeCard.tsx`          | Custom RF node renderer                         |
| `EdgeLine`         | `../../GloGraphDesktopApplication/src/components/EdgeLine.tsx`          | Custom RF edge renderer                         |
| `NodePanel`        | `../../GloGraphDesktopApplication/src/components/NodePanel.tsx`         | Create/edit node form (right panel)             |
| `EdgePanel`        | `../../GloGraphDesktopApplication/src/components/EdgePanel.tsx`         | Edit edge form (right panel)                    |
| `GraphSettingsModal` | `../../GloGraphDesktopApplication/src/components/GraphSettings.tsx`   | Settings modal on the shared `<Modal>`. Tabs: Presets, Node Fields, Edge Fields, Display, API, Shortcuts. Accepts `initialTab` (Preferences → Keyboard Shortcuts opens the Shortcuts tab). |
| `SettingsProvider` | `../../GloGraphDesktopApplication/src/context/SettingsContext.tsx`      | React context. Fetches and exposes active preset data globally. |
| `PresenceProvider` | `../../GloGraphDesktopApplication/src/context/PresenceContext.tsx`      | Live Share presence isolation: wraps AppInner and splits a frequently-changing **peers** context (cursors/marquees/badges/toasts) from a memoised **api** context (`remoteSelections` + `sendCursor`), so remote cursor moves (~22/s) re-render only the cursor layer — not AppInner/GraphCanvas. Exposes `usePresencePeers()` / `usePresenceApi()`. |
| `PresenceBadges`   | `../../GloGraphDesktopApplication/src/components/PresenceBadges.tsx`    | "Who's here" in the host banner: a **name chip** per participant (colour dot + name); each peer chip is a button outlined in their colour → click to jump the viewport to their cursor. Reads peers from PresenceContext. |
| `PresenceToasts`   | `../../GloGraphDesktopApplication/src/components/PresenceToasts.tsx`    | Transient "X joined / left" awareness toasts derived from presence peer-set deltas (the initial set is seeded silently). |
| `useGraph`         | `../../GloGraphDesktopApplication/src/hooks/useGraph.ts`                | DB state + CRUD + `reload()` for full refresh. Exposes `mutationSeq` (bumped by mutation methods, not by load/`reload`) — App watches it to flip the tab dirty *instantly*, then a debounced backend content-fingerprint recheck (`recompute_active_tab_dirty`) clears it again if the content matches the saved/initial baseline (so undoing back to the saved state un-dirties the tab). See UX_SPEC §25.10. |
| `useHistory`       | `../../GloGraphDesktopApplication/src/hooks/useHistory.ts`              | Undo/redo command stack (`push`/`undo`/`redo`); peek-don't-pop so a failed undo keeps its entry. |
| `useImpactTrace`   | `../../GloGraphDesktopApplication/src/hooks/useImpactTrace.ts`          | Ephemeral impact-trace overlay: seed/direction/result + the `trace` fetch (stale-guarded) + seed-deletion cleanup; `handleTrace`/`clearTrace`. |
| `useKeyboardShortcuts` | `../../GloGraphDesktopApplication/src/hooks/useKeyboardShortcuts.ts` | The app-wide `keydown` handler (one document listener), reading latest state via a `keyStateRef` so it stays stable. Exports the `KeyboardShortcutState`/`ClipboardPayload` shapes. Its shortcut set mirrors UX_SPEC §14 and the GraphSettings `SHORTCUTS` list — keep the three in sync. |
| `useClipboard`     | `../../GloGraphDesktopApplication/src/hooks/useClipboard.ts`            | Copy/paste/duplicate: the clipboard ref + `buildClipboardPayload` (selection → portable payload) + `handlePaste` (recreate with new ids, copying links/media/size/region-state, one undo/redo entry per batch). Cross-cutting, hence a wide injected-deps contract. |
| `useAppQuitFlow`   | `../../GloGraphDesktopApplication/src/hooks/useAppQuitFlow.ts`          | Window-close save prompt: holds the close, prompts to save each unsaved project in turn, then `destroy()`s. |
| `useGraphExport`   | `../../GloGraphDesktopApplication/src/hooks/useGraphExport.ts`          | Read-only exporters: PNG / CSV (two sibling files) / Mermaid / DOT, to a file or the clipboard, with the free-tier attribution stamp. No mutation/history. |
| `useProjectFiles`  | `../../GloGraphDesktopApplication/src/hooks/useProjectFiles.ts`         | Save / Save As / Open (`triggerSave`/`openSaveDialog`/`handleOpenProject`) + active-tab metadata sync (save path, name, dirty, recents). |
| `useCanvasBookmarks` | `../../GloGraphDesktopApplication/src/hooks/useCanvasBookmarks.ts`    | Canvas bookmarks (saved viewports): persisted to `app_settings.canvas_bookmarks`, save/delete/restore, and the restore `targetViewport` GraphCanvas animates to. |
| `useMediaDrop`     | `../../GloGraphDesktopApplication/src/hooks/useMediaDrop.ts`            | Drag-and-drop media: Tauri native file drop (paths) + HTML5 URL drop → attach to the node under the cursor or create an image/video/audio item (centred-in-region when dropped on a region). Routes through `graph.addMedia`, so a Live Share guest's file uploads to the host via the `remoteApi` seam. Returns `dropActive` for the canvas drop overlay. |
| `useNodeActions`   | `../../GloGraphDesktopApplication/src/hooks/useNodeActions.ts`         | Node create/edit/delete/move + per-node media/link mutations (CreateItem, InlineNoteChange, NodeResize, Add/Remove/Reorder Media, Add/Remove Link, node z-order, SaveNode, DeleteNode, DeleteMultiple, NodeMove, QuickConnect) + the `nodeToUpdateInput` helper. Each is graph CRUD + one undo/redo `history.push`. The create-flow **UI** (the create-type picker, `viewportCenterNodePos`, `handlePickCreateType`, `handleCreateItemAtCenter`) stays in `AppInner` and calls this hook's `handleCreateItem`. Injected-deps contract. (Phase 72.) |
| `useEdgeActions`   | `../../GloGraphDesktopApplication/src/hooks/useEdgeActions.ts`         | Edge create/edit/delete: Connect, DeleteEdge, FlipEdge, EdgeReconnect, SaveEdge, EdgeLabelChange, EdgeWaypointsChange. Same graph-CRUD + single undo/redo pattern; injected deps. (Phase 72.) |
| `useRegionActions` | `../../GloGraphDesktopApplication/src/hooks/useRegionActions.ts`       | Region create/edit/delete/arrange: Move, Resize, BringToFront/SendToBack, SaveRegion, DeleteRegion, WrapSelectionInRegion, AutoFit + the `regionToUpdateInput` helper. Same CRUD + undo/redo pattern; injected deps. (Phase 72.) |
| `useGraphArrange`  | `../../GloGraphDesktopApplication/src/hooks/useGraphArrange.ts`        | Graph-wide arrange: Auto-Wire (connect selected nodes in order) + Auto-Layout (dagre + fit-view). One undo/redo entry each; injected deps. (Phase 72.) |
| `api`              | `../../GloGraphDesktopApplication/src/lib/api.ts`                       | All Tauri `invoke` wrappers (nodes, edges, regions, settings, tabs) |
| `graphObject`      | `../../GloGraphDesktopApplication/src/lib/graphObject.ts`               | Graph-object class hierarchy — `GraphObject` base + `NodeObject`/`EdgeObject`/`RegionObject`. `NodeObject` is further subclassed for graph-item variants (`NoteObject`, `MediaNodeObject` → `Image/Video/AudioObject`) which own their `cardLayout()`/`primaryMedia()`; `nodeObjectFor(node)` factories the right one from `kind`. `RegionObject.contains()` is the membership/locking behavior; `partitionIds`/`resolveObject` |
| `regionMembership` | `../../GloGraphDesktopApplication/src/lib/regionMembership.ts`          | Geometry primitives: `isNodeInRegion` (node center inside region), `isRegionInRegion` (≥50% area overlap **into a strictly larger region** — one-directional, so a child can't capture its bigger parent) |
| `containerHierarchy` | `../../GloGraphDesktopApplication/src/lib/containerHierarchy.ts`      | Live region containment forest: `computeHierarchy` (`parentOf` = immediate/smallest container, `childrenOf`) + `subtreeOf` (transitive descendants). Drives lock ownership (immediate parent) and drag movement (subtree) |
| `mediaCacheBust`   | `../../GloGraphDesktopApplication/src/lib/mediaCacheBust.ts`            | Per-media cache-bust tokens so an edited media source refetches instead of serving a cached image/video/audio |
| `dropMedia`        | `../../GloGraphDesktopApplication/src/lib/dropMedia.ts`                 | Pure drag-drop helpers: `mediaKindForExt`/`mediaKindForPath` (extension → image/video/audio, broad allowlist), `extOf`/`baseNameOf`, `urlFromDataTransfer`. Unit-tested. |

---

## Interaction Model

### Node lifecycle
1. **Create**: click "+ Add Node" in toolbar → NodePanel opens (create mode) → fill form → Save → node appears on canvas near graph centroid.
2. **Select**: single-click a node — or **start dragging it** — selects the node (highlights it + sidebar; opens its panel). Dragging selects on drag-*start* (every kind: standard nodes, note/image/video/audio items, and regions); a group/multi-select drag is left intact.
3. **Edit**: double-click a node OR click it in sidebar → NodePanel opens (edit mode).
4. **Move**: drag node on canvas → position saved to DB on drag-stop (the drag also selects it, per step 2).
5. **Delete**: open edit panel → Delete button.

### Edge lifecycle
1. **Create**: hover a node → handles (dots) appear → drag from handle to another node → edge created with defaults → EdgePanel opens automatically.
2. **Edit**: click an edge → EdgePanel opens.
3. **Delete**: open EdgePanel → Delete button.

### Canvas navigation
- Scroll to zoom
- Click-drag on empty space to pan
- Double-click empty canvas → deselects everything, closes panel
- Controls widget: zoom in/out, fit view, lock

### Keyboard
All shortcuts (Escape, Delete/Backspace, N, Ctrl+Z/Y, and ~20 more) are implemented — the canonical,
current list is **[UX_SPEC.md](UX_SPEC.md) §14**. Node/edge deletion is immediate with Ctrl+Z as the
safety net (no confirmation dialog).

---

## State Architecture

```
App
 └── SettingsProvider (React context)
      ├── settings: GraphSettings | null   // active preset's full schema
      ├── refreshSettings()
      └── helpers: getCategoryLabel/Color, getStatusLabel/Color,
                   getSubCategoriesForCategory, activeCategories,
                   activeStatuses, activeParamDefs

      AppInner (useState)
       ├── graph = useGraph()
       │    ├── nodes: GloNode[]
       │    ├── edges: GloEdge[]
       │    ├── CRUD methods
       │    └── reload()           // re-fetches all nodes + edges (used after import)
       ├── panel: PanelState       // none | createNode | editNode | editEdge
       ├── selectedNodeId: string?
       ├── selectedEdgeId: string?
       ├── graphSettingsOpen: boolean
       └── fileInputRef            // hidden <input type=file> for Load Graph

GraphCanvas (useNodesState / useEdgesState)
 └── Derives RF node/edge arrays from graph.nodes / graph.edges
     Syncs back to graph on drag-stop (positions only)
```

The canvas uses React Flow's internal state for smooth dragging. External state (`graph.nodes`) is
the source of truth for all data. Positions are persisted to SQLite on every drag-stop via
`update_node_positions`.

**Settings context** is intentionally above `AppInner` so `NodePanel`, `NodeCard`, `Sidebar`, and
`GraphSettingsModal` can all read the active preset without prop drilling.

**AppInner composes domain hooks** (Phase 67, extended Phase 72). What were inline state + handlers for
impact trace, keyboard shortcuts, clipboard, the quit flow, graph exports, project files, and canvas
bookmarks now live in `useImpactTrace` / `useKeyboardShortcuts` / `useClipboard` / `useAppQuitFlow` /
`useGraphExport` / `useProjectFiles` / `useCanvasBookmarks`. **Phase 72** then extracted the remaining
mutation-handler clusters into four entity **action-hooks** — `useNodeActions` / `useEdgeActions` /
`useRegionActions` / `useGraphArrange` — each a verbatim, behaviour-preserving move that takes its
`graph`/`history`/setter deps as an injected object (App.tsx 2,163 → 1,520 lines). Together these keep
`AppInner` an orchestrator rather than a god component. The
keyboard and clipboard hooks read live state through refs (`keyStateRef`, `rfSelectionRef`, refreshed
each render) so their effects/handlers stay stable. `useClipboard` is the exception to "extraction =
decoupling": `handlePaste` is intrinsically cross-cutting (nodes/edges/regions/view-state/history/region
locking), so the hook takes a wide injected-deps object — it's the single home for that orchestration,
documented as such in its docstring. The Phase-72 action-hooks share the same "injected deps" property:
they relocate handlers for navigability/size, not to decouple them from AppInner's state.

---

## Backend (Tauri / Rust)

- **Storage**: SQLite at `{AppData}/com.glograph.dev/glograph.db`
- **WAL mode**: enabled at startup for concurrent read performance
- **Foreign keys**: `PRAGMA foreign_keys=ON` — cascades handle child row cleanup
- **State**: `Mutex<rusqlite::Connection>` managed by Tauri

### Tables

| Table | Description |
|-------|-------------|
| `nodes` | Core node data (incl. `external_id`, `tags`, `data_source`, `is_pinned`, `is_expand_pinned`) |
| `node_links` | URLs attached to nodes (FK → nodes CASCADE) |
| `node_media` | Image/video/audio attachments incl. `show_on_card` (FK → nodes CASCADE) |
| `edges` | Connections; carries `source_handle`, `target_handle`, `waypoints`, `label`, `external_id` (FK → nodes CASCADE) |
| `regions` | Labelled grouping rectangles incl. `z_order`, `is_locked`, `is_minimized` |
| `presets` | Named setting schemas |
| `app_settings` | Key/value store (active preset id, edge routing mode, API config, migration flags) |
| `node_param_defs` | Node parameter definitions, incl. `drives_color` (FK → presets CASCADE) |
| `node_param_options` | Options for select/select_color node params (FK → defs CASCADE) |
| `node_param_values` | Per-node param values incl. `show_on_card` (FK → nodes + defs CASCADE) |
| `edge_param_defs` | Edge parameter definitions, incl. `drives_arrow/style/color/width` (FK → presets CASCADE) |
| `edge_param_options` | Options for select edge params (FK → defs CASCADE) |
| `edge_param_values` | Per-edge param values (FK → edges + defs CASCADE) |

> **Removed in Phase 18:** `node_images`, `preset_categories`, `preset_sub_categories`,
> `preset_statuses`, and assorted dead `nodes`/`edges` columns. Category/Status are now
> `node_param_defs` rows (see NODE_SPEC). **Each project tab is its own SQLite file** under
> `{AppData}/.../projects/<tabId>.db`; tab metadata lives in `projects/tabs.json`. State is a
> `ProjectManager` behind `Arc<Mutex<…>>` (`PmState`), shared by the Tauri commands and the HTTP API.

### Seeding

`init_db()` runs on every launch. It uses `INSERT OR IGNORE` with fixed UUIDs to seed the
built-in "Macro Economics" preset idempotently. Schema migrations use `ALTER TABLE ... ADD COLUMN`
wrapped in `let _ = ...` (ignored if column already exists).

### Command modules

| Module | Commands |
|--------|----------|
| `commands::nodes` | `get_all_nodes`, `create_node`, `update_node`, `restore_node`, `delete_node`, `update_node_positions`, `add_node_link`, `delete_node_link`, `add_node_media`, `update_node_media`, `update_node_media_show_on_card`, `delete_node_media`, `set_node_pinned`, `set_node_expand_pinned` |
| `commands::edges` | `get_all_edges`, `create_edge`, `update_edge`, `update_edge_waypoints`, `reconnect_edge`, `restore_edge`, `delete_edge` |
| `commands::regions` | `get_all_regions`, `create_region`, `update_region`, `restore_region`, `delete_region`, `set_region_z_order`, `set_region_locked`, `set_region_minimized` |
| `commands::settings` | `get_graph_settings`, `set_active_preset`, preset CRUD, node/edge param-def & option CRUD, `set_drives_color`, `set_edge_drive`, `get/set_app_setting` |
| `commands::graph` | `new_graph`, `save_graph_to_path`, `write_text_file` (CSV export), `write_binary_file` (PNG export) + internal `build_export`/`do_import` (also used by the HTTP API). `export_graph`/`import_graph`/`quick_save_graph` were removed in Phase 18. |
| `commands::tabs` | `get_tabs`, `create_tab`, `switch_tab`, `close_tab` (takes `deleteDb`), `set_tab_dirty`, `recompute_active_tab_dirty` (content-fingerprint dirty recheck), `rename_tab`, `set_tab_save_path`, `open_path_as_tab`, `get_recent_projects`, `record_recent_project`, `remove_recent_project` (Start-screen Clear / Re-path) |

Plus an embedded **axum HTTP API** (`http_api.rs`) for automation — see `API_SPEC.md`. Undo/redo,
multi-tab projects, regions, and node media are all implemented (the "Planned Features" table
below predates them).

- **Serialisation**: `serde rename_all = "camelCase"` on all models
- **ID generation**: `uuid::Uuid::new_v4().to_string()` in Rust; never generated on the frontend

---

## Web Demo (the same app, no Rust backend)

The public demo at **https://glograph.com/demo/** is **this exact frontend compiled for the browser** —
not a separate viewer — so it stays 1:1 with the desktop product. Because the entire data layer is
reached through one `invoke()` seam (`../../GloGraphDesktopApplication/src/lib/api.ts`), the demo swaps the backend without touching any
component.

- **Build:** `vite build --mode demo` (see `vite.config.ts`) aliases the five Tauri modules to browser
  shims and outputs to `../../website/demo/` (`base: /demo/`). Scripts: `npm run build:demo`; `npm run deploy`
  builds it then publishes the site. `tsconfig.json` excludes `../../GloGraphDesktopApplication/src/demo/` so the desktop `tsc` is
  unaffected.
- **`../../GloGraphDesktopApplication/src/demo/shims/`** replace `@tauri-apps/api/core` (`invoke` + `convertFileSrc`), `…/event`
  (`listen`), `…/api/window` (`getCurrentWindow`), `plugin-dialog` (`save`/`open`), `plugin-opener`.
- **`../../GloGraphDesktopApplication/src/demo/runtime.ts`** is the in-browser "backend": an event bus (powers `listen` / `tabs:changed`)
  plus a `dispatch()` implementing **every** `api.ts` command against in-memory stores, seeded from the
  bundled `../../GloGraphDesktopApplication/demos/*.glograph` (`../../GloGraphDesktopApplication/src/demo/graphs.ts`). The settings mapping is trivial because
  `GraphExportSettings.paramDefs` already matches `GraphSettings.paramDefs` and `SettingsContext` reads
  `paramDefs` directly.
- **Hard demo limits** (all in `runtime.ts`, zero app edits): nothing persists (refresh resets);
  Save/CSV/PNG → browser downloads; Open Project → file picker; no HTTP API; a 255 graph-object cap
  (plus a 6 project-tab cap) with an inline notice; a 30-minute auto-reset. Injected chrome adds the marketing-site header + Founder's
  strip, the object/timer badges, and a first-visit tutorial.

> Edit the app (or `../../GloGraphDesktopApplication/src/demo/`) and rebuild — never hand-edit the generated `../../website/demo/`. Full
> write-up: HANDOFF Phase 42.

---

## Feature status

The full shipped capability list and history live in **[HANDOFF.md](../architecture/HANDOFF.md)** (phase log); the
interaction rules and keyboard shortcuts are in **[UX_SPEC.md](UX_SPEC.md) §14**. In brief, the core is
complete: node/edge/region CRUD, the preset/param schema system, multi-select + copy/paste/duplicate,
undo/redo, dagre auto-layout, timeline + bulk-edit panels, multi-project tabs, node media + graph-item
variants (note/image/video/audio), regions (lock/minimize/nest), save/load (`.glograph`), exports
(PNG/CSV/Mermaid/DOT), and the embedded HTTP API + Python SDK.

**Genuinely future (not built):**

| Feature           | Description                                                       |
|-------------------|-------------------------------------------------------------------|
| AI scraper        | Crawl URLs → Claude extracts events → auto-creates nodes + edges  |
| Causality scoring | Edge weights computed from scraped content; visual heat-map       |
