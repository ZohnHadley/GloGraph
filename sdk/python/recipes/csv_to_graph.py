#!/usr/bin/env python3
"""
CSV → GloGraph ingestion (idempotent, re-runnable).

This is the canonical "refreshable data" recipe: point it at a CSV of nodes
(and optionally a CSV of edges) and it upserts them into the active GloGraph
project **by `externalId`**. Run it again and rows are updated in place rather
than duplicated, so you can wire it to a schedule (cron / Task Scheduler) or a
data pull to keep a map in sync with an external source.

Design choices that make it safe to re-run:
  - Every node is keyed by `external_id` (required). Existing → PATCH update,
    new → create. No duplicates.
  - **Your layout is preserved.** Positions are only set when the CSV provides
    `x`/`y`, or when a node is first created (auto grid). Re-running does NOT
    move nodes you've arranged by hand in the app.
  - Edges are de-duplicated by (source, target), so re-runs don't pile up.
  - Typed values: a `category` column (nodes) / `relationship` column (edges)
    is mapped onto the active preset's colour-driving param when the value
    matches one of its options (by slug or label); unmatched values are skipped
    with a warning, so the recipe works against any preset.

Zero dependencies — standard library only (csv + the bundled glograph client).

Usage:
    python csv_to_graph.py --nodes sample_nodes.csv
    python csv_to_graph.py --nodes sample_nodes.csv --edges sample_edges.csv
    python csv_to_graph.py --nodes nodes.csv --token "$GLOGRAPH_TOKEN" --port 57321
    python csv_to_graph.py --nodes nodes.csv --dry-run

Prerequisites: GloGraph running with a project open and the API enabled
(Preferences → API). Pass --token if you've set one.

Node CSV columns (only `external_id` is required):
    external_id, title, category, description, event_date, tags, color, kind, x, y
    - tags: pipe-separated, e.g. "rates|policy"
    - category: matched against the preset's colour param (slug or label)

Edge CSV columns (source/target are external_ids of nodes):
    source, target, relationship, label
"""
import argparse
import csv
import os
import sys

# Import the bundled client (recipes live one dir below the SDK root).
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from glograph import GloGraph, GloGraphError  # noqa: E402


class Schema:
    """Resolves a free-text category/relationship to the preset's colour param."""

    def __init__(self, g: GloGraph):
        s = g.settings() or {}
        self.node_def = next((d for d in s.get("paramDefs", []) if d.get("drivesColor")), None)
        self.edge_def = next((d for d in s.get("edgeParamDefs", []) if d.get("drivesColor")), None)

    @staticmethod
    def _match(definition, value):
        if not definition or not value:
            return None
        v = value.strip().lower()
        if not v:
            return None
        for o in definition.get("options", []):
            if o.get("valueSlug", "").lower() == v or o.get("label", "").lower() == v:
                return o.get("valueSlug")
        return None

    def node_param_values(self, category):
        slug = self._match(self.node_def, category)
        if slug is None:
            return None
        return [{"paramDefId": self.node_def["id"], "value": slug,
                 "isEnabled": True, "showOnCard": True}]

    def edge_param_values(self, relationship):
        slug = self._match(self.edge_def, relationship)
        if slug is None:
            return None
        return [{"paramDefId": self.edge_def["id"], "value": slug, "isEnabled": True}]


def _val(row, *names):
    """First non-empty value among the given column names (header-flexible)."""
    for n in names:
        if n in row and row[n] is not None and str(row[n]).strip() != "":
            return str(row[n]).strip()
    return None


def _grid_pos(i, x_step, y_step):
    cols = 6
    return (i % cols) * x_step, (i // cols) * y_step


def ingest_nodes(g, schema, rows, x_step, y_step, dry_run):
    """Upsert node rows by external_id. Returns {external_id: node_id}."""
    idmap = {}
    created = updated = skipped = 0
    for i, row in enumerate(rows):
        ext = _val(row, "external_id", "externalId", "id")
        if not ext:
            print(f"  ! row {i + 1}: no external_id — skipped (required for upsert)")
            skipped += 1
            continue

        title = _val(row, "title") or ""
        fields = {}
        for col, key in (("description", "description"), ("event_date", "event_date"),
                         ("color", "color"), ("kind", "kind")):
            v = _val(row, col)
            if v is not None:
                fields[key] = v
        tags = _val(row, "tags")
        if tags is not None:
            fields["tags"] = [t.strip() for t in tags.split("|") if t.strip()]
        category = _val(row, "category")
        if category is not None:
            pv = schema.node_param_values(category)
            if pv is None:
                print(f"  ~ {ext}: category '{category}' not in this preset — left untyped")
            else:
                fields["param_values"] = pv

        x = _val(row, "x")
        y = _val(row, "y")
        has_xy = x is not None and y is not None

        existing = g.nodes.get_by_external_id(ext)
        if dry_run:
            idmap[ext] = existing["id"] if existing else f"(new:{ext})"
            print(f"  · would {'update' if existing else 'create'} {ext}: {title!r}")
            if existing:
                updated += 1
            else:
                created += 1
            continue

        if existing:
            upd = dict(fields)
            if title:
                upd["title"] = title
            if has_xy:                       # only move when the CSV says so
                upd["x"], upd["y"] = float(x), float(y)
            if upd:
                g.nodes.update(existing["id"], **upd)
            idmap[ext] = existing["id"]
            updated += 1
        else:
            px, py = (float(x), float(y)) if has_xy else _grid_pos(i, x_step, y_step)
            node = g.nodes.create(title=title, x=px, y=py, external_id=ext, **fields)
            idmap[ext] = node["id"]
            created += 1

    print(f"  nodes: {created} created, {updated} updated, {skipped} skipped")
    return idmap


def ingest_edges(g, schema, rows, idmap, dry_run):
    """Create edges between nodes referenced by external_id, de-duped by pair."""
    seen = set()
    if not dry_run:
        for e in g.edges.list():
            seen.add((e.get("sourceId"), e.get("targetId")))

    created = skipped = dup = 0
    for i, row in enumerate(rows):
        s_ext = _val(row, "source", "source_id", "from")
        t_ext = _val(row, "target", "target_id", "to")
        if not s_ext or not t_ext:
            print(f"  ! edge row {i + 1}: missing source/target — skipped")
            skipped += 1
            continue

        sid = idmap.get(s_ext) or (_lookup(g, s_ext) if not dry_run else None)
        tid = idmap.get(t_ext) or (_lookup(g, t_ext) if not dry_run else None)
        if not sid or not tid:
            print(f"  ! edge {s_ext}→{t_ext}: endpoint not found — skipped")
            skipped += 1
            continue

        if (sid, tid) in seen:
            dup += 1
            continue

        rel = _val(row, "relationship", "type")
        label = _val(row, "label")
        pv = schema.edge_param_values(rel) if rel else None
        if rel and pv is None:
            print(f"  ~ edge {s_ext}→{t_ext}: relationship '{rel}' not in preset — left untyped")

        if dry_run:
            print(f"  · would connect {s_ext} → {t_ext}")
        else:
            g.edges.create(source_id=sid, target_id=tid,
                           param_values=pv or [], label=label or None)
            seen.add((sid, tid))
        created += 1

    print(f"  edges: {created} created, {dup} already existed, {skipped} skipped")


def _lookup(g, ext):
    n = g.nodes.get_by_external_id(ext)
    return n["id"] if n else None


def main():
    ap = argparse.ArgumentParser(description="Idempotently ingest CSV(s) into GloGraph.")
    ap.add_argument("--nodes", required=True, help="Path to the nodes CSV.")
    ap.add_argument("--edges", help="Optional path to the edges CSV.")
    ap.add_argument("--port", type=int, default=57321)
    ap.add_argument("--token", default=os.environ.get("GLOGRAPH_TOKEN", ""))
    ap.add_argument("--x-step", type=float, default=280.0, help="Grid X spacing for new nodes.")
    ap.add_argument("--y-step", type=float, default=160.0, help="Grid Y spacing for new nodes.")
    ap.add_argument("--dry-run", action="store_true", help="Show what would change; write nothing.")
    args = ap.parse_args()

    g = GloGraph(port=args.port, token=args.token)
    try:
        g.ping()
    except GloGraphError as e:
        print(f"Can't reach GloGraph on port {args.port}. Is it running with the API enabled "
              f"(Preferences → API)?\n  {e}")
        return 1
    except Exception as e:
        print(f"Can't reach GloGraph on port {args.port}: {e}")
        return 1

    with open(args.nodes, newline="", encoding="utf-8-sig") as f:
        node_rows = list(csv.DictReader(f))
    print(f"Ingesting {len(node_rows)} node row(s) from {args.nodes}"
          + (" (dry run)" if args.dry_run else ""))

    schema = Schema(g)
    idmap = ingest_nodes(g, schema, node_rows, args.x_step, args.y_step, args.dry_run)

    if args.edges:
        with open(args.edges, newline="", encoding="utf-8-sig") as f:
            edge_rows = list(csv.DictReader(f))
        print(f"Ingesting {len(edge_rows)} edge row(s) from {args.edges}")
        ingest_edges(g, schema, edge_rows, idmap, args.dry_run)

    if not args.dry_run:
        print(f"Done. {g.stats()}")
        print("Re-run any time — rows upsert by external_id, so nothing duplicates "
              "and your manual layout is preserved.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
