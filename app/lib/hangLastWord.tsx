import type { ReactNode } from "react";

/**
 * Hang the final word on its own line — e.g. "What This Looks Like In" /
 * "Practice". The first line is kept on one line (nowrap) so the split is
 * always clean regardless of column width; a single-word heading is returned
 * unchanged.
 */
export function hangLastWord(heading: string): ReactNode {
  const words = heading.trim().split(/\s+/);
  if (words.length < 2) return heading;
  const last = words.pop();
  return (
    <>
      <span className="block whitespace-nowrap">{words.join(" ")}</span>
      <span className="block">{last}</span>
    </>
  );
}
