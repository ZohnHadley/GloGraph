#!/usr/bin/env python3
"""Generate demos/software-architecture-demo.glograph — a payments-platform
software-architecture map (services, datastores, a cache, an event bus, external
deps) for the web demo's default project. Self-contained v8 export with its own
"Software Architecture" preset. Re-run to regenerate."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "demos", "software-architecture-demo.glograph")

PRESET_ID = "b0000000-0000-0000-0000-000000000001"
TYPE_DEF = "b1000000-0000-0000-0000-000000000001"
OWNER_DEF = "b1000000-0000-0000-0000-000000000002"
REL_DEF = "b3000000-0000-0000-0000-000000000001"
DIR_DEF = "b3000000-0000-0000-0000-000000000002"
NOTES_DEF = "b3000000-0000-0000-0000-000000000003"

# Type option slug -> (label, colour)
TYPES = [
    ("gateway",   "Gateway",   "#d68b2a"),
    ("service",   "Service",   "#5588bb"),
    ("datastore", "Datastore", "#3d9e5f"),
    ("cache",     "Cache",     "#00b0c8"),
    ("queue",     "Queue",     "#7766aa"),
    ("external",  "External",  "#888888"),
]
# Relation option slug -> (label, colour)
RELS = [
    ("calls",         "Calls",         "#d68b2a"),
    ("depends-on",    "Depends on",    "#5588bb"),
    ("reads",         "Reads",         "#3d9e5f"),
    ("writes",        "Writes",        "#c83030"),
    ("publishes-to",  "Publishes to",  "#7766aa"),
    ("subscribes-to", "Subscribes to", "#00b0c8"),
]
REL_COLOR = {slug: color for slug, _, color in RELS}

def type_options():
    return [
        {"id": f"b2000000-0000-0000-0000-0000000000{i:02d}", "paramDefId": TYPE_DEF,
         "valueSlug": slug, "label": label, "color": color, "sortOrder": i}
        for i, (slug, label, color) in enumerate(TYPES)
    ]

def rel_options():
    return [
        {"id": f"b4000000-0000-0000-0000-0000000000{i:02d}", "paramDefId": REL_DEF,
         "valueSlug": slug, "label": label, "color": color, "sortOrder": i}
        for i, (slug, label, color) in enumerate(RELS)
    ]

settings = {
    "presetName": "Software Architecture",
    "paramDefs": [
        {"id": TYPE_DEF, "presetId": PRESET_ID, "displayName": "Type", "paramType": "select_color",
         "defaultValue": None, "drivesColor": True, "showOnCardDefault": True, "sortOrder": 0,
         "options": type_options()},
        {"id": OWNER_DEF, "presetId": PRESET_ID, "displayName": "Owner", "paramType": "text",
         "defaultValue": None, "drivesColor": False, "showOnCardDefault": False, "sortOrder": 1,
         "options": []},
    ],
    "edgeParamDefs": [
        {"id": REL_DEF, "presetId": PRESET_ID, "displayName": "Relation", "paramType": "select_color",
         "defaultValue": None, "drivesArrow": False, "drivesStyle": False, "drivesColor": True,
         "drivesWidth": False, "sortOrder": 0, "options": rel_options()},
        {"id": DIR_DEF, "presetId": PRESET_ID, "displayName": "Directed", "paramType": "boolean",
         "defaultValue": "true", "drivesArrow": True, "drivesStyle": False, "drivesColor": False,
         "drivesWidth": False, "sortOrder": 1, "options": []},
        {"id": NOTES_DEF, "presetId": PRESET_ID, "displayName": "Notes", "paramType": "text",
         "defaultValue": None, "drivesArrow": False, "drivesStyle": False, "drivesColor": False,
         "drivesWidth": False, "sortOrder": 2, "options": []},
    ],
}

# name -> (type slug, owner, x, y, description)
NODES = {
    "Web App":       ("service",   "Frontend", 0,    80,  "Customer-facing React app. Talks to the platform only through the API Gateway."),
    "Mobile App":    ("service",   "Frontend", 0,    240, "iOS/Android client. Same public API surface as the web app."),
    "API Gateway":   ("gateway",   "Platform", 300,  160, "Edge router + auth check. Fans requests out to the core services."),
    "Auth Service":  ("service",   "Identity", 620,  -40, "Issues and validates session tokens. Most services depend on it."),
    "Payments Service": ("service","Payments", 620,  140, "Owns /charge and /refund. Calls Stripe and writes the payments ledger."),
    "Orders Service":("service",   "Commerce", 620,  320, "Owns the order lifecycle; writes orders and emits order events."),
    "Notifications Service": ("service","Growth",620,500,"Sends email/SMS off the event bus (order confirmations, receipts)."),
    "Redis Cache":   ("cache",     "Platform", 940,  -40, "Shared session + hot-path cache. Read by Auth and Orders."),
    "Payments DB":   ("datastore", "Payments", 940,  140, "Postgres. Source of truth for charges, refunds, and payout state."),
    "Orders DB":     ("datastore", "Commerce", 940,  320, "Postgres. Orders, line items, and fulfilment status."),
    "Event Bus":     ("queue",     "Platform", 940,  500, "Kafka. Order/payment events; decouples producers from consumers."),
    "Stripe":        ("external",  None,       1260, 140, "Third-party card processor. Called by Payments to capture funds."),
    "SendGrid":      ("external",  None,       1260, 500, "Third-party email provider used by Notifications."),
}

# (source, target, relation slug)
EDGES = [
    ("Web App", "API Gateway", "calls"),
    ("Mobile App", "API Gateway", "calls"),
    ("API Gateway", "Auth Service", "calls"),
    ("API Gateway", "Payments Service", "calls"),
    ("API Gateway", "Orders Service", "calls"),
    ("Payments Service", "Auth Service", "depends-on"),
    ("Orders Service", "Auth Service", "depends-on"),
    ("Payments Service", "Payments DB", "writes"),
    ("Orders Service", "Orders DB", "writes"),
    ("Auth Service", "Redis Cache", "reads"),
    ("Orders Service", "Redis Cache", "reads"),
    ("Payments Service", "Stripe", "calls"),
    ("Payments Service", "Event Bus", "publishes-to"),
    ("Orders Service", "Event Bus", "publishes-to"),
    ("Notifications Service", "Event Bus", "subscribes-to"),
    ("Notifications Service", "SendGrid", "calls"),
]

NODE_W, NODE_H = 200.0, 80.0

def closest_handles(dx, dy):
    if abs(dx) >= abs(dy):
        return ("right", "left") if dx >= 0 else ("left", "right")
    return ("bottom", "top") if dy >= 0 else ("top", "bottom")

# Build node records + id lookup.
node_ids = {}
nodes = []
for i, (name, (tslug, owner, x, y, desc)) in enumerate(NODES.items(), start=1):
    nid = f"b5000000-0000-0000-0000-0000000000{i:02d}"
    node_ids[name] = (nid, x, y)
    pvs = [{"id": f"b6000000-0000-0000-0000-0000000000{i:02d}", "nodeId": nid,
            "paramDefId": TYPE_DEF, "value": tslug, "isEnabled": True, "showOnCard": True}]
    if owner:
        pvs.append({"id": f"b6000000-0000-0000-0000-0000000001{i:02d}", "nodeId": nid,
                    "paramDefId": OWNER_DEF, "value": owner, "isEnabled": True, "showOnCard": False})
    nodes.append({
        "id": nid, "title": name, "description": desc, "eventDate": None,
        "dateAdded": "2026-06-07T00:00:00Z", "x": float(x), "y": float(y),
        "color": None, "confidence": None, "impactMagnitude": None, "tags": [],
        "links": [], "media": [], "paramValues": pvs,
        "isPinned": False, "isExpandPinned": False, "zOrder": 0,
        "kind": "standard", "width": None, "height": None,
    })

# A standalone note explaining the demo.
nodes.append({
    "id": "b5000000-0000-0000-0000-0000000000ff", "title": "",
    "description": "Software architecture map — a payments platform.\n\nEvery box is a typed node and every arrow a classified dependency, so this is queryable data, not just a picture. Right-click a node and \"Trace upstream\" to see its blast radius (e.g. what breaks if Auth Service or Redis goes down).",
    "eventDate": None, "dateAdded": "2026-06-07T00:00:00Z", "x": 0.0, "y": 440.0,
    "color": None, "confidence": None, "impactMagnitude": None, "tags": [],
    "links": [], "media": [], "paramValues": [],
    "isPinned": False, "isExpandPinned": False, "zOrder": 0,
    "kind": "note", "width": 260.0, "height": 150.0,
})

edges = []
for i, (s, t, rel) in enumerate(EDGES, start=1):
    eid = f"be000000-0000-0000-0000-0000000000{i:02d}"
    sid, sx, sy = node_ids[s]
    tid, tx, ty = node_ids[t]
    sh, th = closest_handles((tx + NODE_W/2) - (sx + NODE_W/2), (ty + NODE_H/2) - (sy + NODE_H/2))
    edges.append({
        "id": eid, "sourceId": sid, "targetId": tid, "sourceHandle": sh, "targetHandle": th,
        "waypoints": None,
        "paramValues": [
            {"id": f"bf000000-0000-0000-0000-0000000001{i:02d}", "edgeId": eid, "paramDefId": REL_DEF, "value": rel, "isEnabled": True},
            {"id": f"bf000000-0000-0000-0000-0000000002{i:02d}", "edgeId": eid, "paramDefId": DIR_DEF, "value": "true", "isEnabled": True},
        ],
        "color": REL_COLOR[rel],  # bake colour (drivesColor only drives the label since Phase 40)
    })

regions = [
    {"id": "b7000000-0000-0000-0000-000000000001", "title": "Core services", "x": 580.0, "y": -100.0,
     "width": 300.0, "height": 720.0, "color": "#5588bb", "zOrder": 0, "isLocked": False, "isMinimized": False, "createdAt": "2026-06-07T00:00:00Z"},
    {"id": "b7000000-0000-0000-0000-000000000002", "title": "Data & messaging", "x": 900.0, "y": -100.0,
     "width": 300.0, "height": 720.0, "color": "#3d9e5f", "zOrder": 0, "isLocked": False, "isMinimized": False, "createdAt": "2026-06-07T00:00:00Z"},
    {"id": "b7000000-0000-0000-0000-000000000003", "title": "Third-party", "x": 1220.0, "y": 100.0,
     "width": 260.0, "height": 520.0, "color": "#888888", "zOrder": 0, "isLocked": False, "isMinimized": False, "createdAt": "2026-06-07T00:00:00Z"},
]

export = {
    "version": 8, "exportedAt": "2026-06-07T00:00:00Z", "settings": settings,
    "nodes": nodes, "edges": edges, "regions": regions,
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(export, f, indent=1)
print(f"wrote {os.path.normpath(OUT)}: {len(nodes)} nodes, {len(edges)} edges, {len(regions)} regions")
