"""
GloGraph Python SDK

Interact with a running GloGraph instance via its HTTP API.
Zero external dependencies — uses only the Python standard library.

Quick start:
    from glograph import GloGraph

    g = GloGraph()                        # default: port 57321, no token
    g = GloGraph(port=57321, token="abc") # with auth token

    # Enable the API first: Preferences → API → toggle on
    g.ping()                              # {"status": "ok", "version": "1.0"}
    g.stats()                             # {"nodes": 12, "edges": 8, ...}

    node = g.nodes.create(
        title="Fed +25bps",
        x=100, y=200,
        eventDate="2023-03-22",
        externalId="FED_MAR23",
        tags=["monetary-policy", "rates"],
    )
    g.nodes.update(node["id"], confidence=85)
    g.nodes.list(tag="rates")
    g.nodes.list(search="inflation")
    g.nodes.get_by_external_id("FED_MAR23")
    g.nodes.neighbors(node["id"], direction="out")
    g.nodes.edges(node["id"])
    g.nodes.batch_positions([{"id": n["id"], "x": i*200, "y": 0}
                              for i, n in enumerate(g.nodes.list())])
"""

import json
import urllib.parse
import urllib.request
import urllib.error
from typing import Any, Optional


class GloGraphError(Exception):
    pass


# Built-in preset ids (see the desktop New Project dialog) — accepted by name in
# create_project() so callers don't memorise UUIDs.
_BUILTIN_PRESETS = {
    "blank":           "00000000-0000-0000-0000-000000000005",
    "macro economics": "00000000-0000-0000-0000-000000000001",
    "system behavior": "00000000-0000-0000-0000-000000000002",
    "knowledge map":   "00000000-0000-0000-0000-000000000003",
    "project tracker": "00000000-0000-0000-0000-000000000004",
}


class _Resource:
    def __init__(self, client: "GloGraph", path: str):
        self._c = client
        self._path = path

    def _req(self, method: str, path: str, body: Any = None) -> Any:
        return self._c._request(method, path, body)


class NodeResource(_Resource):
    def list(self, *, external_id: str = None, tag: str = None,
             search: str = None) -> list:
        params = {}
        if external_id:
            params["externalId"] = external_id
        if tag:
            params["tag"] = tag
        if search:
            params["search"] = search
        qs = ("?" + urllib.parse.urlencode(params)) if params else ""
        return self._req("GET", f"{self._path}{qs}")

    def get(self, id: str) -> dict:
        return self._req("GET", f"{self._path}/{id}")

    def get_by_external_id(self, external_id: str) -> Optional[dict]:
        results = self.list(external_id=external_id)
        return results[0] if results else None

    def create(self, *, title: str = "", x: float, y: float, params: dict = None, **kwargs) -> dict:
        """Create a node. `params={"Domain": "Financial"}` resolves preset param
        names/options to the API's paramValues (see GloGraph.resolve_params).

        Extra kwargs map straight through (camelCased), e.g. `kind="file"`,
        `width=240`, `height=160`, `render_markdown=False` (notes),
        `show_thumbnail=False` (file nodes) — so a styled/sized node is one call."""
        body = {"title": title, "x": x, "y": y,
                "paramValues": self._c.resolve_params(params), **_camel(kwargs)}
        return self._req("POST", self._path, body)

    def upsert(self, *, external_id: str, title: str = "", x: float = None, y: float = None,
               params: dict = None, **kwargs) -> dict:
        """Create-or-update a node by `external_id` (PUT /api/nodes) — idempotent,
        ideal for re-runnable scripts and streaming. On update, omitted fields
        (including x/y) are preserved, so it won't reset a layout. Returns the node."""
        body: dict = {"externalId": external_id, **_camel(kwargs)}
        if title != "":
            body["title"] = title
        if x is not None:
            body["x"] = x
        if y is not None:
            body["y"] = y
        if params is not None:
            body["paramValues"] = self._c.resolve_params(params)
        return self._req("PUT", self._path, body)

    def create_batch(self, nodes: list) -> list:
        return self._req("POST", f"{self._path}/batch", nodes)

    def update(self, id: str, **kwargs) -> dict:
        return self._req("PATCH", f"{self._path}/{id}", _camel(kwargs))

    def delete(self, id: str) -> None:
        self._req("DELETE", f"{self._path}/{id}")

    def edges(self, id: str) -> list:
        """Get all edges where this node is source or target."""
        return self._req("GET", f"{self._path}/{id}/edges")

    def neighbors(self, id: str, *, direction: str = "both") -> list:
        """Get nodes connected to this node.
        direction: "in" | "out" | "both" (default)
        """
        return self._req("GET", f"{self._path}/{id}/neighbors?direction={direction}")

    def batch_positions(self, positions: list) -> None:
        """Update x/y for many nodes in one transaction.
        positions: list of {"id": str, "x": float, "y": float}
        """
        self._req("PATCH", f"{self._path}/batch-positions", positions)

    def links(self, id: str) -> list:
        return self._req("GET", f"{self._path}/{id}/links")

    def add_link(self, id: str, *, url: str, label: str = None) -> dict:
        return self._req("POST", f"{self._path}/{id}/links",
                         {"url": url, "label": label})

    def media(self, id: str) -> list:
        return self._req("GET", f"{self._path}/{id}/media")

    def add_media(self, id: str, *, label: str, src: str,
                  src_type: str = "url", media_type: str = "image",
                  show_on_card: bool = True) -> dict:
        # The node id is taken from the path; no need to repeat it in the body.
        return self._req("POST", f"{self._path}/{id}/media",
                         {"label": label, "src": src,
                          "srcType": src_type, "mediaType": media_type,
                          "showOnCard": show_on_card})


class EdgeResource(_Resource):
    def list(self, *, source_id: str = None, target_id: str = None, external_id: str = None) -> list:
        params = {}
        if source_id:
            params["sourceId"] = source_id
        if target_id:
            params["targetId"] = target_id
        if external_id:
            params["externalId"] = external_id
        qs = ("?" + urllib.parse.urlencode(params)) if params else ""
        return self._req("GET", f"{self._path}{qs}")

    def get_by_external_id(self, external_id: str) -> Optional[dict]:
        results = self.list(external_id=external_id)
        return results[0] if results else None

    def get(self, id: str) -> dict:
        return self._req("GET", f"{self._path}/{id}")

    def create(self, *, source_id: str, target_id: str, params: dict = None, **kwargs) -> dict:
        """Create an edge. `params={"Relationship": "Caused By"}` resolves edge
        param names/options to the API's paramValues."""
        body = {"sourceId": source_id, "targetId": target_id,
                "paramValues": self._c.resolve_params(params, edge=True), **_camel(kwargs)}
        return self._req("POST", self._path, body)

    def upsert(self, *, external_id: str, source_id: str, target_id: str,
               params: dict = None, **kwargs) -> dict:
        """Create-or-update an edge by `external_id` (PUT /api/edges) — idempotent.
        Endpoints, colour and params are set/replaced. Returns the edge."""
        body = {"externalId": external_id, "sourceId": source_id, "targetId": target_id,
                "paramValues": self._c.resolve_params(params, edge=True), **_camel(kwargs)}
        return self._req("PUT", self._path, body)

    def create_batch(self, edges: list) -> list:
        return self._req("POST", f"{self._path}/batch", edges)

    def update(self, id: str, **kwargs) -> dict:
        return self._req("PATCH", f"{self._path}/{id}", _camel(kwargs))

    def delete(self, id: str) -> None:
        self._req("DELETE", f"{self._path}/{id}")


class RegionResource(_Resource):
    def list(self) -> list:
        return self._req("GET", self._path)

    def get(self, id: str) -> dict:
        return self._req("GET", f"{self._path}/{id}")

    def create(self, *, title: str, x: float, y: float,
               width: float = 400, height: float = 300, **kwargs) -> dict:
        body = {"title": title, "x": x, "y": y,
                "width": width, "height": height, **_camel(kwargs)}
        return self._req("POST", self._path, body)

    def update(self, id: str, **kwargs) -> dict:
        return self._req("PATCH", f"{self._path}/{id}", _camel(kwargs))

    def delete(self, id: str) -> None:
        self._req("DELETE", f"{self._path}/{id}")


class GloGraph:
    """Client for the GloGraph HTTP API.

    Enable the API in Preferences → API before using.
    Set a token in Preferences and pass it here for auth.
    """

    def __init__(self, port: int = 57321, token: str = ""):
        self.base_url = f"http://127.0.0.1:{port}/api"
        self.token = token
        self.nodes   = NodeResource(self, f"{self.base_url}/nodes")
        self.edges   = EdgeResource(self, f"{self.base_url}/edges")
        self.regions = RegionResource(self, f"{self.base_url}/regions")
        self._schema: Any = None  # cached /settings for resolve_params()

    def _request(self, method: str, url: str, body: Any = None) -> Any:
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Content-Type", "application/json")
        req.add_header("Accept", "application/json")
        if self.token:
            req.add_header("Authorization", f"Bearer {self.token}")
        try:
            with urllib.request.urlopen(req) as resp:
                raw = resp.read()
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            body_text = e.read().decode(errors="replace")
            raise GloGraphError(f"HTTP {e.code} {method} {url}: {body_text}") from e

    def ping(self) -> dict:
        return self._request("GET", f"{self.base_url}/ping")

    def stats(self) -> dict:
        """Return node/edge/region/link/media counts for the active project."""
        return self._request("GET", f"{self.base_url}/stats")

    def tabs(self) -> list:
        """Return all open project tabs."""
        return self._request("GET", f"{self.base_url}/tabs")

    def create_project(self, name: str = "Untitled Project", preset: str = "blank") -> list:
        """Create a new project tab and make it active (subsequent calls target it) —
        lets a script/agent provision a fresh project instead of only touching the
        user's current tab. `preset` is a built-in preset name (blank / macro economics /
        system behavior / knowledge map / project tracker) or a raw preset id. Returns
        the updated tab list."""
        preset_id = _BUILTIN_PRESETS.get(str(preset).strip().lower(), preset)
        self.refresh_schema()  # active project changed → drop cached param schema
        return self._request("POST", f"{self.base_url}/tabs", {"name": name, "presetId": preset_id})

    def switch_project(self, tab_id: str) -> list:
        """Make an existing project tab active (by id). Returns the tab list."""
        self.refresh_schema()
        return self._request("POST", f"{self.base_url}/tabs/{tab_id}/activate")

    def close_project(self, tab_id: str, *, delete_db: bool = False) -> list:
        """Close a project tab. `delete_db=True` also removes its on-disk database
        (otherwise the file stays, reopenable by path). Idempotent. Returns the
        updated tab list."""
        self.refresh_schema()
        qs = "?deleteDb=true" if delete_db else ""
        return self._request("DELETE", f"{self.base_url}/tabs/{tab_id}{qs}")

    def subscribe(self, on_event, *, kinds=None):
        """Stream live graph-change events (Server-Sent Events from GET /api/events)
        and call on_event(dict) for each. Each event is {"kind": ..., "action": ...}
        — e.g. {"kind": "node", "action": "created"}. `kinds` optionally filters to
        a set/list of kinds. Blocks while connected (run in a thread for background
        use); reflects HTTP API writes. Zero-dependency: plain SSE line reading."""
        req = urllib.request.Request(f"{self.base_url}/events")
        req.add_header("Accept", "text/event-stream")
        if self.token:
            req.add_header("Authorization", f"Bearer {self.token}")
        with urllib.request.urlopen(req) as resp:
            for raw in resp:                      # iterate the stream line-by-line
                line = raw.decode("utf-8", "replace").rstrip("\r\n")
                if not line.startswith("data:"):  # skip blank lines + ":" keep-alives
                    continue
                payload = line[5:].strip()
                if not payload:
                    continue
                try:
                    ev = json.loads(payload)
                except ValueError:
                    continue
                if kinds is None or ev.get("kind") in kinds:
                    on_event(ev)

    def trace(self, node_id: str, *, direction: str = "downstream") -> dict:
        """Ephemeral impact trace over the active project's directed edges — what
        `node_id` reaches (`downstream`, following arrows) or what reaches it
        (`upstream`, against arrows). Pure topology, no simulation. Returns
        {seedId, direction, nodes:[{id,hop}], edgeIds, reachedCount, maxHop}."""
        if direction not in ("downstream", "upstream"):
            raise ValueError("direction must be 'downstream' or 'upstream'")
        qs = urllib.parse.urlencode({"from": node_id, "direction": direction})
        return self._request("GET", f"{self.base_url}/trace?{qs}")

    def search(self, query: str, *, limit: int = 10) -> list:
        """Semantic (vector) search over node title + description
        (POST /api/search/semantic). Requires an embeddings provider enabled in
        embed_config.json (projects dir; defaults to a local Ollama on :11434) —
        raises GloGraphError (503) if it's off. Returns hits ranked by similarity:
        [{"id", "title", "summary", "score"}]. For a plain substring filter use
        nodes.list(search=...) instead (no provider needed)."""
        return self._request("POST", f"{self.base_url}/search/semantic",
                             {"query": query, "limit": limit})

    def export(self) -> dict:
        """Return the full graph as a .glograph-format dict."""
        return self._request("GET", f"{self.base_url}/graph")

    def import_graph(self, export: dict) -> None:
        """Replace the current graph with a .glograph-format dict."""
        self._request("POST", f"{self.base_url}/import", export)

    def settings(self) -> dict:
        return self._request("GET", f"{self.base_url}/settings")

    def refresh_schema(self) -> None:
        """Drop the cached preset schema (call after changing presets/params)."""
        self._schema = None

    def _schema_cached(self) -> dict:
        if self._schema is None:
            self._schema = self.settings()
        return self._schema

    def resolve_params(self, params: Optional[dict], *, edge: bool = False) -> list:
        """Map a friendly ``{paramName: value}`` dict to the API's ``paramValues``,
        resolving param names → def ids and option labels → value slugs against the
        active preset. Lets you write ``params={"Domain": "Financial"}`` instead of
        hand-building ``[{"paramDefId": "...uuid...", "value": "financial"}]``.

        Raises GloGraphError if a param name or option isn't in the active preset.
        """
        if not params:
            return []
        schema = self._schema_cached()
        defs = schema.get("edgeParamDefs" if edge else "paramDefs", []) or []
        out = []
        for name, val in params.items():
            d = next((x for x in defs if str(x.get("displayName", "")).lower() == str(name).lower()), None)
            if d is None:
                raise GloGraphError(
                    f"No {'edge ' if edge else ''}param named {name!r} in the active preset")
            ptype = d.get("paramType")
            if ptype in ("select", "select_color"):
                opts = d.get("options") or []
                opt = next((o for o in opts
                            if str(o.get("label", "")).lower() == str(val).lower()
                            or o.get("valueSlug") == val), None)
                if opt is None:
                    raise GloGraphError(f"Param {name!r} has no option {val!r}")
                value = opt["valueSlug"]
            elif ptype == "boolean":
                value = "true" if val in (True, "true", "True", 1, "1") else "false"
            else:
                value = str(val)
            entry = {"paramDefId": d["id"], "value": value, "isEnabled": True}
            if not edge:
                entry["showOnCard"] = bool(d.get("showOnCardDefault"))
            out.append(entry)
        return out

    def get_app_setting(self, key: str) -> Optional[str]:
        result = self._request("GET", f"{self.base_url}/settings/app?key={urllib.parse.quote(key)}")
        return result.get("value") if result else None

    def set_app_setting(self, key: str, value: str) -> None:
        self._request("PUT", f"{self.base_url}/settings/app", {"key": key, "value": value})

    def update_link(self, link_id: str, *, url: str = None, label: str = None) -> dict:
        body = {}
        if url is not None:
            body["url"] = url
        if label is not None:
            body["label"] = label
        return self._request("PATCH", f"{self.base_url}/links/{link_id}", body)

    def delete_link(self, link_id: str) -> None:
        self._request("DELETE", f"{self.base_url}/links/{link_id}")

    def update_media(self, media_id: str, *, label: str = None,
                     show_on_card: bool = None, sort_order: int = None) -> dict:
        body = {}
        if label is not None:
            body["label"] = label
        if show_on_card is not None:
            body["showOnCard"] = show_on_card
        if sort_order is not None:
            body["sortOrder"] = sort_order
        return self._request("PATCH", f"{self.base_url}/media/{media_id}", body)

    def delete_media(self, media_id: str) -> None:
        self._request("DELETE", f"{self.base_url}/media/{media_id}")


# ── Internal helpers ──────────────────────────────────────────────────────────


def _camel(kwargs: dict) -> dict:
    """Convert snake_case keyword args to camelCase for the API."""
    def to_camel(s: str) -> str:
        parts = s.split("_")
        return parts[0] + "".join(p.capitalize() for p in parts[1:])
    return {to_camel(k): v for k, v in kwargs.items()}
