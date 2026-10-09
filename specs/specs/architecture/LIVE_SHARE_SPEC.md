# Live Share — Specification

> Status: **planned / partial groundwork.** No networking is built yet. The identity layer and the
> host/join UI **stubs** exist (see "Built today" below); everything else here is the design to build
> against. Source of the original feature notes: the user's `Live Share ideas.txt` (now superseded by
> this document). Architecture rationale lives in [ARCHITECTURE.md](ARCHITECTURE.md); build status in
> [HANDOFF.md](HANDOFF.md) (Phases 46–47).

Live Share lets people **work together in real time on the same graph over a LAN or a self-hosted
server.** It is build-our-own (not VS Live Share / a SaaS), gated on demand and product maturity, so it
ships in phases and each phase must be useful on its own.

---

## 1. Architecture

- **Topology: host-authoritative.** One Rust backend owns the SQLite truth; others connect to it. On a
  LAN the host is a participant's machine; for self-hosting it is a dedicated box. Same code path. This
  matches the "authoritative Rust host, thin clients" pattern in [ARCHITECTURE.md](ARCHITECTURE.md).
- **Sync model: last-write-wins.** The host applies a mutation to SQLite and broadcasts it; SQLite is the
  arbiter. Good enough when people edit different things. (CRDTs are reserved only if offline-merge or
  true peer-to-peer ever becomes a hard requirement; that would be a large rearchitecture.)
- **Transport:**
  - **Mutations** ride the existing HTTP endpoints (clients POST/PATCH/DELETE).
  - **Change events** ride **Server-Sent Events** (`GET /api/events`, already built) so clients learn of
    others' edits.
  - **Presence** (live cursors, selections, viewports) needs a **WebSocket** per participant. Each client
    sends its own cursor at move-rate, which is the wrong shape for HTTP/SSE; one duplex socket is right.
    WebSocket is therefore adopted at the presence/editing phase, not before.
- **Security boundary:** today the API binds to `127.0.0.1` only. Network exposure (hosting) is a
  separate, explicit opt-in and is the part that requires a join token. The always-on **local** API and
  the **network host** are different concerns and must not be conflated.

---

## 2. Built today (groundwork)

| Piece | Where | Notes |
| --- | --- | --- |
| Display-name identity (required, no anonymous users) | `user_config.json`, `get/set_display_name`, `DisplayNamePrompt.tsx` | Global per-machine name. |
| Auto-generated usernames (`Name#1234`) | `../../GloGraphDesktopApplication/src/lib/username.ts` | Pre-filled, editable, regenerate. |
| Host/Join UI **stubs** | `App.tsx` Share menu, `HostSessionDialog.tsx`, `JoinSessionDialog.tsx` | No networking; `setSession(...)` is the seam. |
| Join token | `../../GloGraphDesktopApplication/src/lib/token.ts` (`generateJoinToken`) | Collected, **not enforced** yet. Host shares address + token. |
| Shareable LAN address | `get_lan_address` command | Shown read-only in the host dialog. |
| Live change-event stream | `GET /api/events` (SSE) | Reflects HTTP API writes **and now GUI edits** (Phase 1 part A: shared `events.rs` `EventBus` + a `publish_change` command the host UI calls, coalesced). |
| Demo gating | `../../GloGraphDesktopApplication/src/lib/env.ts` `IS_DEMO` | Share menu greyed out in the web demo. |

The two `setSession(...)` calls in `App.tsx` are the Phase-1 seams: host swaps in "start the host +
require token"; join swaps in "connect to address with token."

---

## 3. Shared mechanics

- **Live cursors.** Every participant sees everyone else's cursor in the **graph view and on the
  minimap**, drawn as labelled cursor sprites.
- **Per-user colour.** Each participant is assigned a stable colour on join, used for their cursor and
  their selection/active-edit highlight, so people are distinguishable at a glance.
- **Local-only save/export.** The host's project is the source of truth. Saving or exporting writes to
  the actor's **own machine only**; it never pushes a file to other participants. A permitted guest who
  saves is forking a local copy, not editing the host's file.

---

## 4. Host experience

### 4.1 Starting a session
The host explicitly activates the server from the UI (hosting is never automatic). At activation the host
sets, in `HostSessionDialog` (alongside the already-collected name + address + token):

- **Default role** for joiners: **read-only** or **editor** (see §6).
- **Restrictions**: whether others may **save a copy**, and whether others may **create new tabs**.

### 4.2 Session-users tab
While hosting, a **"Session users"** tab appears in the menu bar:

- Opening it shows a **modal listing all current participants** (name, colour, role, connection state).
- Clicking a participant **closes the modal and moves the host's view to that user's cursor** (jump-to-user).
- The host can **kick** a participant from the modal (removed until a new session is started).

### 4.3 Hiding tabs
A host can hide specific tabs from joiners: an **eye icon on each tab toggles its visibility** to other
participants. Hidden tabs do not appear in guests' tab bars.

---

## 5. Guest experience (non-host participants)

- **Presence + identity.** Their cursor (in their colour) shows to everyone on the canvas and minimap.
  They can open a read-only "who's here" participant list.
- **Follow mode.** Click a participant, or toggle **"Follow host"**, to lock their viewport to that
  user's pan/zoom (presenter / walkthrough mode). Panning themselves unlocks it. This is the guest mirror
  of the host's jump-to-user.
- **Always-visible role badge.** A persistent indicator: "Viewing · read-only" or "Editing". Disallowed
  actions are **greyed with a tooltip**, never a silent failure. Optional **"Request edit access"** that
  the host approves.
- **Private exploration for read-only guests.** Pan, zoom, filter, expand nodes, and run **impact trace**
  are local view-only actions: they never mutate shared state or disturb others.
- **Editor guests.** Edits broadcast live (last-write-wins). A soft **"X is editing this"** highlight
  (the other user's active node, in their colour) reduces collisions.
- **Undo/redo is per-user. ✅ Implemented** (§8 increment 6). In a shared session, **Ctrl+Z / Ctrl+Y only
  undo or redo your own operations, never anyone else's.** Each participant keeps their own operation
  history (the guest a `useHistory` stack of inverse/redo closures that route through `remoteWrite`; the host
  its existing local stack, which already holds only host ops because guest edits arrive as reloads). An undo
  emits the inverse op, the host applies it and broadcasts, everyone converges. **Exceptions:** node/edge
  **delete** aren't undoable yet (cascade / full reconstruct).
- **Save a copy** (only if the host allows it). Exports a snapshot to the guest's **own machine as a
  fork**, clearly labelled local; it never writes to the host's project.
- **Tab visibility.** Guests see only the tabs the host has not hidden. The host decides whether guests
  follow the host's active tab or may navigate the allowed tabs independently.
- **Awareness toasts.** "You joined as editor", "Host hid a tab", "Host ended the session" (with a
  graceful exit to the guest's local copy if they have one).
- **Leave and reconnect.** A clean "Leave Session" returns the guest to their own local workspace
  (already stubbed). If they drop, they can rejoin with the same address + token + name (pre-filled).

---

## 6. Permission model

- **Roles** (session-scoped, set by the host, can be per-user-overridable later):
  - **Read-only** — can view, navigate, filter, and trace; cannot mutate the graph.
  - **Editor** — can view and edit; edits broadcast.
- **Restrictions** (host toggles, before hosting): may guests **save a copy**; may guests **create tabs**.
- **Enforcement is host-side.** Roles and restrictions are enforced by the host's core/API (a read-only
  guest's mutation request is rejected by the server), not merely greyed in the UI. The UI greying is a
  courtesy; the server is the gate.
- The **join token** gates *entry*; the **role/restrictions** gate *actions* once inside.

---

## 7. Security

- **Off by default; explicit opt-in.** Hosting is never automatic. Local API default-on (loopback) does
  not imply network exposure.
- **Bind address is deliberate and visible.** Going from loopback to a routable LAN/public address is a
  conscious step shown to the host.
- **A join token is required** to enter a session (not optional, unlike the local API token). The host
  shares address + token; the joiner presents both.
- **Identity is required** — every participant has a display name; no anonymous connections.
- **Future:** view-vs-edit permissions (above), and per-session scoping.

### 7.1 Security hardening (2026-06-07 review)

A security pass over the Live Share + loopback-API surface (`http_api.rs`, `session.rs`) landed these:

- **Loopback API rejects browser cross-origin requests.** `auth_layer` 403s any request carrying an
  `Origin` header that isn't the Tauri webview's, *before* the diagnostics bypass — so a web page the
  user merely visits can't read their graph/tab paths or issue mutations against `127.0.0.1:57321`
  (localhost-CSRF / data-exfil). `CorsLayer::permissive()` was removed (no cross-origin reads even if a
  request slipped through). Programmatic clients (SDK/curl) send no `Origin` and are unaffected.
- **Guests can't whole-graph import.** `serve_session`'s editor role no longer mounts `POST /api/import`
  (a destructive replace-all that also swaps the preset schema) — so "everyone can edit" can't be used by
  one guest to wipe the host's project. Per-entity edits/deletes remain.
- **Constant-time token comparison** (`ct_eq`) in both `auth_layer` and `session_auth` — no timing
  side-channel on the API/join tokens.
- **Presence relay caps message size** (8 KB) so a peer can't amplify large payloads to everyone.
- **Stop = abort.** `stop_host_session` aborts the server task (rather than a graceful wait), freeing the
  LAN port immediately even with long-lived SSE/WS open, so an immediate re-host can't hit "address in
  use."

**TLS — DONE (2026-06-07).** The session is now encrypted end to end with a **self-signed cert + a
loopback bridge** (the webview can't trust a self-signed LAN cert, and there's no JS API to pin one):

- **Host serves HTTPS/WSS.** `start_host_session` generates a per-session self-signed cert for the LAN
  IP (`rcgen`, `src/tls.rs`) and `serve_session` runs over rustls (`axum-server`). The cert's SHA-256
  fingerprint is returned and shared with guests folded into the address as `ip:port#fingerprint`.
- **Guest loopback bridge** (`src/guest_bridge.rs`). The webview still speaks plain HTTP/WS, but to
  `127.0.0.1` (same machine — nothing to sniff). `start_guest_bridge` stands up a loopback reverse proxy
  that forwards HTTP + SSE (streamed, `reqwest`) and WS (`tokio-tungstenite`) to the host's HTTPS/WSS,
  with the host cert **pinned by fingerprint** (a custom rustls `ServerCertVerifier` that also verifies
  the handshake signature, so possessing the public cert isn't enough). The frontend transport
  (`remoteApi`, SSE, presence) is unchanged — `guestEndpoints` just points at the loopback base.
- **Trust model:** no CA; the fingerprint travels with the address out-of-band, so a MITM can't
  substitute a different cert. The cross-machine hop is encrypted; the join token no longer crosses the
  LAN in cleartext.
- **Validation:** unit-tested cert/fingerprint/pinning (`tls.rs` tests); the full proxy round-trip needs
  two-machine testing (single-instance lock prevents host+guest on one box).

- **Presence rides the bridge too (fix).** Since the session server is WSS, the host can't reach its own
  presence relay with plaintext `ws://` — so BOTH roles connect to `/ws` through the loopback bridge
  (`session.localBase`): the host bridges to its own server (`127.0.0.1:57400`), the guest to the host.
  Without this the host was off the relay, so cursors and the "N here" count broke for everyone.
- **Media over the session (verified, 2026-06-07).** Guests now SEE the host's file media — the host
  streams it via `GET /api/media/{id}/file` (read-only, both roles) and the guest renders file media from
  that endpoint through the bridge (`src/lib/remoteMedia.ts`) instead of its own asset protocol. Guests
  can also SET media to a URL (`POST/PATCH` with `srcType:url`) or upload a **local file** (`POST
  /api/nodes/{id}/media/file` add / `POST /api/media/{id}/file` replace → saved in the host's
  `projects/session-media/`). **Security:** a guest can never name a host file path — `post_node_media` /
  `patch_media_route` reject a guest-supplied `file` `src` (`state.presence.is_some()`), so file media
  only enters via the upload endpoints (host generates the path); otherwise a guest could read any host
  file back through `.../file`. Uploads cap at 64 MB. *v1 limits:* no HTTP range (large-video seeking
  refetches); replacing a file may show stale on other peers until reload (no per-version stream cache-bust).

- **Guest access UX (2026-06-07).** On join the guest reads its role from `GET /api/session` and the
  session banner shows a **View only / Editing** badge (`session.access`). A guest also health-pings the
  host through the bridge; when the host ends the session (forwarded ping fails ~3×) the guest is told
  *"The host ended the session"* and disconnected back to its own local workspace.
- **View-only is enforced client-side too.** The backend already rejects a read-only guest's writes (no
  mutation routes mounted), but the guest UI now also disables them so nothing appears-then-reverts:
  `readOnly = isGuest && access==='read-only'` turns off React Flow drag/connect + double-click create,
  swallows mutating keyboard shortcuts (`useKeyboardShortcuts`), and guards every create/save/delete/
  connect/auto-wire/media/link handler in `App.tsx`. Reads stay available — open panels, view/listen to
  media, filter, expand, and impact/cause trace.

- **Server-assigned presence identity (2026-06-07).** The relay (`relay_presence`) now assigns each WS
  connection a `conn_id` + colour and **stamps them onto every message** (overwriting client-claimed
  values), so a client can't impersonate another peer's cursor/selection. The client learns its id from a
  `{type:"welcome"}` frame (to drop its own echo) and no longer sends id/colour. Colour is deterministic
  (`presence_color`, mirroring the JS palette).
- **Shared selection (2026-06-07).** Each peer broadcasts its selected element ids (`sel`); peers render
  them in that peer's cursor colour. `usePresence` exposes `remoteSelections` (id→{colour,name}).
  Covers **nodes & regions** (ringed via `--remote-sel-color`, `.node--remote-selected` /
  `.region--remote-selected`), **edges** (tinted + thickened in `EdgeLine`, matching the real id past any
  `__remap` suffix), and **multi-select** — the broadcast is the union of the live React Flow selection
  (drag-box / shift / ctrl, nodes + edges, surfaced reactively via `handleSelectionChange`) and the
  single-select ids.

---

## 8. Phasing / roadmap

> **ARCHITECTURE UPDATE (0.9.6, "path A") — the guest runs the real editor.** As of build 0.9.6 a guest no
> longer renders a separate read-only/spectate component — it runs the **same `AppInner` base editor** as the
> host, with its data source pointed at the session host: `session` lifted to `SessionContext` (above
> `SettingsProvider`); `AppWithTabs` seeds `SettingsProvider` with the host's settings and mounts `AppInner`;
> `useGraph(graphApi)` is injected with `createRemoteApi(base, token)` (HTTP impl of the api graph surface);
> direct element-state writes route through `gapi`; presence covers host+guest; a guest SSE→`graph.reload()`
> (merged via `mergeById`) pulls others' edits; tab bar hidden + session banner shown. **`SpectateView` was
> deleted.** This made expand/pin/fields/z-order/per-user-undo all "just work" (one shared code path).
> Validated host↔guest on a real LAN (2026-06-04). The Phase-1/2 "spectate client" increments below are
> **historical** — the transport (CORS/mixed-content fixes §8.6), the editor-session routes, the optimistic
> `spectateSync` core, and presence all carried over; only the guest *view* changed from a mirror to the
> real editor. (HANDOFF Phases 58–60.)

- **Phase 0 — DONE.** Typed change-event stream (`GET /api/events` SSE). Identity layer + host/join UI
  stubs + join token + LAN address. Demo gating. (HANDOFF Phases 46–47.)
- **Phase 1 — connect the pipe.**
  - **DONE (part A):** Publish change events from the GUI mutation paths too, so GUI edits stream. A shared
    event bus (`events.rs` `EventBus`, Tauri-managed) + a `publish_change` command the host UI calls
    (coalesced) on any graph change, so `GET /api/events` now reflects GUI edits, not only HTTP-API writes.
  - **DONE (part B1a):** the host's gated **LAN session server**. Starting a session spins up a SECOND
    server (`http_api::serve_session`) bound to `0.0.0.0:57400`, **token-gated** (`Authorization: Bearer`
    or `?token=`), **read-only** (only `/api/ping` + `/api/graph` + `/api/events`), sharing the host's
    PmState + event bus (so spectators see GUI edits via part A). Lifecycle in `session.rs`
    (`start_host_session` / `stop_host_session`, graceful shutdown via a `watch` channel). The host dialog
    "Start hosting" now actually starts it; the banner/menu Stop tears it down; `get_lan_address` points at
    the session port. The loopback API stays loopback-only (separate concern).
  - **DONE (part B2):** the read-only **spectate client** (`../../GloGraphDesktopApplication/src/components/SpectateView.tsx`). A guest
    session replaces the local app with a read-only mirror: it `fetch`es `http://<addr>/api/graph` (with
    the Bearer token) and renders it via the normal `GraphCanvas`, wrapped in a `SettingsProvider` **seeded
    with the host's settings** (new `seed` prop) so colours/params/regions render correctly. It subscribes
    to the host's `GET /api/events` via `EventSource` (token as `?token=`) and refetches (debounced) on each
    change, so it mirrors the host's edits **live**, including GUI edits (via part A). Read-only: all
    `GraphCanvas` editing handlers are no-ops and every node is pinned (non-draggable); local keyboard
    shortcuts are suppressed while spectating. Works because the webview CSP is `null` (remote `http://`
    fetch/`EventSource` allowed). **Phase 1 is now an end-to-end thread: host shares → guest watches live.**
  - **Caveat:** the desktop single-instance lock means host+guest can't both run on one machine; a real
    test needs two machines (or two GloGraph instances) on the same LAN.
- **Phase 2 — collaborative editing + presence.**
  - **DONE (increment 1): presence cursors.** A WebSocket relay `GET /ws` on the session server
    (`http_api::ws_presence`/`relay_presence`, token-gated, `AppState.presence`) rebroadcasts each peer's
    message to the others. `../../GloGraphDesktopApplication/src/lib/presence.ts` `usePresence` connects (host → its own loopback session,
    guest → the remote host), throttle-sends the local cursor in **flow coords**, drops its own echo by id,
    and prunes stale peers. `GraphCanvas` draws remote cursors via `ViewportPortal` (counter-scaled by zoom
    so they stay constant size) with per-user colours, and captures the local cursor over the canvas. Wired
    on both the host canvas (AppInner) and the spectate canvas (SpectateView).
  - **DONE (increment 2): participant awareness.** A "who's here" indicator
    (`../../GloGraphDesktopApplication/src/components/PresenceBadges.tsx`) on the host banner — driven by the
    `usePresence` peer list (via PresenceContext). **As of Phase 70 it's a name chip per participant** (colour
    dot + name; your own "You" chip is muted), and each peer chip is a button outlined in their colour →
    **click it to jump the viewport to that user's cursor** (jump-to-user). Was originally just coloured dots
    + a count. (Also removed the now-false "networking not wired yet" banner tag.)
  - **DONE (increment 3): live editing (structural ops).** Guests can now change the host's graph.
    - **Host opt-in:** `HostSessionDialog` gained an **Access** choice — *View only* (default) vs *Everyone
      can edit*. The role flows through `start_host_session(token, role)` into `serve_session`.
    - **Server (`http_api::serve_session`):** in an **editor** session it additionally mounts the graph
      mutation routes (nodes create/move/batch/delete, edges create/delete, regions create/patch/delete,
      import), reusing the exact local-API handlers, and runs the same `event_layer` so a guest write
      broadcasts a `ChangeEvent` to every spectator. A `GET /api/session` endpoint reports the role so the
      guest can enable/disable its editing UI.
    - **Guest (`SpectateView` + `../../GloGraphDesktopApplication/src/lib/remoteWrite.ts`):** fetches `/api/session`; if `editor`, un-pins the
      nodes and wires `GraphCanvas`'s edit callbacks (`onNodeMove`, `onConnect`, `onEdgeDelete`,
      `onRegionMove/Resize`, `onContextMenuCreate*`) to `createRemoteWriter` HTTP calls. **Host-authoritative,
      last-write-wins, no optimistic state:** a write lands on the host, the host's change event refetches
      everyone into sync. Status bar shows `editing` vs `read-only`.
  - **DONE (increment 4): property editing.** Closed the property-edit gap — guests now get the real
    **node/edge panels**. In an editor session, selecting (or double-clicking) a node/edge opens
    `NodePanel`/`EdgePanel` inside the spectate `SettingsProvider`; **Save** `PATCH`es the host
    (`PATCH /api/nodes|edges/{id}`, the full `Update*Input` body — server reads `id` from the path), **Delete**
    `DELETE`s it. Covers title, description, accent colour, params, event date, confidence/impact, tags
    (node) and label, colour, params (edge), plus node/edge delete. Media/link callbacks are omitted (host-
    local file paths), and the panels guard those with optional chaining.
  - **DONE (increment 5): smaller editing gaps.** Guests can now also edit node **links** (add/remove →
    `POST /api/nodes/{id}/links`, `DELETE /api/links/{id}`, mounted in editor sessions and passed to
    `NodePanel`), **reconnect edges** (`PatchEdgeBody` gained `sourceId/targetId/*Handle`; `patch_edge`
    rewrites the endpoint + handle; wired via `onEdgeReconnect`), and **lock/minimize regions**
    (`PatchRegionBody` gained `isLocked/isMinimized`; `patch_region` persists them; wired via
    `onRegionLock`/`onRegionMinimize`). The open panel is now resolved from the live graph by id, so added
    links appear immediately and the panel closes if its target is deleted.
    - **Node media stays host-only by design:** media `src` is a host-local file path rendered through
      Tauri's asset protocol, so a guest can't see the host's file-media nor supply a path the host could
      resolve, and the media HTTP surface can't edit `src` — wiring it would create broken references.
      Edge **waypoints** remain unwired (no route yet).
  - **DONE (increment 6): per-user undo/redo.** Ctrl+Z / Ctrl+Y (and Ctrl+Shift+Z) now undo/redo **only the
    local user's own** edits, never anyone else's. The guest gets its own `useHistory` stack: each remote op
    records an inverse/redo that routes back through `remoteWrite` (e.g. move → restore captured positions;
    property edit → re-`PATCH` the captured "before"; create → delete the created id via an id-promise that
    redo refreshes; reconnect/region-move/resize/lock/minimize → restore prior state; add/remove link →
    inverse). Undo/Redo buttons sit in the spectate bar (keyboard skipped while typing in a panel field). The
    **host** side already satisfied this by construction — guest edits arrive as reloads that don't push the
    host's stack, so the host's Ctrl+Z only ever touches host ops. **Not undoable yet:** node delete (cascade
    restore) and edge delete (full reconstruct) — documented; their inverse needs more than the current API.
  - **DONE (Phase 70, 0.9.12):** presence moved into `context/PresenceContext.tsx` (peers vs. stable api split)
    so cursor moves re-render only the cursor layer, not the whole app; **remote drag-select boxes** (each
    peer's live marquee, in their colour); **minimap cursors** (`MinimapCursors`); **jump-to-user** (click a
    presence dot → centre on their cursor); join/leave **awareness toasts** (`PresenceToasts`); **undo of
    node/edge/region delete** for guests via shared `restore_*_inner` + `POST /api/{nodes,edges,regions}/restore`
    (editor sessions, original ids preserved); and more **optimistic guest edits** (reconnect/delete-edge,
    region update/delete/reorder, node z-order/size).
  - **Remaining:** continuous **viewport-follow** (presenter mode — needs broadcasting pan/zoom, not just the
    cursor); edge **waypoints**; **per-user** roles (today uniform per session); and **per-entity sync deltas**
    (replace the full-graph reload — deferred, see HANDOFF Phase 70 / the deferred task).
- **Phase 3 — host tools + self-host.** Session-users tab (list, jump-to-user, kick), hide-tabs,
  restrictions (save-a-copy, create-tabs). Run the backend **headless** on a server for the self-host
  mode.
- **Later.** mDNS LAN discovery (so users do not type IPs); "request edit access" approval flow;
  CRDTs only if offline-merge / true peer-to-peer becomes a hard requirement.

---

## 8.5 Known limitations (Phase 1, audited 2026-06-03)

- Switching the host's active tab doesn't push a change event, so a spectator goes stale until the host's
  next edit (the publisher remounts per tab and skips its initial load). Minor; fix when wiring presence.
- The read-only spectate canvas still shows right-click context menus whose items no-op, and regions can be
  dragged locally (resets on the next refetch). Cosmetic.
- A real test needs two GloGraph instances on one LAN (the single-instance lock prevents host + guest on
  one machine).

## 8.6 Validated end-to-end on a real LAN (2026-06-03, build 0.9.3)

Two Windows machines, same subnet (host `192.168.0.105:57400`). **Working:** spectating (graph renders
live), presence ("N here" badge + live cursors), and editor-session editing across machines. Getting there
surfaced four real gaps that the loopback/curl tests could not (a webview enforces rules `curl` doesn't):

1. **CORS `Authorization` header** — the session server answered preflight with `Access-Control-Allow-Headers: *`,
   but the Fetch spec excludes `Authorization` from the `*` wildcard, so the guest webview blocked
   `GET /api/graph` + every Bearer-token mutation while SSE (`?token=`) still connected. **Fix:**
   `serve_session` lists `[AUTHORIZATION, CONTENT_TYPE]` explicitly (`http_api.rs`).
2. **Mixed content** — the webview origin (`tauri.localhost`) is a *secure context*, so Chromium/WebView2
   blocked all plain-`http`/`ws` LAN requests (fetch **and** WebSocket) as mixed content — "connected but
   blank, 1 here." **Fix:** `additionalBrowserArgs: "… --allow-running-insecure-content"` in
   `tauri.conf.json`. (Windows/WebView2-specific; a cross-platform fix would route guest I/O through Tauri's
   Rust HTTP/WS plugins.)
3. **Spectate render collapse** — `.spectate__canvas` wasn't a flex container, so the base `.graph-canvas`
   (`flex: 1`) collapsed to 0 height and React Flow drew nothing despite 200s/101. **Fix:**
   `.spectate__canvas { display: flex; flex-direction: column }` (`App.css`).
4. **Firewall** — inbound TCP 57400 must be allowed on the host (Private *and* Public, since LAN adapters are
   often classified Public). Windows prompts on first host; a manual rule covers it.

(Build 0.9.3 also has `tauri` `devtools` feature ON for diagnosis — **strip before a real release**.)

### Performance — optimistic + incremental sync
The original sync was host-authoritative with **no optimistic state + full-graph refetch+replace per change**,
so a guest's own edits felt delayed and the whole canvas flickered on every event. The history matters because
the docs drifted from the code here:
- **0.9.4** added a Google-Sheets / VSCode-Live-Share **optimistic engine** in `../../GloGraphDesktopApplication/src/lib/spectateSync.ts`
  (`EditAction` / `applyLocal` / `mergeGraph` + a ~1.5 s protection window), wired into the then-separate
  `SpectateView`.
- **0.9.6 "path A"** deleted `SpectateView` and routed the guest through the shared `AppInner` + `useGraph`.
  That regressed the guest to **pessimistic** editing (each mutation `await`s the host before applying) and
  kept only the *render-efficiency* half: `useGraph.reload` reconciles via `mergeById` (identity-preserving,
  no protection). The `applyLocal` / `invertAction` / `mergeGraph` engine was left **built + unit-tested but
  unwired** — and §8.6 still wrongly read "DONE — optimistic" until this correction.
- **NOW (re-wired, leaner):** `useGraph` gained an **`optimistic` flag** — on for guests, **off for the host
  (its mutation paths are byte-identical to before)**. When on, **node update / move / delete** apply to local
  state *before* the host round-trip, mark the touched ids **protected for ~1.5 s**, and roll back via
  `reload()` on a write error; `reload` now reconciles with `mergeById(prev, server, protectedIds)` so an
  in-flight edit isn't snapped back to the host's not-yet-updated state. The `spectateSync`
  `applyLocal`/`mergeGraph`/`invertAction` engine was **superseded by this inline path and retired**
  (2026-06-05) — only `mergeById` (with the optional `protectedIds`) remains, and the now-dead
  `remoteWrite.ts` companion was deleted too. The retired `invertAction` (per-action inverse, in git history)
  is the reference for the **planned per-user undo/redo** (owner intent — see `memory/`).
- **Still pessimistic (await-then-apply), by design for now:** node/edge/region **creates** (need temp-id
  reconciliation first), edges (update/reconnect/waypoints/delete), regions (update/delete), links, media.
  Extend the same `optimistic`-gated pattern when there's demand.
- **Presence heartbeat** (0.9.4): `usePresence` re-broadcasts every 2 s (and on connect), so an idle peer
  stays present instead of being pruned.
- **NEEDS TWO-MACHINE VALIDATION:** the optimistic guest path can't be exercised by unit tests or on one
  machine (single-instance lock). Verify with `../../GloGraphDesktopApplication/tests/session_guest_test.py` + a real host↔guest run before a
  release trusts it. The host path is covered by being unchanged (`optimistic=false`).
- **Remaining:** stream node **drags** (intermediate positions) for smooth *remote* movement; **per-entity
  deltas** over the live channel (avoid the whole-graph `GET` — the Sheets endgame); optimistic
  creates/edges/regions; VSCode-style **selections / follow** for presence.

## 9. Open questions

- Whether guests can switch among allowed tabs independently, or are pinned to the host's active tab.
- Whether roles are set only as a session default or also per-user (and live-changeable mid-session).
- Reconnection/state-resync semantics after a guest drops mid-edit.
- Conflict UX beyond last-write-wins (do we ever surface "your change was overwritten"?).
- **Per-user undo/redo:** the base mechanism is **implemented** (§8 increment 6) — each participant's
  Ctrl+Z/Y affects only their own ops. The remaining open question is correctness in a last-write-wins
  model when you undo an op whose target was since changed by someone else, and undo of node/edge/region
  **delete** (cascade reconstruct), which is not yet reversed.
- NAT traversal: the LAN and self-host modes avoid it; a relay is only needed if peers are on different
  networks with no public host (defer until there is demand).
