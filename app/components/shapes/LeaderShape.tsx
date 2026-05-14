import type { SVGAttributes } from "react";
import { useId } from "react";

type Variant = "br" | "tl";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 372:444 aspect ratio. */
  size?: number;
  /** Notch placement — "br" matches leader2/4.svg, "tl" matches leader6/8.svg. */
  variant?: Variant;
  /** Optional image filling the shape. Without it, `fill` is used. */
  imageSrc?: string;
  /** Optional video filling the shape; takes precedence over imageSrc. */
  videoSrc?: string;
  /** Alt text used when media is provided. */
  imageAlt?: string;
  /** Solid fill when no media is provided. */
  fill?: string;
  /** Add a darken gradient at the bottom of the shape (clipped to the path). */
  darkBottom?: boolean;
  /** Classes applied to the inner image/video element (e.g. zoom on hover). */
  imageClassName?: string;
};

const VIEWBOX = "0 0 372 444";
const W = 372;
const H = 444;
const ASPECT = H / W;

const PATHS: Record<Variant, string> = {
  br: "M41.1193 424C29.8862 424 24.2695 424 20.0258 421.242C16.7477 419.111 14.0585 415.872 12.2897 411.923C10 406.812 10 400.046 10 386.515L10.0001 37.4846C10.0001 23.9539 10 17.1883 12.2898 12.0766C14.0585 8.12792 16.7477 4.88867 20.0259 2.75808C24.2696 -5.04703e-06 29.8863 -4.45557e-06 41.1193 -3.27268e-06L330.881 2.72406e-05C342.114 2.84235e-05 347.73 2.90149e-05 351.974 2.75812C355.252 4.8887 357.942 8.12796 359.71 12.0766C362 17.1884 362 23.9539 362 37.4846L362 287.04C362 305.868 362 315.282 358.162 322.395C355.197 327.89 350.69 332.397 345.195 335.362C338.082 339.2 328.668 339.2 309.84 339.2L273.702 339.2C263.158 339.2 254.61 349.496 254.61 362.197L254.61 371.84C254.61 390.668 254.61 400.082 250.772 407.195C247.807 412.69 243.3 417.197 237.806 420.162C230.693 424 221.278 424 202.45 424L41.1193 424Z",
  tl: "M330.881 0C342.114 0 347.73 -1.90735e-05 351.974 2.75808C355.252 4.88866 357.941 8.12793 359.71 12.0766C362 17.1883 362 23.9538 362 37.4846L362 386.515C362 400.046 362 406.812 359.71 411.923C357.942 415.872 355.252 419.111 351.974 421.242C347.73 424 342.114 424 330.881 424L41.1193 424C29.8862 424 24.2696 424 20.0259 421.242C16.7477 419.111 14.0585 415.872 12.2897 411.923C10 406.812 10 400.046 10 386.515L10 136.96C10 118.132 10 108.718 13.838 101.605C16.8027 96.11 21.31 91.6027 26.8046 88.638C33.9176 84.8 43.3317 84.8 62.16 84.8L98.2983 84.8C108.842 84.8 117.39 74.5041 117.39 61.8034L117.39 52.16C117.39 33.3317 117.39 23.9176 121.228 16.8046C124.193 11.31 128.7 6.8027 134.194 3.83797C141.307 0 150.722 0 169.55 0L330.881 0Z",
};

export default function LeaderShape({
  size = 372,
  variant = "br",
  imageSrc,
  videoSrc,
  imageAlt = "",
  fill = "#000036",
  darkBottom = false,
  className,
  imageClassName,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `leader-clip-${rawId}`;
  const gradientId = `leader-grad-${rawId}`;
  const path = PATHS[variant];
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
          <path d={path} />
        </clipPath>
        {darkBottom ? (
          <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#000000" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        ) : null}
      </defs>
      {hasMedia ? (
        <g clipPath={`url(#${clipId})`}>
          {videoSrc ? (
            <foreignObject x="0" y="0" width={W} height={H}>
              <video
                src={videoSrc}
                poster={imageSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                disableRemotePlayback
                disablePictureInPicture
                aria-label={imageAlt || undefined}
                className={imageClassName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  ...(imageClassName
                    ? { transformOrigin: "center" }
                    : null),
                }}
              />
            </foreignObject>
          ) : (
            <image
              href={imageSrc}
              x="0"
              y="0"
              width={W}
              height={H}
              preserveAspectRatio="xMidYMid slice"
              className={imageClassName}
              style={
                imageClassName
                  ? { transformBox: "fill-box", transformOrigin: "center" }
                  : undefined
              }
            />
          )}
          {darkBottom ? (
            <rect
              x="0"
              y={H - 340}
              width={W}
              height="340"
              fill={`url(#${gradientId})`}
            />
          ) : null}
        </g>
      ) : (
        <path d={path} fill={fill} />
      )}
    </svg>
  );
}
