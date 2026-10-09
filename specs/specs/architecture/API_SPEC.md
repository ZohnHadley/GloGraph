# GloGraph HTTP API Specification

The embedded axum REST API runs on `http://127.0.0.1:57321` (default port, configurable via Preferences → API).

## Authentication

All endpoints require the API to be enabled in Preferences → API, and optionally a Bearer token. The only exceptions are the **GET** diagnostics `GET /api/ping`, `GET /api/tabs`, and `GET /api/stats`, which bypass auth/enabled. (Mutations on those paths — e.g. `POST /api/tabs` — are **not** exempt and require auth.)

```
Authorization: Bearer <token>
```

If no token is configured, any request passes. If the API is disabled, all authenticated endpoints return `503 Service Unavailable`.

The enable flag, token, and port are **global** (server-wide), stored in `api_config.json` in the app data dir — **not** per-project. So creating or switching projects never changes whether the API is on. (`api_enabled` / `api_token` / `api_port` are therefore read/written through that global file by Preferences; they remain rejected with `403` on `PUT /api/settings/app` — a client still can't enable the API or rotate its own auth.)

---

## Diagnostic endpoints (no auth required)

### `GET /api/ping`
Health check.
```json
{ "status": "ok", "version": "1.0" }
```

### `GET /api/tabs`
Returns all open project tabs and which one is active.
```json
[
  { "id": "uuid", "name": "Project 1", "savePath": null, "order": 0, "isActive": true }
]
```

### `GET /api/stats`
Quick count summary for the active project. Useful for sanity-checking after batch imports.
```json
{ "nodes": 42, "edges": 38, "regions": 5, "links": 17, "media": 9 }
```

---

## Live change events

### `GET /api/events`
A **Server-Sent Events** stream of graph changes — subscribe once and receive an event each time the graph is mutated, instead of polling. One-way (server→subscriber); you still make changes via the normal endpoints. Auth-gated like the rest of the API (not a diagnostic). Works with browser `EventSource` and any line-reading HTTP client.

Each event's `data:` line is a JSON object:
```json
{ "kind": "node", "action": "created" }
```
- `kind`: `node` · `edge` · `region` · `link` · `media` · `settings` · `tab` · `graph`
- `action`: `created` · `updated` · `deleted` · `activated` · `reloaded`

Today the stream reflects **HTTP API writes** (Phase-0 groundwork toward live collaboration); richer payloads (entity ids/diffs) and GUI-originated edits are planned. Example:
```bash
curl -N -H "Authorization: Bearer $TOKEN" http://127.0.0.1:57321/api/events
```
SDK: `g.subscribe(on_event, kinds=None)` (blocking; run in a thread for background use).

---

## Projects / tabs

The API reads and writes the **active** project. These let a script or AI agent provision a new
project or switch which one is active, instead of only operating on the tab the user has focused.
Both require auth (they are mutations).

### `POST /api/tabs`
Create a new project tab and make it active (subsequent API calls target it). Returns the updated tab list; `201 Created`.
```json
{ "name": "Q3 Risk Map", "presetId": "00000000-0000-0000-0000-000000000001" }
```
Both fields are optional: `name` defaults to "Untitled Project"; `presetId` defaults to the **Blank** preset (`…0005`). Built-in preset ids: Blank `…0005`, Macro Economics `…0001`, System Behavior `…0002`, Knowledge Map `…0003`, Project Tracker `…0004`. To provision a fully typed project from scratch, create a tab then `POST /api/import` a graph whose `settings` block defines the schema.

### `POST /api/tabs/{id}/activate`
Make an existing tab active. Returns the tab list. `404` if the id is unknown.

### `DELETE /api/tabs/{id}`
Close a project tab. Add `?deleteDb=true` to also delete its on-disk SQLite files; the default keeps the `.db` on disk (reopenable by path) and just removes it from the session. If the closed tab was active, the lowest-ordered remaining tab becomes active (or none — which sends the desktop UI to the Start screen). Returns the updated tab list; **idempotent** — deleting an unknown id is a no-op that returns the current list with `200`.

---

## Graph

### `GET /api/graph`
Export the entire active project as a portable JSON object (nodes, edges, regions, settings).

### `POST /api/import`
Import a graph export into the active project (replaces all content).
```json
{ "version": 10, "exportedAt": "...", "settings": {...}, "nodes": [...], "edges": [...], "regions": [...], "bookmarks": "...", "graphNotes": "..." }
```
Accepts versions 3–10. Current exports are **version 10**: nodes carry an optional `showThumbnail`
(file nodes only — show the thumbnail/first-page preview vs an icon; null/absent = `true`, added v10) and
an optional `renderMarkdown` (notes only — render the body as markdown vs raw text; null/absent = `true`,
added v9). v8 added an optional edge `color` (hex stroke override; null = default white). Nodes also carry
a `kind` (`standard`/`note`/`image`/`video`/`audio`/`file` — see GRAPH_ITEMS_DESIGN.md) and optional
`width`/`height` (resizable image/video/note items), in addition to the v5 `isPinned`/`isExpandPinned`;
regions carry `isLocked`/`isMinimized`; and the top level adds `bookmarks` + `graphNotes`. All new fields
are optional (older files load unchanged; absent `kind` defaults to `standard`, absent `width`/`height`
mean the default size, absent edge `color` = white, absent `renderMarkdown`/`showThumbnail` = `true`).

---

## Nodes

### `GET /api/nodes`
List all nodes. Optional query parameters:
- `?externalId=<id>` — return only the node with that external ID
- `?tag=<tag>` — filter nodes that contain the tag
- `?search=<text>` — case-insensitive substring match on title or description

### `POST /api/nodes`
Create a node. Returns `201 Created`.
```json
{
  "title": "Fed hikes rates",
  "description": "Optional description",
  "eventDate": "2024-03-20",
  "x": 100.0, "y": 200.0,
  "color": "#e74c3c",
  "confidence": 80,
  "impactMagnitude": 5,
  "externalId": "optional-external-ref",
  "tags": ["macro", "rates"],
  "kind": "standard",
  "paramValues": [
    { "paramDefId": "uuid", "value": "high", "isEnabled": true, "showOnCard": true }
  ]
}
```
`kind` (`standard`/`note`/`image`/`video`/`audio`/`file` — see GRAPH_ITEMS_DESIGN.md) is optional and
defaults to `standard`. Create also accepts the display/size fields (parity with `PATCH`): `width`/`height`
(resizable image/video/note/file items; omit → auto-size), `renderMarkdown` (notes; default `true`), and
`showThumbnail` (file nodes; default `true`) — so a script can make a styled/sized node in one call. These
apply on `POST`, `PUT` (upsert), and `POST /api/nodes/batch`.

### `PUT /api/nodes`
**Upsert by `externalId`** (idempotent — ideal for re-runnable scripts and streaming). Body is the same partial shape as `PATCH` plus a **required non-empty `externalId`**:
```json
{ "externalId": "FED_MAR23", "title": "Fed +25bps", "confidence": 90, "paramValues": [] }
```
- If a node with that `externalId` exists, it is **PATCH-merged** — omitted fields (including `x`/`y`) are left unchanged, so re-streaming data never resets a user's layout. Returns `200 OK`.
- Otherwise a new node is created (missing fields use defaults: `x`/`y` → 0, `kind` → `standard`). Returns `201 Created`.
- Missing/empty `externalId` → `400 Bad Request`.

### `POST /api/nodes/batch`
Create multiple nodes in one transaction. Body: array of node creation objects. Returns `201 Created` with array of created nodes.

### `PATCH /api/nodes/batch-positions`
Update x/y positions for many nodes in one transaction. Returns `204 No Content`.
Useful for programmatic layout (e.g., after running a force-directed algorithm externally).
```json
[
  { "id": "node-uuid-1", "x": 120.5, "y": 300.0 },
  { "id": "node-uuid-2", "x": 450.0, "y": 120.0 }
]
```

### `GET /api/nodes/{id}`
Get a single node by ID (includes links, media, param values).

### `PATCH /api/nodes/{id}`
Update node fields (partial update — only provided fields change).
```json
{ "title": "New title", "confidence": 90, "tags": ["macro"] }
```
Also accepts `kind` (convert a node to/from a graph-item variant), `width`/`height` (resize an
image/video/note item — flow coordinates; omit to leave size unchanged), `renderMarkdown`
(notes — render the body as markdown vs raw text), and `showThumbnail` (file nodes — show the
thumbnail/first-page preview vs an icon). Example:
```json
{ "kind": "image", "width": 320.0, "height": 200.0 }
```
Persisted element state can also be patched here: `isPinned`, `isExpandPinned` (booleans), and `zOrder`
(integer). `PATCH /api/edges/{id}` likewise accepts `sourceId`/`targetId`/`sourceHandle`/`targetHandle`
(reconnect an endpoint); `PATCH /api/regions/{id}` accepts `isLocked`/`isMinimized`/`zOrder`.

### `DELETE /api/nodes/{id}`
Delete a node and all its connected edges. Returns `204 No Content`.

---

## Node graph traversal

### `GET /api/nodes/{id}/edges`
Get all edges where the node is either source or target.

### `GET /api/nodes/{id}/neighbors`
Get all nodes directly connected to this node. Optional query parameter:
- `?direction=in` — only nodes that point **to** this node
- `?direction=out` — only nodes that this node points **to**
- `?direction=both` — all connected nodes (default)

### `GET /api/trace?from={nodeId}&direction=downstream|upstream`
Multi-hop reachability (BFS) over the active project's directed edges — the API twin of the UI's impact-trace overlay. `downstream` follows arrows (what the node leads to); `upstream` walks against them (what leads to the node). `direction` defaults to `downstream`. Pure topology: no weights, probabilities, or prediction — it maps relationships, it doesn't simulate them. Cycles/feedback loops terminate safely, and each node carries its **shortest** hop distance from the seed. `400` on a bad direction, `404` if `from` is unknown.
```json
{
  "seedId": "abc",
  "direction": "downstream",
  "nodes": [ { "id": "abc", "hop": 0 }, { "id": "def", "hop": 1 } ],
  "edgeIds": ["e1", "e2"],
  "reachedCount": 1,
  "maxHop": 1
}
```
`nodes` includes the seed (hop 0) and is sorted by hop then id; `reachedCount` excludes the seed. Read-only — does not emit `api:graph-changed`.

---

## Semantic search

### `POST /api/search/semantic`
Rank nodes by **meaning** (vector similarity), the structured-memory complement to keyword `?search=`. Off by
default: requires an embeddings provider in `embed_config.json` (projects dir; `{"enabled":false,
"url":"http://localhost:11434/v1/embeddings","model":"nomic-embed-text","apiKey":""}`). GloGraph ships **no
model** — it calls any OpenAI-compatible embeddings endpoint (default: a local Ollama), caches one vector per
node in `node_embeddings` (re-embedded lazily when a node's title/description or the model changes), and
ranks by cosine similarity.
```json
{ "query": "what handles login", "limit": 10 }
```
Returns `[{ "id", "title", "summary", "score" }]` sorted by score (desc). `503` if not configured, `502` if
the provider is unreachable — clients (e.g. the MCP server's `recall`) should fall back to `?search=`.

---

## Node Links

### `GET /api/nodes/{id}/links`
List all URL links attached to a node.
```json
[{ "id": "uuid", "nodeId": "...", "url": "https://...", "label": "Source" }]
```

### `POST /api/nodes/{id}/links`
Add a URL link to a node. Returns `201 Created`.
```json
{ "url": "https://example.com", "label": "Optional label" }
```

### `PATCH /api/links/{id}`
Update a link's URL or label.
```json
{ "url": "https://new-url.com", "label": "Updated label" }
```

### `DELETE /api/links/{id}`
Delete a link. Returns `204 No Content`.

---

## Node Media

### `GET /api/nodes/{id}/media`
List all media attachments for a node.
```json
[{ "id": "uuid", "nodeId": "...", "label": "Chart", "src": "...", "srcType": "url", "mediaType": "image", "sortOrder": 0, "showOnCard": true }]
```

### `POST /api/nodes/{id}/media`
Add a media attachment. Returns `201 Created`. The node id comes from the path — the body does
**not** need to repeat it.
```json
{ "label": "Chart", "src": "https://...", "srcType": "url", "mediaType": "image", "showOnCard": true }
```

`srcType`: `"file"` | `"url"`
`mediaType`: `"image"` | `"video"` | `"audio"` | `"file"`

A `file` node's content is just a media item with `mediaType: "file"` (the `src` is a local path with
`srcType: "file"`, or a link with `srcType: "url"`).

### `PATCH /api/media/{id}`
Update a media item's label, visibility, or sort position.
```json
{ "label": "Updated Chart", "showOnCard": false, "sortOrder": 2 }
```

### `DELETE /api/media/{id}`
Delete a media attachment. Returns `204 No Content`.

---

## Edges

### `GET /api/edges`
List all edges. Optional query parameters:
- `?sourceId=<node-id>` — filter edges originating from this node
- `?targetId=<node-id>` — filter edges pointing to this node
- `?externalId=<id>` — return only the edge with that external ID

### `PUT /api/edges`
**Upsert by `externalId`** (idempotent). Body is a `POST` edge object plus a **required non-empty `externalId`**. If an edge with that `externalId` exists, its endpoints, handles, colour and param values are **replaced**; otherwise a new edge is created. Returns `200 OK` (update) or `201 Created`; missing/empty `externalId` → `400`.
```json
{ "externalId": "CPI_TO_FED", "sourceId": "<id>", "targetId": "<id>", "paramValues": [] }
```

### `POST /api/edges`
Create an edge. Returns `201 Created`.
```json
{
  "sourceId": "node-uuid",
  "targetId": "node-uuid",
  "sourceHandle": "right",
  "targetHandle": "left",
  "paramValues": [],
  "externalId": null,
  "color": null
}
```
`color` is an optional hex stroke override (e.g. `"#c83030"`); when set it takes priority over the
`drivesColor` edge param. `null`/omitted = use the param-driven colour.

**Handles are optional and auto-picked.** If you omit both `sourceHandle` and `targetHandle`, the
server chooses them from the two nodes' relative positions so the edge leaves and enters on the sides
that face each other (the nearest sides) — the dominant axis decides left/right vs top/bottom. Supplying
either handle disables auto-pick and your value is used as-is. (Same rule applies to `POST /api/edges/batch`
and `PUT /api/edges`.)

### `POST /api/edges/batch`
Create multiple edges in one transaction. Returns `201 Created`.

### `GET /api/edges/{id}`
Get an edge by ID.

### `PATCH /api/edges/{id}`
Update edge param values, external ID, label (free-text label shown at the edge midpoint), or
`color` (hex stroke override; overrides the `drivesColor` param).
```json
{ "paramValues": [...], "externalId": "ext-ref", "label": "causes", "color": "#c83030" }
```

### `DELETE /api/edges/{id}`
Delete an edge. Returns `204 No Content`.

---

## Regions

Region objects include a `zOrder` integer — the manual front/back ordering controlled from the desktop UI (Bring to Front / Send to Back); higher renders in front, default `0`. It is returned by the read endpoints and round-trips through export/import; there is no dedicated HTTP setter. The same applies to the region `isLocked`/`isMinimized` and node `isPinned`/`isExpandPinned` view-state flags (Phase 20): read-back + export/import only, set from the desktop UI.

### `GET /api/regions`
List all regions.

### `POST /api/regions`
Create a region. Returns `201 Created`.
```json
{ "title": "Fed Policy", "x": 0.0, "y": 0.0, "width": 400.0, "height": 300.0, "color": "#2ecc71" }
```

### `GET /api/regions/{id}`
Get a region by ID.

### `PATCH /api/regions/{id}`
Update region fields (partial update).
```json
{ "title": "New Title", "x": 50.0, "width": 500.0 }
```

### `DELETE /api/regions/{id}`
Delete a region. Returns `204 No Content`.

---

## Settings

### `GET /api/settings`
Returns the full graph settings: active preset ID, all presets, node param defs (with options), and edge param defs.

### `GET /api/settings/app?key=<key>`
Get a single app setting value.
```json
{ "key": "api_enabled", "value": "true" }
```

### `PUT /api/settings/app`
Set an app setting.
```json
{ "key": "edge_routing_mode", "value": "waypoints" }
```
Returns `204 No Content`. **Restricted to a safe allowlist** — only `edge_routing_mode`,
`snap_to_grid`, `graph_notes`, and `canvas_bookmarks` are writable. Security-sensitive keys
(`api_enabled`, `api_token`, `api_port`) and migration flags are **not** writable via the API and
return `403 Forbidden` (a client must not be able to disable the API or rotate its own auth).

---

## Debugging Workflow

The API is designed to let you inspect and modify GloGraph state without touching the UI.

### 1. Verify the app is running
```bash
curl http://127.0.0.1:57321/api/ping
```

### 2. Check which projects are open
```bash
curl http://127.0.0.1:57321/api/tabs
```

### 3. Get a quick overview of the active project
```bash
curl http://127.0.0.1:57321/api/stats
# → { "nodes": 12, "edges": 8, "regions": 2, "links": 5, "media": 1 }
```

### 4. Inspect the active project
```bash
# Get all nodes
curl -H "Authorization: Bearer <token>" http://127.0.0.1:57321/api/nodes

# Search for nodes mentioning "inflation"
curl -H "Authorization: Bearer <token>" "http://127.0.0.1:57321/api/nodes?search=inflation"

# Get all edges
curl -H "Authorization: Bearer <token>" http://127.0.0.1:57321/api/edges

# All edges from a specific node
curl -H "Authorization: Bearer <token>" "http://127.0.0.1:57321/api/edges?sourceId=<node-id>"

# Full export
curl -H "Authorization: Bearer <token>" http://127.0.0.1:57321/api/graph
```

### 5. Create test data programmatically
```bash
# Create a node
curl -X POST http://127.0.0.1:57321/api/nodes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Node","x":100,"y":100,"paramValues":[]}'

# Connect two nodes
curl -X POST http://127.0.0.1:57321/api/edges \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sourceId":"<id1>","targetId":"<id2>","paramValues":[]}'
```

### 6. Explore the graph programmatically
```bash
# Find neighbors of a node
curl -H "Authorization: Bearer <token>" "http://127.0.0.1:57321/api/nodes/<id>/neighbors"

# Only incoming neighbors (nodes that point to this one)
curl -H "Authorization: Bearer <token>" "http://127.0.0.1:57321/api/nodes/<id>/neighbors?direction=in"

# Get all edges touching a node (in or out)
curl -H "Authorization: Bearer <token>" "http://127.0.0.1:57321/api/nodes/<id>/edges"
```

### 7. Programmatic layout — move many nodes at once
```bash
curl -X PATCH http://127.0.0.1:57321/api/nodes/batch-positions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[{"id":"<id1>","x":100,"y":200},{"id":"<id2>","x":400,"y":200}]'
```

### 8. Find a node by external reference
```bash
curl "http://127.0.0.1:57321/api/nodes?externalId=my-crm-id-123" \
  -H "Authorization: Bearer <token>"
```

### 9. Check API enabled status
```bash
curl "http://127.0.0.1:57321/api/settings/app?key=api_enabled"
```

---

## Error format

All errors return JSON with an `error` field:
```json
{ "error": "Node 'xyz' not found" }
```

Common status codes:
- `200 OK` — successful read
- `201 Created` — resource created
- `204 No Content` — successful delete or update
- `401 Unauthorized` — bad or missing Bearer token
- `404 Not Found` — `GET`/`PATCH` on an `{id}` that doesn't exist (nodes, edges, regions, links, media). `DELETE` is idempotent and returns `204` even if the row was already gone.
- `503 Service Unavailable` — API disabled in preferences
- `500 Internal Server Error` — backend failure (check error message)

---

## Python SDK

A Python client is available at `../../GloGraphDesktopApplication/sdk/python/glograph.py`. It wraps all endpoints and handles authentication automatically. Runnable recipes live in `../../GloGraphDesktopApplication/sdk/python/recipes/` — notably `csv_to_graph.py`, an idempotent CSV → graph ingestion (upsert by `external_id`, layout-preserving, schedulable) for keeping a map in sync with an external source. A ready-to-run example, `../../GloGraphDesktopApplication/sdk/python/recipes/architecture_demo.py`, provisions a typed `payments-system` map live on the canvas (creates its own tab, then installs the schema via a replace-all `POST /api/import`) — the script behind launch post ARCH-3.

```python
from glograph import GloGraph
g = GloGraph(token="my-token")

# Stats
stats = g.stats()  # {"nodes": 12, "edges": 8, ...}

# Nodes
nodes = g.list_nodes()
nodes = g.list_nodes(search="inflation")
node = g.create_node(title="Fed hikes", x=100, y=100)

# Graph traversal
neighbors = g.node_neighbors(node["id"], direction="out")
edges = g.node_edges(node["id"])

# Programmatic layout
g.batch_positions([{"id": n["id"], "x": i*200, "y": 0} for i, n in enumerate(nodes)])

# Edges (with filtering)
edges = g.list_edges(source_id=node["id"])
g.create_edge(source_id=node["id"], target_id=other_id)
```
