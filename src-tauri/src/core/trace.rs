//! Impact-trace engine: BFS reachability over directed edges. Pure — no SQLite,
//! axum, or Tauri. The single source of truth for "what does this node reach";
//! the Tauri command, the HTTP endpoint, and the demo's JS mirror all defer to
//! the behaviour pinned here (see `tests/fixtures/trace_cases.json`).

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TraceDirection {
    Downstream,
    Upstream,
}

/// Minimal directed edge — only what reachability needs. Wrappers map their
/// richer edge types (e.g. `GloEdge`) down to this. `Deserialize` lets the
/// shared fixture build these directly.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraceEdge {
    pub id: String,
    pub source_id: String,
    pub target_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraceNode {
    pub id: String,
    pub hop: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TraceResult {
    pub seed_id: String,
    pub direction: TraceDirection,
    /// Reachable nodes including the seed (hop 0), sorted by hop then id.
    pub nodes: Vec<TraceNode>,
    /// Ids of edges participating in the cascade, sorted.
    pub edge_ids: Vec<String>,
    /// Reached node count, excluding the seed.
    pub reached_count: usize,
    pub max_hop: u32,
}

/// Breadth-first reachability from `seed` along directed edges. `downstream`
/// follows source→target; `upstream` walks target→source. Pure topology — no
/// weights or probabilities. Cycles/feedback loops terminate via the visited
/// set, back-edges still count toward the cascade, and each node carries its
/// shortest hop. Output is deterministic: nodes sorted by (hop, id), edges sorted.
///
/// The seed is always emitted at hop 0; callers validate that it exists.
pub fn compute_trace(seed: &str, edges: &[TraceEdge], direction: TraceDirection) -> TraceResult {
    use std::collections::{HashMap, HashSet, VecDeque};

    let downstream = direction == TraceDirection::Downstream;
    let mut adj: HashMap<&str, Vec<(&str, &str)>> = HashMap::new();
    for e in edges {
        let (from, to) = if downstream {
            (e.source_id.as_str(), e.target_id.as_str())
        } else {
            (e.target_id.as_str(), e.source_id.as_str())
        };
        adj.entry(from).or_default().push((to, e.id.as_str()));
    }

    let mut hops: HashMap<&str, u32> = HashMap::new();
    hops.insert(seed, 0);
    let mut edge_ids: HashSet<&str> = HashSet::new();
    let mut max_hop: u32 = 0;
    let mut queue: VecDeque<&str> = VecDeque::new();
    queue.push_back(seed);
    while let Some(cur) = queue.pop_front() {
        let cur_hop = hops[cur];
        if let Some(neighbors) = adj.get(cur) {
            for &(to, eid) in neighbors {
                edge_ids.insert(eid);
                if !hops.contains_key(to) {
                    let h = cur_hop + 1;
                    hops.insert(to, h);
                    if h > max_hop {
                        max_hop = h;
                    }
                    queue.push_back(to);
                }
            }
        }
    }

    let mut nodes: Vec<TraceNode> = hops
        .iter()
        .map(|(id, &hop)| TraceNode { id: id.to_string(), hop })
        .collect();
    nodes.sort_by(|a, b| a.hop.cmp(&b.hop).then_with(|| a.id.cmp(&b.id)));
    let mut edge_id_vec: Vec<String> = edge_ids.iter().map(|s| s.to_string()).collect();
    edge_id_vec.sort();
    let reached_count = nodes.len().saturating_sub(1);

    TraceResult {
        seed_id: seed.to_string(),
        direction,
        nodes,
        edge_ids: edge_id_vec,
        reached_count,
        max_hop,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct Expect {
        nodes: Vec<TraceNode>,
        edge_ids: Vec<String>,
        reached_count: usize,
        max_hop: u32,
    }

    #[derive(Deserialize)]
    struct Case {
        name: String,
        edges: Vec<TraceEdge>,
        seed: String,
        direction: TraceDirection,
        expect: Expect,
    }

    /// Pins the Rust engine to the shared contract. The same JSON drives the
    /// TypeScript mirror (`src/lib/trace.test.ts`), so the two can't diverge —
    /// and any reported trace bug becomes a new case here.
    #[test]
    fn matches_shared_fixture() {
        let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../tests/fixtures/trace_cases.json");
        let raw = std::fs::read_to_string(path).expect("read trace fixture");
        let cases: Vec<Case> = serde_json::from_str(&raw).expect("parse trace fixture");
        assert!(!cases.is_empty(), "fixture has no cases");
        for c in &cases {
            let got = compute_trace(&c.seed, &c.edges, c.direction);
            assert_eq!(got.nodes, c.expect.nodes, "nodes mismatch: {}", c.name);
            assert_eq!(got.edge_ids, c.expect.edge_ids, "edgeIds mismatch: {}", c.name);
            assert_eq!(got.reached_count, c.expect.reached_count, "reachedCount mismatch: {}", c.name);
            assert_eq!(got.max_hop, c.expect.max_hop, "maxHop mismatch: {}", c.name);
        }
    }
}
