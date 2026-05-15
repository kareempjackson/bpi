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
// Notched rectangle with a CUT-OUT at the BOTTOM-LEFT corner (used for
// cards on the RIGHT of a row in the Other Works grid).
const PATH_D =
  "M203.33 321C203.33 307.745 192.585 297 179.33 297H24C10.7452 297 0 286.255 0 273L0 24C0 10.7452 10.7452 0 24 0L620 0C633.255 0 644 10.7452 644 24L644 590.624C644 603.879 633.255 614.624 620 614.624H227.33C214.075 614.624 203.33 603.879 203.33 590.624L203.33 321Z";

export default function InitiativeRightShape({
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
  const clipId = `init-right-clip-${rawId}`;
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
            imagePosition={imagePosition}
          />
        ) : (
          <path d={PATH_D} fill={fill} />
        )}
      </svg>
    </div>
  );
}
