import type { SVGAttributes, ReactNode } from "react";
import { useId } from "react";

import ShapeMedia from "./ShapeMedia";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 312:274 aspect ratio. */
  size?: number;
  /** Fill color for the card. Defaults to brand green. Ignored when media is set. */
  fill?: string;
  /** Optional image filling the shape via clipPath. */
  imageSrc?: string;
  /** Optional video filling the shape; takes precedence over imageSrc. */
  videoSrc?: string;
  /** Alt text used when media is provided. */
  imageAlt?: string;
  /** Optional content positioned on top of the shape. */
  children?: ReactNode;
  /** Mirror the shape horizontally. */
  flipX?: boolean;
};

const VIEWBOX = "0 0 312 274";
const W = 312;
const H = 274;
const ASPECT = H / W;
const PATH_D =
  "M232.4 0C233.976 0.000125137 235.488 0.747167 236.603 2.07617C237.647 3.32207 238.263 4.98398 238.336 6.73535V33C238.336 39.6274 243.709 45 250.336 45H306.451C307.899 45.1022 309.27 45.8317 310.302 47.0615C311.251 48.193 311.844 49.668 312 51.2412V249.745C312 263 301.255 273.745 288 273.745H154.843C153.267 273.745 151.755 272.998 150.641 271.669C149.656 270.495 149.053 268.951 148.926 267.311V245.197C148.926 238.57 143.553 233.197 136.926 233.197H5.07813C3.82185 232.977 2.64884 232.281 1.74023 231.197C0.625866 229.868 -6.8891e-08 228.065 0 226.186V24C0 10.7452 10.7452 4.33632e-07 24 0H232.4Z";

export default function VisionShape({
  size = 312,
  fill = "#83ffc1",
  imageSrc,
  videoSrc,
  imageAlt = "",
  className,
  children,
  flipX,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `vision-clip-${rawId}`;
  const mirror = flipX ? `scale(-1, 1) translate(${-W}, 0)` : undefined;
  const hasMedia = !!(imageSrc || videoSrc);

  const renderFill = () =>
    hasMedia ? (
      <>
        <defs>
          <clipPath id={clipId}>
            <path d={PATH_D} transform={mirror} />
          </clipPath>
        </defs>
        <ShapeMedia
          clipId={clipId}
          pathD={PATH_D}
          width={W}
          height={H}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          videoSrc={videoSrc}
        />
      </>
    ) : (
      <path d={PATH_D} fill={fill} transform={mirror} />
    );

  if (!children) {
    // Wrap the SVG in an aspect-ratio div so the height is reliably
    // derived from the viewBox aspect on every browser. Safari otherwise
    // falls back to the intrinsic pixel height of an SVG sized with
    // `width:100%; height:auto`, leaving the silhouette small inside a
    // larger card.
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
          {renderFill()}
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${className ?? ""}`}
      style={{ maxWidth: size, aspectRatio: `${W} / ${H}` }}
      role={hasMedia ? "img" : undefined}
      aria-label={hasMedia ? imageAlt || undefined : undefined}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute inset-0"
        {...rest}
      >
        {renderFill()}
      </svg>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
