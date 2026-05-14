import type { SVGAttributes } from "react";
import { useId } from "react";

import ShapeMedia from "./ShapeMedia";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the source SVG's aspect ratio. */
  size?: number;
  /** Optional image filling the shape. Without it, `fill` is used. */
  imageSrc?: string;
  /** Optional video filling the shape; takes precedence over imageSrc. */
  videoSrc?: string;
  /** Alt text used when media is provided. */
  imageAlt?: string;
  /** Solid fill when no media is provided. */
  fill?: string;
  /**
   * SVG `preserveAspectRatio` value for the image. Defaults to centred
   * (`xMidYMid slice`).
   */
  imagePosition?: string;
};

const VIEWBOX = "0 0 645 615";
const W = 645;
const H = 615;
const ASPECT = H / W;
// Notched rectangle with a CUT-OUT at the TOP-RIGHT corner (used for
// cards on the LEFT of a row in the Other Works grid).
const PATH_D =
  "M441.156 293.624C441.156 306.879 451.901 317.624 465.156 317.624H620.486C633.741 317.624 644.486 328.369 644.486 341.624V590.624C644.486 603.879 633.741 614.624 620.486 614.624H24.4863C11.2315 614.624 0.486328 603.879 0.486328 590.624V24C0.486328 10.7451 11.2315 0 24.4863 0H417.156C430.411 0 441.156 10.7452 441.156 24V293.624Z";

export default function InitiativeLeftShape({
  size = 645,
  imageSrc,
  videoSrc,
  imageAlt = "",
  fill = "#ffffff",
  imagePosition = "xMidYMid slice",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `init-left-clip-${rawId}`;
  const hasMedia = !!(imageSrc || videoSrc);

  return (
    <svg
      width={size}
      height={size * ASPECT}
      viewBox={VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={hasMedia ? "img" : undefined}
      aria-label={hasMedia ? imageAlt || undefined : undefined}
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
          width={W}
          height={H}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          videoSrc={videoSrc}
          imagePosition={imagePosition}
        />
      ) : (
        <path d={PATH_D} fill={fill} />
      )}
    </svg>
  );
}
