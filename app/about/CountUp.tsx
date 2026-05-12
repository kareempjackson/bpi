"use client";

import { useEffect, useRef, useState } from "react";

const NUMBER_RE = /^(\D*)(\d+(?:\.\d+)?)(\D*)$/;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type Props = {
  value: string;
  durationMs?: number;
  className?: string;
};

export default function CountUp({
  value,
  durationMs = 1400,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const match = value.match(NUMBER_RE);
    if (!match) return;
    const prefix = match[1] ?? "";
    const target = parseFloat(match[2]);
    const suffix = match[3] ?? "";
    const decimals = match[2].includes(".")
      ? match[2].split(".")[1].length
      : 0;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setText(value);
      return;
    }

    setText(`${prefix}${(0).toFixed(decimals)}${suffix}`);

    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let start = 0;
    const run = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / durationMs);
      const current = target * easeOutCubic(t);
      setText(`${prefix}${current.toFixed(decimals)}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            raf = requestAnimationFrame(run);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
