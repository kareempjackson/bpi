import type { SVGAttributes, ReactNode } from "react";
import { useId } from "react";

import ShapeMedia from "./ShapeMedia";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 352:424 aspect ratio. */
  size?: number;
  /** Fill color for the card. Defaults to white. Ignored when media is set. */
  fill?: string;
  /** Optional image filling the shape via clipPath. */
  imageSrc?: string;
  /** Optional video filling the shape; takes precedence over imageSrc. */
  videoSrc?: string;
  /** Alt text used when media is provided. */
  imageAlt?: string;
  /** Optional content to render on top of the card, positioned with the card as backdrop. */
  children?: ReactNode;
  /** Mirror the shape horizontally — moves the notch from bottom-right to bottom-left. */
  flipX?: boolean;
};

const VIEWBOX = "0 0 352 424";
const W = 352;
const H = 424;
const ASPECT = H / W;
const PATH_D =
  "M31.1193 424C19.8862 424 14.2695 424 10.0258 421.242C6.74772 419.111 4.05851 415.872 2.28973 411.923C-1.2041e-05 406.812 2.17027e-05 400.046 2.26847e-05 386.515L4.80165e-05 37.4846C4.89985e-05 23.9538 1.62369e-05 17.1883 2.28976 12.0766C4.05854 8.12794 6.74775 4.88866 10.0259 2.75808C14.2696 -1.41069e-05 19.8863 -4.45557e-06 31.1193 -3.27267e-06L320.881 2.72406e-05C332.114 2.84235e-05 337.73 1.9955e-05 341.974 2.75812C345.252 4.8887 347.942 8.12797 349.71 12.0766C352 17.1883 352 23.9539 352 37.4846L352 287.04C352 305.868 352 315.282 348.162 322.395C345.197 327.89 340.69 332.397 335.195 335.362C328.082 339.2 318.668 339.2 299.84 339.2L263.702 339.2C253.158 339.2 244.61 349.496 244.61 362.197L244.61 371.84C244.61 390.668 244.61 400.082 240.772 407.195C237.807 412.69 233.3 417.197 227.806 420.162C220.693 424 211.278 424 192.45 424L31.1193 424Z";

export default function BlogPostShape({
  size = 352,
  fill = "#ffffff",
  imageSrc,
  videoSrc,
  imageAlt = "",
  className,
  children,
  flipX,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `blog-clip-${rawId}`;
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
        {renderFill()}
      </svg>
    );
  }

  return (
    <div
      className={`relative w-full ${className ?? ""}`}
      style={{ maxWidth: size, aspectRatio: "352 / 424" }}
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
