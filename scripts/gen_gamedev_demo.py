#!/usr/bin/env python3
"""Generate demos/gamedev-project-demo.glograph (v8) — a media-rich demo for
recording videos/gifs. It exercises EVERY graph-item kind: standard typed nodes
(features/systems/tasks/milestone), note items, image items, video item, audio
items, plus regions and typed/coloured edges.

Theme: an indie pixel-platformer project ("Hollow Drift"). Media paths come from
demos/media/manifest.json (run scripts/fetch_demo_media.py first to populate it
with CC0 assets). Media is referenced as local files (srcType=file) by absolute
path, which the desktop app loads via the asset protocol (scope is "**").
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "demos" / "media" / "manifest.json"
if not MANIFEST.exists():
    sys.exit("Missing demos/media/manifest.json — run scripts/fetch_demo_media.py first.")
M = json.loads(MANIFEST.read_text(encoding="utf-8"))

def media_path(kind: str, idx: int) -> str:
    key = {"image": "images", "audio": "audio", "video": "video"}[kind]
    val = M.get(key)
    if isinstance(val, str):       # manifest stores `video` as a single path string
        return val
    lst = val or []
    if not lst:
        sys.exit(f"manifest has no {key} entries — re-run fetch_demo_media.py")
    return lst[min(idx, len(lst) - 1)]

P = "b0000000-0000-0000-0000-000000000001"  # preset id
DATE = "2026-06-04T00:00:00Z"
def uid(p, n): return f"{p}-0000-0000-0000-{n:012d}"

# ── node "Type" (drives colour) + Effort + Status ──
type_opts = [
    ("feature",   "Feature",   "#5588bb"),
    ("system",    "System",    "#7766aa"),
    ("art",       "Art",       "#d68b2a"),
    ("audio",     "Audio",     "#3d9e5f"),
    ("task",      "Task",      "#888888"),
    ("milestone", "Milestone", "#c83030"),
]
status_opts = [("todo", "To do"), ("doing", "In progress"), ("done", "Done")]
TYPE = uid("b1000000", 1)
EFFORT = uid("b1000000", 2)
STATUS = uid("b1000000", 3)
COLOR = {s: c for s, _, c in type_opts}
param_defs = [
    {"id": TYPE, "presetId": P, "displayName": "Type", "paramType": "select_color",
     "defaultValue": None, "drivesColor": True, "showOnCardDefault": True, "sortOrder": 0,
     "options": [{"id": uid("b2000000", i + 1), "paramDefId": TYPE, "valueSlug": s,
                  "label": l, "color": c, "sortOrder": i} for i, (s, l, c) in enumerate(type_opts)]},
    {"id": EFFORT, "presetId": P, "displayName": "Effort (days)", "paramType": "number",
     "defaultValue": None, "drivesColor": False, "showOnCardDefault": False, "sortOrder": 1, "options": []},
    {"id": STATUS, "presetId": P, "displayName": "Status", "paramType": "select",
     "defaultValue": None, "drivesColor": False, "showOnCardDefault": True, "sortOrder": 2,
     "options": [{"id": uid("b2500000", i + 1), "paramDefId": STATUS, "valueSlug": s,
                  "label": l, "color": None, "sortOrder": i} for i, (s, l) in enumerate(status_opts)]},
]

# ── edge "Relation" (drives colour) + Directed (arrow) + Weight (width) ──
rel_opts = [
    ("depends-on", "Depends on", "#5588bb"),
    ("blocks",     "Blocks",     "#c83030"),
    ("part-of",    "Part of",    "#7766aa"),
    ("related",    "Related",    "#888888"),
]
REL = uid("b3000000", 1)
DIRECTED = uid("b3000000", 2)
WEIGHT = uid("b3000000", 3)
REL_COLOR = {s: c for s, _, c in rel_opts}
edge_param_defs = [
    {"id": REL, "presetId": P, "displayName": "Relation", "paramType": "select_color",
     "defaultValue": None, "drivesArrow": False, "drivesStyle": False, "drivesColor": True,
     "drivesWidth": False, "sortOrder": 0,
     "options": [{"id": uid("b4000000", i + 1), "paramDefId": REL, "valueSlug": s,
                  "label": l, "color": c, "sortOrder": i} for i, (s, l, c) in enumerate(rel_opts)]},
    {"id": DIRECTED, "presetId": P, "displayName": "Directed", "paramType": "boolean",
     "defaultValue": "true", "drivesArrow": True, "drivesStyle": False, "drivesColor": False,
     "drivesWidth": False, "sortOrder": 1, "options": []},
    {"id": WEIGHT, "presetId": P, "displayName": "Weight", "paramType": "number",
     "defaultValue": "2", "drivesArrow": False, "drivesStyle": False, "drivesColor": False,
     "drivesWidth": True, "sortOrder": 2, "options": []},
]

# ── nodes ──────────────────────────────────────────────────────────────────────
# Each: key, title, kind, type, x, y, effort, status, desc, media(=(mediaType, idx) or None),
#       width, height
N = [
    # Core systems (region R1)
    ("player",  "Player controller", "standard", "system",  40,  170, 5, "done",
     "8-direction run + variable jump height. Momentum-based, the core feel of the game.", None, None, None),
    ("physics", "Physics & collision", "standard", "system", 40, 330, 4, "done",
     "Swept-AABB collision against the tilemap. Owns gravity, one-way platforms, slopes.", None, None, None),
    ("tilemap", "Tilemap engine", "standard", "system", 360, 170, 3, "done",
     "Chunked tilemap renderer + collision baking. Loads levels authored in the editor.", None, None, None),
    ("save",    "Save system", "standard", "feature", 360, 330, 2, "doing",
     "Three save slots, checkpoint-based. Serialised to a local file.", None, None, None),
    ("enemyai", "Enemy AI", "standard", "feature", 200, 470, 4, "doing",
     "State-machine patrols + chase. Reused by every enemy type, including the boss.", None, None, None),

    # Content — Level 1 (region R2)
    ("level1",  "Level 1: Caverns", "standard", "feature", 820, 170, 6, "doing",
     "The first playable level. Tutorialises movement, then introduces hazards and the boss gate.", None, None, None),
    ("menu",    "Main menu", "standard", "feature", 1060, 170, 2, "todo",
     "Title screen, save-slot select, options. First thing a player sees.", None, None, None),
    ("boss",    "Boss: The Warden", "standard", "feature", 940, 340, 5, "todo",
     "Level 1 boss. Three phases. Gates progression to the vertical slice.", None, None, None),

    # Art & Audio (region R3) — the media items
    ("artchar", "Character sprites", "image", "art", 20, 640, None, "done",
     "", ("image", 1), 260, 180),
    ("arttiles","Tileset & mockup", "image", "art", 300, 640, None, "done",
     "", ("image", 0), 260, 180),
    ("artenemy","Enemy & item concepts", "image", "art", 580, 640, None, "doing",
     "", ("image", 2), 260, 180),
    ("autheme", "Main theme (loop)", "audio", "audio", 20, 900, None, "doing",
     "", ("audio", 0), None, None),
    ("aujump",  "Jump SFX", "audio", "audio", 300, 900, None, "done",
     "", ("audio", 1), None, None),
    ("aupickup","Pickup SFX", "audio", "audio", 560, 900, None, "done",
     "", ("audio", 2), None, None),

    # Milestone (region R4)
    ("vslice",  "Vertical Slice", "standard", "milestone", 1120, 640, None, "todo",
     "The demo build: one polished level start to boss, with menu, art, and audio in place.", None, None, None),
    ("polish",  "Polish & juice", "standard", "task", 920, 640, 3, "todo",
     "Screenshake, hit-stop, particles, transitions. The pass that makes it feel good.", None, None, None),
    ("preview", "Gameplay preview", "video", "art", 920, 800, None, "doing",
     "", ("video", 0), 340, 210),
    ("pillars", "", "note", None, 1180, 820, None, None,
     "Design pillars\n\n1. Momentum is king — never take control away from the player.\n"
     "2. Death is cheap, checkpoints are close.\n3. Every screen teaches one idea.", None, 300, 180),

    # Floating explainer note
    ("about",   "", "note", None, 1180, 120, None, None,
     "About this demo. A game project as a typed graph: systems, features, tasks, a milestone, plus "
     "image / video / audio / note items and regions. Right-click any node and Trace upstream to see "
     "what a slipping task puts at risk. Built for recording GloGraph videos.", None, 320, 190),
]

def node_params(typ, effort, status):
    pvs = []
    if typ is not None:
        pvs.append({"paramDefId": TYPE, "value": typ, "showOnCard": True})
    if effort is not None:
        pvs.append({"paramDefId": EFFORT, "value": str(effort), "showOnCard": False})
    if status is not None:
        pvs.append({"paramDefId": STATUS, "value": status, "showOnCard": True})
    return pvs

NID = {}
nodes = []
for i, (key, title, kind, typ, x, y, effort, status, desc, media, w, h) in enumerate(N, start=1):
    nid = uid("b5000000", i)
    NID[key] = nid
    pvs = [{"id": uid("b6000000", i * 10 + j + 1), "nodeId": nid,
            "paramDefId": pv["paramDefId"], "value": pv["value"],
            "isEnabled": True, "showOnCard": pv["showOnCard"]}
           for j, pv in enumerate(node_params(typ, effort, status))]
    media_rows = []
    if media is not None:
        mtype, midx = media
        media_rows.append({
            "id": uid("b9000000", i), "nodeId": nid,
            "label": title or mtype, "src": media_path(mtype, midx),
            "srcType": "file", "mediaType": mtype, "sortOrder": 0, "showOnCard": True,
        })
    nodes.append({
        "id": nid, "title": title, "description": desc or None, "eventDate": None,
        "dateAdded": DATE, "x": x, "y": y, "color": None, "confidence": None,
        "impactMagnitude": None, "tags": [], "links": [], "media": media_rows,
        "paramValues": pvs, "isPinned": False, "isExpandPinned": False, "zOrder": 0,
        "kind": kind, "width": w, "height": h,
    })

# ── edges ──────────────────────────────────────────────────────────────────────
# (source, target, relation, weight, sourceHandle, targetHandle)
E = [
    ("player",  "physics", "depends-on", 3, "bottom", "top"),
    ("enemyai", "physics", "depends-on", 2, "left", "bottom"),
    ("boss",    "enemyai", "depends-on", 3, "left", "right"),
    ("level1",  "tilemap", "depends-on", 3, "left", "right"),
    ("level1",  "player",  "depends-on", 2, "left", "right"),
    ("save",    "menu",    "related",    1, "right", "left"),
    # art / audio wired into the features they belong to
    ("artchar",  "player",  "part-of", 2, "top", "bottom"),
    ("arttiles", "tilemap", "part-of", 2, "top", "bottom"),
    ("artenemy", "enemyai", "part-of", 2, "top", "bottom"),
    ("autheme",  "level1",  "part-of", 1, "top", "left"),
    ("aujump",   "player",  "related", 1, "top", "bottom"),
    ("aupickup", "level1",  "related", 1, "top", "bottom"),
    # milestone gating
    ("vslice",  "level1",  "depends-on", 3, "top", "bottom"),
    ("vslice",  "boss",    "depends-on", 3, "left", "bottom"),
    ("vslice",  "menu",    "depends-on", 2, "top", "bottom"),
    ("polish",  "vslice",  "blocks",     2, "right", "left"),
    ("boss",    "vslice",  "blocks",     2, "bottom", "top"),
    ("preview", "vslice",  "related",    1, "right", "bottom"),
    ("pillars", "player",  "related",    1, "left", "right"),
]
edges = []
for i, (s, t, rel, w, sh, th) in enumerate(E, start=1):
    eid = uid("be000000", i)
    edges.append({
        "id": eid, "sourceId": NID[s], "targetId": NID[t],
        "sourceHandle": sh, "targetHandle": th, "waypoints": None,
        "paramValues": [
            {"id": uid("bf000000", i * 10 + 1), "edgeId": eid, "paramDefId": REL, "value": rel, "isEnabled": True},
            {"id": uid("bf000000", i * 10 + 2), "edgeId": eid, "paramDefId": DIRECTED, "value": "true", "isEnabled": True},
            {"id": uid("bf000000", i * 10 + 3), "edgeId": eid, "paramDefId": WEIGHT, "value": str(w), "isEnabled": True},
        ],
        "color": REL_COLOR[rel],
    })

# ── regions ────────────────────────────────────────────────────────────────────
regions = [
    {"id": uid("b7000000", 1), "title": "Core systems", "x": -40, "y": 110, "width": 700, "height": 430,
     "color": "#7766aa", "createdAt": DATE},
    {"id": uid("b7000000", 2), "title": "Content — Level 1", "x": 760, "y": 110, "width": 480, "height": 360,
     "color": "#5588bb", "createdAt": DATE},
    {"id": uid("b7000000", 3), "title": "Art & Audio", "x": -40, "y": 580, "width": 880, "height": 480,
     "color": "#d68b2a", "createdAt": DATE},
    {"id": uid("b7000000", 4), "title": "Milestone: Vertical Slice", "x": 880, "y": 580, "width": 620, "height": 480,
     "color": "#c83030", "createdAt": DATE},
]

# Spread node positions + region bounds so expanded cards have adequate spacing
# (card sizes are left unscaled — only the layout grid grows).
SCALE = 1.6
for _n in nodes:
    _n["x"] = round(_n["x"] * SCALE, 2); _n["y"] = round(_n["y"] * SCALE, 2)
for _r in regions:
    for _k in ("x", "y", "width", "height"):
        _r[_k] = round(_r[_k] * SCALE, 2)

doc = {"version": 8, "exportedAt": DATE,
       "settings": {"presetName": "Game Project", "paramDefs": param_defs, "edgeParamDefs": edge_param_defs},
       "nodes": nodes, "edges": edges, "regions": regions}

out = ROOT / "demos" / "gamedev-project-demo.glograph"
out.write_text(json.dumps(doc, indent=2), encoding="utf-8")
kinds = {}
for n in nodes:
    kinds[n["kind"]] = kinds.get(n["kind"], 0) + 1
print(f"wrote {out}")
print(f"  nodes={len(nodes)} edges={len(edges)} regions={len(regions)}  kinds={kinds}")
