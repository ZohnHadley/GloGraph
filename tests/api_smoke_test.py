#!/usr/bin/env python3
"""
GloGraph HTTP API smoke / integration test.

Runs the core API contract against a LIVE app instance and asserts on it — a
committed, repeatable version of the manual curl flow. Covers CRUD, the 404
not-found semantics, idempotent DELETE, graph-item variants (note/image/**file**
kinds + the per-node `renderMarkdown` / `showThumbnail` display toggles), the
**node-media content** lifecycle (attach / list / edit / remove), and (the
important one) the transactional import rollback: a failed import must NOT wipe
the existing graph.

Prerequisites:
  - GloGraph running with at least one open project tab.
  - The HTTP API enabled (Preferences -> API), reachable on 127.0.0.1:57321.
  - If a bearer token is set, pass it: API_TOKEN=... python tests/api_smoke_test.py

Non-destructive: it snapshots the active project's graph at start and restores it
at the end, so it's safe to run against a real (or throwaway) project.

Exit code 0 = all checks passed; 1 = a check failed or the API is unreachable.
"""
import json
import os
import sys
import urllib.error
import urllib.request

BASE = os.environ.get("GLOGRAPH_API", "http://127.0.0.1:57321/api")
TOKEN = os.environ.get("API_TOKEN", "")

_passed = 0
_failed = 0


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
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw.decode(errors="replace")


def check(name, cond):
    global _passed, _failed
    if cond:
        _passed += 1
        print(f"  PASS  {name}")
    else:
        _failed += 1
        print(f"  FAIL  {name}")


def main():
    # Liveness + that the API is actually enabled (not 503).
    st, _ = req("GET", "/ping")
    if st != 200:
        print(f"API not reachable at {BASE} (ping -> {st}). Is GloGraph running?")
        return 1
    st, _ = req("GET", "/nodes")
    if st == 503:
        print("API is disabled. Enable it in Preferences -> API, then re-run.")
        return 1

    # Snapshot for restore (non-destructive).
    _, snapshot = req("GET", "/graph")

    try:
        # ---- CRUD + 404 semantics ----------------------------------------
        st, a = req("POST", "/nodes", {"title": "Alpha", "x": 0, "y": 0, "paramValues": []})
        check("POST /nodes -> 201", st == 201 and isinstance(a, dict) and "id" in a)
        st, b = req("POST", "/nodes", {"title": "Beta", "x": 260, "y": 0, "paramValues": []})
        check("POST /nodes (2nd) -> 201", st == 201)

        st, _ = req("GET", f"/nodes/{a['id']}")
        check("GET existing node -> 200", st == 200)
        st, body = req("GET", "/nodes/does-not-exist")
        check("GET missing node -> 404", st == 404 and isinstance(body, dict) and "error" in body)
        st, _ = req("PATCH", "/nodes/does-not-exist", {"title": "x"})
        check("PATCH missing node -> 404", st == 404)
        st, _ = req("DELETE", "/nodes/does-not-exist")
        check("DELETE missing node -> 204 (idempotent)", st == 204)

        # ---- Graph items: kind + resizable size (write paths) ------------
        st, item = req("POST", "/nodes", {"title": "Note", "x": 0, "y": 0, "kind": "note", "paramValues": []})
        check("POST /nodes kind=note -> 201", st == 201 and isinstance(item, dict) and item.get("kind") == "note")
        st, patched = req("PATCH", f"/nodes/{item['id']}", {"kind": "image", "width": 320, "height": 200})
        check("PATCH sets kind + width/height",
              st == 200 and patched.get("kind") == "image"
              and patched.get("width") == 320 and patched.get("height") == 200)

        # ---- Note display toggle: renderMarkdown (default on) ------------
        st, note2 = req("POST", "/nodes", {"title": "Styled note", "x": 0, "y": 130, "kind": "note", "paramValues": []})
        check("POST /nodes kind=note (2nd) -> 201", st == 201 and note2.get("renderMarkdown") is True)
        st, note2off = req("PATCH", f"/nodes/{note2['id']}", {"renderMarkdown": False})
        check("PATCH renderMarkdown=false round-trips", st == 200 and note2off.get("renderMarkdown") is False)

        # ---- File node + showThumbnail toggle (new node type) -----------
        st, fnode = req("POST", "/nodes", {"title": "File", "x": 0, "y": 260, "kind": "file", "paramValues": []})
        check("POST /nodes kind=file -> 201", st == 201 and isinstance(fnode, dict) and fnode.get("kind") == "file")
        check("file node defaults showThumbnail=true", fnode.get("showThumbnail") is True)
        st, foff = req("PATCH", f"/nodes/{fnode['id']}", {"showThumbnail": False})
        check("PATCH showThumbnail=false round-trips", st == 200 and foff.get("showThumbnail") is False)

        # ---- Create with display/size fields in one call (POST parity w/ PATCH) ----
        st, fc = req("POST", "/nodes",
                     {"title": "Styled file", "x": 0, "y": 390, "kind": "file",
                      "width": 240, "height": 160, "showThumbnail": False,
                      "renderMarkdown": False, "paramValues": []})
        check("POST /nodes accepts width/height/showThumbnail/renderMarkdown",
              st == 201 and fc.get("width") == 240 and fc.get("height") == 160
              and fc.get("showThumbnail") is False and fc.get("renderMarkdown") is False)

        # ---- Node media content (attach / list / edit / remove) ----------
        #      The file node's "content" is a node_media item (mediaType=file).
        #      The node id comes from the path — the body omits it (per API_SPEC).
        st, m = req("POST", f"/nodes/{fnode['id']}/media",
                    {"label": "Spec", "src": "https://example.com/spec.pdf", "srcType": "url", "mediaType": "file"})
        check("POST /nodes/{id}/media -> 201",
              st == 201 and isinstance(m, dict) and m.get("nodeId") == fnode["id"]
              and m.get("src") == "https://example.com/spec.pdf" and m.get("mediaType") == "file")
        st, mlist = req("GET", f"/nodes/{fnode['id']}/media")
        check("GET /nodes/{id}/media lists the attached item",
              st == 200 and isinstance(mlist, list) and any(x["id"] == m["id"] for x in mlist))
        st, mp = req("PATCH", f"/media/{m['id']}", {"label": "Spec v2", "showOnCard": False})
        check("PATCH /media/{id} edits label + showOnCard",
              st == 200 and mp.get("label") == "Spec v2" and mp.get("showOnCard") is False)
        st, _ = req("DELETE", f"/media/{m['id']}")
        check("DELETE /media/{id} -> 204", st == 204)
        st, mlist2 = req("GET", f"/nodes/{fnode['id']}/media")
        check("media list empty after delete",
              st == 200 and isinstance(mlist2, list) and not any(x["id"] == m["id"] for x in mlist2))
        st, _ = req("DELETE", f"/media/{m['id']}")
        check("DELETE /media/{id} idempotent on unknown id -> 204", st == 204)

        # ---- Edges (transactional create + patch) ------------------------
        st, e = req("POST", "/edges", {"sourceId": a["id"], "targetId": b["id"], "paramValues": []})
        check("POST /edges -> 201", st == 201 and isinstance(e, dict))
        st, eb = req("PATCH", f"/edges/{e['id']}", {"label": "causes"})
        check("PATCH /edges sets label", st == 200 and eb.get("label") == "causes")
        st, _ = req("GET", "/edges/nope")
        check("GET missing edge -> 404", st == 404)

        # ---- Upsert by externalId (PUT) + edge externalId filter ---------
        st, u1 = req("PUT", "/nodes", {"externalId": "SMOKE_UP", "title": "Up v1", "x": 500, "y": 500, "paramValues": []})
        check("PUT new node -> 201", st == 201 and isinstance(u1, dict) and u1.get("externalId") == "SMOKE_UP")
        st, u2 = req("PUT", "/nodes", {"externalId": "SMOKE_UP", "title": "Up v2"})  # omit x/y → preserved
        check("PUT existing node -> 200 (update, not duplicate)",
              st == 200 and u2.get("id") == u1.get("id") and u2.get("title") == "Up v2")
        check("PUT preserves omitted x/y (layout-safe)", u2.get("x") == 500 and u2.get("y") == 500)
        st, _ = req("PUT", "/nodes", {"title": "no externalId"})
        check("PUT node without externalId -> 400", st == 400)
        st, found = req("GET", "/nodes?externalId=SMOKE_UP")
        check("GET /nodes?externalId finds the upserted node",
              isinstance(found, list) and len(found) == 1 and found[0]["id"] == u1["id"])

        st, ue1 = req("PUT", "/edges", {"externalId": "SMOKE_UP_E", "sourceId": a["id"], "targetId": b["id"], "paramValues": []})
        check("PUT new edge -> 201", st == 201 and isinstance(ue1, dict) and ue1.get("externalId") == "SMOKE_UP_E")
        st, ue2 = req("PUT", "/edges", {"externalId": "SMOKE_UP_E", "sourceId": a["id"], "targetId": b["id"], "paramValues": []})
        check("PUT existing edge -> 200 (update, not duplicate)", st == 200 and ue2.get("id") == ue1.get("id"))
        st, _ = req("PUT", "/edges", {"sourceId": a["id"], "targetId": b["id"], "paramValues": []})
        check("PUT edge without externalId -> 400", st == 400)
        st, efound = req("GET", "/edges?externalId=SMOKE_UP_E")
        check("GET /edges?externalId finds the upserted edge",
              isinstance(efound, list) and len(efound) == 1 and efound[0]["id"] == ue1["id"])

        # ---- Impact trace (read-only) ------------------------------------
        st, tr = req("GET", f"/trace?from={a['id']}&direction=downstream")
        check("GET /trace downstream reaches the target -> 200",
              st == 200 and isinstance(tr, dict) and tr.get("seedId") == a["id"]
              and any(n["id"] == b["id"] for n in tr.get("nodes", []))
              and tr.get("reachedCount", 0) >= 1 and tr.get("maxHop", 0) >= 1)
        st, tru = req("GET", f"/trace?from={b['id']}&direction=upstream")
        check("GET /trace upstream reaches the source -> 200",
              st == 200 and any(n["id"] == a["id"] for n in tru.get("nodes", [])))
        st, _ = req("GET", "/trace?from=does-not-exist&direction=downstream")
        check("GET /trace with unknown node -> 404", st == 404)
        st, _ = req("GET", f"/trace?from={a['id']}&direction=sideways")
        check("GET /trace with bad direction -> 400", st == 400)

        # ---- Semantic search (provider-gated: 200 with hits, or 503 if off) ----
        st, sr = req("POST", "/search/semantic", {"query": "alpha", "limit": 5})
        check("POST /search/semantic -> 200 (list) or 503 (provider off)",
              (st == 200 and isinstance(sr, list)) or st == 503)

        # ---- Event stream (SSE) liveness: open, check headers, close (no body read,
        #      since the stream is infinite). ------------------------------------
        try:
            er = urllib.request.Request(BASE + "/events")
            er.add_header("Accept", "text/event-stream")
            if TOKEN:
                er.add_header("Authorization", f"Bearer {TOKEN}")
            eresp = urllib.request.urlopen(er, timeout=3)
            ect, estatus = eresp.headers.get("Content-Type", ""), eresp.status
            eresp.close()
            check("GET /events -> 200 text/event-stream", estatus == 200 and "text/event-stream" in ect)
        except Exception:
            check("GET /events -> 200 text/event-stream", False)

        # ---- App-setting write allowlist (non-destructive) ---------------
        _, cur = req("GET", "/settings/app?key=edge_routing_mode")
        prev = cur.get("value") if isinstance(cur, dict) else None
        st, _ = req("PUT", "/settings/app", {"key": "edge_routing_mode", "value": prev or "waypoints"})
        check("PUT allowed app setting -> 204", st == 204)
        st, _ = req("PUT", "/settings/app", {"key": "api_enabled", "value": "false"})
        check("PUT protected app setting (api_enabled) -> 403", st == 403)
        st, _ = req("PUT", "/settings/app", {"key": "api_token", "value": "x"})
        check("PUT protected app setting (api_token) -> 403", st == 403)

        # ---- Tab lifecycle: create -> activate -> delete -----------------
        #      Fully non-destructive: the throwaway tab is created and then
        #      deleted with deleteDb=true, so the run leaves no stray project.
        BLANK = "00000000-0000-0000-0000-000000000005"
        tabs_now = req("GET", "/tabs")[1]
        n_before = len(tabs_now) if isinstance(tabs_now, list) else 0
        active_id = next((t["id"] for t in tabs_now if t.get("isActive")), None) if isinstance(tabs_now, list) else None

        st, _ = req("POST", "/tabs/does-not-exist/activate")
        check("POST /tabs/<bad>/activate -> 404", st == 404)

        st, made = req("POST", "/tabs", {"name": "SMOKE_TAB", "presetId": BLANK})
        check("POST /tabs creates + activates -> 201",
              st == 201 and isinstance(made, list)
              and any(t.get("name") == "SMOKE_TAB" and t.get("isActive") for t in made))
        new_id = next((t["id"] for t in made if t.get("name") == "SMOKE_TAB"), None) if isinstance(made, list) else None

        if new_id:
            st, after = req("DELETE", f"/tabs/{new_id}?deleteDb=true")
            check("DELETE /tabs/<id> removes it -> 200",
                  st == 200 and isinstance(after, list)
                  and not any(t.get("id") == new_id for t in after) and len(after) == n_before)
            st, _ = req("DELETE", f"/tabs/{new_id}")
            check("DELETE /tabs/<id> idempotent on unknown id -> 200", st == 200)

        # Restore the original active tab (create/delete moved it).
        if active_id:
            st, sw = req("POST", f"/tabs/{active_id}/activate")
            check("POST /tabs/<id>/activate -> 200 (restores original active tab)",
                  st == 200 and isinstance(sw, list)
                  and any(t.get("id") == active_id and t.get("isActive") for t in sw))

        # ---- Import rollback (the integrity guarantee) -------------------
        _, good = req("GET", "/graph")
        n_before = req("GET", "/stats")[1]["nodes"]
        check("graph has data before broken import", n_before >= 2)

        broken = json.loads(json.dumps(good))
        if len(broken["nodes"]) >= 2:
            broken["nodes"][1]["id"] = broken["nodes"][0]["id"]  # duplicate primary key
        st, _ = req("POST", "/import", broken)
        check("broken import -> 500", st == 500)
        n_after = req("GET", "/stats")[1]["nodes"]
        check("ROLLBACK: graph intact after failed import", n_after == n_before)

        st, _ = req("POST", "/import", good)
        check("good import -> 204", st == 204)
    finally:
        # Restore the original graph regardless of outcome.
        if snapshot is not None:
            req("POST", "/import", snapshot)

    print(f"\n{_passed} passed, {_failed} failed")
    return 0 if _failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
