interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  regionCount: number;
  savePath: string | null;
  undoCount: number;
  zoom?: number;
}

export default function StatusBar({ nodeCount, edgeCount, regionCount, savePath, undoCount, zoom }: StatusBarProps) {
  const fileName = savePath ? savePath.split(/[\\/]/).pop() ?? savePath : 'Unsaved';

  return (
    <div className="status-bar">
      <span className="status-bar__file" title={savePath ?? undefined}>{fileName}</span>
      <span className="status-bar__sep" />
      <span className="status-bar__stat">{nodeCount} nodes</span>
      <span className="status-bar__dot">·</span>
      <span className="status-bar__stat">{edgeCount} edges</span>
      <span className="status-bar__dot">·</span>
      <span className="status-bar__stat">{regionCount} regions</span>
      {undoCount > 0 && (
        <>
          <span className="status-bar__sep" />
          <span className="status-bar__undo">↩ {undoCount} unsaved</span>
        </>
      )}
      {zoom !== undefined && (
        <>
          <span className="status-bar__sep" />
          <span className="status-bar__stat">{Math.round(zoom * 100)}%</span>
        </>
      )}
    </div>
  );
}
