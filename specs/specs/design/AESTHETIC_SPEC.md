# GloGraph — Aesthetic & Visual Identity Specification

> Reference for all visual design decisions. Every colour, spacing, surface treatment,
> and typography choice must feel like it belongs in a professional workstation application,
> not a SaaS product.
>
> **The *why* behind these rules — and the binding requirements for new UI — live in
> [STYLE_PHILOSOPHY.md](STYLE_PHILOSOPHY.md). Read it before building any new component.**
> In short: every new component, page, or control **must** reuse these tokens and surface
> treatments, and every dialog-class modal **must** be built on the shared `<Modal>` component
> (`../../GloGraphDesktopApplication/src/components/Modal.tsx`) so it inherits the shared base behaviors (Escape closes,
> backdrop-click closes, standard header).

---

## Source Inspiration

Classic Steam (2003–2008), Valve Hammer Editor, Bloomberg Terminal, MetaTrader 4,
Source SDK, audio workstations (Cubase, older Ableton), enterprise CAD tools.

Reference screenshots: `screen shots/examples/`

Core emotional response:
**Competence. Control. Technical authority. Immersion.**

Not: friendliness, softness, consumer warmth.

---

## 1. Colour Palette

### 1.1 Background Stack (darkest → lightest)

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#171717` | Canvas, deepest recessed layer, input backgrounds |
| `--surface` | `#212121` | Sidebar, detail panel — primary panel surface |
| `--surface-2` | `#2a2a2a` | Node cards, elevated controls |
| `--surface-3` | `#353535` | Hover states, active rows |

Palette is **neutral charcoal with no blue tint**. Blue-tinted dark palettes read as
modern web apps (GitHub, VS Code dark). The workstation aesthetic uses warm-neutral
or pure-neutral grays.

### 1.2 Bevel Border System

The bevel system is the defining structural signature of this aesthetic.
Every raised element uses 4-value `border-color`:

| Token | Hex | Role in bevel |
|-------|-----|---------------|
| `--border-hi` | `#6a6a6a` | Highlight edge — top and left of raised element |
| `--border-lo` | `#0c0c0c` | Shadow edge — bottom and right of raised element |
| `--border` | `#484848` | Flat border (non-bevel use) |
| `--border-strong` | `#585858` | Stronger flat border, handle fill |
| `--border-subtle` | `#1c1c1c` | Inset separators within panels |

**Raised element** (buttons, cards, toolbar, context menu):
```css
border: 1px solid;
border-color: var(--border-hi) var(--border-lo) var(--border-lo) var(--border-hi);
```

**Recessed element** (inputs, sunken panels, list scrolltrack):
```css
border-color: var(--border-lo) var(--border-strong) var(--border-strong) var(--border-lo);
box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.55);
```

**Double-line panel separator** (sidebar right edge, detail panel left edge):
```css
/* Sidebar */
border-right: 1px solid var(--border-lo);
box-shadow: inset -1px 0 0 var(--border-subtle), -2px 0 0 var(--border-hi);
```

### 1.3 Accent Colours

| Token | Hex | Use |
|-------|-----|-----|
| `--accent` | `#ffb000` | Selection, active state, focus, amber power indicator |
| `--accent-dim` | `#6e4c00` | Pressed/background for primary button |
| `--accent-2` | `#00b0c8` | Industrial cyan — secondary highlights |

### 1.4 Semantic Colours

| Token | Hex | Use |
|-------|-----|-----|
| `--danger` | `#c83030` | Destructive actions, errors |
| `--danger-dim` | `#4a1010` | Danger button fill |
| `--ok` | `#3d9e5f` | Confirmed states |
| `--warn` | `#c97a1a` | Warnings |

### 1.5 Text System

| Token | Hex | Use |
|-------|-----|-----|
| `--text` | `#d2d2d2` | Primary body, node titles |
| `--text-muted` | `#a0a0a0` | Labels, panel headings, meta |
| `--text-dim` | `#949494` | Ghost text, badges, dates, disabled |

> **Contrast bump (2026-06-07):** raised from `#cccccc` / `#888888` / `#7a7a7a` because muted/dim text
> was too close to the lighter surfaces (`--surface-2 #2a2a2a` / `--surface-3 #353535`) to read
> comfortably — dim fell below ~3:1 there. The three-tier hierarchy (dim < muted < text) is preserved.
> (`--text-dim` had already gone `#545454 → #7a7a7a` in an earlier pass; this continues it.)

No blue tint in text. Warm neutral grays read as screen-lit workstation output.

---

## 2. Gradient Surfaces

> **Updated direction (2026-06-01): flat over gradient.** GloGraph moved to a **blockier, flat-fill**
> look — chrome (toolbar, menubar, panel/region headers, menus, buttons, scrollbar thumbs, `<kbd>`)
> and graph elements (node cards, regions) now use **solid fills** instead of the top-to-bottom
> gradients below, with **square corners** on node cards and regions (`border-radius: 0`). Depth now
> comes from the **bevel borders** (the 4-value `hi lo lo hi` system) and tight shadows alone, not
> gradient. The gradient values below are retained as historical reference; new UI should use a flat
> fill (the element's lit/top tone) plus the bevel border.

Historically, panel headers, toolbars, and raised buttons used a subtle top-to-bottom gradient
to simulate physical depth — a trait of 2000s-era desktop applications.

**Standard panel gradient** (toolbar, sidebar brand, detail panel header):
```css
background: linear-gradient(to bottom, #3a3a3a 0%, #282828 100%);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);  /* top highlight */
```

**Button gradient** (default):
```css
background: linear-gradient(to bottom, #4a4a4a 0%, #363636 100%);
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 1px 2px rgba(0,0,0,0.4);
```

**Primary button** (amber):
```css
background: linear-gradient(to bottom, #db9700 0%, #916400 100%);
border-color: #ffb000 var(--border-lo) var(--border-lo) #ffb000;
```

Node cards use a softer gradient to keep the canvas readable:
```css
background: linear-gradient(to bottom, #2e2e2e 0%, #252525 100%);
```

**Region card header** is opaque and tinted by the region's own border colour, blended into a dark
base via `color-mix` so the light header text stays legible across any region colour:
```css
background: linear-gradient(
  180deg,
  color-mix(in srgb, var(--region-color, #484848) 42%, #1b1b1b),
  color-mix(in srgb, var(--region-color, #484848) 18%, #141414)
);
```
The region *body* stays translucent so the canvas and nodes behind it remain visible.

---

## 3. Typography

### 3.1 Font Stack

UI labels and body:
```css
font-family: 'Segoe UI', Tahoma, system-ui, sans-serif;
```

Data values, timestamps, numeric displays, count readouts:
```css
font-family: Consolas, 'Cascadia Code', monospace;
font-variant-numeric: tabular-nums;
```

`Segoe UI`/`Tahoma` are the system fonts of the reference-era workstation software
(Steam, Hammer, VS 2005). They carry the correct visual weight for this aesthetic.
Web fonts like Geist or Inter read as modern SaaS and break the illusion.

### 3.2 Type Scale

| Use | Size | Weight | Treatment |
|-----|------|--------|-----------|
| Panel / toolbar heading | 10px | 700 | Uppercase, 1–1.4px letter-spacing |
| Section / form label | 10px | 700 | Uppercase, 1px letter-spacing, `--text-dim` |
| Body / node title | 12px | 600 | Normal case |
| Secondary text | 11px | 400 | `--text-muted` |
| Meta / counts / dates | 10px | 400 | `--text-dim`, monospace tabular |
| Badge / category tag | 9px | 700 | Uppercase, 0.8px letter-spacing |
| Filter chip label | 9px | 700 | Uppercase, 0.6px letter-spacing |

---

## 4. Border Radius

| Element | Radius |
|---------|--------|
| Panels (sidebar, detail panel, toolbar) | `0` — hard-docked |
| Node cards | `2px` |
| Buttons | `1px` |
| Inputs | `1px` |
| Filter chips | `1px` |
| Context menus | `1px` |
| Scrollbar thumbs | natural — no explicit radius |

No `border-radius > 2px` anywhere. `--radius: 2px`, `--radius-sm: 1px`.

---

## 5. Spacing

| Context | Value |
|---------|-------|
| Toolbar height | 28px |
| Sidebar brand header height | 28px |
| Detail panel header height | 28px |
| Node list item min-height | 25px |
| Filter chip min-height | 20px |
| Button min-height | 22px |
| Panel body padding | 10px |
| Form group gap | 10px |
| Within form group | 4px |

4px base grid. The goal is maximum information density without becoming unreadable.

**Spacing tokens** (`:root` in `index.css`): `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`,
`--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`. New components should use these rather than
raw px. Two off-grid values are sanctioned for dense surfaces: **10px** (panel body padding) and **6px**
(tight insets/footers). The existing dense panels (`.detail-panel__body` 10px padding / 10px gap,
`.form-group` 4px gap) already conform; modals use 12px internally.

> **CSS file layout (Phase 66):** component styles live in `../../GloGraphDesktopApplication/src/styles/*.css` — one file per component
> area (sidebar, node-card, modal, settings, …). `../../GloGraphDesktopApplication/src/App.css` is a **barrel of `@import`s in cascade
> order** (order matters; it reproduces the original source order). `index.css` holds the tokens +
> base/reset. Add new component styles as a new file in `../../GloGraphDesktopApplication/src/styles/` and `@import` it at the right
> position in `App.css`.

---

## 6. Node Card

```
┌─────────────────────────────────────┐
│▌ [POLITICAL]         2022-06-15     │  ← 3px left stripe (category colour)
│                                     │     badge 9px/700/uppercase dim
│  Fed Rate Hike +75bps               │  ← title 12px/600
│  Powell signals front-loading...    │  ← desc 11px/muted
│                                     │
│  ⛓ 2  ▪ 1                          │  ← meta row, mono 10px dim
└─────────────────────────────────────┘
```

- **Left 3px stripe** = category colour indicator (not a top bar)
- Card has raised bevel border + gradient background + drop shadow
- Selected: amber `border-color + box-shadow` ring
- Width: 185–260px

---

## 7. Connection Handles

- All 4 handles are `type="source"` with `ConnectionMode.Loose` — any handle
  can initiate or receive a connection
- Always faintly visible at `opacity: 0.3`, increase to `0.65` on card hover
- On direct hover: fill with `--accent` amber, amber glow box-shadow, `opacity: 1`
- Size: `8×8px`
- Do NOT set `position: relative` on `.node-handle` — React Flow requires
  its own absolute positioning to place handles at node edges

---

## 8. Edges

| Property | Value |
|----------|-------|
| Default stroke | `#ffffff` — white, when no per-edge `color` is set (Phase 40) |
| Custom stroke | the edge's `color` hex override (EdgePanel → Edge Color), when set |
| Hover stroke | `filter: brightness(1.7)` on the `<g>` wrapping path + arrowhead |
| Selected stroke | `#ffb000` — amber accent |
| Colour application | set via inline `style={{ stroke }}`, **not** the `stroke` attribute, so it wins over React Flow's base `.react-flow__edge-path` CSS |
| Arrow marker | Custom inline SVG `<polygon>` per edge, angle computed from geometry |
| Stroke width (strength 1–3) | 0.8px |
| Stroke width (strength 4–7) | 1.5px |
| Stroke width (strength 8–10) | 2.5px |
| Waypoint path | smooth Catmull-Rom spline through the bend points (Phase 40); orthogonal mode stays right-angled |
| Hit area | 20px-wide transparent stroke path behind the visible path |

Selected edges show amber glow: `box-shadow: 0 0 0 1px var(--accent), 0 2px 12px rgba(255, 176, 0,0.3)` (node card selection ring, not edge itself).

**Waypoint handles** (rendered as HTML `div` via `EdgeLabelRenderer`, visible only when edge is selected and not captured):
- `24×24px` transparent drag target, centered on waypoint coordinates
- Visual dot: SVG `<circle r={5}>` with class `edge-handle` — filled amber, `pointer-events: none`
- Bezier CP handle: same circle, class `edge-handle edge-handle-bezier`
- Orthogonal bend handle: SVG `<rect 10×10px rx={2}>`, class `edge-handle edge-handle-ortho`
- Double-click on a waypoint dot removes it; click on the edge path between waypoints inserts one

**Captured edge** (both endpoints inside a locked region):
- Rendered identically to uncaptured, but all drag handles and the click-to-add strip are hidden
- Lock icon badge (`<Lock size={9}>`) rendered at edge midpoint, cyan (`--accent-2`), `opacity: 0.65`
- Waypoints visually follow the locked region drag via `regionDragOffset` context (no RF state mutation)

---

## 9. Scrollbars

Industrial scrollbars — thick, styled, visible structure:

```css
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: #141414; border-left: 1px solid var(--border-subtle); }
::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #4a4a4a, #383838);
  border: 1px solid; border-color: #555 #222 #222 #555;
}
::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #585858, #444); }
```

Thin 3px scrollbars are a modern SaaS pattern — banned here.

---

## 10. Canvas

- Background: `--bg #171717` — neutral near-black
- Dot grid: `#282828` — barely perceptible, just enough structure
- MiniMap: dark `#1a1a1a` background, `#484848` border
- Selection box: sharp corners (`border-radius: 0`), amber border, minimal fill opacity

---

## 11. Status Bar

```
[ filename ]  ·  [ 12 nodes · 8 edges · 2 regions ]  [ ↩ 3 unsaved ]  [ 87% ]
```

**Implemented** (`../../GloGraphDesktopApplication/src/components/StatusBar.tsx`, `.status-bar`) at the bottom of `.app__main`:
shows the active project's filename (or "Unsaved"), node/edge/region counts, an unsaved-undo
indicator, and the current zoom. Monospace, dense, top border — matches the toolbar treatment.

---

## 12. Modal Pattern (shared `<Modal>` base)

Every dialog-class modal is built on the shared **`<Modal>`** component (`../../GloGraphDesktopApplication/src/components/Modal.tsx`),
which owns the chrome below and the **base behaviors all modals share: Escape closes, backdrop-click
closes, and a `.modal-header` with title + ✕**. Adopters: Graph Settings, New Project, New Graph,
About, Close-Tab. The bespoke command palettes (QuickFind/QuickConnect) and the fullscreen media viewer
aren't built on `<Modal>`, but each registers its own document-level Escape listener so the
Escape-to-close behavior is universal.

Modals use a full-viewport dark backdrop with a centred panel. Rules:

```css
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.72);
  z-index: 1000;
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 48px;
}

.modal-panel {
  background: var(--surface);           /* #212121 */
  border: 1px solid;
  border-color: var(--border-hi) var(--border-lo) var(--border-lo) var(--border-hi);
  width: 600px; max-height: calc(100vh - 96px);
  display: flex; flex-direction: column;
}
```

- Modal header uses the standard panel gradient (`#3a3a3a → #282828`).
- Tabs are rendered as a flat row below the header. Active tab: amber bottom border +
  `--text` colour. Inactive: `--text-dim`.
- Modal body scrolls independently. Tab switching resets scroll to top.
- Close button (×) is always in the modal header top-right.
- Error messages appear in a `.modal-error` block below the tabs, not inline.

### Settings Row Pattern

Every editable item in the settings lists follows this structure:

```
[ ● colour swatch (if applicable) ]  [ label text ]  [ badge chip ]  [ action icons ]
```

- Rows use `display: flex; align-items: center; gap: 6px`.
- Action icons (Edit, Delete, Up/Down, Duplicate) are icon buttons that appear on row hover.
- Active/selected row gets amber left border (`border-left: 2px solid var(--accent)`).
- Inline edit mode replaces the label text with an input; no modal-within-modal.
- Color pickers appear inline below the row — a row of 12 hex swatches + hex input field.

---

## Anti-Patterns (Banned)

| Pattern | Replacement |
|---------|-------------|
| Blue-tinted dark palette (`#111418`, `#1a1d23`) | Neutral charcoal (`#171717`, `#212121`) |
| Flat single-color borders | Bevel borders (`border-color: hi lo lo hi`) |
| Flat button backgrounds | Gradient surfaces |
| `border-radius > 2px` on any element | `1–2px` max |
| Web fonts (Geist, Inter) as body font | `'Segoe UI', Tahoma` |
| Thin 3px scrollbars | 10px industrial scrollbars |
| Soft glow box-shadows | Structural bevel borders |
| Blue accent (`#58a6ff`) | Amber `#ffb000` |
| `position: relative` on `.node-handle` | Let React Flow control handle position |
| Glassmorphism, backdrop-filter | Hard opaque surfaces |
| Panel padding ≥ 16px | 10px max |
| Rounded pill filter chips | Rectangular `1px` radius |
| Consumer-app spacing (8px+ gaps) | Dense 4px grid |
| The `◈` glyph (banned project-wide) | `▪` (or another simple square marker) |
