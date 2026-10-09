#!/usr/bin/env python3
"""Live HTTP test for the Live Share editor-session handlers.

The session server (`serve_session`, editor mode) mounts the SAME handlers as the
local API, just behind a token. This test exercises those handlers over real HTTP
against the local API (no session needed), so it validates the actual compiled
mutation logic added for live editing: edge reconnect, region lock/minimize, and
node links — plus node create/move/patch and edge create.

Usage:  python tests/editing_handlers_test.py [base_url]
        default base_url = http://127.0.0.1:57321   (the local API)

To point it at a real hosted SESSION instead (two-machine test), pass the host
address and set GLOGRAPH_TOKEN:
        GLOGRAPH_TOKEN=ABCD-... python tests/editing_handlers_test.py http://<host-ip>:57400
"""
import json
import os
import sys
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:57321").rstrip("/")
TOKEN = os.environ.get("GLOGRAPH_TOKEN")
PASS, FAIL = 0, 0


def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    if TOKEN:
        r.add_header("Authorization", "Bearer " + TOKEN)
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, None


def check(name, cond):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"  PASS  {name}")
    else:
        FAIL += 1
        print(f"  FAIL  {name}")


print(f"Target: {BASE}  (token: {'yes' if TOKEN else 'no'})\n")

# Sanity
st, _ = req("GET", "/api/ping")
if st != 200:
    print(f"Cannot reach {BASE} (ping → {st}). Is the app running?")
    sys.exit(2)

# --- nodes: create + move (batch-positions) + patch (properties) ---
st, a = req("POST", "/api/nodes", {"title": "A", "x": 0, "y": 0})
check("create node A", st in (200, 201) and a and "id" in a)
st, b = req("POST", "/api/nodes", {"title": "B", "x": 100, "y": 0})
st, c = req("POST", "/api/nodes", {"title": "C", "x": 200, "y": 0})

st, _ = req("PATCH", "/api/nodes/batch-positions", [{"id": a["id"], "x": 42, "y": 7}])
st, a2 = req("GET", f"/api/nodes/{a['id']}")
check("move node A (batch-positions)", a2 and a2["x"] == 42 and a2["y"] == 7)

st, _ = req("PATCH", f"/api/nodes/{a['id']}", {"title": "A-renamed", "color": "#00b0c8"})
st, a3 = req("GET", f"/api/nodes/{a['id']}")
check("patch node properties", a3 and a3["title"] == "A-renamed" and a3["color"] == "#00b0c8")

# --- node links: add + remove ---
st, link = req("POST", f"/api/nodes/{a['id']}/links", {"url": "https://example.com", "label": "ex"})
check("add link", st in (200, 201) and link and "id" in link)
st, a4 = req("GET", f"/api/nodes/{a['id']}")
check("link present on node", a4 and any(l["id"] == link["id"] for l in (a4.get("links") or [])))
st, _ = req("DELETE", f"/api/links/{link['id']}")
st, a5 = req("GET", f"/api/nodes/{a['id']}")
check("remove link", a5 and not any(l["id"] == link["id"] for l in (a5.get("links") or [])))

# --- edges: create + reconnect (the new PatchEdgeBody source/target) ---
st, e = req("POST", "/api/edges", {"sourceId": a["id"], "targetId": b["id"]})
check("create edge A->B", st in (200, 201) and e and "id" in e)
st, _ = req("PATCH", f"/api/edges/{e['id']}", {"sourceId": a["id"], "targetId": c["id"]})
st, e2 = req("GET", f"/api/edges/{e['id']}")
check("reconnect edge A->B to A->C", e2 and e2["sourceId"] == a["id"] and e2["targetId"] == c["id"])
st, _ = req("PATCH", f"/api/edges/{e['id']}", {"label": "rel", "color": "#c83030"})
st, e3 = req("GET", f"/api/edges/{e['id']}")
check("patch edge label/color", e3 and e3["label"] == "rel" and e3["color"] == "#c83030")

# --- regions: create + move/resize + lock/minimize (new PatchRegionBody fields) ---
st, rg = req("POST", "/api/regions", {"title": "R", "x": 0, "y": 0, "width": 200, "height": 150})
check("create region", st in (200, 201) and rg and "id" in rg)
st, _ = req("PATCH", f"/api/regions/{rg['id']}", {"x": 10, "y": 20, "width": 300, "height": 250})
st, rg2 = req("GET", f"/api/regions/{rg['id']}")
check("move/resize region", rg2 and rg2["x"] == 10 and rg2["width"] == 300)
st, _ = req("PATCH", f"/api/regions/{rg['id']}", {"isLocked": True, "isMinimized": True})
st, rg3 = req("GET", f"/api/regions/{rg['id']}")
check("region lock/minimize persisted", rg3 and rg3.get("isLocked") is True and rg3.get("isMinimized") is True)
st, _ = req("PATCH", f"/api/regions/{rg['id']}", {"isLocked": False})
st, rg4 = req("GET", f"/api/regions/{rg['id']}")
check("region unlock (and minimize unchanged)", rg4 and rg4.get("isLocked") is False and rg4.get("isMinimized") is True)

# --- cleanup ---
for nid in (a, b, c):
    req("DELETE", f"/api/nodes/{nid['id']}")
req("DELETE", f"/api/regions/{rg['id']}")

print(f"\n{PASS} passed, {FAIL} failed")
sys.exit(1 if FAIL else 0)
