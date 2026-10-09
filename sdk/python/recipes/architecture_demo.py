#!/usr/bin/env python3
"""
Architecture SDK demo — build a live, typed system map on the GloGraph canvas.

This is the script behind launch post ARCH-3 ("your architecture map doesn't have
to be hand-drawn"). It provisions a fresh "payments-system" project, installs a
typed schema (a `Type` node param + a `Relation` edge param), then upserts a small
payments-platform architecture — services, datastores, a queue, an external — and
their dependencies, by stable external_id. You watch it appear on the canvas live.

Because every node/edge is keyed by `external_id`, re-running UPSERTS in place
(no duplicates) — the same property that lets you point this at a real source
(Terraform / a service registry / CI) and re-run it on a schedule to keep the map
current instead of letting it go stale.

Prerequisites:
  - GloGraph running with the HTTP API enabled (Preferences -> API; green "API"
    badge top-left of the canvas).
  - If you set an API token, put it in TOKEN below (or the GLOGRAPH_TOKEN env var).

Safe: it creates its OWN project tab ("payments-system"); it never touches your
other open projects.

Run:  cd sdk/python/recipes && python architecture_demo.py
"""
import os
import sys
import time

# Import the bundled client (recipes live one dir below the SDK root).
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from glograph import GloGraph, GloGraphError  # noqa: E402

# ── config ──────────────────────────────────────────────────────────────────
TOKEN = os.environ.get("GLOGRAPH_TOKEN", "")   # set if you configured a token
# Pause between writes so the reveal is readable on video. This pauses ONLY this
# Python script, never GloGraph (see the note at the bottom of this file). Set to
# 0 for an instant build, or raise it for a slower reveal. The graph is small, so
# each write's canvas refresh is cheap and stays smooth.
STEP_DELAY = 0.3

# ── the architecture (a small payments platform) ─────────────────────────────
# Node "Type" (drives colour + badge):
TYPE_COLORS = {
    "Service":   "#5588bb",
    "Datastore": "#3d9e5f",
    "Queue":     "#d68b2a",
    "External":  "#888888",
}
# Edge "Relation" (drives the midpoint label); we also colour the stroke to match.
REL_COLORS = {
    "Depends on":   "#5588bb",
    "Publishes to": "#d68b2a",
    "Reads from":   "#3d9e5f",
}

# (external_id, title, Type, x, y)
SERVICES = [
    ("svc-web",      "Web App",       "Service",     0, 240),
    ("svc-gateway",  "API Gateway",   "Service",   300, 240),
    ("svc-auth",     "Auth Service",  "Service",   620, 120),
    ("svc-payments", "Payments API",  "Service",   620, 360),
    ("ds-userdb",    "User DB",       "Datastore", 940, 120),
    ("q-events",     "Event Queue",   "Queue",     940, 280),
    ("ds-paydb",     "Payments DB",   "Datastore", 940, 440),
    ("ext-stripe",   "Stripe",        "External",  940, 580),
    ("svc-notify",   "Notifications", "Service",  1260, 200),
    ("svc-ledger",   "Ledger",        "Service",  1260, 440),
]

# (source_ext, target_ext, Relation)  — "source <relation> target"
DEPS = [
    ("svc-web",      "svc-gateway",  "Depends on"),
    ("svc-gateway",  "svc-auth",     "Depends on"),
    ("svc-gateway",  "svc-payments", "Depends on"),
    ("svc-auth",     "ds-userdb",    "Reads from"),
    ("svc-payments", "svc-auth",     "Depends on"),
    ("svc-payments", "ds-paydb",     "Reads from"),
    ("svc-payments", "ext-stripe",   "Depends on"),
    ("svc-payments", "q-events",     "Publishes to"),
    ("svc-ledger",   "q-events",     "Reads from"),
    ("svc-ledger",   "ds-paydb",     "Reads from"),
    ("svc-notify",   "q-events",     "Reads from"),
]


def build_schema():
    """A full .glograph export carrying only the typed schema (empty graph).
    Importing it installs the preset and gives us a clean canvas to build on."""
    def node_def():
        return {
            "id": "type-def", "presetId": "arch-preset", "displayName": "Type",
            "paramType": "select_color", "defaultValue": None, "drivesColor": True,
            "showOnCardDefault": True, "sortOrder": 0,
            "options": [
                {"id": f"type-opt-{i}", "paramDefId": "type-def",
                 "valueSlug": label.lower(), "label": label, "color": color, "sortOrder": i}
                for i, (label, color) in enumerate(TYPE_COLORS.items())
            ],
        }

    def edge_def():
        return {
            "id": "rel-def", "presetId": "arch-preset", "displayName": "Relation",
            "paramType": "select_color", "defaultValue": None,
            "drivesArrow": False, "drivesStyle": False, "drivesColor": True,
            "drivesWidth": False, "sortOrder": 0,
            "options": [
                {"id": f"rel-opt-{i}", "paramDefId": "rel-def",
                 "valueSlug": label.lower().replace(" ", "-"), "label": label,
                 "color": color, "sortOrder": i}
                for i, (label, color) in enumerate(REL_COLORS.items())
            ],
        }

    return {
        "version": 8, "exportedAt": "2026-06-05T00:00:00Z",
        "settings": {"presetName": "Architecture",
                     "paramDefs": [node_def()], "edgeParamDefs": [edge_def()]},
        "nodes": [], "edges": [], "regions": [],
    }


def main():
    g = GloGraph(token=TOKEN)

    # 1. Liveness check. A disabled API returns an HTTP error (GloGraphError); an
    #    app that isn't running refuses the connection (OSError/URLError).
    try:
        g.ping()
    except (GloGraphError, OSError) as e:
        sys.exit(f"Can't reach GloGraph's API at {g.base_url}: {e}\n"
                 "Make sure GloGraph is running and the API is enabled "
                 "(Preferences -> API; green 'API' badge top-left of the canvas).")

    # 2. Provision a dedicated project so we never clobber your other work,
    #    then install the typed schema (this also clears that fresh tab).
    print("Creating project 'payments-system'...")
    g.create_project("payments-system", preset="blank")
    g.import_graph(build_schema())
    g.refresh_schema()           # the active preset just changed; drop the cache
    time.sleep(STEP_DELAY)

    # 3. Upsert the services (watch them pop onto the canvas).
    print(f"Adding {len(SERVICES)} services...")
    ids = {}
    for ext, title, typ, x, y in SERVICES:
        node = g.nodes.upsert(external_id=ext, title=title, x=x, y=y,
                              color=TYPE_COLORS[typ], params={"Type": typ})
        ids[ext] = node["id"]
        print(f"  + {title} ({typ})")
        time.sleep(STEP_DELAY)

    # 4. Upsert the dependencies between them.
    print(f"Wiring {len(DEPS)} dependencies...")
    for i, (s_ext, t_ext, rel) in enumerate(DEPS):
        g.edges.upsert(external_id=f"dep-{i}",
                       source_id=ids[s_ext], target_id=ids[t_ext],
                       color=REL_COLORS[rel], params={"Relation": rel})
        print(f"  {s_ext} --{rel}--> {t_ext}")
        time.sleep(STEP_DELAY)

    print(f"\nDone. {g.stats()}")
    print("Re-run any time: it upserts by external_id, so nothing duplicates.")
    print("Now right-click 'Payments DB' -> Trace upstream to see the blast radius.")


if __name__ == "__main__":
    main()
