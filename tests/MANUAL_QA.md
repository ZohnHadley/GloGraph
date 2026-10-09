# GloGraph — Manual QA checklist

A pre-release click-through. The automated suites (`cargo test`, `npm test`,
`tests/api_smoke_test.py`) cover the data layer and pure logic; this covers the
things only a human at the GUI can confirm. Target: ~20 minutes.

Mark each ☐ → ✅/❌. Note anything weird (console errors: open devtools with
`Ctrl+Shift+I`). Report ❌ items back with what you saw.

## Setup
- ☐ Launch with `npm run tauri dev`. Window opens **maximized**, no white screen.
- ☐ Start screen → **Open Project…** → `demos/macro-economics-demo.glograph`. Graph renders.

## A. New / changed this session (highest priority)
1. **Edge weight legend** — the Macro preset's *Strength* drives edge width.
   - ☐ A small **legend** appears **top-right** of the canvas naming the width param with 3 tiers + a min–max.
   - ☐ It disappears if you open Graph Settings → Edge Fields and clear the `drives_width` flag (then re-set it).
2. **Media reorder** — edit a node → Add field → add 2+ Image/URL media items.
   - ☐ Each saved media item shows **↑/↓** buttons; they're disabled at the ends.
   - ☐ Reordering updates the order in the panel **and** on the node card.
3. **API badge** — Preferences → API → toggle **Enable** on.
   - ☐ A small green-dot **`API`** badge appears **top-left** of the canvas immediately (no restart).
   - ☐ Toggle off → badge disappears. (Leave it **off** when done.)

## B. Core loop (regression)
4. ☐ Double-click empty canvas → node panel opens; add a node; it appears.
5. ☐ Hover a node → handles fade in; drag handle to another node → edge created, EdgePanel opens.
6. ☐ Single-click selects; double-click opens edit; Escape closes/deselects.
7. ☐ Drag a node → release → reload won't lose it (drag persists). Undo (`Ctrl+Z`) reverts the move; Redo (`Ctrl+Y`) reapplies.
8. ☐ Box-select several nodes; `W` auto-wires them; `Ctrl+C`/`Ctrl+V` pastes with offset.
9. ☐ Delete a node (`Del`) → its edges go too; `Ctrl+Z` restores node **and** edges.

## C. Regions
10. ☐ Right-click canvas → Add Region. Drag a node so its center is inside.
11. ☐ Lock the region (🔒) → drag the region → the member node follows.
12. ☐ Minimize (−) → contained nodes hide, crossing edges remap to the header; expand restores.
13. ☐ Lock + **Auto Layout** (Edit menu) → locked-region members stay put (don't scatter out).
14. ☐ Reload the project (close tab, reopen file) → lock/minimize/pin state persists.

## D. Sidebar / filters / search
15. ☐ Sidebar lists regions + nodes; clicking one selects + scrolls canvas (node flashes).
16. ☐ Filter chips: a param with >7 options shows a `+N` chip that expands/collapses.
17. ☐ Search filters the list live; non-matching nodes dim on canvas.

## E. Tabs / save / load
18. ☐ `+` new project (pick a preset) → new tab, switches to it.
19. ☐ Edit something → tab shows the amber unsaved ●. `Ctrl+S` → Save As → ● clears.
20. ☐ Open the **same** file again → switches to the existing tab (no duplicate).
21. ☐ Close a tab with unsaved changes → the Save/Don't Save/Cancel dialog (Escape cancels).

## F. Export / misc
22. ☐ File → Export as PNG / CSV → native save dialog → file written.
23. ☐ File → Copy as Mermaid / DOT → pastes valid text elsewhere.
24. ☐ `\` toggles focus mode (hides sidebar + panel); `/` quick-find; `R` cycles edge routing.
25. ☐ Status bar shows counts + zoom; no stray `console` errors during the run.

## G. Graph items (note / image / video / audio)
27. ☐ Right-click empty canvas → menu shows **Add note / image / video / audio here** between
    "Add node here" and "Add region here". Edit menu shows **Add Note/Image/Video/Audio**.
28. ☐ **Add note here** → a node is created immediately at the cursor and its edit panel opens with the
    **Description** body shown. Type text → Save → the card renders the text **text-first** at rest
    (no hover needed); an empty note shows a muted "Untitled note".
29. ☐ **Add image/video/audio here** → node created + panel opens on a **media picker slot** of that
    type. Pick a file/URL → Add → Save → the card renders the media **media-first** at rest. (Audio:
    the volume control + no-duplicate-on-expand from section A still apply.)
30. ☐ Items behave as nodes: drag a handle from a note to another node → edge created; box-select +
    `W` auto-wires them; `Del` removes; `Ctrl+Z` restores. An untitled item shows "Untitled <kind>"
    in the sidebar and Quick-Find (`/`).
31. ☐ `Ctrl+Z` right after creating an item removes it (create is undoable).

## Scale sanity (optional)
26. ☐ With the API enabled, run `python tests/api_scale_test.py` then reload the app on that
    project — note whether the **canvas** stays usable (pan/zoom/select) at 1.5k+ nodes. This is the
    one perf number the headless tests can't capture.

## H. Free-tier gating (license caps)

The caps live in `src-tauri/src/licensing.rs` and are enforced in the Rust backend. Only a human at
the GUI can confirm the limits actually fire and the messages/watermarks render.

> **Tier switch:** dev builds run as **Pro** by default, so the caps are invisible until you force the
> free tier. Launch the app as Free, then relaunch normally (or as Pro) for the Pro checks:
> - Free:  `$env:GLOGRAPH_TIER='free'; npm run tauri dev`   (PowerShell; `GLOGRAPH_TIER=free npm run tauri dev` on bash)
> - Pro:   `npm run tauri dev`  (default), or `$env:GLOGRAPH_TIER='pro'`

**Free tier** (launched with `GLOGRAPH_TIER=free`):
32. ☐ **Project cap (2).** With 2 projects open, click `+` / press `Ctrl+N` to make a 3rd → it's
    refused with a "free tier is limited to 2 open projects" message (a toast/error, not a crash or
    silent no-op). Closing one project then creating a new one works (back under the cap).
33. ☐ **Open-project cap + exemption.** With 2 open, File → Open Project… a 3rd `.glograph` → same
    refusal. Now File → Open Project… a file that is **already open** → it just switches to that tab
    (not blocked — re-opening an open file is exempt).
34. ☐ **Node cap (150).** In a project, grow it toward 150 nodes (add a few by hand, then box-select +
    `Ctrl+D` / `Ctrl+V` to multiply). The create that would make node 151 is refused with a "limited to
    150 nodes per project" message; the existing nodes are intact (no half-written/corrupt state).
35. ☐ **Opening a big file is allowed.** Open a `.glograph` that already has >150 nodes (e.g. one made
    in Pro mode, or via `python tests/api_scale_test.py` while Pro). It loads and you can pan/drag/edit
    it — only **creating new** nodes past 150 is blocked, not viewing your own file.
36. ☐ **API tab gated.** Preferences → Graph Settings → **API** tab shows the amber notice "The HTTP API
    and Python SDK are a Pro feature" and the **Enable API** checkbox is **disabled**. The on-canvas
    `API` badge never appears, and `curl http://127.0.0.1:57321/api/nodes` returns `503` (Pro feature).
37. ☐ **Watermarked PNG.** File → Export as PNG → the saved image has a small
    "Made with GloGraph Free · glograph.com" stamp in the bottom-right corner.
38. ☐ **Watermarked text exports.** Export as CSV → both `…-nodes.csv` and `…-edges.csv` end with an
    attribution row. Copy as Mermaid / Copy as DOT → the copied text includes a `%%` / `//` attribution
    comment line.

**Pro tier** (normal `npm run tauri dev`, or `GLOGRAPH_TIER=pro`):
39. ☐ **No caps, clean output.** Create a 3rd project and the 151st node freely. The API tab's
    **Enable API** toggle is active; enabling it makes the on-canvas `API` badge appear. PNG export has
    **no** stamp and CSV/Mermaid/DOT have **no** attribution line.

**Free tier — Live Share (continued):**
40. ☐ **Host + join gated.** On Free, the **Share** menu shows both **Host Session… (Pro)** and
    **Join Session… (Pro)** greyed out (disabled). On Pro, both are enabled. (Backend backstop for
    hosting: even if forced, `start_host_session` returns "Live Share hosting is a Pro feature." Joining
    has no guest-side backend command, so the menu is its enforcement point.)

**Release build (do once before shipping):**
41. ☐ **No dev backdoor.** In a real release build (`npm run tauri build`, then install/run it),
    `GLOGRAPH_TIER=pro` has **no effect** — the app runs as **Free** (caps active; API, hosting, and
    joining gated). The dev profile must be compiled out of the shipped binary (`#[cfg(debug_assertions)]`).
