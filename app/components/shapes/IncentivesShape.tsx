import type { SVGAttributes } from "react";
import { useId } from "react";

import ShapeMedia from "./ShapeMedia";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 1200:644 aspect ratio. */
  size?: number;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  fill?: string;
};

const VIEWBOX = "0 0 1200 644";
const W = 1200;
const H = 644;
const ASPECT = H / W;
const PATH_D =
  "M544.451 0C544.451 0 544.451 0 544.452 0H1176C1189.25 0 1200 10.7452 1200 24V349.598C1200 362.853 1189.25 373.598 1176 373.598H568.451C555.196 373.598 544.451 384.343 544.451 397.598V619.736C544.451 632.991 533.706 643.736 520.451 643.736H24C10.7452 643.736 0 632.991 0 619.736V24C0 10.7452 10.7452 0 24 0H544.451Z";

/**
 * Notched rectangle from `public/icons/incentives.svg` — a rounded
 * rectangle with the bottom-right corner cut away so a content card can
 * dock into the negative space. Notch bounds in path coordinates:
 *   x: 544.451 → 1200   (≈ 45.37 % → 100 % of width)
 *   y: 373.598 → 643.736 (≈ 58.04 % → 100 % of height)
 */
export const INCENTIVES_NOTCH = {
  leftPct: (544.451 / W) * 100,
  topPct: (373.598 / H) * 100,
  rightPct: 0,
  bottomPct: 0,
} as const;

export default function IncentivesShape({
  size = 1200,
  imageSrc,
  videoSrc,
  imageAlt = "",
  fill = "#E0F2FF",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `incentives-clip-${rawId}`;
  const hasMedia = !!(imageSrc || videoSrc);

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={{ aspectRatio: `${W} / ${H}` }}
      role={hasMedia ? "img" : undefined}
      aria-label={hasMedia ? imageAlt || undefined : undefined}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
        {...rest}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={PATH_D} />
          </clipPath>
        </defs>
        {hasMedia ? (
          <ShapeMedia
            clipId={clipId}
            pathD={PATH_D}
            width={W}
            height={H}
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            videoSrc={videoSrc}
          />
        ) : (
          <path d={PATH_D} fill={fill} />
        )}
      </svg>
    </div>
  );
}
