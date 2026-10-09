#!/usr/bin/env python3
"""Generate demos/agent-memory-demo.glograph (v8). An AI ops agent's accumulated
memory of a software system: typed entities + typed relationships, so you can ask
"what breaks if the user database goes down?" (impact trace) — the structured,
multi-hop, *visible* memory a vector store can't give an agent."""
import json, pathlib

P = "a0000000-0000-0000-0000-000000000001"  # preset id
def uid(p, n): return f"{p}-0000-0000-0000-{n:012d}"

# ── node "Type" param (drives colour) ──
type_opts = [
    ("service",  "Service",  "#5588bb"),
    ("datastore","Datastore","#3d9e5f"),
    ("external", "External", "#888888"),
    ("person",   "Person",   "#d68b2a"),
    ("incident", "Incident", "#c83030"),
    ("decision", "Decision", "#7766aa"),
]
TYPE = uid("a1000000", 1)
param_defs = [
    {"id": TYPE, "presetId": P, "displayName": "Type", "paramType": "select_color",
     "defaultValue": None, "drivesColor": True, "showOnCardDefault": True, "sortOrder": 0,
     "options": [{"id": uid("a2000000", i+1), "paramDefId": TYPE, "valueSlug": s,
                  "label": l, "color": c, "sortOrder": i} for i, (s, l, c) in enumerate(type_opts)]},
    {"id": uid("a1000000", 2), "presetId": P, "displayName": "Confidence (%)", "paramType": "number",
     "defaultValue": None, "drivesColor": False, "showOnCardDefault": False, "sortOrder": 1, "options": []},
    {"id": uid("a1000000", 3), "presetId": P, "displayName": "Source", "paramType": "text",
     "defaultValue": None, "drivesColor": False, "showOnCardDefault": False, "sortOrder": 2, "options": []},
]

# ── edge "Relation" param (drives colour) ──
rel_opts = [
    ("depends-on", "Depends on", "#5588bb"),
    ("owns",       "Owns",       "#d68b2a"),
    ("caused",     "Caused",     "#c83030"),
    ("mitigates",  "Mitigates",  "#3d9e5f"),
    ("supersedes", "Supersedes", "#7766aa"),
    ("related",    "Related",    "#888888"),
]
REL = uid("a3000000", 1)
DIRECTED = uid("a3000000", 2)
WEIGHT = uid("a3000000", 3)
edge_param_defs = [
    {"id": REL, "presetId": P, "displayName": "Relation", "paramType": "select_color",
     "defaultValue": None, "drivesArrow": False, "drivesStyle": False, "drivesColor": True,
     "drivesWidth": False, "sortOrder": 0,
     "options": [{"id": uid("a4000000", i+1), "paramDefId": REL, "valueSlug": s,
                  "label": l, "color": c, "sortOrder": i} for i, (s, l, c) in enumerate(rel_opts)]},
    {"id": DIRECTED, "presetId": P, "displayName": "Directed", "paramType": "boolean",
     "defaultValue": "true", "drivesArrow": True, "drivesStyle": False, "drivesColor": False,
     "drivesWidth": False, "sortOrder": 1, "options": []},
    {"id": WEIGHT, "presetId": P, "displayName": "Weight", "paramType": "number",
     "defaultValue": "2", "drivesArrow": False, "drivesStyle": False, "drivesColor": False,
     "drivesWidth": True, "sortOrder": 2, "options": []},
    {"id": uid("a3000000", 4), "presetId": P, "displayName": "Notes", "paramType": "text",
     "defaultValue": None, "drivesArrow": False, "drivesStyle": False, "drivesColor": False,
     "drivesWidth": False, "sortOrder": 3, "options": []},
]

DATE = "2026-06-04T00:00:00Z"
COLOR = {s: c for s, l, c in type_opts}
REL_COLOR = {s: c for s, l, c in rel_opts}

# (key, title, type, x, y, confidence, source, description)
N = [
    ("billing", "Billing API", "service", 520, 160, None, None,
     "Owns the /charge and /invoice routes. Calls Auth on every request and Stripe to capture cards."),
    ("auth", "Auth Service", "service", 280, 320, None, None,
     "Issues and validates session tokens for every internal call. Owned by Priya."),
    ("userdb", "User Database", "datastore", 60, 500, 95, "incident postmortem",
     "Postgres primary: accounts, sessions, entitlements. Single point of failure; hit connection limits on Oct 3."),
    ("stripe", "Stripe", "external", 800, 160, None, None,
     "Third-party card processor. Billing API depends on it for captures; outages here surface as failed charges."),
    ("priya", "Priya (on-call)", "person", 280, 80, None, "#incidents",
     "Owns Auth Service. Paged for the Oct 3 checkout outage and led the mitigation."),
    ("outage", "Oct 3 checkout outage", "incident", 60, 720, 90, "incident postmortem",
     "Checkout failed for ~40 min. Traced to the user database exhausting its connection pool under load."),
    ("replica", "Add a read replica", "decision", -200, 560, 80, "design review",
     "Agreed mitigation: route read traffic to a replica so the primary stops being the bottleneck."),
]

nodes = []
for i, (k, title, typ, x, y, conf, src, desc) in enumerate(N, start=1):
    nid = uid("a5000000", i)
    pvs = [{"id": uid("a6000000", i*10+1), "nodeId": nid, "paramDefId": TYPE,
            "value": typ, "isEnabled": True, "showOnCard": True}]
    if conf is not None:
        pvs.append({"id": uid("a6000000", i*10+2), "nodeId": nid, "paramDefId": uid("a1000000", 2),
                    "value": str(conf), "isEnabled": True, "showOnCard": False})
    if src is not None:
        pvs.append({"id": uid("a6000000", i*10+3), "nodeId": nid, "paramDefId": uid("a1000000", 3),
                    "value": src, "isEnabled": True, "showOnCard": False})
    nodes.append({"id": nid, "title": title, "description": desc, "eventDate": None, "dateAdded": DATE,
                  "x": x, "y": y, "color": None, "confidence": None, "impactMagnitude": None,
                  "tags": [], "links": [], "media": [], "paramValues": pvs,
                  "isPinned": False, "isExpandPinned": False, "zOrder": 0, "kind": "standard",
                  "width": None, "height": None})

# Explanatory note (graph object).
nodes.append({"id": "a8a8a8a8-0000-0000-0000-000000000001", "title": "About this demo",
              "description": "Note. This is an AI ops agent's MEMORY of a system, as a typed graph: services, a datastore, people, an incident, a decision, and how they connect. Right-click the user database and Trace upstream to see what breaks if it goes down. An agent reads and writes this over the API/MCP; you can see and correct it.",
              "eventDate": None, "dateAdded": DATE, "x": 520, "y": 480, "color": None,
              "confidence": None, "impactMagnitude": None, "tags": [], "links": [], "media": [],
              "paramValues": [], "isPinned": False, "isExpandPinned": False, "zOrder": 0,
              "kind": "note", "width": 300, "height": 170})

NID = {k: uid("a5000000", i) for i, (k, *_rest) in enumerate(N, start=1)}

# (source, target, relation, weight, sourceHandle, targetHandle)
E = [
    ("billing", "auth",   "depends-on", 3, "left", "right"),
    ("billing", "stripe", "depends-on", 2, "right", "left"),
    ("auth",    "userdb", "depends-on", 3, "left", "right"),
    ("userdb",  "outage", "caused",     3, "bottom", "top"),
    ("priya",   "auth",   "owns",       2, "bottom", "top"),
    ("priya",   "outage", "related",    1, "left", "top"),
    ("replica", "userdb", "mitigates",  2, "right", "left"),
    ("replica", "outage", "mitigates",  2, "bottom", "left"),
]
edges = []
for i, (s, t, rel, w, sh, th) in enumerate(E, start=1):
    eid = uid("ae000000", i)
    edges.append({"id": eid, "sourceId": NID[s], "targetId": NID[t],
                  "sourceHandle": sh, "targetHandle": th, "waypoints": None,
                  "paramValues": [
                      {"id": uid("af000000", i*10+1), "edgeId": eid, "paramDefId": REL, "value": rel, "isEnabled": True},
                      {"id": uid("af000000", i*10+2), "edgeId": eid, "paramDefId": DIRECTED, "value": "true", "isEnabled": True},
                      {"id": uid("af000000", i*10+3), "edgeId": eid, "paramDefId": WEIGHT, "value": str(w), "isEnabled": True},
                  ],
                  "color": REL_COLOR[rel]})

regions = [
    {"id": uid("a7000000", 1), "title": "Live system", "x": -20, "y": 100, "width": 940, "height": 520,
     "color": "#5588bb", "createdAt": DATE},
    {"id": uid("a7000000", 2), "title": "What the agent observed", "x": -280, "y": 480, "width": 460, "height": 360,
     "color": "#c83030", "createdAt": DATE},
]

# Spread node positions + region bounds for adequate expanded-card spacing.
SCALE = 1.6
for _n in nodes:
    _n["x"] = round(_n["x"] * SCALE, 2); _n["y"] = round(_n["y"] * SCALE, 2)
for _r in regions:
    for _k in ("x", "y", "width", "height"):
        _r[_k] = round(_r[_k] * SCALE, 2)

doc = {"version": 8, "exportedAt": DATE,
       "settings": {"presetName": "Agent Memory", "paramDefs": param_defs, "edgeParamDefs": edge_param_defs},
       "nodes": nodes, "edges": edges, "regions": regions}

out = pathlib.Path(__file__).resolve().parent.parent / "demos" / "agent-memory-demo.glograph"
out.write_text(json.dumps(doc, indent=2), encoding="utf-8")
print(f"wrote {out}  nodes={len(nodes)} edges={len(edges)} regions={len(regions)}")
