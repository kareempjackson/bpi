import type { SVGAttributes } from "react";
import { useId } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 414:551 aspect ratio. */
  size?: number;
  /** Optional image filling the shape. Without it, `fill` is used. */
  imageSrc?: string;
  /** Alt text used when imageSrc is provided. */
  imageAlt?: string;
  /** Solid fill when no imageSrc is provided. */
  fill?: string;
};

const VIEWBOX = "0 0 414 551";
const W = 414;
const H = 551;
const ASPECT = H / W;
const PATH_D =
  "M36.5447 551.007C23.3532 551.007 16.7572 551.007 11.7737 547.423C7.92399 544.654 4.76592 540.444 2.68875 535.313C-0.000206251 528.67 -0.000186941 519.878 -0.000185403 502.294L-0.00014575 48.7128C-0.000144213 31.1291 -0.000161986 22.3369 2.6888 15.694C4.76597 10.5626 7.92404 6.35299 11.7737 3.58421C16.7573 -6.03422e-05 23.3532 -3.50501e-05 36.5448 -3.38969e-05L376.826 -4.14853e-06C390.018 -2.99529e-06 396.614 -2.71341e-05 401.597 3.58424C405.447 6.35303 408.605 10.5626 410.682 15.6941C413.371 22.337 413.371 31.1291 413.371 48.7129L413.371 396.44C413.371 412.455 413.371 420.462 410.107 426.512C407.585 431.186 403.751 435.019 399.078 437.541C393.028 440.805 385.021 440.805 369.006 440.805L309.678 440.805C297.296 440.805 287.258 454.185 287.258 470.691L287.258 506.642C287.258 522.656 287.258 530.664 283.993 536.714C281.472 541.387 277.638 545.221 272.965 547.742C266.915 551.007 258.907 551.007 242.893 551.007L36.5447 551.007Z";

export default function InitiativesShape({
  size = 414,
  imageSrc,
  imageAlt = "",
  fill = "#E0F2FF",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `init-clip-${rawId}`;

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
