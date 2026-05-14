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
   * (`xMidYMid slice`). Use `xMidYMin slice` to anchor the crop to the
   * top of the photo (e.g. to keep a subject's face from being cut off).
   */
  imagePosition?: string;
};

const VIEWBOX = "0 0 1201 549";
const W = 1201;
const H = 549;
const ASPECT = H / W;
const PATH_D =
  "M1200.84 419.233C1200.84 432.488 1190.09 443.233 1176.84 443.233H663.938C650.683 443.233 639.938 453.979 639.938 467.233V524.843C639.938 538.098 629.192 548.843 615.938 548.843H24C10.7452 548.843 0 538.098 0 524.843V162.242C0 148.987 10.7452 138.242 24 138.242H424.396C437.651 138.242 448.396 127.497 448.396 114.242V24C448.396 10.7452 459.142 0 472.396 0H1176.84C1190.09 0 1200.84 10.7452 1200.84 24V419.233Z";

export default function CareerShape({
  size = 1200,
  imageSrc,
  videoSrc,
  imageAlt = "",
  fill = "#ffffff",
  imagePosition = "xMidYMid slice",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `career-clip-${rawId}`;
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
