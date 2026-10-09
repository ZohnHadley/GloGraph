#!/usr/bin/env python3
"""Headless 'guest' contract test for a real Live Share SESSION server.

This is the automated half of the two-machine LAN test. On machine A, open the
GloGraph app and start hosting (Share -> Host a session) — choose "Everyone can
edit" to exercise the editor routes. Note the address (e.g. 192.168.1.20:57400)
and the join token. Then run this from machine B (or from A using the LAN IP):

    python tests/session_guest_test.py <host-ip>:57400 <JOIN-TOKEN>

It checks exactly what a guest's SpectateView relies on:
  * token auth gating (no token -> 401; bad token -> 401)
  * GET /api/session reports the role
  * GET /api/graph returns the host's graph
  * (editor) an edit lands on the host AND is announced on GET /api/events (SSE),
    then shows up on a refetch — the host-authoritative round trip
"""
import json
import sys
import threading
import time
import urllib.request

if len(sys.argv) < 3:
    print(__doc__)
    sys.exit(2)

ADDR = sys.argv[1].replace("http://", "").replace("https://", "").rstrip("/")
TOKEN = sys.argv[2]
BASE = f"http://{ADDR}"
PASS, FAIL = 0, 0


def req(method, path, body=None, token=TOKEN):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    if token:
        r.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, None


def check(name, cond):
    global PASS, FAIL
    PASS, FAIL = (PASS + 1, FAIL) if cond else (PASS, FAIL + 1)
    print(f"  {'PASS' if cond else 'FAIL'}  {name}")


print(f"Host session: {BASE}\n")

# --- auth gating ---
st, _ = req("GET", "/api/ping", token=None)
check("no token -> 401", st == 401)
st, _ = req("GET", "/api/ping", token="wrong-token")
check("bad token -> 401", st == 401)
st, _ = req("GET", "/api/ping")
check("good token -> 200", st == 200)

# --- session role ---
st, sess = req("GET", "/api/session")
check("GET /api/session returns role", st == 200 and sess and "role" in sess)
role = (sess or {}).get("role")
print(f"        role = {role}")

# --- graph fetch ---
st, graph = req("GET", "/api/graph")
check("GET /api/graph", st == 200 and graph and "nodes" in graph)

if role != "editor":
    print("\nRead-only session: skipping edit round-trip. "
          "Re-host with 'Everyone can edit' to test editing.")
    print(f"\n{PASS} passed, {FAIL} failed")
    sys.exit(1 if FAIL else 0)

# --- editor round trip: edit shows up AND is announced on the SSE stream ---
events = []


def listen_sse():
    r = urllib.request.Request(f"{BASE}/api/events?token={TOKEN}")
    try:
        with urllib.request.urlopen(r, timeout=8) as resp:
            t0 = time.time()
            for line in resp:
                s = line.decode(errors="ignore").strip()
                if s.startswith("data:"):
                    events.append(s)
                if time.time() - t0 > 6:
                    break
    except Exception:
        pass


th = threading.Thread(target=listen_sse, daemon=True)
th.start()
time.sleep(0.5)  # let the stream connect

st, node = req("POST", "/api/nodes", {"title": "guest-test-node", "x": 12, "y": 34})
check("guest POST /api/nodes accepted", st in (200, 201) and node and "id" in node)

time.sleep(1.0)  # allow the host to broadcast
st, g2 = req("GET", "/api/graph")
check("created node visible on refetch", g2 and any(n["id"] == node["id"] for n in g2["nodes"]))

th.join(timeout=7)
check("change announced on GET /api/events (SSE)", len(events) > 0)

# cleanup
req("DELETE", f"/api/nodes/{node['id']}")

print(f"\n{PASS} passed, {FAIL} failed")
sys.exit(1 if FAIL else 0)
