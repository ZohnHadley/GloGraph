# GloGraph

A local-first desktop workstation for building **typed relational and causal graphs**: a way to map how
events, concepts, systems, and tasks connect, and to question those connections later. It is
general-purpose. A node can be any entity (a service, a person, a concept, an event, a task) and an edge
any classified relationship between them. The built-in presets are example starting templates, not the
foundation: the schema bends to your domain through a per-project preset and parameter system.

Status: **beta** (v0.9.x). The core is complete and stable; some collaboration features are still
landing. See [`../specs/architecture/HANDOFF.md`](../specs/architecture/HANDOFF.md) for the full build log.

---

## What it is

- A diagram remembers nothing. GloGraph remembers. Instead of a static drawing, your graph is structured,
  typed data you can filter, search, trace, script, and export.
- **Local-first.** Everything lives in SQLite on your machine. No account, no cloud, no telemetry. Each
  project is its own database file.
- **Scriptable.** An embedded HTTP API (loopback-only) and a zero-dependency Python SDK let scripts and AI
  agents read and build graphs. There is also an optional MCP server.
- **Honest about what it does.** The impact-trace overlay maps relationships (multi-hop reachability over
  your directed edges). It does not simulate or predict.

### Example domains (the built-in presets)

Each project picks a preset, which defines the fields available on nodes and edges. The five bundled
presets are examples you can use as-is, edit, or replace:

| Preset | For |
| --- | --- |
| System / architecture map | Services, datastores, dependencies, and "what breaks if X goes down" |
| Macro Economics | Events, regimes, and causal chains across asset classes |
| System Behavior | Stocks, flows, feedback loops, and dynamic behavior |
| Knowledge Map | Concepts, claims, evidence, and how they relate |
| Project Tracker | Tasks, features, bugs, and dependencies |

Bundled `.glograph` example files live in [`demos/`](demos/).

---

## Key features

- Typed nodes and edges with a fully customizable, per-project **preset / parameter system** (text,
  number, boolean, select, and color-select fields; flags that drive edge arrow, style, color, and width).
- Node **regions**: resizable labelled rectangles that group, lock, minimize, and nest.
- **Graph items** as node variants: standalone notes, images, video, and audio.
- A dense, keyboard-first canvas (React Flow): drag-to-connect, multi-select, auto-wire, auto-layout
  (dagre), three edge routing modes with draggable waypoints, bookmarks, quick-find, and focus mode.
- Full **undo / redo** for every mutation.
- **Multi-project tabs**, each an isolated database, with save/load to a portable `.glograph` file.
- **Impact trace**: an ephemeral, topology-only reachability overlay (downstream/upstream) from any node.
- Exports: PNG, CSV, Mermaid, and Graphviz DOT.
- Optional **semantic search** over your nodes via a pluggable, OpenAI-compatible embeddings endpoint
  (off by default; ships no model).
- A workstation aesthetic (dense docked panels, beveled chrome, warm-neutral charcoal, amber accent).
  See [`../specs/design/STYLE_PHILOSOPHY.md`](../specs/design/STYLE_PHILOSOPHY.md).

---

## Architecture

GloGraph is a [Tauri](https://tauri.app) app: a React + TypeScript frontend over a Rust backend, talking
to SQLite.

- **Frontend** (`src/`): React 19, TypeScript, Vite, and [React Flow](https://reactflow.dev)
  (`@xyflow/react`) for the canvas. The entire data layer is reached through a single `invoke()` seam
  (`src/lib/api.ts`).
- **Backend** (`src-tauri/`): Rust with `rusqlite` (bundled SQLite). Tauri commands handle the desktop
  UI; an embedded [axum](https://github.com/tokio-rs/axum) HTTP server provides the automation API.
- **Core-engine pattern.** Derived graph logic (impact trace today; more later) lives once as pure Rust
  in `src-tauri/src/core/`, with thin Tauri-command and HTTP wrappers. The desktop UI never reimplements
  it. Parity with the web demo's JS mirror is pinned by shared fixtures in `tests/fixtures/`. See
  [`../specs/architecture/ARCHITECTURE.md`](../specs/architecture/ARCHITECTURE.md).
- **Web demo.** `glograph.com/demo` is this exact frontend compiled for the browser, with the Tauri
  modules aliased to in-memory shims (`src/demo/`). It is the real app, not a look-alike.

### Tech stack

React 19, TypeScript 5.8, Vite 7, `@xyflow/react` 12, `@dagrejs/dagre`, `lucide-react`, `html-to-image`
on the frontend; Tauri 2, `rusqlite` (bundled SQLite 3.45), `axum` 0.8, `tokio`, `serde` on the backend.
Tests with Vitest and `cargo test`.

---

## Project structure

```
src/              React + TypeScript frontend (canvas, panels, hooks, contexts, pure libs)
src/demo/         In-browser shims + runtime for the web demo
src-tauri/        Rust backend
  src/core/       Pure derived-graph engines (e.g. impact trace) - single source of truth
  src/commands/   Tauri command wrappers (nodes, edges, regions, settings, graph, tabs)
  src/http_api.rs Embedded axum REST API + Live Share session server
  src/db.rs       SQLite schema, migrations, and built-in preset seeding
demos/            Example .glograph files (one per preset)
sdk/python/       Zero-dependency Python client + runnable recipes
mcp/              Model Context Protocol server (Python sidecar; not part of the app)
tests/            Live HTTP-API tests, scale harness, manual-QA checklist, parity fixtures
scripts/          Build/deploy helpers (site deploy, OG image render, demo generator)

../specs/         Design, UX, architecture, and API specifications (start with architecture/HANDOFF.md)
                    — workspace-level sibling, grouped into design/, architecture/, product/
../website/       Marketing site + the built web demo (deploy artifact) — workspace-level sibling
```

> The `specs/` and `website/` folders now live at the **workspace root** (one level above this app
> directory), as siblings of `GloGraphDesktopApplication/`. Build/deploy scripts that target them
> (`scripts/deploy-site.mjs`, the `vite --mode demo` output dir) reference them by their new paths.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ and npm
- The [Rust toolchain](https://rustup.rs)
- Tauri's platform prerequisites (a system webview and build tools). See the
  [Tauri prerequisites guide](https://tauri.app/start/prerequisites/).

### Develop

```bash
npm install
npm run tauri dev      # launches the desktop app with hot reload
```

### Build

```bash
npm run tauri build    # produces a per-OS installer (MSI/NSIS, DMG, AppImage/deb)
```

`npm run build` type-checks and builds the frontend bundle only; `npm run build:demo` builds the
browser web-demo into `../website/demo/`.

---

## Automation: HTTP API, Python SDK, MCP

GloGraph exposes a local REST API for scripting and for letting AI agents read and build graphs.

1. Enable it in the app: **Preferences -> API -> Enable**, optionally set a bearer token. It binds to
   `127.0.0.1:57321` only.
2. Drive it with the bundled Python client:

```python
from glograph import GloGraph

g = GloGraph(token="...")                 # token optional
g.create_project("Q3 Risk Map", preset="macro economics")
a = g.nodes.create(title="CPI 9.1%", x=0, y=0, params={"Domain": "Economic"})
b = g.nodes.create(title="Fed +75bps", x=300, y=0, params={"Domain": "Economic"})
g.edges.create(source_id=a["id"], target_id=b["id"], params={"Relationship": "Caused By"})
print(g.trace(a["id"]))                   # impact trace: what this leads to
```

- The SDK and runnable recipes (including an idempotent CSV-to-graph sync) are in
  [`sdk/python/`](sdk/python/). Full endpoint reference: [`../specs/architecture/API_SPEC.md`](../specs/architecture/API_SPEC.md).
- An MCP server that exposes memory-shaped tools (`remember`, `relate`, `recall`, `trace_impact`, ...) is
  in [`mcp/`](mcp/).

---

## Testing

| Suite | Command |
| --- | --- |
| Rust unit/integration | `cargo test --manifest-path src-tauri/Cargo.toml` |
| Frontend unit (Vitest) | `npm test` |
| HTTP API (against a running app) | `python tests/api_smoke_test.py` |
| Backend scale harness | `python tests/api_scale_test.py` |
| Manual GUI checklist | [`tests/MANUAL_QA.md`](tests/MANUAL_QA.md) |

---

## File format

Projects save to a portable, human-readable JSON `.glograph` file (current version **8**; the backend
accepts versions 3 through 8). It contains the preset schema, nodes, edges, regions, and project-level
state (bookmarks, notes). Older files load unchanged.

---

## Documentation

All design and reference documents live in [`../specs/`](../specs/). Start with:

- [`../specs/architecture/HANDOFF.md`](../specs/architecture/HANDOFF.md) - the complete implementation inventory and build log.
- [`../specs/architecture/ARCHITECTURE.md`](../specs/architecture/ARCHITECTURE.md) - where derived logic lives and the parity-fixture rule.
- [`../specs/design/UX_SPEC.md`](../specs/design/UX_SPEC.md), [`../specs/design/STYLE_PHILOSOPHY.md`](../specs/design/STYLE_PHILOSOPHY.md),
  [`../specs/design/AESTHETIC_SPEC.md`](../specs/design/AESTHETIC_SPEC.md) - interaction and visual rules (required reading
  before any UI work).
- [`../specs/architecture/NODE_SPEC.md`](../specs/architecture/NODE_SPEC.md), [`../specs/architecture/API_SPEC.md`](../specs/architecture/API_SPEC.md) - data model and
  HTTP API.

---

## License

GloGraph is a commercial application, currently in beta. Proprietary; all rights reserved.
