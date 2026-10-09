#!/usr/bin/env python3
"""
GloGraph backend scale test.

Seeds a large graph over the HTTP API and times the read/export paths, so we know
how the data layer behaves at scale. This measures the BACKEND (SQLite + Rust
command) cost only — it does not measure React Flow canvas render performance,
which needs the GUI.

Usage:
  python tests/api_scale_test.py            # default 1500 nodes
  N=3000 python tests/api_scale_test.py
  API_TOKEN=... python tests/api_scale_test.py

Prerequisites: same as api_smoke_test.py (app running, API enabled).
Non-destructive: snapshots and restores the active project's graph.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = os.environ.get("GLOGRAPH_API", "http://127.0.0.1:57321/api")
TOKEN = os.environ.get("API_TOKEN", "")
N = int(os.environ.get("N", "1500"))


def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    if TOKEN:
        r.add_header("Authorization", f"Bearer {TOKEN}")
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")


def timed(label, fn):
    t0 = time.perf_counter()
    out = fn()
    ms = (time.perf_counter() - t0) * 1000
    print(f"  {label:<34} {ms:8.1f} ms")
    return out, ms


def main():
    st, _ = req("GET", "/ping")
    if st != 200:
        print(f"API not reachable at {BASE} (ping -> {st}).")
        return 1
    if req("GET", "/nodes")[0] == 503:
        print("API is disabled. Enable it in Preferences -> API, then re-run.")
        return 1

    _, snapshot = req("GET", "/graph")
    print(f"Scale test: {N} nodes\n")
    try:
        # Grid layout so positions are realistic.
        cols = max(1, int(N ** 0.5))
        nodes = [
            {"title": f"N{i}", "x": (i % cols) * 220.0, "y": (i // cols) * 120.0, "paramValues": []}
            for i in range(N)
        ]
        (st, created), _ = timed(f"create {N} nodes (batch)",
                                 lambda: req("POST", "/nodes/batch", nodes))
        if st != 201:
            print(f"  batch create failed: {st} {created}")
            return 1
        ids = [n["id"] for n in created]

        # A chain of edges (N-1) to give the edge read path real work.
        edges = [{"sourceId": ids[i], "targetId": ids[i + 1], "paramValues": []}
                 for i in range(len(ids) - 1)]
        timed(f"create {len(edges)} edges (batch)",
              lambda: req("POST", "/edges/batch", edges))

        print()
        timed("GET /stats", lambda: req("GET", "/stats"))
        (_, nodes_back), _ = timed("GET /nodes (full load)", lambda: req("GET", "/nodes"))
        timed("GET /edges (full load)", lambda: req("GET", "/edges"))
        timed("GET /graph (full export)", lambda: req("GET", "/graph"))

        # programmatic relayout of every node in one transaction
        moves = [{"id": i, "x": 0.0, "y": 0.0} for i in ids]
        timed("PATCH /nodes/batch-positions", lambda: req("PATCH", "/nodes/batch-positions", moves))

        print(f"\n  loaded back: {len(nodes_back)} nodes")
        stats = req("GET", "/stats")[1]
        print(f"  stats: {stats}")
    finally:
        if snapshot is not None:
            print("\nrestoring original graph...")
            req("POST", "/import", snapshot)
    return 0


if __name__ == "__main__":
    sys.exit(main())
