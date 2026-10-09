#!/usr/bin/env python3
"""One-shot: spread the built-in demo layouts so node cards have adequate spacing
once "Expand nodes by default" makes cards larger. Scales node positions, region
bounds, and any edge waypoints by a constant factor (card sizes are left as-is).

Only the hand-authored built-ins are touched here; the generated demos get the same
spread baked into their generators (gen_*_demo.py, SCALE). NOT idempotent — run once.

Usage:  python scripts/respace_builtin_demos.py
"""
import json
import pathlib

SCALE = 1.6
ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = [
    "macro-economics-demo.glograph",
    "system-behavior-demo.glograph",
    "knowledge-map-demo.glograph",
    "project-tracker-demo.glograph",
]


def scale_point(p):
    if isinstance(p, dict):
        if "x" in p:
            p["x"] = round(p["x"] * SCALE, 2)
        if "y" in p:
            p["y"] = round(p["y"] * SCALE, 2)
    elif isinstance(p, (list, tuple)) and len(p) >= 2:
        p[0] = round(p[0] * SCALE, 2)
        p[1] = round(p[1] * SCALE, 2)


for name in FILES:
    path = ROOT / "demos" / name
    d = json.loads(path.read_text(encoding="utf-8"))
    for n in d["nodes"]:
        n["x"] = round(n["x"] * SCALE, 2)
        n["y"] = round(n["y"] * SCALE, 2)
    for r in d["regions"]:
        for k in ("x", "y", "width", "height"):
            r[k] = round(r[k] * SCALE, 2)
    for e in d["edges"]:
        wp = e.get("waypoints")
        if isinstance(wp, list):
            for p in wp:
                scale_point(p)
    path.write_text(json.dumps(d, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"respaced (x{SCALE})  {name}  nodes={len(d['nodes'])} regions={len(d['regions'])}")
