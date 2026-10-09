// The GloGraph brand mark — the amber "G" diamond (matches the app icon /
// favicon). Inherits `currentColor` so it picks up the surrounding brand colour.
export default function GlographMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="currentColor"
      aria-hidden="true"
    >
      <g transform="translate(512 512) rotate(-45) scale(6) translate(-50 -50)">
        <rect x="0" y="0" width="24" height="100" />
        <rect x="0" y="0" width="100" height="24" />
        <rect x="0" y="76" width="100" height="24" />
        <rect x="76" y="52" width="24" height="48" />
        <rect x="52" y="52" width="48" height="24" />
      </g>
    </svg>
  );
}
