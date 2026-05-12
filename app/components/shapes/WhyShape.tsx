import type { SVGAttributes } from "react";
import { useId } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 1:1 aspect ratio. */
  size?: number;
  /** Optional image filling the shape. Without it, `fill` is used. */
  imageSrc?: string;
  /** Alt text used when imageSrc is provided. */
  imageAlt?: string;
  /** Solid fill when no imageSrc is provided. */
  fill?: string;
  /**
   * SVG `preserveAspectRatio` value for the image. Use this to control
   * what part of the photo stays visible after the slice crop. Defaults
   * to centred (`xMidYMid slice`). Use `xMidYMin slice` to anchor the
   * crop to the top of the photo (e.g. to keep a subject's face from
   * being cut off).
   */
  imagePosition?: string;
};

const VIEWBOX = "0 0 500 500";
const W = 500;
const H = 500;
const ASPECT = H / W;
const PATH_D =
  "M455.728 0C471.681 0 479.658 -2.24241e-05 485.685 3.25196C490.341 5.76405 494.16 9.58337 496.672 14.2391C499.924 20.2662 499.924 28.2432 499.924 44.1968V455.728C499.924 471.681 499.924 479.658 496.672 485.685C494.16 490.341 490.341 494.16 485.685 496.672C479.658 499.924 471.681 499.924 455.728 499.924H44.1968C28.2432 499.924 20.2662 499.924 14.2391 496.672C9.58337 494.16 5.76405 490.341 3.25196 485.685C-2.24241e-05 479.658 0 471.681 0 455.728V152.145C0 133.317 0 123.902 3.83797 116.789C6.8027 111.295 11.31 106.788 16.8046 103.823C23.9176 99.9849 33.3317 99.9849 52.16 99.9849H125.405C140.38 99.9849 152.519 87.8453 152.519 72.8703V52.16C152.519 33.3317 152.519 23.9176 156.357 16.8046C159.322 11.31 163.829 6.8027 169.324 3.83797C176.437 0 185.851 0 204.679 0H455.728Z";

export default function WhyShape({
  size = 500,
  imageSrc,
  imageAlt = "",
  fill = "#ffffff",
  imagePosition = "xMidYMid slice",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `why-clip-${rawId}`;

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
          preserveAspectRatio={imagePosition}
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <path d={PATH_D} fill={fill} />
      )}
    </svg>
  );
}
