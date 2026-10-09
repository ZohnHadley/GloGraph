import type { GloEdge, GloNode, NodePosition } from '../types';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

// dagre is ~heavy and only needed when the user runs Auto Layout, so it's loaded
// on demand (a dynamic import → its own chunk) instead of in the initial bundle.
export async function computeLayout(
  nodes: GloNode[],
  edges: GloEdge[],
  direction: 'TB' | 'LR' = 'TB'
): Promise<NodePosition[]> {
  const { default: dagre } = await import('@dagrejs/dagre');
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 });

  nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach(e => {
    if (g.hasNode(e.sourceId) && g.hasNode(e.targetId)) {
      g.setEdge(e.sourceId, e.targetId);
    }
  });

  dagre.layout(g);

  return nodes.map(n => {
    const pos = g.node(n.id);
    if (!pos) return { id: n.id, x: n.x, y: n.y };
    return { id: n.id, x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 };
  });
}
