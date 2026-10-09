import { save as nativeSaveDialog } from '@tauri-apps/plugin-dialog';
import { api } from '../lib/api';
import { nodeDisplayLabel } from '../lib/nodeDisplay';
import type { GloNode, GloEdge, NodeParamDef } from '../types';

type SaveToast = { msg: string; ok: boolean } | null;

interface GraphExportDeps {
  nodes: GloNode[];
  edges: GloEdge[];
  /** Active preset's node params — drive the CSV columns + value labels. */
  activeParamDefs: NodeParamDef[];
  /** Active project name — the default export filename. */
  projectName: string | undefined;
  setSaveToast: (toast: SaveToast) => void;
}

/**
 * Graph exporters, extracted from AppInner: PNG / CSV (two sibling files) /
 * Mermaid / DOT. All are **read-only** over the graph — they serialize the current
 * nodes/edges to a file (native save dialog) or the clipboard. No mutation, no history.
 */
export function useGraphExport({ nodes, edges, activeParamDefs, projectName, setSaveToast }: GraphExportDeps) {
  const baseFileName = () =>
    (projectName ?? 'graph').replace(/[\\/:*?"<>|]/g, '_').trim() || 'graph';

  async function handleExportCsv() {
    // Build nodes CSV
    const nodeHeaders = ['id', 'title', 'description', 'eventDate', 'x', 'y', 'confidence', 'impactMagnitude',
      ...activeParamDefs.map(d => d.displayName)].join(',');
    const nodeRows = nodes.map(n => [
      n.id,
      `"${(n.title ?? '').replace(/"/g, '""')}"`,
      `"${(n.description ?? '').replace(/"/g, '""')}"`,
      n.eventDate ?? '',
      n.x, n.y,
      n.confidence ?? '',
      n.impactMagnitude ?? '',
      ...activeParamDefs.map(def => {
        const pv = n.paramValues.find(p => p.paramDefId === def.id);
        if (!pv?.value) return '';
        if (def.paramType === 'select_color' || def.paramType === 'select') {
          return def.options.find(o => o.valueSlug === pv.value)?.label ?? pv.value;
        }
        return pv.value;
      }),
    ].join(','));
    const nodesCsv = [nodeHeaders, ...nodeRows].join('\n');

    // Build edges CSV
    const edgeRows = edges.map(e => [e.id, e.sourceId, e.targetId].join(','));
    const edgesCsv = [['id', 'sourceId', 'targetId'].join(','), ...edgeRows].join('\n');

    // Pick where to save; nodes + edges are written as two sibling files.
    const chosen = await nativeSaveDialog({
      title: 'Export CSV (writes a -nodes and -edges file)',
      defaultPath: `${baseFileName()}-nodes.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    });
    if (!chosen) return;
    const nodesPath = chosen.endsWith('.csv') ? chosen : `${chosen}.csv`;
    const edgesPath = /-nodes\.csv$/i.test(nodesPath)
      ? nodesPath.replace(/-nodes\.csv$/i, '-edges.csv')
      : nodesPath.replace(/\.csv$/i, '-edges.csv');
    try {
      await api.writeTextFile(nodesPath, nodesCsv);
      await api.writeTextFile(edgesPath, edgesCsv);
      setSaveToast({ msg: `Exported ${nodesPath.split(/[\\/]/).pop()} + ${edgesPath.split(/[\\/]/).pop()}`, ok: true });
      setTimeout(() => setSaveToast(null), 2800);
    } catch (err) {
      setSaveToast({ msg: `Export failed: ${err}`, ok: false });
      setTimeout(() => setSaveToast(null), 4000);
    }
  }

  async function handleExportPng() {
    const canvas = document.querySelector('.graph-canvas') as HTMLElement | null;
    if (!canvas) return;
    const chosen = await nativeSaveDialog({
      title: 'Export PNG',
      defaultPath: `${baseFileName()}.png`,
      filters: [{ name: 'PNG Image', extensions: ['png'] }],
    });
    if (!chosen) return;
    const dest = chosen.endsWith('.png') ? chosen : `${chosen}.png`;
    setSaveToast({ msg: 'Exporting…', ok: true });
    try {
      const { toPng } = await import('html-to-image'); // loaded on demand (its own chunk)
      const dataUrl = await toPng(canvas, {
        filter: node => {
          const el = node as HTMLElement;
          return (
            !el.classList?.contains('react-flow__controls') &&
            !el.classList?.contains('react-flow__minimap') &&
            !el.classList?.contains('canvas-context-menu') &&
            !el.classList?.contains('canvas-empty')
          );
        },
        backgroundColor: '#171717',
      });
      // data-URL → bytes for the native write command.
      const base64 = dataUrl.split(',')[1] ?? '';
      const bin = atob(base64);
      const bytes = new Array<number>(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      await api.writeBinaryFile(dest, bytes);
      setSaveToast({ msg: `Exported ${dest.split(/[\\/]/).pop()}`, ok: true });
      setTimeout(() => setSaveToast(null), 2500);
    } catch (err) {
      setSaveToast({ msg: `Export failed: ${err}`, ok: false });
      setTimeout(() => setSaveToast(null), 4000);
    }
  }

  function handleExportMermaid() {
    const sanitize = (s: string) => s.replace(/"/g, "'");
    const lines = ['flowchart LR'];
    for (const node of nodes) {
      lines.push(`  ${node.id}["${sanitize(nodeDisplayLabel(node))}"]`);
    }
    for (const edge of edges) {
      lines.push(`  ${edge.sourceId} --> ${edge.targetId}`);
    }
    navigator.clipboard.writeText(lines.join('\n'));
    setSaveToast({ msg: 'Mermaid diagram copied to clipboard', ok: true });
    setTimeout(() => setSaveToast(null), 2500);
  }

  function handleExportDot() {
    const sanitize = (s: string) => s.replace(/"/g, '\\"');
    const lines = ['digraph G {'];
    lines.push('  rankdir=LR;');
    lines.push('  node [shape=box];');
    for (const node of nodes) {
      lines.push(`  "${node.id}" [label="${sanitize(nodeDisplayLabel(node))}"];`);
    }
    for (const edge of edges) {
      lines.push(`  "${edge.sourceId}" -> "${edge.targetId}";`);
    }
    lines.push('}');
    navigator.clipboard.writeText(lines.join('\n'));
    setSaveToast({ msg: 'DOT graph copied to clipboard', ok: true });
    setTimeout(() => setSaveToast(null), 2500);
  }

  return { handleExportCsv, handleExportPng, handleExportMermaid, handleExportDot };
}
