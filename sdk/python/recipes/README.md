# SDK recipes

Runnable, copy-and-adapt scripts built on the [GloGraph Python SDK](../README.md).
Standard library only — no `pip install`.

## Architecture demo (typed system map, live)

[`architecture_demo.py`](architecture_demo.py) provisions a fresh `payments-system`
project, installs a typed schema (a `Type` node param + a `Relation` edge param),
then upserts a small payments-platform architecture — services, datastores, a queue,
an external — and its dependencies, so the map appears on the canvas live. It's the
script behind launch post ARCH-3 ("your architecture map doesn't have to be
hand-drawn") and a good template for syncing a map from a real source (Terraform / a
service registry / CI), since every node/edge is keyed by `external_id` and re-runs
upsert in place.

```bash
cd sdk/python/recipes
python architecture_demo.py
```

It creates its **own** project tab, so it never touches your other open projects.
Note: it calls `import_graph` to install the typed params, which **replaces that
fresh tab's graph** — the SDK/HTTP API can't create new param *definitions*, only an
import or the desktop UI can. To add to an *existing* project, use `upsert` directly
and rely on that project's existing preset params. Then right-click **Payments DB →
Trace upstream** to see the blast radius.

## CSV → graph (idempotent / refreshable)

[`csv_to_graph.py`](csv_to_graph.py) ingests a CSV of nodes (and optionally a CSV
of edges) into the **active** GloGraph project, keyed by `external_id`. It's the
foundation of the "keep a map in sync with an external source" pattern: run it
once to seed, run it again (or on a schedule) to refresh.

### Why it's safe to re-run

- **Upsert by `external_id`** — existing rows are updated in place, new rows are
  created. Nothing duplicates.
- **Your layout is preserved** — positions are only written when the CSV provides
  `x`/`y`, or when a node is first created (auto grid). Re-running never yanks
  nodes you've arranged by hand back to a grid.
- **Edges de-dupe** by (source, target), so repeated runs don't pile up edges.
- **Preset-agnostic typing** — a `category` (nodes) / `relationship` (edges)
  column is mapped onto the active preset's colour-driving param when the value
  matches one of its options (by slug or label). Unmatched values are left
  untyped with a warning, so it works against any preset.

### Run it

Start GloGraph, open a project, enable the API (Preferences → API), then:

```bash
cd sdk/python/recipes

# Seed from the bundled samples (Macro Economics preset recommended)
python csv_to_graph.py --nodes sample_nodes.csv --edges sample_edges.csv

# Re-run: same command updates in place, no duplicates
python csv_to_graph.py --nodes sample_nodes.csv --edges sample_edges.csv

# Preview without writing anything
python csv_to_graph.py --nodes sample_nodes.csv --edges sample_edges.csv --dry-run

# With an auth token / custom port
python csv_to_graph.py --nodes sample_nodes.csv --token "$GLOGRAPH_TOKEN" --port 57321
```

You should see the nodes, edges, and regions appear on the canvas live.

### CSV format

**Nodes** (`--nodes`) — only `external_id` is required:

| column | notes |
|--------|-------|
| `external_id` | stable key used for upsert (required) |
| `title` | node title (optional; items can be untitled) |
| `category` | matched against the preset's colour param (slug or label) |
| `description` | free text |
| `event_date` | `YYYY-MM-DD` |
| `tags` | pipe-separated, e.g. `rates\|policy` |
| `color` | hex override, e.g. `#e74c3c` |
| `kind` | `standard` (default) / `note` / `image` / `video` / `audio` |
| `x`, `y` | optional fixed position; omit to auto-grid new nodes |

**Edges** (`--edges`) — `source`/`target` are node `external_id`s:

| column | notes |
|--------|-------|
| `source`, `target` | external_ids of the endpoint nodes (required) |
| `relationship` | matched against the preset's edge colour param |
| `label` | free-text midpoint label (optional) |

### Schedule it (the "live data" pattern)

Because the script is idempotent, you can keep a map in sync by re-running it
whenever your source changes. Replace the sample CSV with a step that pulls fresh
data (an API, a database query, a report) and writes the same columns, then:

- **macOS / Linux (cron)** — refresh every 15 minutes:
  ```cron
  */15 * * * * cd /path/to/sdk/python/recipes && python csv_to_graph.py --nodes /data/nodes.csv --edges /data/edges.csv >> /tmp/glograph-sync.log 2>&1
  ```
- **Windows (Task Scheduler)** — create a Basic Task that runs
  `python C:\path\to\csv_to_graph.py --nodes C:\data\nodes.csv` on your interval.

GloGraph stays local-first and offline — *you* own the pull step and the data
never leaves your machine. The SDK just upserts the result into the open project.
