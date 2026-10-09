import { useSettings } from '../context/SettingsContext';
import type { GloEdge } from '../types';

// Width tiers must mirror the stroke-width buckets in EdgeLine.tsx
// (value ≤3 → thin, ≤7 → medium, else thick).
const TIERS = [
  { label: '1–3', width: 0.8 },
  { label: '4–7', width: 1.5 },
  { label: '8–10', width: 2.5 },
];

/**
 * Small canvas overlay explaining the active edge-width encoding. Renders only
 * when the active preset has a `drivesWidth` edge param AND at least one edge
 * actually carries a width value (otherwise every edge draws at the default
 * width and the legend would be noise).
 */
export default function EdgeWeightLegend({ edges }: { edges: GloEdge[] }) {
  const { activeEdgeParamDefs } = useSettings();
  const widthParam = activeEdgeParamDefs.find(d => d.drivesWidth);
  if (!widthParam) return null;

  const values = edges
    .map(e => {
      const pv = e.paramValues.find(p => p.paramDefId === widthParam.id && p.isEnabled);
      return pv?.value != null && pv.value !== '' ? Number(pv.value) : null;
    })
    .filter((v): v is number => v != null && !Number.isNaN(v));
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="edge-weight-legend">
      <div className="edge-weight-legend__title">{widthParam.displayName}</div>
      {TIERS.map(t => (
        <div className="edge-weight-legend__row" key={t.label}>
          <svg width={26} height={8} className="edge-weight-legend__sample">
            <line x1={1} y1={4} x2={25} y2={4} stroke="var(--text)" strokeWidth={t.width} />
          </svg>
          <span className="edge-weight-legend__label">{t.label}</span>
        </div>
      ))}
      <div className="edge-weight-legend__range">{min === max ? `= ${min}` : `${min}–${max}`}</div>
    </div>
  );
}
