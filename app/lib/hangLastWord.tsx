import type { ReactNode } from "react";
import { stegaClean } from "next-sanity";

/**
 * Hang the final word on its own line — e.g. "What This Looks Like In" /
 * "Practice". The first line is kept on one line (nowrap) so the split is
 * always clean regardless of column width; a single-word heading is returned
 * unchanged.
 *
 * `stegaClean` first: splitting a stega-encoded string across spans fragments
 * the Content Source Map payload and crashes the Visual Editing decoder
 * (`codePointAt` of undefined). Cleaning drops per-word click-to-edit on the
 * heading, which is an acceptable trade for not throwing.
 */
export function hangLastWord(heading: string): ReactNode {
  const words = stegaClean(heading).trim().split(/\s+/);
  if (words.length < 2) return heading;
  const last = words.pop();
  return (
    <>
      <span className="block whitespace-nowrap">{words.join(" ")}</span>
      <span className="block">{last}</span>
    </>
  );
}
