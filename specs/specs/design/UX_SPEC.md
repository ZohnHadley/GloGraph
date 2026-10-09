# GloGraph — UX Design Specification

> Reference document for all frontend work. Every decision about interaction, layout, feedback,
> or visual treatment should be checked against these principles before implementation.

---

## Sources

- Medium — UI/UX Design Principles for Modern Web Apps
- Laws of UX (lawsofux.com) — 30 research-backed behavioural laws
- Figma Resource Library — UI Design Principles

---

## 1. Core Philosophy

GloGraph is a **power tool for analysts**, not a consumer app. Users arrive with a goal (build a
causal map, trace a macro narrative) and need to stay in flow. Every design decision should reduce
friction, never create it.

Three tests for any UI change:

1. **Watch someone use it cold.** Their first hesitation pinpoints the design failure.
2. **Remove one element.** If nothing breaks, it probably didn't belong.
3. **Can a user complete the core task (add node → connect → annotate) without reading anything?**
   If not, the interface is not intuitive enough.

---

## 2. Visual Hierarchy

*Sources: Figma — Hierarchy; Law of Prägnanz; Selective Attention*

### 2.1 Information Priority Tiers

Every screen region has one job. Never compete within a tier.

| Tier | Visual weight | Used for |
|------|--------------|----------|
| **Primary** | Full `--text`, weight 600, 13–14 px | Node title, panel heading, active action |
| **Secondary** | `--text`, weight 400, 13 px | Body copy, form labels, edge notes |
| **Tertiary** | `--text-muted`, 11–12 px | Dates, counts, hints, placeholder text |
| **Ghost** | `--text-muted`, 10 px, uppercase, tracked | Section labels, badge text, meta lines |

### 2.2 Colour as a Signal, Not Decoration

- **Accent (`--accent` #ffb000, amber):** Selected/active state, focused inputs. One use per context. (Canonical palette: [AESTHETIC_SPEC.md](AESTHETIC_SPEC.md).)
- **Category colours:** Encode meaning (Political = blue, Economic = green, etc.). Never reuse a
  category colour for a UI control — it breaks the encoding.
- **Danger red (`--danger`):** Destructive actions only. Never use for warnings or neutral states.
- **`--text-muted`:** Default for everything that is not the primary focus. When in doubt, go muted.

### 2.3 Von Restorff Effect — Strategic Contrast

*"The item that differs from the rest is remembered most."*

- The primary action button on any panel is always `btn--primary`. There is never more than one
  primary button visible at a time.
- The delete button is always `btn--danger`, always positioned **left** in the footer, away from
  the save action. Destructive and constructive actions must never be adjacent.
- Category badges use `background: color + '33'` (20% alpha) so they add identity without
  overpowering the title text above them.

---

## 3. Cognitive Load

*Sources: Miller's Law (7±2); Chunking; Cognitive Load; Hick's Law; Progressive Disclosure*

### 3.1 Miller's Law — Limit Choices Per Context

- **Filter chips in sidebar:** Categories are dynamic (pulled from the active preset). When a param
  has > 7 options the sidebar shows the first 7 plus a `+N` chip that expands the rest, with a "Less"
  chip to collapse (per-param `expandedParams` in `Sidebar.tsx`; HANDOFF Phase 23).
- **Edge type select:** 7 options. Do not add more without removing one.
- **Colour swatches in NodePanel:** 8 presets + 1 clear swatch = 9. This is the ceiling. Adding
  more creates choice overload.
- **Context menu items:** Never exceed 5. If a context menu grows, group into sections with
  separators.

### 3.2 Hick's Law — Progressive Disclosure

*"Decision time grows with the number and complexity of options."*

- The "Add Node" panel opens with **only Title visible**. Every other field is optional and added
  on demand via the `+ ADD FIELD` dropdown (progressive disclosure). In edit mode, fields that
  already have values auto-appear; the rest remain hidden until added. This avoids overwhelming
  new users while keeping the full data model accessible to power users.
- The toolbar exposes one primary action. Secondary actions (export, auto-layout, etc.) go in a
  secondary menu, not in the main toolbar.
- **EdgePanel** follows the same progressive disclosure pattern as NodePanel. Params with a default
  value or existing data auto-appear; the rest surface on demand via `+ Add field`.

### 3.3 Chunking — Group Related Controls

- Form groups always: `label → input → hint`. Never mix ordering within the panel.
- Footer always: `[danger action left] [spacer] [secondary action] [primary action right]`.
- Node card always: `[colour bar] → [badge + date] → [title] → [description] → [meta]`.
  Never rearrange this stack.

### 3.4 Working Memory — Keep Context Visible

- When a node is selected, its title must remain visible somewhere at all times (panel header,
  sidebar highlight, or node highlight on canvas).
- When creating an edge, both source and target node titles are shown in the EdgePanel header
  before any form fields.
- The toolbar stat (`N nodes · M connections`) always reflects live state — never stale.

---

## 4. Consistency

*Sources: Figma — Consistency; Jakob's Law; Mental Model*

### 4.1 Jakob's Law — Follow Established Patterns

Users have used other tools. Respect those conventions:

| Convention | GloGraph rule |
|------------|--------------|
| Click = select | Single-click on node → select, open sidebar highlight |
| Drag = select + move | Starting to drag an element (node, graph item, or region) also selects it (opens its panel), so the thing you're moving is the thing you're acting on |
| Double-click = edit | Double-click on node → open edit panel |
| Right-click = context menu | Right-click on empty canvas → context menu |
| Escape = cancel/close | Escape key always closes open panel and deselects |
| Drag handle = connect | Drag from node edge dot → create edge |
| Scroll = zoom | Scroll wheel zooms canvas (React Flow native) |

### 4.2 Naming Consistency

| Action | Label | Icon |
|--------|-------|------|
| Open create panel | **Add Node** | `<Plus>` |
| Save a new record | **Add Node** | `<Plus>` |
| Save an edited record | **Save Changes** | — |
| Remove a node permanently | **Delete** | `<Trash2>` |
| Dismiss panel without saving | **×** (icon button only) | `<X>` |
| Add a link to a node | **Add Link** | `<Plus>` |

Never mix "Create", "New", and "Add" for the same action. GloGraph uses **Add** throughout.

### 4.3 Button Placement

- **Primary action:** always last (rightmost) in a footer or action group.
- **Danger action:** always first (leftmost), visually separated from the primary.
- **Cancel/close:** always top-right of the panel header as an icon button, never in the footer.
- **Ghost/secondary action:** between danger and primary in the footer.

```
Footer layout:
[ Delete (danger) ]          [ Ghost action ]  [ Primary action ]
  ↑ left                                          ↑ right, always last
```

### 4.4 Form Field Consistency

Every form group follows this exact structure:
```
<label>  Field Name *          ← uppercase, 11px, muted; asterisk for required
<input | select | textarea>    ← full-width, border on focus changes to --accent
<span class="form-hint">       ← 11px muted hint, only when genuinely useful
```

- Labels are always above their control, never beside it (sidebar is too narrow).
- Hints appear below the control, not above. They explain format or consequence, not the field name.
- Error messages appear at the **top** of the form body, not inline next to fields. One error block,
  not per-field labels.

---

## 5. Feedback & States

*Sources: Doherty Threshold (<400ms); Goal-Gradient Effect; Peak-End Rule; Zeigarnik Effect*

### 5.1 Response Time Budget

| Interaction | Max latency | Treatment |
|-------------|------------|-----------|
| Button hover | Immediate | CSS `opacity` transition, 150ms |
| Panel open/close | < 150ms | No animation needed at this speed |
| Node select / deselect | Immediate | Border + glow via CSS transition |
| Save (Tauri invoke) | < 400ms target | Show spinner if > 200ms, disable button immediately |
| Canvas drag / pan | Immediate | React Flow native — never add JS to this path |
| Node creation → appears on canvas | < 500ms | Smooth `setCenter` scroll after DB resolves |

If a Tauri command ever takes > 400ms, show a loading state. The Doherty Threshold says
productivity drops when the user has to wait — perceived speed matters as much as actual speed.

### 5.2 Every State Must Be Designed

For every interactive component, all four states must have a defined visual treatment:

| State | Required treatment |
|-------|--------------------|
| **Default** | Resting appearance |
| **Hover** | Subtle background shift or opacity change |
| **Active / Selected** | Accent border + optional glow |
| **Disabled** | `opacity: 0.5`, `cursor: not-allowed`, no hover change |

Never leave a state undefined. A button with no hover state feels broken.

### 5.3 Loading States

- **Inline button spinner:** Use `<Loader>` icon with `.spin` CSS animation. Disable the button.
  Label changes to "Saving…" — never leave the original label while loading.
- **Full-page load:** The `.app-loading` screen (already exists). Keep it minimal: one line of
  muted text. No spinners, logos, or splash screens.
- **Canvas empty state:** When 0 nodes exist, show a centred prompt on the canvas:
  *"Right-click anywhere or click + Add Node to get started."* Remove it as soon as the first
  node is added.

### 5.4 Error States

- Show errors at the **top** of the form body, inside `.form-error`.
- One consolidated message, not multiple per field.
- Never use `alert()` or browser dialogs — they break flow and look out of place in a dark-theme app.
- On Tauri invoke failure, show the error message in the same `.form-error` block. Always give
  the user a path forward ("Try again" or actionable text), not just "An error occurred."

### 5.5 Destructive Action Pattern

*Peak-End Rule: the user's last memory of a session is how deletions felt.*

- Delete buttons are always `btn--danger` with `<Trash2>` icon.
- For node/edge deletion: no confirmation dialog. The action is immediate but the edge/node
  disappears with a brief React Flow transition. **Undo (Ctrl+Z) is the safety net, not a dialog.**
- Never auto-delete on timeout or background action. All deletes are explicit user actions.

---

## 6. Spatial Layout & Proximity

*Sources: Figma — Proximity, Alignment; Law of Proximity; Law of Common Region*

### 6.1 The Three-Column Rule

The app is always three columns. Never break this:

```
[ Sidebar 220px ] [ Canvas flex:1 ] [ Detail Panel 300px (conditional) ]
```

- Sidebar is permanent. It never collapses or overlaps the canvas.
- The detail panel slides in by replacing canvas space (canvas shrinks), never overlays it.
- Nothing floats over the canvas except: React Flow Controls widget, MiniMap, and context menus
  (which are portalled to `document.body` with `position: fixed`).

### 6.2 Spacing System

All spacing uses multiples of 4px (the base unit):

| Token | Value | Use |
|-------|-------|-----|
| `4px` | xs | Icon-to-text gap, badge padding |
| `8px` | sm | Form element gap, button icon gap, list item gap |
| `12px` | md | Card body padding, sidebar item padding |
| `16px` | lg | Section gap, dialog internal padding |
| `24px` | xl | Major section separation |

Never use odd-pixel spacing (e.g., 7px, 11px, 13px). If a value isn't on this scale, adjust to the
nearest step. **Dense docked panels are tighter than this general scale** — panel body padding is
**10px** (a sanctioned off-grid value), per [AESTHETIC_SPEC.md](AESTHETIC_SPEC.md) §5. Use 16px+ only
for dialogs/sections, never for the sidebar or detail panel body.

### 6.3 Proximity Rules

- Related controls sit within the same `.form-group` container (shared parent = perceived group,
  per Law of Common Region).
- The gap between form groups (`14px`) is larger than the gap within a form group (`5px`).
  This spacing difference alone communicates the grouping hierarchy.
- The footer (`detail-panel__footer`) is visually separated from the body by a top border,
  not by spacing alone. Borders communicate hard breaks; spacing communicates soft grouping.

---

## 7. Fitts's Law — Target Sizing

*"Time to acquire a target is a function of distance and size."*

Minimum touch/click target sizes:

| Element | Min size | Rationale |
|---------|----------|-----------|
| Primary button | `padding: 6px 14px`, min 32px height | Main action, must be easy to hit |
| Icon button | `24×24px` (including padding) | Small but reachable |
| Node connection handle | `10×10px` visual, `20×20px` hit area | Dragging precision matters |
| Category filter chip | `28px` height, full text width | Scannable and clickable |
| Sidebar node list item | Full 220px width, `36px` height | Large tap area, easy to select |
| Colour swatch | `22×22px` visual | Sufficient for mouse precision |

Connection handles get a larger invisible hit area than visual size. The CSS `::before` pseudo-element
or React Flow's `style` prop can expand the hit area without changing the dot's visual size.

---

## 8. Aesthetic-Usability Effect

*"Users perceive aesthetically pleasing design as more usable."*

Visual polish is not cosmetic — it builds trust in the tool's data.

### 8.1 Dark Theme Discipline

GloGraph uses a strict dark palette (warm-neutral charcoal, **not** blue-tinted). The exact token
values are canonical in [AESTHETIC_SPEC.md](AESTHETIC_SPEC.md) §1; the rules that must not be violated:

- Background layers go from darkest (`--bg #171717`) → surface (`--surface #212121`) →
  elevated (`--surface-2 #2a2a2a`). **Never reverse this stack.** A card on a panel is lighter
  than the panel background, not darker.
- Borders use the 4-value bevel system (`--border-hi`/`--border-lo`), or flat `--border #484848`.
  Never use `rgba` black borders — they disappear on dark backgrounds.
- Text is always `--text #cccccc` (primary) or `--text-muted #888888` (secondary). Never use
  pure `#ffffff` — it creates harsh contrast on a dark surface.

### 8.2 Motion Discipline

Motion should communicate, not entertain:

| What | Motion | Duration |
|------|--------|----------|
| Button hover | `opacity 0.15s` | 150ms |
| Node border + glow (selected) | `border-color, box-shadow 0.15s` | 150ms |
| Connection handle fade-in | `opacity 0.15s` | 150ms |
| Canvas scroll-to-node | `setCenter duration: 500` | 500ms |
| Panel open | No animation (instant) | — |
| Spinner rotation | `spin 0.8s linear infinite` | Continuous |

Never add `transition: all` — it creates unintended animation on layout properties. Always
name the specific property.

Never animate canvas nodes outside of React Flow's built-in drag behaviour. GloGraph is a data
tool; gratuitous animation undermines credibility.

---

## 9. Postel's Law — Forgiving Input

*"Be liberal in what you accept, and conservative in what you send."*

- **Title field:** Accept any string up to ~200 chars. Trim whitespace before saving. Never reject
  valid characters with regex.
- **Date field:** Use `type="date"` for consistent parsing. Accept empty (optional field).
  Never validate date logic (e.g., "event date must be in the past") — users add historical and
  future nodes.
- **URL fields:** Accept with or without `https://`. If stored without protocol, prepend `https://`
  on display/open. Never reject a URL just because it lacks a scheme.
- **Colour:** Accept hex string or empty. Empty means "use category colour." Never require a
  colour to be set.
- **Edge strength:** Clamp to 1–10 on the Rust side. The slider enforces this on the UI side.
  Both validate — UI for responsiveness, backend for integrity.

---

## 10. Tesler's Law — Manage Inherent Complexity

*"Every system has irreducible complexity. Someone must deal with it — push it to the system,
not the user."*

GloGraph is a complex analytical tool. The complexity lives in the data model, not the UI.

| Complexity | Who handles it |
|------------|---------------|
| UUID generation | Rust backend — user never sees or sets IDs |
| `dateAdded` timestamp | Rust backend — auto-set, never editable in UI |
| Canvas coordinate space vs screen coordinates | `screenToFlowPosition()` in GraphCanvas — user just right-clicks |
| Edge directionality | Defaults to `directed: true` on creation — user changes it in EdgePanel if needed |
| SQLite WAL mode, connection lifecycle | Tauri managed state — fully hidden |
| Category-to-colour mapping | `getCategoryColor()` in types — user picks a category, colour follows |

---

## 11. Sidebar Behaviour

The sidebar is a **navigation and filtering tool**, not an editor. Its rules:

- Clicking a node in the sidebar: opens its edit panel AND scrolls the canvas to that node.
- The sidebar list always reflects the active category filter AND search text simultaneously.
- The count at the bottom shows `N nodes · R regions` (and filtered form when search/filter active).
- The active node or region is highlighted in the sidebar list while its panel is open. When the panel is
  closed, no item is highlighted.
- Search is always live (filter on keypress, not on submit). No search button.
- Search text and filter chips work simultaneously with AND logic — both conditions are active at
  once. Both reset when a new graph is created or a graph file is loaded.

**Sidebar section layout (top → bottom):**
1. Brand logo + search bar
2. **Filters** (collapsible toggle, closed by default) — node param chips, edge param chips, tag chips
3. **Graph Stats** (collapsible toggle, closed by default) — count rows + param breakdowns
4. **Graph Notes** (collapsible toggle, closed by default) — free-text textarea
5. **Nodes** (collapsible toggle, open by default) — sort bar + hierarchy list
6. Count bar

- **Filters toggle**: only appears when at least one filterable param or tag exists. An amber dot appears on the toggle when any filter is active but the section is collapsed.
- **Node param filter chips** are pulled dynamically from `activeParamDefs` (select and select_color
  types). **Edge param filter chips** are pulled from `activeEdgeParamDefs` (select and select_color
  types) and appear in a separate group with a teal `"edge"` badge label. Selecting an edge param
  chip filters to nodes that have at least one connected edge with that param value.
- **Canvas highlight on filter**: when any search or filter is active, non-matching nodes are dimmed
  on the canvas. The sidebar calls `onHighlight(filteredNodes.map(n => n.id))`; App.tsx stores the
  set in `highlightedNodeIds`, which flows through `GraphStateContext` to NodeCard. When the filter
  clears, `onHighlight([])` removes all dimming.
- **Graph stats panel**: all select/select_color node param breakdowns are shown (not just a single
  "primary" param). Edge param breakdowns are also shown below node param breakdowns.
- **Nodes toggle**: wraps the sort bar and the full hierarchy list (regions + uncontained nodes). Open by default; collapsing it hides the list to free vertical space for Stats/Notes/Filters.
- **Regions** appear inside the Nodes section, separated by a horizontal divider. Region indicator dot
  is a rounded square (`border-radius: 2px`) instead of the node's circle.
  Clicking a region in the sidebar opens RegionPanel and scrolls the canvas to the region center.

---

## 12. Canvas Behaviour

The canvas is **the primary workspace**. Everything else serves it.

- **Nothing permanently obscures the canvas.** The sidebar and detail panel share space with the
  canvas — they shrink it, they don't overlap it.
- **Pane click always deselects.** Clicking empty canvas space closes all panels and deselects
  everything. No exceptions.
- **Double-click on empty canvas:** opens "Create Node" panel at the double-clicked position (same as right-click → Add node here). Implemented via `PaneDblClickHandler` inner component in GraphCanvas.
- **Right-click on canvas:** shows the pane context menu (**Add node here…** → opens the create-type picker / Add Region). Right-click on a regular node: shows node context menu with "Select Connected", trace, Bring to Front / Send to Back, and **Duplicate** / **Delete** (separated, Delete in the danger style). Both are **selection-aware** — if the right-clicked node is part of a multi-selection the action targets the whole selection (the label shows the count); otherwise just the clicked node. Right-click on a region: shows region context menu (**Add node here…** / Lock / Minimize / **Bring to Front** / **Send to Back** / Edit / **Duplicate** / Delete) — "Add node here…" opens the picker (a single entry, not five, to stay within the Miller's-law budget); the new node is centred on the click so it lands inside the region (and is auto-captured when the region is locked).
- **Right-click inside an editable text field** (the inline note editor on a card, or any panel `<input>`/`<textarea>`) shows a **text menu** — Copy / Cut / Paste / Select All (Copy/Cut disabled with no selection) — instead of the canvas/node menu, on the app's context-menu styling. Implemented app-wide by one capture-phase `contextmenu` listener (`TextFieldContextMenu`) that intercepts editable text targets before React Flow's node menu; clipboard ops use `execCommand` (so controlled inputs stay in sync) plus `navigator.clipboard.readText()` for paste.
- **Region stacking & overlap:** larger-area regions render behind smaller ones so a small/nested region stays clickable; the selected region wins exact-size ties; **Bring to Front / Send to Back** set a persisted manual order that overrides this. Region move and resize are undoable (Ctrl+Z/Y).
- **Node stacking:** all nodes render above all regions (note/image/video/audio items included — same node z, no kind special-casing). Order has two layers: a **persisted** `nodes.z_order` and a **transient float** for the node you're currently touching. Node z = `1000 + zOrder` (kept above every region); a **merely-selected** node lifts to `100000`, and the **most-recently clicked/dragged** node (`frontNodeId`) lifts highest to `100001` — so dragging node B while node A is selected surfaces B *above* A (this `100001` vs `100000` split fixes an earlier tie the selected node silently won). (Starting a drag also *selects* the element and opens its panel — see the Node-dragging bullet below.) **Dragging a node also brings it to the front permanently:** it bumps `z_order` above the others, folded into the move's single undo step, so the new stacking survives clicking off, reload, and export. The transient float **clears on empty-canvas click** — which drops a *clicked-but-not-dragged* node back to its saved order (a dragged node stays front because its `z_order` is now highest). Right-click → **Bring to Front / Send to Back** sets the same `z_order`; undoable. Regions use a negative `regionZ`, always behind every node.
- **Drag-and-drop media:** drag image/video/audio **files** from the OS (Tauri native drop → absolute path, `srcType:'file'`) or a media **URL** (HTML5 drop → `srcType:'url'`, detected by extension) onto the canvas. Dropping onto a node **attaches** the media to it; onto empty canvas creates a new image/video/audio **item**; onto a region creates the item **inside** it (centred on the drop, auto-captured if locked). Broad format allowlist (unsupported files skipped with a toast; unplayable-but-common containers fall back to the media-error placeholder); a drop overlay shows while dragging over the canvas; undoable. In a Live Share session a guest's dropped file **uploads to the host** automatically (the `remoteApi` media seam reads the bytes via `read_local_file` + POSTs `/media/file`); view-only guests are inert. See `hooks/useMediaDrop` + `lib/dropMedia`. *Caveat:* with Tauri's native file-drop enabled, WebView2 can suppress HTML5 URL drops — file drops are solid, URL drops are environment-dependent.
- **Scroll to zoom, drag to pan:** standard and must never be overridden.
- **Level-of-detail (LOD) when zoomed out:** to stay fast on large graphs, node cards drop their media
  as you zoom far out. Media renders at zoom **≥ 0.2** (`LOD_FULL`); below that it is hidden, and below
  **0.1** the card thins toward a plain rectangle (`LOD_COMPACT` → `LOD_MINIMAL`). Tiers are discrete
  (`zoomToLodTier` in `GraphStateContext`), so cards only re-render when crossing a threshold — zoom
  itself stays a cheap CSS transform. (The media threshold was tuned from 0.4 to 0.2 so media stays
  visible to roughly twice the zoom-out distance.)
- **The MiniMap** is always visible when the canvas is rendered. It is never hidden behind a
  toggle — it is too useful for orientation on large graphs. MiniMap node colours use `getNodeColor()`
  from `SettingsContext`, not `node.color` directly — the latter ignores category-colour param defs.
- **Node dragging:** positions are saved on `onNodeDragStop`. Never batch or debounce this —
  the user expects their layout to persist immediately.
- **Dragging selects the element:** starting a drag selects the dragged element and opens its panel
  (`onNodeDragStart` → `onNodeSelect`/`onRegionSelect`). Applies to **every kind** — standard nodes,
  note/image/video/audio items, and **regions**. Selection fires on drag-*start* (not stop), so the
  panel is open for the whole move and, for resizable items/regions, the resize handles show. A
  **group/multi-select drag is left intact** (grabbing an element that's already part of a multi-select
  doesn't collapse the selection to one). Selecting on drag-start (rather than drag-stop) also avoids a
  flicker: selecting at drag-stop changed the selection while the position commit was still in flight,
  and the canvas re-sync momentarily snapped the element back to its pre-drag spot.
- **Auto-layout** (`Edit → Auto Layout ↕ / ↔`): positions all nodes via dagre, then fires
  `fitView({ duration: 400 })` via the FitViewTrigger inner component. The trigger is a monotonically
  incrementing integer — never reset it to 0, which causes a double-fire loop.
- **Edge colour:** an edge's stroke is its per-edge `color` override (EdgePanel → **Edge Color**),
  defaulting to **white** when none is set (Phase 40 — the `drivesColor` param no longer drives the
  stroke, only the label). Selected edges draw amber. The colour is applied via inline
  `style={{ stroke }}` so it beats React Flow's base edge CSS.
- **Edge labels:** when an edge has a selected value for the `drivesColor` param, that option's
  label renders as a small pill at the midpoint of the edge path. Derived via `getEdgeLabel(edge)`
  from `SettingsContext`. Rendered via `EdgeLabelRenderer` (not inside the SVG `<path>`).
  If the edge is also captured by a locked region, the Lock icon appears inline with the label
  in the same pill (flex row, `gap: 3px`).
- **Edge bends:** in **waypoints** routing mode the path is a smooth Catmull-Rom spline through the
  bend points (smooth curves, not sharp corners); **orthogonal** mode stays right-angled; **bezier**
  mode uses a single control point.
- **Edge hover:** hovering over any edge brightens it via `filter: brightness(1.7)` applied to
  a `<g>` wrapping the visible path and arrowhead. The hover area is a 20px-wide transparent
  stroke path — this is also the element that drives the `onMouseEnter/Leave` state.
- **Edge context menu:** right-clicking any edge opens a small portal context menu at the cursor.
  If the edge has waypoints, a "Clear Waypoints" option appears first (with separator). "Delete Edge"
  (danger) is always shown. The menu is dismissed by left-clicking anywhere or opening another menu.
- **Edge waypoint editing (waypoints routing mode):**
  - Click anywhere on a selected edge's path to insert a waypoint at that point (nearest segment).
  - Double-click an existing waypoint dot to remove it.
  - Drag a waypoint handle (rendered via `EdgeLabelRenderer`) to reposition it.
  - All changes immediately persist via `onWaypointsChange`, which is also undoable (Ctrl+Z).
  - Waypoint handles and the click-to-add strip are hidden when the edge is captured by a locked
    region — the region controls waypoint positions, not the user.
- **Snap-to-grid:** when enabled (Preferences → Graph Settings → Display → Canvas section), all
  node and region positions snap to a 24px grid during drag. Controlled by `snapToGrid` in
  `SettingsContext`; persisted to `app_settings` table as `'true'/'false'` string.

---

## 13. Empty & Zero States

Every list and canvas region needs a designed zero state:

| Region | Zero state treatment |
|--------|---------------------|
| Canvas (0 nodes) | Centred muted text: *"Right-click the canvas or click + Add Node to begin"* |
| Sidebar node list (filtered, 0 results) | *"No nodes match this filter"* in `.sidebar__empty` |
| Node links section | *"No links yet"* hint in the links form group |
| Edge notes field | Placeholder: *"Why are these events connected?"* |
| Description field | Placeholder: *"What happened? Why does it matter for markets?"* |

Zero states must not be error states. Use `--text-muted`, no icons, no red colour.

---

## 14. Keyboard & Interaction Shortcuts

*Source: Jakob's Law — users expect keyboard access in power tools*

| Shortcut | Action | Status |
|----------|--------|--------|
| `Escape` | Close open panel, deselect all | **Done** |
| `Enter` (in title field) | Submit form | **Done** |
| `Delete` / `Backspace` | Delete selected node, edge, or region (supports multi-select) | **Done** |
| `N` | Open the **create-type picker** (Node / Note / Image / Video / Audio — Node is the default, so `N` then Enter makes a plain node; `T`/`I`/`V`/`A` pick an item) at viewport centre | **Done** |
| `Ctrl+A` | On the canvas: select all nodes and edges (or, if a region is selected, only its member nodes). In a text field: native select-all of the field's text (no longer hijacked). | **Done** |
| `Ctrl+C` | Copy selected node(s) + edges between them | **Done** |
| `Ctrl+V` | Paste with +40px offset | **Done** |
| `Ctrl+D` | Duplicate selected immediately | **Done** |
| `Ctrl+F` | Focus sidebar search | **Done** |
| `Ctrl+N` | New Project (opens the New Project dialog) | **Done** |
| `Ctrl+O` | Open Project — file picker, loads the chosen `.glograph` as a new path-linked tab | **Done** |
| `Ctrl+S` | Save — overwrites the project's linked `.glograph` file in place; opens Save As if it has none yet | **Done** |
| `Ctrl+Shift+S` | Save As — always opens the save dialog; first-time filename defaults to the active tab name | **Done** |
| `Ctrl+Z` | Undo last action | **Done** |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo | **Done** |
| `Ctrl+Shift+F` | Zoom to selection (or fit-all when none selected) | **Done** |
| `Ctrl+B` | Save canvas bookmark at current viewport | **Done** |
| `Tab` (no modifier, node selected) | Quick-connect: create a new connected node | **Done** |
| `\\` | Toggle focus mode (hides sidebar + detail panel) | **Done** |
| `/` | Quick-find overlay: typeahead search by node title/description/date | **Done** |
| `R` | Cycle edge routing mode: bezier → waypoints → orthogonal → bezier | **Done** |
| `W` | Auto-Wire: connect selected nodes in order with correctly-oriented edges | **Done** |
| `G` | Zoom/pan to fit current selection (or fit all when nothing selected) | **Done** |
| `E` | Expand / collapse all nodes (or only the selected nodes) | **Done** |

**Menu-accessible actions (no shortcut):**

| Action | Location | Status |
|--------|----------|--------|
| Export as PNG | File menu — opens a native **save dialog** to choose the location (default name = tab name); writes the rendered canvas PNG to the chosen path via `write_binary_file` | **Done** |
| Export as CSV | File menu — opens a native **save dialog**; writes two sibling files (`<name>-nodes.csv` + `<name>-edges.csv`) to the chosen location via `write_text_file` | **Done** |
| Copy as Mermaid | File menu — copies `flowchart LR` diagram text to clipboard | **Done** |
| Copy as DOT (Graphviz) | File menu — copies `digraph G { … }` text to clipboard | **Done** |
| Auto Layout ↕ (top-to-bottom) | Edit menu | **Done** |
| Auto Layout ↔ (left-to-right) | Edit menu | **Done** |
| Zoom to Selection | Edit menu (`Ctrl+Shift+F` / `G`) — **disabled when nothing is selected** | **Done** |
| Wrap Selection in Region | **Graph Objects** menu — creates a region sized to fit selected nodes; opens RegionPanel to set title | **Done** |
| Add Node / Note / Image / Video / Audio / Region | **Graph Objects** menu — creates a graph object (node + the note/media variants + region); items land at graph-view center | **Done** |
| About GloGraph | Preferences menu — modal with app name, version, tagline | **Done** |

---

## 15. Graph Settings System

The Graph Settings modal (Preferences → Graph Settings) contains the full schema for the active
analysis session. Rules:

- **Presets** are named schemas. Each preset owns its own categories, sub-categories, statuses,
  and custom parameter definitions. Switching presets live-updates the canvas.
- There are **four built-in presets** (all `is_builtin=1`; cannot be deleted):
  | Preset | Primary node field | Primary edge field |
  |--------|-------------------|--------------------|
  | Macro Economics | Domain (Political/Economic/Financial/Policy/…) + Region | Causation (Caused By/Amplifies/Offsets/…) |
  | System Behavior | Element Type (Auxiliary/Stock/Flow/Parameter/…) | Polarity (Positive/Negative) + Loop Type (Reinforcing/Balancing) |
  | Knowledge Map | Type (Concept/Claim/Evidence/Method/Source/Question) | Relation (Supports/Contradicts/Extends/Implies/Cites/Related) |
  | Project Tracker | Status (To Do/In Progress/In Review/Done/Blocked) + Type | Relationship (Depends On/Blocks/Part Of/Triggers/Related) |
- **Preset switching is restricted to empty graphs.** Presets can only be activated in the Presets
  tab when the graph is empty (`nodeCount === 0`). When nodes exist, the "Activate" button is
  disabled and a notice banner explains the restriction. Preset selection is also available when
  creating a new project via the `NewProjectDialog`.
- **New Project dialog (`NewProjectDialog`):** Creating a project (File → New Project or Ctrl+N) opens
  a custom modal — not `window.confirm` — with a name field and a preset selector (Blank plus the four
  built-ins). Each project is its own tab/DB, so a "new graph" is now a new project. (The earlier
  `NewGraphDialog`, which cleared the current graph in place, was superseded by the multi-tab model.)
- **Built-in preset visual indicators** in the Presets tab:
  - Teal left border (`.settings-row--builtin`).
  - **Template badge** (teal) — distinct from the orange **Active** badge.
  - One-sentence description below the name (from `BUILTIN_DESCRIPTIONS` map in `GraphSettings.tsx`).
- Built-in presets can be renamed and have their fields edited directly — no fork is created. They cannot be deleted. User-created presets can be renamed, deleted, or duplicated. "Add Preset" creates a blank preset; the user adds fields manually via the Node Fields and Edge Fields tabs.
- **Preset selector in Node Fields and Edge Fields tabs:** a compact selector bar at the top of
  each tab shows the current preset and lets the user switch presets inline — equivalent to
  clicking "Activate" in the Presets tab, without leaving the tab.
- **Value slugs** are stable identifiers stored on nodes. Renaming a category label updates the
  display everywhere without touching node data (the slug on the node stays the same).
- **Custom node parameters** are defined per-preset via the **Node Fields** tab. Each node can
  store a value for each param def. Param types: `text`, `number`, `boolean`, `select`,
  `select_color`. Category and Status are seeded `select_color` params — same system, same UI.
- **Edge parameters** are defined per-preset via the **Edge Fields** tab. Each `EdgeParamDef`
  carries up to four optional drive flags:
  - `drives_arrow` (boolean param) — arrowhead on/off
  - `drives_style` (select param) — React Flow path type (`default`/`straight`/`step`/`smoothstep`)
  - `drives_color` (select_color param) — stroke colour
  - `drives_width` (number param) — stroke width
  Each drive flag is **exclusive per preset**: assigning it to one def clears it from all others.
  Seeded edge params in the built-in preset: Relationship (select_color, drives_color), Directed
  (boolean, drives_arrow, default=true), Line Style (select, drives_style), Strength (number,
  drives_width, default=5), Notes, Correlation, Time Lag, Confidence.
- Inline editing in the settings modal must be non-destructive: edits stage locally; the user
  confirms with Enter or the check button before any DB write occurs.
- **Tab switching** scrolls the modal body back to the top (prevents disorientation on long lists).
- Each expanded param collapses when a different one is opened — maintain single-expand discipline.
- **Display tab:** contains canvas-level visual preferences. Current settings:
  - **Snap to Grid** — toggles 24px grid snapping for node and region drags. Persisted between
    sessions via `app_settings`. Toggle rendered as a checkbox row inside a "Canvas" settings section.
  - **Edge Routing Mode** — selector for `Bezier`, `Waypoints`, or `Orthogonal` routing. Persisted
    to `app_settings` as `edge_routing_mode`. Waypoints is the default. Changes apply immediately to
    all edges on canvas.
- **API tab:** exposes the embedded axum HTTP API controls.
  - **Enable toggle** (`api_enabled` app setting, stored as `'true'/'false'`): when disabled the API
    server does not bind; when enabled it listens on `127.0.0.1:57321`.
  - **Port** — read-only display field showing the active port (`api_port` setting, default `57321`).
  - **Token** — bearer token field (`api_token` setting). Show/hide button (`Eye`/`EyeOff`),
    copy-to-clipboard button, and "Generate" button that produces a 48-char hex token via
    `crypto.getRandomValues(Uint8Array(24))`. Token is saved on change via `setAppSetting`.
  - **Python SDK hint** — one-line code snippet showing `import glograph; g = glograph.GloGraph()`.
  - **Endpoint reference table** — static list of every REST endpoint with method badge (GET green,
    POST amber, PATCH blue, DELETE red), path, and one-line description. Used as a quick reference
    for API consumers without opening external docs.

- **Shortcuts tab:** a read-only reference listing every keyboard shortcut grouped by category
  (File / Edit / Create & connect / View & navigation / General), each with styled `<kbd>` keys.
  Also reachable directly via **Preferences → Keyboard Shortcuts…**, which opens the Graph Settings
  modal on this tab (`GraphSettingsModal` accepts an `initialTab` prop). Source of truth = the
  `SHORTCUTS` array in `GraphSettings.tsx`; keep it in sync with the keydown handler in `App.tsx`.

**Diagnostic endpoint (always available, no auth required):**
- `GET /api/tabs` — returns the full tab list (same shape as Tauri `get_tabs`) regardless of whether the API is enabled or a token is set. Exempt from auth middleware alongside `/api/ping`. Useful for debugging tab state without opening the UI.

---

## 16. Save / Load Graph

The Save/Load feature serialises the entire graph (nodes + edges + active preset settings) to a
`.glograph` file and restores it.

### Save behaviour
- **File → Save / Save…** (`Ctrl+S`): if the graph was previously saved to a known path
  (`currentSavePath`), saves to that path immediately with no dialog. Otherwise opens the OS native
  save dialog. The menu item label shows `"Save"` (no ellipsis) when a path is known, `"Save…"` when
  not. **File → Save As…** (`Ctrl+Shift+S`) always opens the dialog regardless of path; the first-time
  filename **defaults to the active tab/project name** (sanitised for the filesystem) rather than a
  generic "My Graph". `currentSavePath` resets to `null` on New Graph or Open Project.
  (The old `Ctrl+S` "Quick Save to ~/Documents/GloGraph Saves/" command was removed — `Ctrl+S`
  now always goes through Save / Save As as described above.)
- The file contains: `version`, `exportedAt`, `settings` (preset snapshot with `edgeParamDefs`),
  `nodes` (each with `paramValues`, `media`, `isPinned`, `isExpandPinned`), `edges` (each with
  `paramValues`, `waypoints`, `label`), `regions` (each with `zOrder`, `isLocked`, `isMinimized`), and
  top-level `bookmarks` + `graphNotes` (the project's canvas bookmarks and notes, so they travel with
  the shared file).

### Open behaviour ("open this document")
- Menu item: **File → Open Project…** (`Ctrl+O`); also the Start screen's **Open Project…** button and
  its Recents list. All three go through the `open_path_as_tab` command. (The menu item was renamed
  from the misleading "Import Project…" — it opens a tab, it never merges into the active project.)
- Opens the OS-native open dialog (`@tauri-apps/plugin-dialog`), filtered to `.glograph`.
- Opens the file as a **new path-linked tab** — never overwrites or replaces the active project —
  **unless it is already open**, in which case it switches to the existing tab (one tab per project;
  see §25.6). Never opens a duplicate.
- The tab's name is the filename (without `.glograph`); its **save path is set to the opened file**, so
  a subsequent `Ctrl+S` / Save overwrites the source in place (Save As makes a copy). The project is
  also recorded in Recents.
- Creates a new preset from the file's settings snapshot; settings are isolated to the new tab's DB.
- On error: a save toast shows the message.

### File format versioning
- Current `.glograph` files carry `"version": 9`. The backend accepts v3–v9; rejects all others.
  Breaking changes increment this number. Version 3 added `edgeParamDefs` in settings and
  `paramValues` arrays on edges. Version 4 added the top-level `regions` array. Version 5 added
  per-node `isPinned`/`isExpandPinned`, per-region `isLocked`/`isMinimized`, and top-level
  `bookmarks`/`graphNotes`. Version 6 added per-node `kind` (graph-item variant — see
  GRAPH_ITEMS_DESIGN.md). Version 7 added per-node `width`/`height` (resizable image/video/note
  items). Version 8 added per-edge `color` (hex stroke override; null = default white). Version 9 added
  per-node `renderMarkdown` (notes — render the body as markdown vs raw text; absent = true). All new
  fields are `#[serde(default)]`, so older files still load (absent `kind` defaults to `standard`; absent
  `width`/`height` mean the default size; absent edge `color` = white; absent `renderMarkdown` = true).

---

## 17. Node Regions

A **node region** is a third graph element type, alongside nodes and edges. It is a labelled, resizable rectangle that lives permanently behind nodes and edges, used to group or annotate areas of the canvas.

### 17.1 Structure

```
┌─ [Title text ──────────] [🔓/🔒] [−/+] ─┐   ← header bar (28px)
│                                           │
│   semi-transparent body                  │   ← body (color-tinted when accent color set)
│   (nodes can sit on top of it)           │
│                                           │
└───────────────────────────────────────────┘
```

- Header height: 28px (matches menubar / panel header for visual consistency).
- Body: `rgba(20,20,20,0.35)` default fill; when an accent color is set, replaced with that color at ~9% opacity (`color + '18'`).
- Border color: set via the color swatch in RegionPanel; defaults to `#484848`.
- z-index: always below regular nodes and edges. Regions use a negative `regionZ` (ordered by `zOrder` → area → selection), and **every node sits at `1000 + zOrder` or higher** (a merely-selected node at `100000`, the most-recently-touched at `100001`), so all nodes always render above all regions. Node z is interaction/`zOrder`-driven, **never `capturedIds`** — which in Phase 19 flipped node z on region capture and flickered region stacking; keeping node z independent of capture avoids that churn, so every node stays clickable regardless of what regions are underneath it.

### 17.2 Interaction

| Action | Gesture | Result |
|--------|---------|--------|
| Create | Right-click canvas → "Add node region here" **or** Graph Objects menu → "Add Region" | Region placed at cursor (or graph center), 320 × 220 default |
| Select | Click anywhere on region | Opens RegionPanel; highlights in sidebar |
| Move | Drag header | Repositions region; saved on drag-stop. Starting the drag also **selects** the region (opens RegionPanel), same as dragging a node |
| Resize | Drag border handles (visible when region is selected) | Resizes region; saved on resize-end |
| Lock | Click 🔒 button in header | Freezes membership; locked nodes move with region. **Persisted** (`regions.is_locked`) — survives restart/tab-switch/export |
| Unlock | Click 🔒 button again | Returns to open-container mode |
| Minimize | Click `−` button in header | Collapses to header only; contained nodes hide. **Persisted** (`regions.is_minimized`) |
| Expand | Click `+` button on minimized header | Restores to full height; nodes reappear |
| Delete | RegionPanel → Delete button, or `Del` key | Removes region only; contained nodes are unaffected |

- Multi-select drag does **not** include regions; only regular nodes are captured in a selection box.

### 17.3 Minimize Behaviour

When a region is minimized:

1. **Contained nodes** (≥ 75% of node area overlapping the region body **at the moment of minimization**) are hidden from the canvas.
2. **Edges with both endpoints in the same minimized region** are hidden entirely.
3. **Edges crossing the region boundary** (one endpoint inside, one outside) are visually remapped: the hidden endpoint is replaced by the region's node ID, so the edge appears to connect to the minimized region header. The actual DB edge data is unchanged.
4. **When expanded**, remapping is removed and edges reconnect to their original nodes automatically — no DB write.

The 75% containment threshold:
- Uses only the **body** area (header excluded) for the containment check.
- Node area = 200 × 80px. If the intersection of node bounds and region body ≥ 0.75 × 16000 px², the node is considered "inside" the region.

**Minimized region occupied area**: when minimized, a region occupies **only its 28px header**. The body area (below the header, where nodes were) is free canvas space. Nodes dropped into the ghost body area after minimization land there normally — they are not absorbed into the region.

**Membership is snapshot-based**: the set of hidden nodes is fixed at the moment of minimization (captured in `minimizedMembership` state via `snapshotMinimizedMembers()`). Moving or dropping nodes into the ghost body after minimization does not change which nodes are hidden.

**Minimize ↔ Lock mutual exclusion:** Minimizing a region that is currently locked **auto-unlocks** it first (removes it from `membershipRef`, clears captured indicators), then takes the minimize snapshot. A tooltip hint "Will unlock first" appears on the Minimize button in the context menu when the region is locked.

Minimize state is **not persisted** — regions always open expanded on app launch or file load.

### 17.3b Lock / Container Behaviour

A region acts as a **container** with two modes controlled by the 🔒 button:

**Unlocked (open container) — default:**
- Membership updates dynamically on every drag-stop: dragging the region over nodes adds them; dragging a node out removes it.
- Dragging the region does **not** move any nodes.

**Locked:**
- Membership is snapshotted when the lock button is pressed and re-evaluated as elements are dragged in/out.
- **Node containment:** a node is inside a region when its **center point** lies within the region body (`isNodeInRegion`) — size-independent, so a small nested region can still capture a node.
- **Child regions** that are **smaller than** the locked region and have ≥ 50% of their bounding area overlapping it are also captured. The smaller-than requirement makes containment one-directional, so locking a small child region never captures its bigger parent.
- **Immediate-parent ownership (containers):** an element is *owned by* (shows the lock badge for) its **immediate** container only — the smallest region that contains it. A node nested in an inner region is **not** owned by a larger locked *ancestor*, even though it sits geometrically inside it. So locking the inner region badges the node; locking only the outer region does not.
- **Transitive movement:** dragging a locked container moves its entire nested subtree — child regions *and* their contents, recursively — even inner regions that aren't themselves locked. So a node still follows when its outer container is dragged; it just isn't *owned* by that ancestor. Both the drag set and the ownership badge are derived from the **live container hierarchy** (`computeHierarchy` / `subtreeOf` in `../../GloGraphDesktopApplication/src/lib/containerHierarchy.ts`), recomputed from current geometry — never a frozen snapshot, so an element dragged out of a region is no longer moved by it (no stale capture). Drag set = the region's transitive `subtreeOf`; ownership/badge = immediate parent (`parentOf`).
- Other nodes/regions that happen to be under the locked region after a move are **not** added to membership.
- Locking and minimize state **are persisted** (`regions.is_locked` / `is_minimized`) — they survive restart, tab switch, and export (Phase 20).

**Lock ↔ Minimize mutual exclusion:** Locking a region that is currently minimized **auto-expands** it first (restores the region to full height), then snapshots membership. A tooltip hint "Will expand first" appears on the Lock button in the context menu when the region is minimized.

**Snap-back flash:** When a locked region is dragged and a member node cannot follow (e.g., because it is position-pinned), the node snaps back to its original position and briefly flashes with a red pulse glow (`.node--snap-back`, 400ms animation) to indicate the move was blocked.

**Membership pruning:** When a node or child region that is a member of a locked region is deleted, its ID is automatically removed from membership on the next render cycle (passive `useEffect` on `[nodes, regions]`). No stale capture indicators are shown.

Membership is tracked entirely in frontend state (`membershipRef` in `GraphCanvas`). There is no DB column for it.

**Capture indicators** — visual feedback for which elements are inside a locked region:
- **Captured node**: small Lock icon appears in the node card's meta row (cyan, 0.55 opacity).
- **Captured region**: chain (Link2) icon appears in the region header (cyan, 0.55 opacity).
- **Captured edge**: Lock icon appears at the edge midpoint via EdgeLabelRenderer (cyan, 0.65 opacity).
  An edge is "captured" only when **both** its endpoints are members of the same locked region.

These indicators are delivered via `GraphStateContext` (`capturedIds`, `capturedEdgeIds`) — never stored on RF node data to avoid triggering the `setDisplayNodes` useEffect and causing node flicker.

**Real-time edge following during locked-region drag:**
When a locked region is dragged, captured edges with waypoints follow the movement in real time.
This is implemented via a `regionDragOffset: { dx, dy, memberIds }` value in `GraphStateContext`.
During `onNodeDrag`, `setRegionDragOffset` is called with the current delta. `EdgeLine` reads this
value and computes `visualWaypoints = localWaypoints.map(wp => wp + offset)` for rendering. The
actual waypoint data (`localWaypoints`) is not mutated during drag — only the visual rendering is
shifted. On drag-end (`onNodeDragStop`), `setRegionDragOffset(null)` clears the visual offset and
the persisted translated positions arrive via the normal async `onEdgeWaypointsChange` flow.

**Why not `setEdges` during drag:** React Flow does not support calling its internal `setEdges`
during an active `onNodeDrag` event — doing so causes a hard app crash. `GraphStateContext` is
the correct channel for communicating drag-time visual state to edge components.

### 17.4 Sidebar

Regions appear in the sidebar list above the node list, separated by a divider. Visual differentiation:

- Node indicator: filled circle (`.node-list-item__dot`)
- Region indicator: rounded square (`.node-list-item__dot--region`, `border-radius: 2px`)
- Region entries show the region title only (no date column).
- Region count shown in the sidebar footer alongside node count.

**Search navigation:** When the search or filter is active and there are 2+ matching nodes, `↑` and `↓` chevron buttons appear in the search row. Pressing them cycles through filtered nodes, selecting each one and scrolling the canvas to it via `setCenter`.

**Graph stats panel:** A collapsible stats row at the bottom of the sidebar shows: total nodes, edges, regions, average edges/node, most-connected node, a breakdown by option for **every** select/select_color node param def, and a breakdown for every select/select_color edge param def. There is no single "primary" param — all param breakdowns are shown.

### 17.5 RegionPanel

Clicking a region header opens the RegionPanel in the detail panel slot (replaces any open NodePanel / EdgePanel). Fields:

- **Title** text input (always visible, required)
- **Accent color** swatch picker (same 8 preset colors as NodePanel) — tints the header gradient
- **Auto-fit (N)** button — shown only when the region has member nodes; resizes the region to tightly wrap them (24px padding, 28px top padding for header). Appears in footer beside Delete.
- **Delete** button (danger, left-aligned in footer)
- **Save Changes** primary button

### 17.6 EdgePanel — Flip Direction & Node Jump

The EdgePanel header row shows `SourceNode → TargetNode` (or `↔` for undirected). Two interaction improvements:

- **Clickable node names:** Source and target titles are `<button>` elements. Clicking one closes the edge panel and navigates to that node's NodePanel (same as clicking in the sidebar list).
- **Flip direction button (⇄):** A small `ArrowLeftRight` icon button at the right of the `edge-nodes` row. Clicking it swaps `sourceId`/`targetId` and their respective handles, then persists via `graph.reconnectEdge`. The action is undoable.
- **Edge Color (Phase 40):** a swatch picker (same 8 presets + clear as NodePanel) sets the edge's `color` override. The clear swatch is the **Default (white)** state; picking a colour overrides it. Saved with the edge (undoable); persisted to `edges.color` and round-tripped through export/import + the HTTP API (`PATCH /api/edges/{id}` `color`).

### 17.7 NodeCard — Edge Count Badge

When a node has any edges, a `⇄ N` badge is shown in the NodeCard meta row (alongside links, media, confidence). The count reflects total connections (both as source and as target). The data flows from `edgeCountByNodeId: Map<string, number>` in `GraphStateContext`, populated by GraphCanvas on each render.

### 17.8 Region Right-Click Context Menu

Right-clicking a region node (via RF's `onNodeContextMenu`) opens a portal context menu with:

| Item | Action |
|------|--------|
| Lock Region / Unlock Region | Toggle locked state (same as header lock button) |
| Minimize / Expand | Toggle minimized state |
| Edit Region… | Open RegionPanel in detail slot |
| Duplicate Region | Clone the region and its member nodes at +40px (undoable) |
| Delete Region | Delete the region (undoable) |

The menu uses the same `canvas-context-menu` styling as the pane and edge context menus. Lock/Minimize actions call the stable callbacks (`stableOnLock`, `stableOnMinimize`) already used by the region header buttons.

---

## 18. Mid-Impact Feature Inventory

### 18.1 Wrap Selection in Region

Graph Objects menu → **Wrap Selection in Region** (enabled when ≥ 1 node is selected). Creates a region bounding the selected nodes (24px side/bottom padding, 28px top padding for header), opens RegionPanel to set the title. Undoable via `history.push`.

The bounding box uses the same constants as region auto-fit: `NODE_W = 200`, `NODE_H = 80`, `PADDING = 24`, `HEADER_H = 28`.

### 18.2 Connected Nodes in NodePanel

When a node has edges, a collapsible **"Connected to (N)"** section appears at the bottom of NodePanel's body (above "Add field"). It lists each adjacent node as a clickable button. Clicking navigates to that node's panel — same behaviour as clicking in the sidebar list.

Data: `edges` and `allNodes` are passed as props from App.tsx. Adjacent node computation deduplicates by node ID (multiple edges to the same node count once).

### 18.3 Sidebar Sort Order

A horizontal sort-toggle row (`.sidebar__sort`) appears above the node list whenever there are 2+ nodes. Options: **Default** (insertion order), **A–Z** (title), **Date** (eventDate ascending, undated last), **# Edges** (descending degree). The active sort is highlighted with `.sort-btn--active`. Sorting applies to both region-member nodes and uncontained nodes. The sort state persists within a session.

### 18.4 Prev/Next Bookmark Navigation

When the bookmark bar has 2+ bookmarks, `<` and `>` chevron buttons appear. Clicking them cycles through bookmarks in order, restoring the saved viewport and highlighting the active chip with `.bookmark-chip--active`. Clicking a chip directly also marks it active.

### 18.5 Ctrl+A — Select All in Region

When a region is selected and `Ctrl+A` is pressed, instead of selecting all nodes, only the nodes whose centers fall inside that region are selected. Implemented via `SelectRegionMembersTrigger` — an inner RF component that calls `setNodes(nds => nds.map(n => ({ ...n, selected: memberIds.has(n.id) })))`. When no region is selected, `Ctrl+A` behaves as before (select everything).

### 18.6 Multi-Select: Ctrl+Click and Auto-Wire

**Ctrl+Click (or Shift+Click):** Adds or removes individual nodes from the current selection without clearing it. Standard cherry-pick behavior. Implemented in `GraphCanvas` — the click handler checks for `ctrlKey`, `metaKey`, or `shiftKey` and toggles the node in the `multiSelectedIds` Set (insertion-ordered).

**Auto-Wire (`W` key or "Auto-Wire" button in BulkEditPanel):** Connects selected nodes in sequence with properly oriented edges. Handle selection uses the dominant axis: if `|dx| ≥ |dy|`, use left/right handles; otherwise top/bottom. The Auto-Wire button appears in BulkEditPanel whenever 2+ nodes are selected via either selection method.

**Selection direction — both modes are direction-aware and consistent:**
- **Ctrl/Shift+Click:** wired in click order (first clicked → last clicked). Click right-to-left → edges point right-to-left.
- **Drag-select:** wired in drag direction. The screen-space vector (mousedown → mouseup position) is stored in `dragVectorRef`. Node centers are projected onto this vector (`pos · drag_direction`) and sorted ascending. Drag right-to-left → edges point right-to-left.

**Implementation — two parallel tracking systems:**
- `multiSelectedIds` (ordered Set, lives in `GraphCanvas`) — populated by Ctrl+Click in insertion order. Changes trigger a `useEffect` that calls `onMultiSelectionOrderChange`, which sets `orderedSelectionRef.current` to the click-ordered array.
- `rfSelectionRef` (unordered, lives in `App.tsx`) — populated by React Flow's `onSelectionChange`, which fires for both drag-select and for the `selected` prop changes that Ctrl+Click causes.

**Discriminating the two modes in `handleSelectionChange`:** React Flow fires `onSelectionChange` for both drag-select and Ctrl+Click (because setting `selected: true` on node props triggers RF's internal selection change). To avoid wiping click order on Ctrl+Click, `handleSelectionChange` checks `dragVectorRef.current`: a Ctrl+Click produces a near-zero mousedown→mouseup vector (`|dx| ≤ 10 && |dy| ≤ 10`), while a drag-select produces a large one. `orderedSelectionRef` is only cleared when the vector is significant (genuine drag) or the selection is empty. This works because the global `mouseup` listener in `GraphCanvas` updates `dragVectorRef` before React's effects run, so the value is always current when `handleSelectionChange` executes.

**`orderedSelectionRef`** is the single source of truth for auto-wire: populated by Ctrl+Click (click order) or left empty for drag-select (fallback sorts `rfSelectionRef.current.nodeIds` by drag vector).

**BulkEditPanel visibility:** Shown when `ctrlSelectionSize > 1` (Ctrl+Click, tracked as reactive state via `onMultiSelectionOrderChange`) OR `rfSelectionSize > 1` (drag-select). Node IDs passed to BulkEditPanel prefer `orderedSelectionRef` (has data for Ctrl+Click) and fall back to `rfSelectionRef.current.nodeIds` (drag-select).

Each edge pair is created with `graph.addEdge` and the whole batch is pushed as a single undoable history entry.

### 18.7 Edge Quick-Note (Inline Label)

Each edge can carry a free-text quick note, stored in the `notes` column of the `edges` table and surfaced as `label` on the `GloEdge` TypeScript type.

**Interaction:**
- **Double-click a selected edge's midpoint** (or its param-driven label area) to enter inline editing mode. An `<input class="edge-label-input">` appears at the edge midpoint, auto-focused.
- `Enter` or blur commits the text. `Escape` cancels without saving.
- Empty string → `null` (no label stored).
- The note is shown as `.edge-quick-note` (italic, muted, 9px) at the edge midpoint, separate from param-driven labels (which appear first). Both can coexist.

**Persistence:** `update_edge` now also writes `notes = label`. `restore_edge` includes `notes` in the `INSERT OR REPLACE`. Undoable — the label before the edit is captured in `handleEdgeLabelChange` and pushed to `history`.

**Param label vs. quick note:** The param-driven label (from `getEdgeLabel`) is rendered first in the label div as a `<span>`. The quick note is a second `<span class="edge-quick-note">` below it. They share the same midpoint position.

### 18.8 Node Flash / Pulse on Navigate

When a node is navigated to by clicking in the sidebar list, it briefly pulses with an amber glow to confirm the canvas has scrolled to it.

**CSS:** `@keyframes node-flash` — box-shadow expands from 0 to 8–12px radius over 1.2s (ease-out, forwards). Applied via `.node-card--flash`.

**Implementation:** `flashNode(nodeId)` in App.tsx sets `flashingNodeId` state and clears it after 1200ms (via `setTimeout`). `flashingNodeId` flows through `GraphCanvas` props → `GraphStateContext` → `NodeCard`, which applies `.node-card--flash` when `flashingNodeId === data.id`. Only one node can flash at a time; a new flash cancels the previous timeout.

Triggered by: `handleSidebarSelect` (sidebar node click).

### 18.9 Copy Node ID

A **Copy** icon button appears in NodePanel's footer (between Delete and Pin). Clicking it copies `node.id` to the clipboard via `navigator.clipboard.writeText`. The icon switches to a Check (`✓`) for 1.5s as confirmation feedback, then reverts. Only rendered for existing nodes (not in create mode). No toast — the in-button feedback is sufficient.

### 18.10 Connection Preview on Hover

Node handles (`.node-handle`) become more visually inviting when hovered or when an active connection drag is in progress:
- **Hover:** scale 1.4×, amber glow ring `box-shadow: 0 0 0 3px rgba(214,139,42,0.25)`.
- **Connecting target (RF adds `.connectingto`):** scale 1.5×, stronger amber glow.

This gives visual affordance that handles are draggable before the user commits to a drag.

### 18.11 Sidebar Collapsible Sections

**"Other Nodes" collapse:** When the graph has both regions and uncontained nodes, the uncontained nodes are grouped under a collapsible **"Other Nodes"** section header. The header (`.hierarchy-row--uncontained`) shows a toggle chevron and, when collapsed, a count badge. Clicking the header toggles collapse state. Region child nodes continue to use the per-region collapse as before.

**Filters section:** All filter chips (node params, edge params, tags) are grouped under a single **Filters** collapsible toggle (closed by default). Uses the same `sidebar__stats-toggle` style as Graph Stats. A small amber dot (`.sidebar__filter-active-dot`) appears inline in the header when any filter is active while the section is closed.

**Nodes section:** The sort bar and full node hierarchy list are wrapped in a **Nodes** collapsible toggle (open by default). Collapsing it hides the list entirely, useful when the user wants to keep Stats or Notes visible without scrolling.

**Section order:** Filters → Graph Stats → Graph Notes → Nodes (hierarchy) → count bar.

**"Add Node" button removed from menu bar:** The primary `+ Add Node` button previously shown in the top-right of the MenuBar quick-actions area has been removed. Node creation is now accessed via the `N` key, the **Graph Objects** menu "Add Node" item, right-click canvas → "Add node here", or pane double-click.

The section is only rendered when there are both regions and uncontained nodes (`visibleRegions.length > 0 && uncontainedNodes.length > 0`). When there are no regions, the node list is flat with no header — same as before.

---

## 19. Low-Impact Feature Inventory

### 19.1 Hover Edge → Highlight Endpoints

Hovering over any edge (including its invisible hit-target path) applies the class `.node-card--endpoint` to the source and target NodeCards. This adds an amber outer glow (`box-shadow: 0 0 0 2px rgba(214,139,42,0.75)`) that draws the eye to both ends of the relationship without requiring a click.

**Important:** `.node-card--endpoint` is **glow-only** — it does not trigger the details-expand animation. Expanding on edge-hover would cause the card to grow while the edge is drawn between it, making the handle position shift mid-drag. Only hover, selection, connecting-source, and pinned-open states trigger expansion.

Implementation: `EdgeLine` calls `edgeData?.onHoverChange?.(id, hovered)` on its hit-path `onMouseEnter`/`onMouseLeave`. `GraphCanvas` maintains `hoveredEdgeId` state with a stable `stableOnEdgeHoverChange` callback; `hoveredEndpointIds` is a `useMemo` derived from that ID. `NodeCard` reads `hoveredEndpointIds` from `GraphStateContext`.

### 19.2 Canvas Focus Mode (`\`)

Pressing `\` toggles focus mode — the sidebar and detail panel are hidden, giving the canvas the full window. A second `\` restores the layout. The toggle adds/removes class `app--focus` on the root `.app` div; CSS rules `app--focus .sidebar` and `.app--focus .detail-panel` set `display: none`.

The `\` key handler is placed **after** the `isEditingText()` guard so it does not fire when the user is typing in a text field.

### 19.3 Node Card Hover-Expand

Node cards use a **compact-by-default / expand-on-hover** design to reduce visual density on the canvas.

**Compact state (default):** only the node title is visible. The card renders as a ~28px tall chip.

**Expanded state:** badge, event date, description preview, custom params, meta row, and media are all visible. The expand is driven by CSS `max-height` / `opacity` transition on `.node-card__details`.

**Expand triggers and delay policy:**

| Trigger | Delay | CSS class / state |
|---------|-------|-------------------|
| Mouse hover | 300ms | `:hover` |
| Node selected | None (instant) | `.node-card--selected` |
| Active connection source | None (instant) | `.node-card--connecting` |
| Pinned open | None (instant) | `.node-card--pinned-open` |
| Edge endpoint hover | **Never** | `.node-card--endpoint` (glow only) |

The 300ms hover delay prevents the card from expanding when the user is quickly passing the cursor over it to reach a connection handle — one of the most common pointer paths on a dense canvas.

**Connection source persistence:** while an edge drag is in progress, `GraphCanvas` tracks the source node ID in `connectingFromNodeId` state (set by `onConnectStart`, cleared by `onConnectEnd`). The source node stays expanded for the full drag without relying on `:hover`, so users can see the source card details while routing a connection.

**Collapse:** removing the expand trigger collapses the card immediately (no delay on collapse). The transition is `max-height 0.15s ease, opacity 0.08s ease` with no delay.

### 19.4 Per-Node Expand Pin Toggle (keep-open)

Each node card has a **keep-open button** (`.node-card__expand-toggle`) that locks it in the expanded
state regardless of hover.

- The button sits at the right of `.node-card__title-row`, next to the position-pin toggle (§19.5).
- Icon: a chevron toggle — `ChevronsUpDown` (keep expanded) when inactive, `ChevronsDownUp`
  (collapse on mouse-out) when active. **Changed from `Pin`** (Phase 34) so it no longer collides
  with the position-pin's thumbtack. **Always visible in the amber accent** (Phase 34 — the icon
  shape conveys on/off; brightens on hover).
- **Active state:** the card gains `.node-card--pinned-open` (instant expansion).
- **Click:** `stopPropagation` on click + `mouseDown` (no node select / RF drag). `togglePinnedExpand(id)`.
- **State** is `pinnedExpandIds: Set<string>` in App.tsx via `GraphStateContext` — session-only.
- Hidden on graph-item cards (note/media), which are always expanded.

### 19.5 Node Position Pin

Position-pinning marks a node non-draggable for the session. It can be toggled from **two** places:

- **Card header** (`.node-card__pin-toggle`, Phase 34): a `Pin`/`PinOff` button at the right of the
  title row, **always visible in the amber accent** (same treatment as the keep-open toggle). `Pin`
  when unpinned, `PinOff` when pinned. Calls `togglePin(id)` via `GraphStateContext` → App's
  `handleTogglePin`. Present on every node kind (including items).
- **NodePanel footer**: a `Pin`/`PinOff` ghost button (`.btn--on` when active).

- Pinned nodes are non-draggable: `rfNodes` sets `draggable: !pinnedNodeIds.has(n.id)`; the card gets
  `.node-card--pinned` so its cursor shows `default` rather than `move`.
- The dedicated meta-row pin badge was **removed** (Phase 34) — the header toggle now shows the
  pinned state, so the badge was redundant.
- Pin state is **session-only**. `pinnedNodeIds: Set<string>` lives in App.tsx, toggled by
  `handleTogglePin`, and flows to `GraphCanvas`/`GraphStateContext` and `NodePanel`.

### 19.6 Undo Indicator in MenuBar

The MenuBar stat line shows `↩ N` when the undo stack is non-empty (N = depth). This gives users a quick read on how many undo steps are available without opening any menu.

Implementation: `useHistory` exposes `undoCount: number` (a `useState` synced inside `sync()` on every push/undo/redo/clear). App.tsx spreads it into the `stat` prop string conditionally: `...(history.undoCount > 0 ? [\`↩ ${history.undoCount}\`] : [])`.

---

## 20. Additional Features

### 20.1 Orthogonal Edge — Multiple Bend Points

Orthogonal edges support adding more than one bend point, matching the waypoints-mode experience:

- **Click the edge** (when selected) to insert a new bend point at the click position. The edge body shows a crosshair cursor. The click uses `handlePathClick` to insert the waypoint at the nearest segment.
- **0 waypoints**: default auto-routed path (`getSmoothStepPath`), single center handle shown for discoverability.
- **1 waypoint**: existing constrained single-bend drag (horiz-primary moves only X; vert-primary moves only Y). Double-click the handle to remove and revert to auto-routing.
- **2+ waypoints**: each waypoint gets its own free-drag square handle. The path is built as a series of x-then-y elbows between consecutive points (y-then-x for the first segment when the source handle is top/bottom). Double-click any handle to remove that bend point.

The arrow angle for multi-bend orthogonal is computed from the direction of the last elbow segment approaching the target.

### 20.2 Region Copy / Paste / Duplicate

Regions are included in copy (`Ctrl+C`), paste (`Ctrl+V`), and duplicate (`Ctrl+D`) operations.

**Copy behaviour:**
- When the selection includes one or more regions, all member nodes of those regions (nodes whose centers fall within the region bounds) are automatically included in the clipboard, along with any explicitly selected nodes.
- Edges between copied nodes are included.
- The clipboard is `{ nodes, edges, regions, pinnedNodeIds, pinnedExpandIds, lockedRegionIds, minimizedRegionIds }`.

**Paste behaviour (`handlePaste`):**
- New nodes are created at +40px offset from originals, with all `paramValues` and `tags` copied.
- Each pasted node's **links and media** are also copied (new DB rows, new IDs).
- **Graph-item variants travel intact:** the node's `kind` is passed to `addNode`, and a resized
  item's `width`/`height` are re-applied via `setNodeSize` after creation — so pasting/duplicating a
  note/image/video/audio keeps its type, content, and size. The full pasted nodes feed the undo
  entry, so Ctrl+Z removes them and Ctrl+Y restores them (kind/size/media included via `restore_node`).
- New edges are created between the new nodes (re-mapped IDs).
- New regions are created at +40px offset, preserving title, dimensions, and colour. Because nodes are also offset by the same amount, the spatial membership relationship is preserved automatically.
- **Transient state is preserved (Phase 5):** After all DB objects are created, the paste handler applies the original transient states to the new IDs:
  - Pasted nodes that were position-pinned → re-added to `pinnedNodeIds`.
  - Pasted nodes that were expand-pinned → re-added to `pinnedExpandIds`.
  - Pasted regions that were locked → `stableOnLock(newId, true)` called (lock runs before minimize to respect mutual-exclusion logic).
  - Pasted regions that were minimized → `stableOnMinimize(newId, true)` called.
- The entire paste (nodes + links + media + edges + regions + states) is a single undoable operation. Redo uses the full node objects (including populated links/media) so `restore_node` re-creates everything correctly.

**Member detection formula** (matches region auto-fit): node center `(n.x + NODE_HALF_W, n.y + NODE_HALF_H)` must fall within region bounds, where `NODE_HALF_W = 100` and `NODE_HALF_H = 40` are module constants in `App.tsx`.

---

## 21. Node Media

Each media item (image, video, or audio) attached to a node is managed as its own independent field slot in NodePanel, not as a grouped list inside a single "Media" section.

### 21.1 Per-Item Field Architecture

- Each saved media item appears as its own `form-group` in the NodePanel body, keyed by `media:${id}` in `visibleFields`.
- Existing items are pre-populated into `visibleFields` when the panel opens (`initVisibleFields` emits one entry per item).
- Adding a media item from the "Add field" dropdown creates a **pending** slot: a temporary inline form with srcType select (File / URL), browse/path input, and optional label. Confirming calls `onAddMedia`, which saves to DB and promotes the slot to a real saved field. Cancelling (X) removes the pending slot with no DB call.
- Deleting a saved media item removes it from the DB, from `localMedia`, and from `visibleFields`. No "hide without delete" option — the delete button is the only removal affordance for media fields.
- **Editing** a saved item's source/label opens an inline form with **no separate Save button** — the change is committed as part of the node's **Save Changes** (or "Cancel edit" to discard). One save for the whole node. (`update_node_media` coalesces a missing label to `''` since `node_media.label` is `NOT NULL`.)
- When a media source is **added or edited**, a session cache-bust token (`../../GloGraphDesktopApplication/src/lib/mediaCacheBust.ts`) is appended to its URL so the node card refetches the new source instead of showing a WebView-cached image/video/audio. The token lives outside node state, so a node save/refetch can't wipe it.

### 21.2 Add Field Dropdown

- The "Add field" button is visible in edit mode even when all fixed/param fields are already added — because media types are always addable (multiple items of the same type supported).
- After the fixed/param field options, a `.add-field-sep` divider separates them from three media type options: **Image**, **Video**, **Audio** (each shows the type icon).
- Clicking a media type option creates a new pending slot immediately.

### 21.3 On-Card Toggle (media)

Each saved media item's header contains an "on card" checkbox toggle (`.show-on-card-toggle` styling). Toggling takes effect immediately (no Save required) — calls `update_node_media_show_on_card` directly and optimistically updates local state. New items default to `showOnCard = true`. Existing items default to `show_on_card = true` via the DB column default.

### 21.3b On-Card Toggle (node params)

Each `node_param_value` also has a `show_on_card` flag controlling whether the param badge renders on the canvas node card. Separately, each `node_param_def` has a `show_on_card_default` used when a new value is saved for that param.

- **Default state**: `drives_color` params (`show_on_card_default = 1`) default to on-card; all other params default off.
- NodeCard filters `paramValues` by `showOnCard === true` before rendering param badges.
- The toggle (if surfaced in NodePanel) applies immediately — same pattern as media.

### 21.4 Preview (Expand/Collapse)

Each saved item has a chevron button in its header to expand/collapse an inline preview (`media-item__preview`):
- Image: `<img>` full-width
- Video: `<video controls>`
- Audio: `<audio controls>`

Only one item is expanded at a time (`expandedMediaId` state).

### 21.5 NodeCard Rendering

NodeCard filters `data.media` to only items where `showOnCard !== false` before rendering:
- **Images**: `<img class="node-media-img">` — `width: 100%; max-height: 160px; object-fit: contain`
- **Video**: `<video controls class="node-media-video">` — `width: 100%; max-height: 180px`
- **Audio**: `<AudioPlayer>` custom component — play/pause button, seekable range input, `M:SS` time display. Wrapped in `nodrag nowheel nopan`.

The meta-row icon counts (Image/Film/Music2) also reflect only on-card items.

### 21.6 Why Immediate for Toggle

The "on card" toggle is immediate (not gated behind Save) because:
1. It controls a display preference, not content — toggling it cannot lose data.
2. It matches the established pattern of the node param "on card" toggles (also immediate).
3. A user browsing a large media library should be able to quickly decide what to show on the card without triggering a full node save.

---

## 22. Anti-Patterns — Never Do These


These patterns explicitly violate the principles above and are banned in GloGraph, with noted
exceptions:

| Anti-pattern | Why it is banned | Exception |
|--------------|-----------------|-----------|
| `alert()`, `confirm()`, `prompt()` | Break flow, look foreign in native app | No `confirm()` remains — tab close uses the custom `CloseTabDialog` (§25.9), New Project uses `NewProjectDialog`. `alert()`: file parse/write failure only. |
| `overflow: hidden` on a flex column without explicit height | Clips footer, hides buttons | — |
| `transition: all` | Animates layout/position unintentionally | — |
| Per-field inline error labels | Adds clutter; one consolidated error block per form | — |
| Confirmation dialogs before node/edge delete | Adds friction; undo is the recovery mechanism | Closing a tab with unsaved work prompts (Save/Don't Save/Cancel) via `CloseTabDialog` — closing can lose data that undo can't recover. |
| Buttons without hover, active, and disabled states | Incomplete state machine = feels broken | — |
| Two primary buttons visible at once | Destroys hierarchy; user doesn't know what to do | — |
| Floating panels overlapping the canvas | The canvas is the workspace — never occlude it | Modals (Graph Settings) are acceptable as full-screen overlays |
| Browser-default scrollbars on panels | Always use the custom 10px industrial scrollbar | — |
| Category colours used for UI controls | Destroys the semantic encoding of the category system | — |
| Animations > 500ms | Feels sluggish in a data tool | — |
| Empty tooltips or placeholder text that repeats the label | Adds noise with zero signal | — |

---

## 23. Low-Priority Backlog

Items identified but deferred. Document here so future sessions don't re-evaluate them.

### 23.1 Window Title — Unsaved Indicator
**What**: Update the OS window title to show `"GloGraph — filename *"` (asterisk) when there are unsaved changes (`undoCount > 0`). Show just the filename when saved; `"GloGraph — New Graph"` when unsaved path.
**Why deferred**: Requires Tauri `Window.setTitle()` call. Low end-user impact for the overhead of tracking the state.
**Implementation note**: Read `currentSavePath` + `history.undoCount` in App.tsx; call `getCurrentWindow().setTitle(...)` in a `useEffect` on those deps.

### 23.2 Restore Last Session on Launch
**What**: On cold start, if `last_session_path` exists in `app_settings` (set on every save), automatically load that file instead of a blank graph.
**Why deferred**: Needs careful handling of missing/moved files (silently skip, not error). Medium complexity for a nice-to-have.
**Implementation note**: On startup, read `api.getAppSetting('last_session_path')`. If it exists, call `api.importGraph(path)` before rendering. Set `last_session_path` in every save handler.

### 23.3 Node Card Density Toggle
**What**: A sidebar toggle (Compact / Normal / Spacious) that adjusts node card `min-width`, font sizes, and padding via CSS custom properties. Useful for dense graphs.
**Why deferred**: No strong user signal yet. Easy to add later as a Display tab option in Graph Settings.
**Implementation note**: Add `--card-density: 1` (1=normal, 0.8=compact, 1.2=spacious) CSS var. Store in `app_settings`. Scale all `node-card__*` spacing values accordingly.

### 23.4 Edge Weight Legend
**What**: When a `drives_width` edge param is active, show a small legend panel (top-right of canvas overlay) with the min/max width range and the param's display name.
**Why deferred**: Requires computing the actual min/max from live edge data. Niche use case.

---

## 24. Node Tags

Each node can carry zero or more free-text tags (`tags: string[]`), stored as JSON in the `tags` column of the `nodes` table. Tags are set and read through existing `create_node` / `update_node` Rust commands.

### 24.1 Tag Input in NodePanel

A **Tags** section appears in NodePanel's body (above "Add field"). It uses a chip-input design:
- Existing tags are shown as removable chips (`.tag-chip`). Clicking the × on a chip removes it immediately (local state, persisted on Save).
- An inline `<input class="tag-chip-input">` sits inside the chip row. Pressing `Enter` or `,` commits the current input as a new tag (if non-empty and not already present). `Backspace` on empty input removes the last tag.
- Tags are normalized: trimmed, trailing commas stripped. Duplicates are silently ignored.
- Tags are saved when the user clicks **Save Changes** (same lifecycle as title, description, etc.).

### 24.2 Tag Display on Node Card

When a node has tags, a `.node-card__tags` row appears in the card's expanded details section (after param badges). Each tag is a `.node-tag` — small rounded chip, `9px`, muted text. Tags only appear in expanded state (same as params, description, meta row).

### 24.3 Tag Filter in Sidebar

When any node has at least one tag, a **Tags** filter group appears in the sidebar's filter area (below node-param filters, above edge-param filters). The filter shows an "All" chip and one chip per unique tag (sorted alphabetically). Clicking a tag chip filters the node list to only nodes that include that tag. Clicking "All" or the active chip clears the filter.

The tag filter state (`activeTagFilter: string | null`) resets when the active project changes — each tab remounts `AppInner` via `key={activeTab.id}`, so the sidebar (and its filter state) is recreated fresh. It participates in `hasAnyFilter` and thus triggers canvas dimming of non-matching nodes (same as param filters).

### 23.5 `Select Connected` Keyboard Shortcut
**What**: `H` key (when a node is selected and not editing text) to highlight that node's immediate neighbors — same as right-click → "Select Connected" but without the mouse.
**Why deferred**: The right-click menu (Phase 17.5) covers the use case. Keyboard shortcut is a nice convenience.
**Implementation note**: Add `h` key handler in `onKey`; read `selectedNodeId` from keyStateRef; call `handleFindRelated` if a node is selected.

---

## 25. Multi-Project Tabs

GloGraph supports multiple simultaneously open projects. Each project is fully isolated in its own SQLite database. A horizontal tab bar sits between the MenuBar and the BookmarkBar, always visible.

### 25.1 Tab Bar Layout

```
┌──────────────────────────────────────────────────────────┐  ← MenuBar
├─[ Project One ]──[ Project Two ▸ ]──[ + ]───────────────┤  ← Tab Bar
├──── Bookmarks ─────────────────────────────────────────────  ← BookmarkBar
│                                                            │
│                     Canvas                                 │
└────────────────────────────────────────────────────────────┘
```

- Each tab chip shows the project name.
- The active tab has a 2px accent-blue (`--accent`) bottom border applied via `::after`.
- The × close button is always visible on every tab. Closing the last tab sends the user to the Start Screen (no chrome, no tab bar).
- The `+` button opens the New Project dialog.
- Tab names truncate with ellipsis at a reasonable max-width rather than causing the bar to scroll.

### 25.2 Tab Interactions

| Interaction | Gesture | Result |
|-------------|---------|--------|
| Switch | Click an inactive tab | Activates that project; full UI remount for clean state |
| Rename | Double-click the tab name | Inline `<input>` appears; Enter commits, Escape cancels, blur commits |
| Close | Click × button | Closes immediately if the tab has no unsaved changes (`dirty` is false); otherwise opens the **Unsaved Changes** dialog (§25.9) |
| New project | Click + button | Opens New Project dialog |

A tab shows an amber **unsaved dot (●)** beside its name when its content **differs from its last
saved / opened state** (`dirty`) — not merely because "an edit happened." Any project change —
node/edge/region content, graph notes, bookmarks, or node-pin / region-lock-minimize toggles (all of
which travel in the export) — flips the dot on immediately; it clears on save **and** whenever the
content returns to that baseline, e.g. after undoing every change back to the saved state. The check is
a backend content-fingerprint comparison (see the *Dirty tracking* note in §25.10), so it's accurate
regardless of how the change was made.

Tab switching causes a **full React subtree remount** (via `key={activeTab.id}` on `SettingsProvider`). This resets graph state, undo history, selection, sidebar filters, and scroll position — a clean slate for every tab change. No tab-switching animation is needed; the remount is fast.

### 25.3 Per-Tab Isolation

- Each tab owns a dedicated SQLite database file: `AppData/GloGraph/projects/<uuid>.db`.
- Tab metadata (name, save path, display order, active tab ID) is persisted to `AppData/GloGraph/projects/tabs.json` and reloaded on every launch.
- Settings (presets, params, app settings) live inside each tab's own DB — they do not cross tabs.
- The HTTP API always operates on the **active tab**. There is no multi-tab API access.

### 25.4 New Project Dialog

- A modal with two fields: "Project name" (text input) and "Preset" (select dropdown).
- Preset options: **Blank** (default), Macro Economics, System Behavior, Knowledge Map, Project Tracker.
- Blank is listed first and selected by default — no parameters, empty schema.
- Enter submits the form. Escape cancels.
- Creating a project switches to the new tab immediately with the chosen preset active.
- No separate welcome/preset screen is shown after creation.

### 25.5 Per-Tab Save Path

- Each tab tracks its own `currentSavePath` (last `.glograph` file saved or opened for that project).
- Save path is persisted in `tabs.json` and restored on launch.
- **File → Save / Save…** and **File → Save As…** write only the active tab's project.
- Saving updates the active tab's save path; other tabs are unaffected.
- The "Save" / "Save…" label toggle (§16) is per-tab: each tab independently tracks whether a path is known.

### 25.6 Opening Files as Tabs

- Menu item: **File → Open Project…** (`Ctrl+O`) (was "Import Project…", "Import Graph…", "Open File as Tab…", previously "Load Graph…").
- Opens the file as a **new tab** (the active project is never replaced or touched) — **unless that
  file is already open in a tab**, in which case it simply **switches to the existing tab** instead of
  duplicating it. A project can be open in at most one tab. Path matching is canonicalised, and the
  existing tab is *not* re-imported, so any unsaved changes in it are preserved.
- The new tab's name is the filename without the `.glograph` extension.
- No confirmation dialog — the operation is non-destructive to all existing tabs.
- On error: `alert()` with the error message (same as other rare file-failure paths).

### 25.9 Closing Tabs with Unsaved Changes

Closing a tab must never silently lose work. The `window.confirm` that used to guard tab close is
replaced by a custom **Unsaved Changes** dialog (`CloseTabDialog`, built on the shared `<Modal>`):

- **When it appears:** closing a tab whose content **differs from its saved / initial baseline**
  (`dirty`). A **newly created** project starts from an *empty* baseline, so it prompts once you've added
  anything — and an empty, untouched new project closes with **no** dialog (it isn't different from its
  initial state). A project **opened** from a file starts clean and only becomes dirty on a real edit
  (content, notes, bookmarks, or pin/lock/minimize) — and goes **back to clean if you undo every change**.
  A tab with no unsaved changes — an opened or new project you haven't changed, or a saved project with
  nothing new — closes immediately with no dialog. (Closing an untouched never-saved tab, e.g. the
  first-launch default, also deletes its empty orphaned DB.)
- **Routing:** if the target tab isn't active, the app switches to it first, so the dialog and any
  Save target the correct project's DB.
- **Actions:** **Save** (writes to the linked file, or opens **Save As…** for a never-saved tab —
  cancelling that file dialog leaves the prompt open), then closes; **Don't Save** discards and
  closes; **Cancel** (or Escape / backdrop click) dismisses without closing.
- **Discard of a never-saved tab deletes its orphaned DB file** (`close_tab(deleteDb: true)`) — a true
  discard, no orphaned `<uuid>.db` left under `projects/`. A discarded *saved* tab keeps its file.

### 25.10 Quitting with Unsaved Changes (per-project prompt)

Closing the **window** must also not silently leave projects un-exported. `AppWithTabs` intercepts the
Tauri `onCloseRequested` event:

- If **no tab is dirty**, the close proceeds normally.
- If any tabs are dirty, it **`preventDefault()`s** the close and walks the dirty projects **one at a
  time** via the same `CloseTabDialog` in a `quitting` mode (title "Save before quitting?", shows
  "Project N of M"). For each: **Save** switches to that project's tab (so `save_graph_to_path` targets
  the right DB) and exports — Save As for a never-saved project, cancelling which leaves that prompt up;
  **Don't Save** skips it; **Cancel** aborts the entire quit (window stays open).
- After the last project is handled, the app calls `getCurrentWindow().destroy()` to actually close
  (requires the `core:window:allow-destroy` capability). `destroy()` — not `close()` — is used so a
  "Don't Save" (still-dirty) project doesn't re-trigger the close prompt in a loop.
- **No data is lost on "Don't Save":** each project's edits live in its own per-tab SQLite DB and
  reopen on next launch; the prompt is about writing the external `.glograph` file, so a never-saved
  project here is *not* deleted (unlike a single-tab discard, §25.9).

> **Dirty tracking (content-fingerprint model).** `TabEntry.dirty` (backend, session-only) means the
> project's content **differs from `TabEntry.saved_fingerprint`** — a stable hash of the *normalized*
> export captured at the last save / open / create (its clean baseline). The backend
> `recompute_active_tab_dirty` command sets `dirty = (saved_fingerprint != Some(current))`
> (`commands::graph::compute_fingerprint`). The fingerprint deliberately strips volatile bits — the
> `exportedAt` timestamp, the child-row UUIDs that `restore_*` regenerates on undo, and collection order
> — so **undoing edits back to the saved/initial state clears `dirty`**, instead of "an edit happened"
> sticking until the next save.
>
> The frontend keeps the dot responsive with a **hybrid**: it flips `dirty` on *instantly* on any change
> (optimistic, via `markDirty`), then a debounced (~400 ms) call to `recompute_active_tab_dirty` is the
> authority — it clears the dot when the content matches baseline (e.g. after undo) and confirms it
> otherwise. `useGraph.mutationSeq` (bumped by mutation methods, not by the initial load or `reload()`)
> drives the instant flip, so opening/loading never marks dirty on its own; external HTTP-API/SDK writes
> trigger a recheck through the reload path. A brand-new project's baseline is its empty seeded state, so
> it is born **clean** (not dirty) and only goes dirty once edited. Only the active tab is editable, so
> the frontend is the sole writer of any tab's flag.

### 25.7 First-Launch Migration

On the first launch after upgrading from a single-project version, the existing `glograph.db` file is copied to a new tab's DB file automatically. No data is lost and no user action is required.

### 25.8 Start Screen

When no tabs are open, GloGraph renders a standalone **Start Screen** instead of the normal app chrome (no MenuBar, no TabBar, no Sidebar, no DetailPanel).

**Layout:** A single framed panel centered on the `--bg` backdrop. The panel follows the workstation aesthetic:
- Panel header: standard toolbar gradient (`#3a3a3a → #282828`), 28px tall, accent-coloured `▪ GLOGRAPH` wordmark.
- Panel body: two side-by-side columns separated by a double-line bevel rule.

**Left column — Start:**
- **New Project** (amber primary gradient button) — opens the New Project dialog.
- **Open Project…** (default gradient button) — opens the system file picker to load a `.glograph` file as a new tab.

**Right column — Recent:**
- Lists the most recently closed projects (max 10, stored in `projects_dir/recent.json`).
- Open tabs that have a save path also appear at the top of the list, distinguished by an amber dot and immediately navigable by click (switches to that tab without re-loading from disk).
- Closed recent projects show a dim dot. Clicking loads the file via `open_path_as_tab`, which reads the file from disk, deserialises it as a `GraphExport`, and opens it in a new tab (or switches to it if that project is already open).
- **Unfound (missing) projects.** The backend flags a recent whose file no longer exists on disk
  (`get_recent_projects` computes `missing` per-read). A missing row renders non-clickable with a red dot,
  a strikethrough name, and a "Not found" badge.
- **Per-row Clear / Re-path actions** (right of each row):
  - **Clear** (✕) — on every recent (revealed on hover; always shown on missing rows). Removes the entry
    from recents (`remove_recent_project` rewrites `recent.json`) and drops it from the list. The file on
    disk is untouched — it only forgets the shortcut.
  - **Re-path** (folder-search icon) — on **missing** rows only. Opens a `.glograph` picker; the chosen
    file is opened via `open_path_as_tab` (recording the new path in Recents) and the stale entry is
    removed. On success the app switches to the new tab and the Start Screen unmounts.
- Empty state: uppercase muted "No recent projects" text.

**Aesthetic:** bevel borders on panel and buttons, 1px border radius, 10px/700 uppercase section labels, dense 4px grid spacing throughout. Matches `AESTHETIC_SPEC.md` exactly.

**Navigation:** The Start Screen is also reachable by closing all tabs. Creating or opening a project from this screen switches immediately to the canvas with full app chrome.
