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

const VIEWBOX = "0 0 477 520";
const W = 477;
const H = 520;
const ASPECT = H / W;
const PATH_D =
  "M337.043 0C339.865 1.27329e-07 342.571 1.14846 344.566 3.19238C346.197 4.86261 347.243 7.01908 347.571 9.3291V39.373C347.571 44.5436 351.763 48.7353 356.934 48.7354H467.215C469.439 49.0432 471.513 49.9811 473.124 51.4336C474.774 52.921 475.824 54.8469 476.139 56.9072V505.151C476.139 512.907 469.852 519.194 462.096 519.194H14.043C6.28724 519.194 0 512.907 0 505.151V14.043C0.000143499 6.28733 6.28734 0.000165419 14.043 0H337.043Z";

export default function ContactShape({
  size = 500,
  imageSrc,
  videoSrc,
  imageAlt = "",
  fill = "#ffffff",
  imagePosition = "xMidYMid slice",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `contact-clip-${rawId}`;
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
