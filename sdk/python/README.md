# GloGraph Python SDK

Zero-dependency Python client for the GloGraph HTTP API.  
Requires Python 3.8+ and a running GloGraph desktop app with the API enabled.

## Setup

**Enable the API:** Preferences → API → toggle on. Optionally set a token.

```python
from glograph import GloGraph

g = GloGraph()                         # port 57321, no auth
g = GloGraph(port=57321, token="abc")  # with bearer token
```

---

## Diagnostics

```python
g.ping()    # → {"status": "ok", "version": "1.0"}
g.tabs()    # → list of open project tabs
g.stats()   # → {"nodes": 12, "edges": 8, "regions": 2, "links": 5, "media": 1}
```

---

## Projects / tabs

The SDK acts on the **active** project. Spin up a new one (it becomes active) or switch between open
projects — useful for agents that build several projects in a session.

```python
g.tabs()                                                     # list tabs (id, name, isActive, …)
g.create_project("Q3 Risk Map", preset="macro economics")   # new tab, becomes active
g.create_project("Scratch")                                  # preset defaults to "blank"
g.switch_project(tab_id)                                     # make an existing tab active
g.close_project(tab_id)                                      # close it (keeps the .db on disk)
g.close_project(tab_id, delete_db=True)                      # close + delete its database
```

`preset` accepts a built-in name (`blank` / `macro economics` / `system behavior` / `knowledge map` /
`project tracker`) or a raw preset id. Switching projects clears the cached param schema so
`params={…}` resolves against the newly active project. To provision a fully typed project from
scratch, `create_project()` then `g.import_graph(export)` with a settings block. `close_project()`
is idempotent and returns the updated tab list; agents that spin up scratch projects can tear them
down with `delete_db=True` to leave nothing behind.

---

## Nodes

```python
# List / search
g.nodes.list()                          # all nodes
g.nodes.list(tag="macro")              # filter by tag
g.nodes.list(search="inflation")       # title/description substring search
g.nodes.list(external_id="FED_MAR23") # find by external ID

# Single node
g.nodes.get("node-uuid")
g.nodes.get_by_external_id("FED_MAR23")  # returns None if not found

# Create
node = g.nodes.create(
    title="Fed hikes rates",
    x=100, y=200,
    description="FOMC +25bps",
    event_date="2024-03-20",
    color="#e74c3c",
    confidence=85,
    impact_magnitude=7,
    external_id="FED_MAR24",
    tags=["macro", "rates"],
)

# Typed params by name — no need to look up param-def UUIDs or value slugs.
# `params` keys are preset param display names; values are option labels (for
# select/select_color) or raw values (text/number/boolean), resolved against the
# active preset via /settings (cached; call g.refresh_schema() after changing it).
node = g.nodes.create(title="CPI 9.1%", x=300, y=200,
                      params={"Domain": "Economic", "Confidence": 85})

# Upsert by external_id — idempotent, the building block for re-runnable scripts
# and streaming. On update, omitted fields (incl. x/y) are preserved (layout-safe).
g.nodes.upsert(external_id="FED_MAR24", title="Fed +25bps (rev)",
               params={"Domain": "Economic"})

# Batch create
nodes = g.nodes.create_batch([
    {"title": "Node A", "x": 0,   "y": 0,   "paramValues": []},
    {"title": "Node B", "x": 200, "y": 0,   "paramValues": []},
])

# Update (partial — only fields you pass change)
g.nodes.update(node["id"], confidence=90, tags=["macro", "rates", "fx"])

# Graph items (note/image/video/audio) are node variants — pass `kind` on create,
# and set a resizable item's size (image/video/note) via update.
note = g.nodes.create(title="", x=400, y=200, kind="note", description="my note text")
img  = g.nodes.create(title="Chart", x=600, y=200, kind="image")
g.nodes.update(img["id"], width=320, height=200)   # resize the image item

# Move many nodes at once (e.g. after running an external layout algorithm)
g.nodes.batch_positions([
    {"id": node_a["id"], "x": 0,   "y": 0},
    {"id": node_b["id"], "x": 300, "y": 0},
])

# Delete
g.nodes.delete(node["id"])
```

---

## Graph traversal

```python
# All edges connected to a node (in or out)
g.nodes.edges(node["id"])

# Connected nodes
g.nodes.neighbors(node["id"])                    # both directions (default)
g.nodes.neighbors(node["id"], direction="in")    # only nodes pointing TO this one
g.nodes.neighbors(node["id"], direction="out")   # only nodes this one points TO

# Impact trace — multi-hop reachability over directed edges (pure topology)
t = g.trace(node["id"])                           # downstream: what this leads to
t = g.trace(node["id"], direction="upstream")     # what leads to this node
print(t["reachedCount"], "nodes, up to", t["maxHop"], "hops")
for n in t["nodes"]:                              # includes the seed at hop 0
    print(n["hop"], n["id"])
```

## Live updates (subscribe)

Stream graph-change events instead of polling — useful while streaming data in, or to
keep an external view in sync. Backed by Server-Sent Events (`GET /api/events`), so it
stays dependency-free.

```python
# Blocking — run in a thread for background use
import threading

def on_event(ev):
    print(ev["kind"], ev["action"])   # e.g. node created / edge deleted

threading.Thread(target=lambda: g.subscribe(on_event), daemon=True).start()

# ...or filter to specific kinds
g.subscribe(on_event, kinds={"node", "edge"})
```

Each event is `{"kind": ..., "action": ...}` (`kind`: node/edge/region/link/media/
settings/tab/graph; `action`: created/updated/deleted/activated/reloaded). Today the
stream reflects HTTP API writes.

---

## Node links

```python
g.nodes.links(node["id"])                                 # list links
link = g.nodes.add_link(node["id"], url="https://...", label="Source")
g.update_link(link["id"], label="Updated label")
g.delete_link(link["id"])
```

---

## Node media

```python
g.nodes.media(node["id"])                                 # list media
item = g.nodes.add_media(
    node["id"],
    label="CPI Chart",
    src="https://example.com/chart.png",
    src_type="url",          # "file" | "url"
    media_type="image",      # "image" | "video" | "audio"
    show_on_card=True,
)
g.update_media(item["id"], label="Updated label", show_on_card=False, sort_order=1)
g.delete_media(item["id"])
```

---

## Edges

```python
# List / filter
g.edges.list()                              # all edges
g.edges.list(source_id=node["id"])         # edges from a node
g.edges.list(target_id=node["id"])         # edges to a node

# List / find
g.edges.list(external_id="CPI_TO_FED")        # filter by external ID
g.edges.get_by_external_id("CPI_TO_FED")      # or None

# Get / create / update / delete (params by name, like nodes)
edge = g.edges.create(source_id=a["id"], target_id=b["id"],
                      params={"Relationship": "Caused By"})
edges = g.edges.create_batch([
    {"sourceId": a["id"], "targetId": b["id"], "paramValues": []},
    {"sourceId": b["id"], "targetId": c["id"], "paramValues": []},
])
# Idempotent upsert by external_id (endpoints/colour/params are replaced)
g.edges.upsert(external_id="CPI_TO_FED", source_id=a["id"], target_id=b["id"],
               params={"Relationship": "Caused By"})
g.edges.update(edge["id"], external_id="my-ref")
g.edges.delete(edge["id"])
```

---

## Regions

```python
region = g.regions.create(title="Fed Policy", x=0, y=0, width=400, height=300, color="#2ecc71")
g.regions.list()
g.regions.update(region["id"], title="Updated", width=500)
g.regions.delete(region["id"])
```

---

## Settings

```python
# Full graph settings (presets, param defs)
g.settings()

# Individual app settings
g.get_app_setting("api_enabled")        # → "true" or None
g.set_app_setting("api_enabled", "true")
```

---

## Graph export / import

```python
# Export the entire active project
export = g.export()

# Replace the active project with an export
g.import_graph(export)
```

---

## Live sync

When you make changes via the API, GloGraph automatically emits an internal
event that causes the open canvas to refresh. You should see nodes, edges, and
regions appear/disappear in real time in the running app window.

---

## Error handling

All API errors raise `GloGraphError` with the HTTP status and response body:

```python
from glograph import GloGraph, GloGraphError

g = GloGraph()
try:
    g.nodes.get("nonexistent-id")
except GloGraphError as e:
    print(e)  # HTTP 404 GET http://...: {"error": "Node '...' not found"}
```

---

## Common patterns

### Build a typed architecture map (runnable demo)

[`recipes/architecture_demo.py`](recipes/README.md) provisions a fresh `payments-system`
project, installs a typed schema, and upserts a small service/dependency map so it
appears on the canvas live — the script behind the "sync your architecture from a
script" story. It creates its own tab, so it won't touch your other projects:

```bash
cd sdk/python/recipes
python architecture_demo.py
```

> It calls `import_graph` to install the typed `Type`/`Relation` params, which
> **replaces the active tab's graph** — which is why it makes a dedicated tab first.
> The SDK/HTTP API can't create new param *definitions*; only an import or the
> desktop UI can. To add to an existing project instead, use `upsert` directly and
> rely on that project's existing preset params.

### Seed a graph from a CSV

Quick one-shot (creates fresh nodes every run):

```python
import csv
from glograph import GloGraph

g = GloGraph(token="my-token")

with open("events.csv") as f:
    rows = list(csv.DictReader(f))

nodes = g.nodes.create_batch([
    {"title": r["title"], "x": float(r["x"]), "y": float(r["y"]),
     "eventDate": r["date"], "externalId": r["id"], "tags": r["tags"].split(","),
     "paramValues": []}
    for r in rows
])
print(f"Created {len(nodes)} nodes")
```

**Want it idempotent / refreshable?** Use the ready-made recipe
[`recipes/csv_to_graph.py`](recipes/README.md). It upserts by `external_id`
(re-run without duplicating), keeps your manual layout, de-dupes edges, maps a
`category`/`relationship` column onto the preset's colour params, and is built to
run on a schedule to keep a map in sync with an external source:

```bash
cd recipes
python csv_to_graph.py --nodes sample_nodes.csv --edges sample_edges.csv
```

### Upsert a single node by external ID

```python
def upsert(g, external_id, **fields):
    existing = g.nodes.get_by_external_id(external_id)
    if existing:
        return g.nodes.update(existing["id"], **fields)
    return g.nodes.create(external_id=external_id, **fields)

upsert(g, "FED_MAR24", title="Fed +25bps", x=100, y=200, tags=["rates"])
```

### Find all nodes connected to a hub

```python
hub = g.nodes.get_by_external_id("FED_CHAIR")
neighbors = g.nodes.neighbors(hub["id"], direction="out")
print([n["title"] for n in neighbors])
```

### Apply a force-directed layout

```python
# Compute positions externally, then push them back in one call
positions = run_my_layout_algorithm(g.nodes.list(), g.edges.list())
g.nodes.batch_positions(positions)
```
