#!/usr/bin/env python3
"""GloGraph MCP server — memory your AI agent can read, write, and that YOU can
see and edit on a live canvas.

Most agent-memory tools are black boxes: the model writes facts into a vector
store or a hidden graph you never look at. GloGraph is the opposite — the memory
is a typed graph open in front of you. The agent calls these tools; you watch the
nodes and relationships appear in real time, and you can correct anything by hand.

This server is a thin wrapper over GloGraph's local HTTP API (via the bundled
Python SDK). Tools are shaped like MEMORY operations, not graph CRUD, so the model
uses them naturally:

    remember(name, summary, type, tags)   -> store an entity / fact (idempotent by name)
    relate(source, target, relationship)  -> record a typed relationship
    recall(query)                         -> find entities by text
    connections(name, direction)          -> who's directly linked to this
    trace_impact(name, direction)         -> multi-hop: what this affects / what affects it
    update_memory(name, ...)              -> revise an entity
    forget(name)                          -> remove an entity
    memory_overview()                     -> counts + the entities in memory

Run (stdio transport):  python mcp/glograph_mcp.py
GloGraph must be running locally (its API listens on 127.0.0.1:57321). If the API
has a token, set GLOGRAPH_TOKEN. See README.md for Claude Desktop / Cursor config.

NOTE (honest scope): this stores + queries STRUCTURE. It does not do semantic
(embedding) recall or auto-extraction from raw text yet — `recall` is keyword/tag
search. The differentiator is structured, multi-hop, and visible/editable memory,
not fuzzy vector recall. See the README for the roadmap to close that gap.
"""
import os
import random
import re
import sys
from pathlib import Path

# Use the bundled SDK without installing it.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "sdk" / "python"))
from glograph import GloGraph, GloGraphError  # noqa: E402

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    sys.exit("Missing dependency: pip install 'mcp[cli]'  (the MCP Python SDK)")

PORT = int(os.environ.get("GLOGRAPH_PORT", "57321"))
TOKEN = os.environ.get("GLOGRAPH_TOKEN", "")
g = GloGraph(port=PORT, token=TOKEN)

mcp = FastMCP("glograph-memory")


# ── helpers ──────────────────────────────────────────────────────────────────
def _key(name: str) -> str:
    """Stable external id from a human name, so re-remembering never duplicates."""
    return re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")[:120] or "unnamed"


def _pos():
    """Auto-assign a canvas position (agents shouldn't think about x/y). Re-saving
    an existing entity never moves it — the human's layout is preserved."""
    return round(random.uniform(-700, 700)), round(random.uniform(-450, 450))


def _view(node: dict) -> dict:
    """A TOKEN-LEAN projection for the model — never the raw node. The full
    `.glograph`/node JSON (x, y, colour, z-order, paramValues, createdAt, internal
    ids, …) is layout/storage cruft that would burn the agent's context for no
    benefit. The agent works in names, so we don't even return the id."""
    v = {"name": node.get("title", "")}
    if node.get("description"):
        v["summary"] = node["description"]
    if node.get("tags"):
        v["tags"] = node["tags"]
    return v


def _ensure(name: str) -> dict:
    """Resolve an entity by name, creating a bare one if the agent references
    something it hasn't explicitly remembered yet."""
    key = _key(name)
    found = g.nodes.get_by_external_id(key)
    if found:
        return found
    x, y = _pos()
    return g.nodes.create(title=name, x=x, y=y, external_id=key)


# ── tools ────────────────────────────────────────────────────────────────────
@mcp.tool()
def remember(name: str, summary: str = "", type: str = "", tags: list[str] | None = None) -> dict:
    """Save an entity or fact to long-term memory as a node. Idempotent BY NAME —
    calling it again with the same name updates that entity instead of duplicating.

    name:    the entity, e.g. "auth-service", "Q3 revenue dip", "Dr. Chen".
    summary: a short description the agent (or human) can read later.
    type:    a category, e.g. "service", "person", "decision", "claim" (stored as a tag).
    tags:    extra labels to group/recall by.
    """
    all_tags = ([type] if type else []) + list(tags or [])
    found = g.nodes.get_by_external_id(_key(name))
    if found:
        node = g.nodes.update(
            found["id"], title=name,
            description=summary or found.get("description") or "",
            tags=all_tags or found.get("tags") or [],
        )
    else:
        x, y = _pos()
        node = g.nodes.create(title=name, x=x, y=y, external_id=_key(name),
                              description=summary, tags=all_tags)
    return _view(node)


@mcp.tool()
def relate(source: str, target: str, relationship: str = "relates to") -> dict:
    """Record a typed relationship between two entities (creating either if new).
    Use a directional verb for `relationship`, e.g. "depends on", "causes",
    "owns", "contradicts" — direction is source -> target.
    """
    s, t = _ensure(source), _ensure(target)
    # Dedupe: reuse the existing edge between these two rather than stacking copies.
    existing = g.edges.list(source_id=s["id"], target_id=t["id"])
    edge = existing[0] if existing else g.edges.create(source_id=s["id"], target_id=t["id"])
    if relationship and edge.get("label") != relationship:
        edge = g.edges.update(edge["id"], label=relationship)
    return {"source": s.get("title"), "target": t.get("title"),
            "relationship": edge.get("label") or relationship}


@mcp.tool()
def recall(query: str, limit: int = 10) -> list[dict]:
    """Find entities in memory relevant to `query`. Uses SEMANTIC search (by
    meaning, via the configured embeddings provider) when available, and falls
    back to keyword search otherwise. Returns lean results (name + summary)."""
    limit = max(1, limit)
    try:
        hits = g._request("POST", f"{g.base_url}/search/semantic", {"query": query, "limit": limit})
        out = []
        for h in hits:
            row = {"name": h.get("title", ""), "relevance": round(h.get("score", 0.0), 3)}
            if h.get("summary"):
                row["summary"] = h["summary"]
            out.append(row)
        return out
    except GloGraphError:
        # No embeddings provider configured (or unreachable) → keyword search.
        return [_view(n) for n in g.nodes.list(search=query)[:limit]]


@mcp.tool()
def connections(name: str, direction: str = "both") -> list[dict]:
    """List entities DIRECTLY linked to `name`. direction: "out" (it points to),
    "in" (point to it), or "both"."""
    node = g.nodes.get_by_external_id(_key(name))
    if not node:
        return []
    return [_view(n) for n in g.nodes.neighbors(node["id"], direction=direction)]


@mcp.tool()
def trace_impact(name: str, direction: str = "downstream") -> dict:
    """Multi-hop reachability — the query a vector store can't answer. From `name`,
    follow the relationships to find everything it affects ("downstream") or
    everything that affects it ("upstream"). Structural reachability, not inference.
    """
    node = g.nodes.get_by_external_id(_key(name))
    if not node:
        return {"error": f"No entity named {name!r} in memory."}
    result = g.trace(node["id"], direction=direction)
    # Trace returns {seedId, nodes:[{id,hop}], ...}; hop 0 is the seed itself.
    reached = [n for n in result.get("nodes", []) if n.get("hop", 0) > 0]
    by_id = {n["id"]: n.get("title", "") for n in g.nodes.list()}
    return {
        "from": node.get("title"),
        "direction": direction,
        "reaches": [by_id.get(n["id"], n["id"]) for n in reached],
        "count": len(reached),
    }


@mcp.tool()
def update_memory(name: str, summary: str | None = None, tags: list[str] | None = None) -> dict:
    """Revise an existing entity's summary and/or tags. Errors if it doesn't exist."""
    node = g.nodes.get_by_external_id(_key(name))
    if not node:
        return {"error": f"No entity named {name!r} in memory. Use `remember` first."}
    fields = {}
    if summary is not None:
        fields["description"] = summary
    if tags is not None:
        fields["tags"] = tags
    return _view(g.nodes.update(node["id"], **fields)) if fields else _view(node)


@mcp.tool()
def forget(name: str) -> dict:
    """Permanently remove an entity (and its relationships) from memory."""
    node = g.nodes.get_by_external_id(_key(name))
    if not node:
        return {"ok": False, "error": f"No entity named {name!r}."}
    g.nodes.delete(node["id"])
    return {"ok": True, "forgot": name}


@mcp.tool()
def memory_overview() -> dict:
    """A snapshot of what's in memory right now: counts + the list of entities."""
    s = g.stats()
    return {
        "entities": s.get("nodes", 0),
        "relationships": s.get("edges", 0),
        "names": [n.get("title", "") for n in g.nodes.list()],
    }


if __name__ == "__main__":
    try:
        g.ping()
    except GloGraphError as e:
        sys.stderr.write(f"[glograph-mcp] Can't reach GloGraph on port {PORT}: {e}\n"
                         "Open GloGraph and enable the API (Preferences -> API).\n")
    mcp.run()  # stdio transport
