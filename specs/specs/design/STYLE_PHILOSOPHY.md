# GloGraph — Style Philosophy & Design Principles

> The *why* behind the look. This is the canonical statement of GloGraph's visual identity
> and the principles every UI decision is measured against.
>
> - Concrete tokens, values, and the bevel/gradient/scrollbar/modal rules live in
>   **[AESTHETIC_SPEC.md](AESTHETIC_SPEC.md)** — that is the implementation reference.
> - The broader pattern catalogue lives in
>   **[industrial_workstation_ui_aesthetic_specification.md](industrial_workstation_ui_aesthetic_specification.md)**.
> - This document is the philosophy and the **binding rules** that govern new work.

---

## 1. The Thesis

> **The interface is a control panel, not a marketing surface.**

GloGraph is a workstation for thinking about how events relate — macro regimes, system
dynamics, knowledge structures, project dependencies. The operator is technical, returns daily,
and wants *information density and control*, not onboarding warmth.

The intended emotional response is **competence, control, technical authority, immersion** —
the feeling of operating an engineering tool. Explicitly **not** friendliness, softness, or
consumer polish.

If a choice would look at home in a modern SaaS dashboard (Linear, Notion, a Vercel landing
page), it is probably wrong for GloGraph.

---

## 2. Inspiration — and what each contributes

| Source | What GloGraph borrows |
|--------|------------------------|
| **Valve Hammer Editor / Source SDK** | Dense docked panels, beveled toolbars, the "level editor" feel — a canvas surrounded by inspectors. |
| **Classic Steam (2003–2008)** | Warm-neutral charcoal surfaces, gradient panel headers, structural borders over flat fills. |
| **Bloomberg Terminal / MetaTrader 4** | Maximum information per screen, monospace numeric readouts, persistent stat lines, keyboard-first operation. |
| **Audio workstations (Cubase, early Ableton)** | Compact controls, single-expand inspectors, immediate visual feedback on every parameter. |
| **Enterprise CAD / industrial control systems** | Functional (not emotional) hierarchy; the UI is instrumentation, surfaces read as screen-lit hardware. |

The era these tools come from assumed desktop-primary software, technical users, dense displays,
and efficiency over discoverability. GloGraph deliberately re-adopts those assumptions.

---

## 3. Core Principles

1. **Density over spaciousness.** A 4px base grid; 4–10px spacing, never 16–32px. Panels stay
   docked and persistent. Maximize usable information per screen without becoming unreadable.
2. **Structure through depth, not glow.** Raised elements use the 4-value bevel border
   (`hi lo lo hi`) over a **flat fill** (the app moved off gradients to a blockier flat look as of
   2026-06-01 — see AESTHETIC_SPEC §2); recessed elements use inset shadow. Soft glows,
   glassmorphism, and `backdrop-filter` are banned — depth is structural, like physical hardware.
3. **Warm-neutral charcoal, never blue-tinted.** Blue-grey darks read as web apps. The palette is
   pure/warm neutral; the one accent is amber `#d68b2a` (with industrial cyan `#00b0c8` secondary).
4. **Functional hierarchy.** Emphasis comes from contrast, weight, and the single amber accent —
   not color variety or size. Category colors encode meaning and are never reused for chrome.
5. **System fonts, screen-lit.** `Segoe UI`/`Tahoma` for UI; `Consolas`/monospace with
   tabular-nums for all data, counts, and timestamps. Web fonts (Inter, Geist) break the illusion.
6. **Hard edges.** Border radius is `0–2px` everywhere. No pills, no rounded cards.
7. **Keyboard-first, immediate feedback.** Every frequent action has a shortcut; every parameter
   change reflects on the canvas at once. Inline edits stage locally and commit on Enter/✓.
8. **Quiet by default, legible on demand.** Node cards are compact at rest and expand on hover;
   handles and action icons fade in. The canvas stays calm until the operator engages an element.

See AESTHETIC_SPEC's **Anti-Patterns** table for the banned-pattern → replacement list.

---

## 4. Binding Rules for New UI

These are **requirements**, not suggestions. They apply to every new component, page, dialog,
panel, or control added to GloGraph.

### 4.1 Everything matches the established style
- **Before building any UI, read [AESTHETIC_SPEC.md](AESTHETIC_SPEC.md) and this document.**
- New UI must use the existing **design tokens** (CSS variables) and shared classes — never
  hard-coded hex colors, ad-hoc radii, or one-off spacing. If a token is missing, add it to the
  token set; don't inline a literal.
- New UI must use the **bevel/gradient surface treatments**, the **10px industrial scrollbars**,
  the **type scale**, and the `0–2px` radius rule. A component that introduces an 8px radius, a
  soft drop-shadow card, a blue accent, or a web font is a defect, not a style choice.
- Reuse existing building blocks (`.btn`, `.icon-btn`, `.form-group`, `.settings-row`, the modal
  shell, etc.) before inventing new ones. Match the comment density and idiom of nearby code.

### 4.2 All modals share base behaviors
- Every dialog-class modal is built on the shared **`<Modal>`** component
  (`../../GloGraphDesktopApplication/src/components/Modal.tsx`), which owns the structural chrome and the behaviors **every modal
  must share**:
  - **Escape closes** the modal.
  - **Clicking the backdrop** (outside the panel) closes it.
  - A standard **`.modal-header`** with an uppercase title and a ✕ close button.
  - The standard `.modal-backdrop` → `.modal-panel`(`--sm`) surface treatment.
- Do **not** hand-roll a new backdrop/panel or re-implement Escape per modal. Use `<Modal>` and
  supply the body (`.modal-body`) and optional `.modal-footer` as children.
- The only sanctioned exceptions are the **command-palette overlays** (QuickFind, QuickConnect)
  and the **fullscreen media viewer**, which are intentionally bespoke; even these **must still
  close on Escape** — each registers its own document-level Escape listener (not just an input
  `onKeyDown`), so Escape-to-close is universal regardless of where focus sits.

> Rationale: consistency is itself part of the aesthetic. A workstation earns trust by behaving
> the same way everywhere — the same key always closes, the same surface always means "dialog."
