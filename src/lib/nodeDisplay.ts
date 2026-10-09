import { NodeKind } from '../types';

// Minimal structural shape so this helper works for any node-like object
// (GloNode, clipboard entries, etc.) without coupling to the full type.
interface NodeLabelSource {
  title?: string | null;
  description?: string | null;
  kind?: NodeKind | null;
  media?: { label?: string | null }[];
}

function kindNoun(kind?: NodeKind | null): string {
  switch (kind) {
    case 'note':  return 'note';
    case 'image': return 'image';
    case 'video': return 'video';
    case 'audio': return 'audio';
    default:      return 'node';
  }
}

/**
 * The label to show for a node anywhere in the UI. Titles are optional (graph
 * items can be untitled — see specs/GRAPH_ITEMS_DESIGN.md), so fall back, in
 * order, to: the title → a media item's label → the first line of the
 * description → "Untitled <kind>". Always returns a non-empty string, so no
 * display site ever renders a blank node.
 */
export function nodeDisplayLabel(node: NodeLabelSource): string {
  const title = node.title?.trim();
  if (title) return title;

  const mediaLabel = node.media?.find(m => m.label && m.label.trim())?.label?.trim();
  if (mediaLabel) return mediaLabel;

  const firstLine = node.description?.split('\n').map(l => l.trim()).find(l => l.length > 0);
  if (firstLine) return firstLine.length > 60 ? firstLine.slice(0, 60) + '…' : firstLine;

  return `Untitled ${kindNoun(node.kind)}`;
}
