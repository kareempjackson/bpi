import fs from "node:fs";
import path from "node:path";
import type { SVGAttributes } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the source SVG's aspect ratio. */
  size?: number;
  /** Overlay color. Defaults to black. */
  fill?: string;
  /** Overlay opacity (0–1). Defaults to 0.5. */
  fillOpacity?: number;
};

const SVG_RAW = fs.readFileSync(
  path.join(process.cwd(), "public/icons/header.svg"),
  "utf-8",
);

const VIEWBOX =
  SVG_RAW.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 1412 1069";
const PATH_D = SVG_RAW.match(/<path[^>]*\sd="([^"]+)"/)?.[1] ?? "";

const [, , vbWidth, vbHeight] = VIEWBOX.split(/\s+/).map(Number);
const ASPECT = vbHeight / vbWidth;

export default function HeroImage2Shape({
  size = 600,
  fill = "#000000",
  fillOpacity = 0.5,
  className,
  ...rest
}: Props) {
  return (
    <svg
      width={size}
      height={size * ASPECT}
      viewBox={VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <path d={PATH_D} fill={fill} fillOpacity={fillOpacity} />
    </svg>
  );
}
