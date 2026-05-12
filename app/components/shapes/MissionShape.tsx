import type { SVGAttributes, ReactNode } from "react";
import { useId } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 341:410 aspect ratio. */
  size?: number;
  /** Fill color for the shape. Ignored when `imageSrc` is set. */
  fill?: string;
  /** Optional image filling the shape via clipPath. */
  imageSrc?: string;
  /** Alt text used when imageSrc is provided. */
  imageAlt?: string;
  /** Optional content positioned on top of the shape. */
  children?: ReactNode;
  /** Mirror the shape horizontally. */
  flipX?: boolean;
};

const VIEWBOX = "0 0 341 410";
const W = 341;
const H = 410;
const ASPECT = H / W;
const PATH_D =
  "M310.853 0C321.735 0 327.176 -1.84437e-05 331.287 2.66701C334.463 4.72724 337.068 7.85956 338.782 11.6778C341 16.6208 341 23.1629 341 36.2469L341 373.753C341 386.837 341 393.379 338.782 398.322C337.068 402.14 334.463 405.273 331.287 407.333C327.176 410 321.735 410 310.853 410L30.1468 410C19.2648 410 13.8236 410 9.71255 407.333C6.53686 405.273 3.93169 402.14 2.21818 398.322C-2.46551e-06 393.379 1.26601e-05 386.837 1.22319e-05 373.753L4.3907e-06 134.16C3.7745e-06 115.332 3.4664e-06 105.918 3.83798 98.8046C6.8027 93.31 11.31 88.8027 16.8046 85.838C23.9176 82 33.3317 82 52.16 82L85.539 82C95.7534 82 104.034 72.044 104.034 59.7627L104.034 52.16C104.034 33.3317 104.034 23.9176 107.872 16.8046C110.837 11.31 115.344 6.8027 120.838 3.83797C127.952 0 137.366 0 156.194 0L310.853 0Z";

export default function MissionShape({
  size = 341,
  fill = "#ffffff",
  imageSrc,
  imageAlt = "",
  className,
  children,
  flipX,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `mission-clip-${rawId}`;
  const mirror = flipX ? `scale(-1, 1) translate(${-W}, 0)` : undefined;

  const renderFill = () =>
    imageSrc ? (
      <>
        <defs>
          <clipPath id={clipId}>
            <path d={PATH_D} transform={mirror} />
          </clipPath>
        </defs>
        <image
          href={imageSrc}
          x="0"
          y="0"
          width={W}
          height={H}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      </>
    ) : (
      <path d={PATH_D} fill={fill} transform={mirror} />
    );

  if (!children) {
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
        {renderFill()}
      </svg>
    );
  }

  return (
    <div
      className={`relative w-full ${className ?? ""}`}
      style={{ maxWidth: size, aspectRatio: `${W} / ${H}` }}
      role={imageSrc ? "img" : undefined}
      aria-label={imageSrc ? imageAlt || undefined : undefined}
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
