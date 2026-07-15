"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Interactive rounded-tile grid backdrop: the single tile under the pointer
 * fills solid brand green (#06FE83) with a subtle glow and lift, fading in/out
 * smoothly as the cursor moves between tiles.
 *
 * The pointer is tracked on `window` (so it works even over the hero's
 * text/image) and the highlight is painted via direct DOM writes — no per-frame
 * React re-render. The layer is `pointer-events-none` so it never blocks
 * links/buttons. Purely decorative (`aria-hidden`); pair with
 * `data-cursor="icon"` for the logo cursor.
 */
const GREEN = "6, 254, 131"; // #06FE83 (error-500)

export default function GridHoverBackdrop({
  cell = 112,
  className = "",
  tone = "dark",
}: {
  /** Tile size in px. */
  cell?: number;
  className?: string;
  /** "dark" (default) draws faint white tile borders for navy backgrounds;
   *  "light" draws faint navy borders for pale backgrounds. */
  tone?: "dark" | "light";
}) {
  const borderClass = tone === "light" ? "border-primary-500/10" : "border-white/5";
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });

  // Measure the container → tile column/row counts that exactly fill it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cols = Math.max(1, Math.ceil(el.offsetWidth / cell));
      const rows = Math.max(1, Math.ceil(el.offsetHeight / cell));
      setGrid((prev) =>
        prev.cols === cols && prev.rows === rows ? prev : { cols, rows },
      );
    };
    measure();
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    if (!ro) window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [cell]);

  // Paint the glow on pointer move (direct DOM writes, rAF-throttled).
  useEffect(() => {
    const el = ref.current;
    const g = gridRef.current;
    if (!el || !g || grid.cols === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeTile: HTMLElement | null = null;
    let raf = 0;

    const clearTile = (t: HTMLElement) => {
      t.style.backgroundColor = "transparent";
      t.style.borderColor = "";
      t.style.boxShadow = "none";
      t.style.transform = "";
      t.style.zIndex = "";
    };

    const paint = (mx: number, my: number | null) => {
      const tiles = g.children;
      let target: HTMLElement | null = null;

      if (my !== null) {
        const cols = grid.cols;
        const colW = el.offsetWidth / cols;
        const col = Math.min(cols - 1, Math.max(0, Math.floor(mx / colW)));
        const row = Math.min(grid.rows - 1, Math.max(0, Math.floor(my / cell)));
        target = (tiles[row * cols + col] as HTMLElement) ?? null;
      }

      if (target === activeTile) return;
      if (activeTile) clearTile(activeTile);
      if (target) {
        target.style.backgroundColor = `rgb(${GREEN})`;
        target.style.borderColor = `rgb(${GREEN})`;
        if (!reduce) {
          target.style.boxShadow = `0 0 16px rgba(${GREEN}, 0.35)`;
          target.style.transform = "scale(1.03)";
          target.style.zIndex = "1";
        }
      }
      activeTile = target;
    };

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const out = x < 0 || y < 0 || x > r.width || y > r.height;
        paint(x, out ? null : y);
      });
    };
    const clear = () => {
      cancelAnimationFrame(raf);
      paint(0, null);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", clear);
    window.addEventListener("blur", clear);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", clear);
      window.removeEventListener("blur", clear);
    };
  }, [cell, grid.cols, grid.rows]);

  const total = grid.cols * grid.rows;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        ref={gridRef}
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
          gridAutoRows: `${cell}px`,
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{ backgroundColor: "transparent" }}
            className={`m-px rounded-[14px] border ${borderClass} transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out motion-reduce:transition-none`}
          />
        ))}
      </div>
    </div>
  );
}
