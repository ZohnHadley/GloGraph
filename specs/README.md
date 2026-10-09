# GloGraph Specifications

> **Moved (2026-06-07):** the spec documents now live in the workspace-level `specs/` folder, grouped into `design/`, `architecture/`, and `product/`. This index links to their new locations; this README stays here as a pointer.

All design and UX reference documents live in the workspace-level `specs/` folder (see links below).

| File | Purpose |
|------|---------|
| [HANDOFF.md](../../specs/architecture/HANDOFF.md) | **Start here** — complete implementation inventory, DB schema, architecture decisions, known gaps |
| [UX_SPEC.md](../../specs/design/UX_SPEC.md) | Interaction & UX principles (17 sections, Laws of UX) |
| [STYLE_PHILOSOPHY.md](../../specs/design/STYLE_PHILOSOPHY.md) | **The *why*** — design thesis, inspiration, principles, and the binding rules for new UI (style conformance + shared modal behaviors) |
| [AESTHETIC_SPEC.md](../../specs/design/AESTHETIC_SPEC.md) | Visual identity — concrete tokens, bevel/gradient/scrollbar/modal rules |
| [DESIGN_SPEC.md](../../specs/design/DESIGN_SPEC.md) | Component inventory, state architecture, backend reference |
| [ARCHITECTURE.md](../../specs/architecture/ARCHITECTURE.md) | Where derived logic lives — the pure Rust core-engine pattern, thin wrappers, parity fixtures, debugging |
| [API_SPEC.md](../../specs/architecture/API_SPEC.md) | The embedded HTTP REST API (endpoints, auth, the SSE event stream, trace) |
| [NODE_SPEC.md](../../specs/architecture/NODE_SPEC.md) | Node data model, settings system, display spec |
| [GRAPH_ITEMS_DESIGN.md](../../specs/architecture/GRAPH_ITEMS_DESIGN.md) | Design record — standalone note/image/video/audio "graph items" as node variants (nullable title + `kind`). **Implemented** (HANDOFF Phases 27–30) |
| [LIVE_SHARE_SPEC.md](../../specs/architecture/LIVE_SHARE_SPEC.md) | Real-time collaboration over LAN / self-host — host-authoritative design, presence, roles, transport, phasing. **Planned** (groundwork only) |
| [industrial_workstation_ui_aesthetic_specification.md](../../specs/design/industrial_workstation_ui_aesthetic_specification.md) | Source inspiration reference (Hammer Editor / Bloomberg aesthetic) |
| [PRICING_AND_GTM_SPEC.md](../../specs/product/PRICING_AND_GTM_SPEC.md) | Commercial layer — positioning, pricing/tiers, feature gating, landing page + go-to-market |
| [MARKET_POSITIONING_ANALYSIS.md](../../specs/product/MARKET_POSITIONING_ANALYSIS.md) | Investor-lens analysis of the "pick a customer / pivot to AI?" question — why booming ≠ reachable, the Obsidian-psychographic thesis, and what to measure before committing |
| [LAUNCH_POSTS.md](../../specs/product/LAUNCH_POSTS.md) | Ready-to-paste build-in-public + launch copy (X/Bluesky, Reddit, Show HN, Lobsters, Product Hunt, devlog) |

## Reading Order

**New to the codebase:** Read `HANDOFF.md` first — it has the complete picture in one place.

**Working on UI/UX (required reading before any new component):**
1. `STYLE_PHILOSOPHY.md` for the design thesis and the binding rules (style conformance + the shared `<Modal>` base)
2. `UX_SPEC.md` for interaction rules (sections 15–17 cover Graph Settings, Save/Load, and anti-patterns)
3. `AESTHETIC_SPEC.md` for visual implementation (section 12 covers modals and settings rows)

**Working on data model or backend:**
1. `HANDOFF.md` → DB Schema section
2. `NODE_SPEC.md` for node/edge field rules and settings system explanation
