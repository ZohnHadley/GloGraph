# GloGraph — Graph Items (Note / Image / Video / Audio) Design Note

> **Status: IMPLEMENTED (2026-06-01).** This is the design decision record for the "new graph
> items" idea (standalone notes, images, videos, and audio that connect to each other and to
> nodes). The approach and the four design decisions (§10) are settled; **all four build phases
> (§11) shipped** as HANDOFF Phases 27–30. Cross-references: [NODE_SPEC.md](NODE_SPEC.md) (data model),
> [UX_SPEC.md](../design/UX_SPEC.md) §12/§17 (canvas + element behavior), [HANDOFF.md](HANDOFF.md)
> (architecture), [API_SPEC.md](API_SPEC.md) (HTTP surface).

---

## 1. The idea (as requested)

> "Add new *graph items* like notes, image, video and audio which would all be separate from a
> node but will all be able to connect with each other and with nodes; they would all have
> nullable titles."

The goal: drop a freeform **note**, **image**, **video**, or **audio** onto the canvas as a
first-class thing you can **wire into the graph** (edges to/from nodes and to/from each other),
without forcing it to be a full typed node with a required title.

---

## 2. Recommendation (the verdict)

**Build these as *node variants* — a typed `kind` on the existing node — not as four new
element types.** Concretely: one new `nodes.kind` discriminator (`standard | note | image |
video | audio`) plus a **nullable/empty-allowed title**, with the card renderer branching on
`kind`. Do **not** introduce new tables, new CRUD command sets, or a new element class per type.

**Why this works and the "four new types" approach does not:**

| Concern | Node variants (recommended) | Four separate element types |
|---------|------------------------------|------------------------------|
| **Edges between items** | Free — edges already FK `nodes(id)` and every item *is* a node | Requires a **polymorphic edge endpoint** (source/target could be node/note/image/…), which breaks the clean `FOREIGN KEY → nodes ON DELETE CASCADE` and the cascade cleanup |
| **Region membership / locking** | Free — `isNodeInRegion` (center-point) and the container hierarchy already operate on nodes | Must re-derive membership geometry, lock ownership, and the minimize remap for each new type |
| **Undo / redo** | Free — `restore_node` already round-trips links + media + param values | New `restore_*` per type, new history entries |
| **Copy / paste / duplicate** | Free — `handlePaste` already clones nodes incl. media | New clone paths per type |
| **Export / import** | One additive `kind` field (v6); `#[serde(default)]` keeps old files loading | New top-level arrays in `GraphExport`, new import remap branches |
| **HTTP API + SDK** | Free — `/api/nodes` already serves them | New route groups, new SDK resources |
| **Graph-object class hierarchy** | They stay `NodeObject` — no new class | New `GraphObject` subclasses + every `partitionIds`/`resolveObject` call site updated |

A "note" is already *a node with only a description*; an "image/video/audio item" is already
*a node with one `node_media` row and `showOnCard = true`*. The data model supports ~90% of this
today. The proposal is mostly **a display variant + a nullable title + creation affordances** —
not a new subsystem.

---

## 3. Data model changes

### 3.1 `nodes.kind` discriminator

```sql
-- Guarded, idempotent ALTER on startup (same pattern as is_pinned / z_order):
ALTER TABLE nodes ADD COLUMN kind TEXT NOT NULL DEFAULT 'standard';
```

- Values: `'standard' | 'note' | 'image' | 'video' | 'audio' | 'file'`.
- Rust `GloNode` gains `kind: String` with `#[serde(default = "default_kind")]` (returns
  `"standard"`); TS `GloNode.kind?: NodeKind`. Existing rows and older `.glograph` files default
  to `standard` — fully backward-compatible.

### 3.2 Nullable title — use empty-string semantics, do **not** rebuild the table

The DB column is `title TEXT NOT NULL` (no default). SQLite cannot cheaply drop `NOT NULL`
(needs a 12-step table rebuild). Instead:

- Keep the column `NOT NULL`, allow **empty string** (`''`) to mean "untitled", and add a column
  default so inserts can omit it:
  `ALTER TABLE` is not needed for the type, but seed callers may pass `''`.
- The TS type can stay `title: string` (empty allowed). The *concept* of "nullable title" is
  satisfied by empty-as-untitled, with a **display fallback** everywhere a title is shown (§4).
- This avoids a destructive migration and keeps `title` non-null for all existing query/sort code.

### 3.3 What each variant stores (no new storage)

| Kind | Primary content | Storage (existing columns/tables) |
|------|-----------------|------------------------------------|
| `note` | Freeform multiline text (plain) | `description` (title optional) |
| `image` / `video` / `audio` | One media item | a single `node_media` row, `show_on_card = 1` (title = optional caption) |
| `standard` | Unchanged | as today |

A variant is a *presentation + default-fields* contract over normal node storage. Nothing stops a
note from also carrying media, or an image item from carrying params — `kind` only drives the
default card layout and the creation flow.

---

## 4. Nullable-title impact (display fallback sites)

Every place that assumes a non-empty `title` needs an "untitled" fallback. Audit:

| Site | File | Current | Needed |
|------|------|---------|--------|
| Node card | `NodeCard.tsx` | renders `data.title` as the always-visible line | For media kinds, lead with the media and treat title as an optional caption; for notes, lead with the text; if title empty and no content, show a muted "Untitled" |
| Sidebar list | `Sidebar.tsx` | shows title | Fallback label (e.g. "Untitled note", first line of description, or media label) |
| Quick-Find (`/`) | `QuickFindDialog.tsx` | searches/labels by title | Same fallback; still searchable by description / media label |
| Mermaid export | `App.tsx` ~L1698 | `node["${sanitize(node.title)}"]` | Must not emit an empty label — fall back to a derived label or the id |
| DOT export | `App.tsx` ~L1714 | `[label="${sanitize(node.title)}"]` | Same |
| CSV export | `App.tsx` ~L1542 | already `n.title ?? ''` | OK (null-safe) |
| Window/tab titles | — | use project name, not node title | No change |

Recommended single helper: `nodeDisplayLabel(node): string` returning
`title || firstMediaLabel || firstLineOfDescription || 'Untitled <kind>'`, used by all display
sites so the fallback is consistent.

---

## 5. Rendering (NodeCard variants)

Branch the card body on `kind` while keeping the shared chrome (stripe, handles, selection,
meta row, pin):

- **`note`** — text-first card. Description (or a dedicated note body) is shown even at rest
  (these exist to be read), title optional above it. No category badge by default.
- **`image` / `video` / `audio`** — media-first card. The single media item fills the card
  (reusing `ImageMedia` / `VideoMedia` / `AudioPlayer` — including the duplicate-playback fix and
  volume control already in place); title renders as a small optional caption. The media is
  **intrinsic and non-removable** (edit/replace the source, but the field can't be deleted). With
  **no source yet**, image/video show a recessed placeholder glyph and audio shows a **disabled**
  player (play disabled until a source is set).
- **`standard`** — unchanged (compact-by-default, expand-on-hover).

Every item also shows a **per-kind glyph before its title** (StickyNote / Image / Film / Music2) so
it reads as its own element type at a glance.

**Further refinements (Phases 32–33):**
- **Inline note editing** — a note's body is edited directly on the card (commits on blur, undoable);
  no detail panel needed. **Enter editing** by double-clicking the body **or** clicking the title-row
  **edit (pencil) button**; a single click just selects the note. By default the body **renders markdown**
  (a per-note title-row toggle flips to raw text — see §5). `nodrag`/`nowheel` keep typing/scrolling from
  panning the canvas. (Phase 76 note: a plain `onDoubleClick` can't be used — clicking a note selects it
  and React Flow re-renders/reorders the node between the two clicks, so the second click (and even the
  native `dblclick` in some webviews) lands on the pane, not the note. The double-click is detected from
  two ordinary `click` events via a capture-phase **document** listener that arms on a click within the
  note's bounds and fires on a second click near the first — geometry, not the event target, so it
  survives the churn and works in WebView2. The pencil button is the reliable, discoverable path.)
- **Resizable image / video / note** — drag-to-resize via `NodeResizer`, persisted to nullable
  `nodes.width`/`height` (file format **v7**). Audio stays a fixed control bar. Region membership and
  element bounds use the actual size when set.
- **Blockier styling** — item and node cards use flat fills (weakened gradients) with square corners;
  notes are a flat warm "paper" tone, media tiles a flat dark frame.

The layout choice is **owned by the element subtype**, not the view: `NodeCard` calls
`nodeElementFor(data).cardLayout()` (→ `standard | text-first | media-first`) rather than switching on
`kind` itself (Phase 31). `NoteElement`/`ImageElement`/`VideoElement`/`AudioElement` subclass
`NodeObject` in `graphObject.ts`, so each object type is a distinct class that decides how it draws.

All variants keep the four connection handles, so **connecting them is identical to nodes** — this
is what satisfies "able to connect with each other and with nodes" for free.

**Items are always fully expanded.** Unlike standard nodes (compact-by-default, expand-on-hover),
note/media items do **not** collapse — both their primary content *and* the secondary details
(params/tags/meta) are shown at rest. The per-card "pin expanded" toggle is hidden for items (it
would be a no-op). Implemented purely in CSS via the `.node-card--note` / `.node-card--media`
modifiers (added to the always-expanded rule group).

---

## 6. Creation UX

Add entry points without disturbing existing ones (keep them preset-neutral and on-aesthetic):

- **Canvas right-click menu** — extend "Add node here" with "Add note here / image / video /
  audio here", placing the new item at the cursor (same `screenToFlowPosition` path as today).
- **Edit menu** — an "Add Item ▸" submenu mirroring the above, placing at **graph-view center**
  (reuse `viewportCenterNodePos()`).
- **Keyboard (optional, later)** — only if there's demand; the canonical shortcut list
  (UX_SPEC §14) should not balloon. Defer per Hick's/Miller's-law discipline.
- The **NodePanel** stays the single create/edit surface (it's already unified). For media kinds,
  the create flow opens with the media field surfaced first instead of the title.

---

## 7. What is inherited for free (no work)

Because items are nodes: **edges, edge params, region capture/lock/minimize, undo/redo,
copy/paste/duplicate, multi-select + auto-wire, sidebar filtering/search, the HTTP API + Python
SDK, and z-ordering** all work unchanged. This is the entire argument for the variant approach.

---

## 8. Export / file format

- Bump `.glograph` to **version 6**; `do_import` accepts **3–6**.
- The only new field is per-node `kind` (`#[serde(default = "default_kind")]`). v3–v5 files load
  with every node defaulting to `standard`. No new top-level arrays.
- Update [API_SPEC.md](API_SPEC.md) `POST /api/import` note (accepts 3–6) and the node shapes to
  mention `kind`.

---

## 9. Explicit non-goals (avoid scope creep)

- **No** `notes` / `images` / `videos` / `audios` tables.
- **No** polymorphic edge endpoints — every edge endpoint remains a node id.
- **No** new object classes in `graphObject.ts` — variants are still `NodeObject`.
- **No** rich-text editor for notes in v1 — plain multiline text (matches the workstation
  aesthetic and the existing description field). **Revisited (Phase 76, 2026-06-15):** notes now
  *render* a lean **markdown** subset, with a per-note toggle (default on) to switch back to raw
  text. The stored body is still **plain text** in `description` (no rich-text data model); only the
  display is styled. See HANDOFF Phase 76 + `lib/markdown.tsx`.

---

## 10. Settled decisions

These were confirmed by the owner (2026-06-01) and are now binding for the build:

1. **Note body → reuse `description`.** A note is a description-led node; no `note_body` column,
   no schema churn. The NodePanel description field is the note body.
2. **Media kinds carry exactly one media item.** An image/video/audio item holds a single
   `node_media` row (with optional caption) in v1. A multi-file "gallery" is explicitly deferred,
   not designed in now.
3. **Media-kind title defaults to empty (untitled).** No auto-fill from filename; the filename
   remains available as the media-label fallback inside `nodeDisplayLabel()` (§4).
4. **Note/media variants show no category/param badges by default.** They aren't "typed
   entities", so the card leads with content, not a badge. Users may still add params via the
   existing add-field flow; `standard` nodes are unchanged.

---

## 11. Suggested phased implementation

1. **Backend:** ✅ **Done (Phase 27, 2026-06-01).** `kind` column + guarded migration; `GloNode.kind`
   + `CreateNodeInput.kind` (Rust serde default + TS `NodeKind`); carried through `create_node`,
   `fetch_node`, `list_all_nodes`, `restore_node`, `do_import`, and both HTTP create paths; export
   bumped to v6 (accepts 3–6); import round-trip test asserts `kind` survives.
2. **Display fallback:** ✅ **Done (Phase 28, 2026-06-01).** Added `../../GloGraphDesktopApplication/src/lib/nodeDisplay.ts`
   (`nodeDisplayLabel`: title → media label → first description line → "Untitled <kind>"); routed
   NodeCard, Sidebar (list + most-connected stat), QuickFind, NodePanel header, and Mermaid/DOT
   exports through it. NodePanel no longer requires a title (label de-asterisked, validation
   relaxed) — empty titles are tolerated end-to-end. Unit test `nodeDisplay.test.ts` (6 cases).
3. **Card variants:** ✅ **Done (Phase 29, 2026-06-01).** `NodeCard` branches on `kind`: notes render
   the description text-first and media items render their single media-first, both as **always-visible
   primary content** (not hover-gated), with the hover-details suppressing the now-duplicate
   description (notes) / media loop (media kinds). Shared chrome (handles, stripe, title row, expand
   pin, fullscreen modal, audio/video pause-on-expand + volume) is reused unchanged via an extracted
   `renderMediaSlot`. New CSS: `.node-card--note`/`--media`, `.node-card__note-body`/`__note-empty`,
   `.node-card__item-media`. No badge shows by default (items carry no params). `standard` nodes
   render exactly as before.
4. **Creation UX:** ✅ **Done (Phase 30, 2026-06-01).** Canvas right-click adds "Add note / image /
   video / audio here" (placed at the cursor); the Edit menu adds flat "Add Note/Image/Video/Audio"
   entries (placed at graph-view center via `viewportCenterNodePos()`) — flat, not a submenu, since the
   MenuBar has no submenu support. Unlike a plain node (created on Save), an **item is created
   immediately and opened in the edit panel** (a media item needs a real node to attach its file to;
   mirrors `handleQuickConnect`), and is undoable. NodePanel auto-surfaces the right field: the
   description body for notes, and an auto-opened media picker slot of the right type for image/video/
   audio items.
5. **Docs/tests:** update NODE_SPEC (kind + nullable title), API_SPEC (v6 + kind), add a Rust
   import round-trip test asserting `kind` survives, and a frontend test for `nodeDisplayLabel`.

Each phase is independently shippable; after phase 1–2 the app already tolerates untitled nodes,
which is the riskiest change, before any new UI is exposed.
