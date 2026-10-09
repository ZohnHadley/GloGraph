# GloGraph — Architecture & maintenance conventions

Short, load-bearing rules for where logic lives and how we keep it from rotting.
Read this before adding any **derived/computed graph logic** (trace, future
propagation/analysis, layout heuristics, validation, etc.).

## The core-engine pattern (single source of truth)

Derived graph computations live **once**, as pure Rust in `../../GloGraphDesktopApplication/src-tauri/src/core/`:

- **Pure** — no SQLite, axum, or Tauri imports. Inputs are plain data, outputs are
  plain data. This makes the logic unit-testable without a running app and reusable
  by every caller.
- **Thin wrappers** call into it and stay boring:
  - a **Tauri command** (`../../GloGraphDesktopApplication/src-tauri/src/commands/…`) for the local desktop UI —
    in-process IPC, always available, works offline, **not** gated by the toggleable
    HTTP API;
  - an **HTTP handler** (`../../GloGraphDesktopApplication/src-tauri/src/http_api.rs`) for ../../GloGraphDesktopApplication/scripts/agents and the
    future remote/Live-Share clients.
- Both wrappers map their richer types (e.g. `GloEdge`) down to the engine's minimal
  input, call the engine, and return its result type **verbatim** (one serialized
  shape for all callers).

The desktop UI must **not** reimplement engine logic in TypeScript, and must **not**
depend on the HTTP API for core features (it can be switched off in Preferences).
It reaches the engine through the Tauri command via `../../GloGraphDesktopApplication/src/lib/api.ts`.

### The one allowed duplicate: the web demo

The demo (`glograph.com/demo`) is the real UI compiled to the browser with **no Rust
backend** — an in-memory JS runtime (`../../GloGraphDesktopApplication/src/demo/runtime.ts`) shims `invoke()`. So the
demo necessarily contains a JS mirror of engine logic (e.g. `../../GloGraphDesktopApplication/src/lib/trace.ts`). This
copy is **quarantined to the demo sandbox** (capped, single-user, marketing) — it is
not the desktop UI's code path. Keep it as thin as possible and pin it (below).

> Long-term, if a browser-based or collaborative client becomes first-class, the way
> to collapse this last duplicate is to compile the Rust core to **WASM** and have JS
> load it. Overkill today; revisit when the engine is large *and* web is first-class.

## Parity fixtures (drift = failing test)

Any logic that exists in both Rust and the demo JS is pinned by a **shared fixture**
under `../../GloGraphDesktopApplication/tests/fixtures/` (e.g. `trace_cases.json`: inputs → expected output). The same
file is asserted by:

- the Rust core test (`#[test]` in `../../GloGraphDesktopApplication/src-tauri/src/core/<engine>.rs`), and
- the vitest mirror test (`../../GloGraphDesktopApplication/src/lib/<engine>.test.ts`).

So the two engines cannot diverge silently. **A reported bug becomes a new fixture
case** — that's simultaneously the repro and the permanent regression guard.

## Debugging

- Set `GLOGRAPH_DEBUG=1` before launching to make the trace command/endpoint log
  `seed / direction / reached / maxHop` to stderr. Add the same gated `eprintln!` to
  new wrappers; keep the pure core silent (it's tested directly instead).
- Reproduce engine bugs by adding the offending inputs to the fixture and running
  `cargo test core::` / `npx vitest run`, not by clicking through the app.

## Forward-compatibility (for Live Share)

Live Share will make the Rust host authoritative and clients thin — exactly the shape
above. To keep older/newer clients compatible:

- Response shapes are **additive only**: add fields, never repurpose or remove.
- Keep wrappers thin; put any new behaviour in the core so all clients inherit it at
  once.

## Where things are

| Concern | Location |
| --- | --- |
| Pure engines | `../../GloGraphDesktopApplication/src-tauri/src/core/` |
| Tauri command wrappers | `../../GloGraphDesktopApplication/src-tauri/src/commands/` |
| HTTP wrappers | `../../GloGraphDesktopApplication/src-tauri/src/http_api.rs` |
| Frontend → backend seam | `../../GloGraphDesktopApplication/src/lib/api.ts` (`invoke`) |
| Demo JS runtime / mirrors | `../../GloGraphDesktopApplication/src/demo/runtime.ts`, `../../GloGraphDesktopApplication/src/lib/*.ts` |
| Parity fixtures | `../../GloGraphDesktopApplication/tests/fixtures/` |
