/**
 * Decorative graphic: many fragmented supply lines entering from the left and
 * converging to one node on the right — the visual argument of "many inputs,
 * one gateway". Static SVG, purely decorative. Uses `slice` so it fills any
 * container aspect (square, portrait, or wide).
 */
export default function ConvergenceGraphic() {
  const W = 520;
  const H = 720;
  const cx = 470;
  const cy = 360;
  // A finer fan of hairline strands. Colour cycles white → blue → green,
  // with the outermost strands fading out for a softer silhouette.
  const COUNT = 13;
  const palette = ["#ffffff", "#6f97ff", "#ffffff", "#3fcd7c"];
  const lines = Array.from({ length: COUNT }, (_, i) => {
    const t = i / (COUNT - 1); // 0 → 1
    const startY = 84 + t * (H - 168);
    const c1x = 200;
    const c2x = 372;
    const c2y = cy + (startY - cy) * 0.12;
    const d = `M0 ${startY} C ${c1x} ${startY}, ${c2x} ${c2y}, ${cx} ${cy}`;
    const color = palette[i % palette.length];
    // Fade strands toward the top/bottom edges; keep the core crisp.
    const edge = Math.abs(t - 0.5) * 2; // 0 centre → 1 edge
    const opacity = 0.85 - edge * 0.45;
    return { d, color, width: color === "#ffffff" ? 1.4 : 1.1, opacity };
  });

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      {lines.map((l, i) => (
        <path
          key={i}
          d={l.d}
          fill="none"
          stroke={l.color}
          strokeWidth={l.width}
          strokeLinecap="round"
          opacity={l.opacity}
        />
      ))}
      {/* Convergence node with a soft halo. */}
      <circle cx={cx} cy={cy} r={16} fill="#ffffff" opacity={0.1} />
      <circle cx={cx} cy={cy} r={5.5} fill="#ffffff" />
    </svg>
  );
}
