# GloGraph MCP server — agent memory you can see

A [Model Context Protocol](https://modelcontextprotocol.io) server that turns a
running GloGraph into **memory an AI agent can read and write — and that you watch
fill in, and edit by hand, on a live canvas.**

Most agent memory is a black box: the model writes into a vector store or a hidden
graph you never look at, and you find out it remembered something wrong only when
it acts on it. GloGraph inverts that. The memory is a typed graph open in front of
you. The agent calls tools; nodes and relationships appear in real time; you fix
anything that's off.

## Why this, vs. a vector store

| | Vector memory | **GloGraph memory** |
|---|---|---|
| Recall | fuzzy "text about X" | entities + **typed relationships** |
| "What does X affect?" | can't answer | `trace_impact` (multi-hop) |
| Inspect / correct | opaque | **you see and edit it** |
| Where it lives | a service | **one local file you own** |

`recall` now does **semantic search** (by meaning) when an embeddings provider is
configured, and falls back to keyword search otherwise — so it *complements* vector
recall while keeping what vectors can't do: typed relationships, multi-hop
reachability, and a memory you can see and edit. (Still no auto-extraction from raw
text — that's the agent's job; see Roadmap.)

## Tools the agent gets

| Tool | What it does |
|---|---|
| `remember(name, summary, type, tags)` | Save an entity/fact. Idempotent **by name** (no duplicates). |
| `relate(source, target, relationship)` | Record a directional typed relationship. |
| `recall(query)` | **Semantic** search (by meaning) if embeddings are set up, else keyword. |
| `connections(name, direction)` | Entities directly linked to one. |
| `trace_impact(name, direction)` | Multi-hop reachability — what it affects / what affects it. |
| `update_memory(name, …)` | Revise an entity. |
| `forget(name)` | Remove an entity. |
| `memory_overview()` | Counts + the list of remembered entities. |

The agent works in human names; the server maps names → stable ids and
auto-positions new nodes (re-remembering never moves your layout).

## Setup

1. **Run GloGraph** and enable the local API (Preferences → API). It listens on
   `127.0.0.1:57321`.
2. Install the MCP SDK: `pip install "mcp[cli]"` (Python 3.10+).
3. Point your MCP client at the server.

**Claude Desktop / Cursor** (`mcp` / `mcpServers` config):

```json
{
  "mcpServers": {
    "glograph-memory": {
      "command": "python",
      "args": ["/absolute/path/to/GloGraph/mcp/glograph_mcp.py"],
      "env": { "GLOGRAPH_TOKEN": "" }
    }
  }
}
```

Set `GLOGRAPH_TOKEN` if you gave the API a token; `GLOGRAPH_PORT` to override 57321.

### Optional: turn on semantic recall

GloGraph ships no embedding model (local-first, no bloat). To make `recall` search
by *meaning*, point it at any OpenAI-compatible embeddings endpoint. Easiest is a
local [Ollama](https://ollama.com): `ollama pull nomic-embed-text`, then edit
`embed_config.json` (created in GloGraph's data dir on first run) to:

```json
{ "enabled": true, "url": "http://localhost:11434/v1/embeddings", "model": "nomic-embed-text", "apiKey": "" }
```

Vectors are cached per node and re-embedded only when a node's text changes. With
it off, `recall` quietly falls back to keyword search — nothing breaks.

## Try it

> *"Remember that the billing service depends on the auth service, and the auth
> service depends on the user database. Then tell me what breaks if the user
> database goes down."*

The agent calls `remember` + `relate` (you watch the three nodes and two edges
appear on the canvas), then `trace_impact("user database", "upstream")` to answer —
and you can drag, retype, or correct any of it.

## Roadmap (to actually own "agent memory")

- ~~Semantic recall~~ — **done** (`POST /api/search/semantic`, pluggable provider).
- **Richer relationship types** — map `relationship` onto typed edge params, not
  just a label.
- **`uvx` / packaged entry point** — zero-install `uvx glograph-mcp`.
- **Optional extraction helper** — turn a blob of text into proposed nodes/edges
  for the human to accept.
- **Auto-embed on write** — embed in the background on node create/update so the
  first `recall` is instant (today it embeds lazily on first search).
