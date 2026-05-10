import type { SVGAttributes } from "react";
import { useId } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 1200:632 aspect ratio. */
  size?: number;
  /** Optional image filling the shape. Without it, `fill` is used. */
  imageSrc?: string;
  /** Alt text used when imageSrc is provided. */
  imageAlt?: string;
  /** Solid fill when no imageSrc is provided. */
  fill?: string;
};

const VIEWBOX = "0 0 1200 632";
const W = 1200;
const H = 632;
const ASPECT = H / W;
const PATH_D =
  "M1164.47 0C1184.09 9.30105e-06 1200 14.988 1200 33.4766V342.299C1200 348.389 1200 354.621 1200 360.711V597.558C1200 616.046 1184.09 631.034 1164.47 631.034H694.597C674.974 631.034 659.067 616.046 659.067 597.558V415.775C659.067 393.684 641.159 375.775 619.067 375.775H35.5292C15.907 375.775 1.5739e-07 360.787 0 342.299V33.4766C0 14.988 15.907 1.95457e-07 35.5292 0H1164.47Z";

export default function UnionShape({
  size = 1200,
  imageSrc,
  imageAlt = "",
  fill = "#cdffe6",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `union-clip-${rawId}`;

  return (
    <svg
      width={size}
      height={size * ASPECT}
      viewBox={VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={imageSrc ? "img" : undefined}
      aria-label={imageSrc ? imageAlt || undefined : undefined}
      {...rest}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={PATH_D} />
        </clipPath>
      </defs>
      {imageSrc ? (
        <image
          href={imageSrc}
          x="0"
          y="0"
          width={W}
          height={H}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <path d={PATH_D} fill={fill} />
      )}
    </svg>
  );
}
