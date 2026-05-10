import type { SVGAttributes } from "react";
import { useId } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 1245:739 aspect ratio. */
  size?: number;
  /** Optional image filling the shape. Without it, `fill` is used. */
  imageSrc?: string;
  /** Alt text used when imageSrc is provided. */
  imageAlt?: string;
  /** Solid fill when no imageSrc is provided. */
  fill?: string;
};

const VIEWBOX = "0 0 1245 739";
const W = 1245;
const H = 739;
const ASPECT = H / W;
const PATH_D =
  "M591.5 310.211C598.926 310.211 606.048 313.391 611.299 319.05C616.549 324.709 619.5 332.384 619.5 340.387V373.204C619.5 390.104 619.499 398.555 622.551 405.01C625.235 410.688 629.52 415.305 634.788 418.198C640.778 421.487 648.619 421.487 664.3 421.487H1187.75C1205.69 421.487 1214.66 421.487 1221.51 424.979C1227.54 428.049 1232.44 432.95 1235.51 438.977C1239 445.828 1239 454.798 1239 472.737V687.093C1239 705.032 1239 714.002 1235.51 720.854C1232.44 726.88 1227.54 731.781 1221.51 734.852C1214.66 738.343 1205.69 738.343 1187.75 738.343H289.625C282.199 738.343 275.077 735.163 269.826 729.504C264.575 723.845 261.625 716.169 261.625 708.166V675.349C261.625 658.449 261.625 649.998 258.573 643.543C255.889 637.865 251.604 633.248 246.336 630.354C240.346 627.066 232.505 627.065 216.824 627.065H51.25C33.3108 627.065 24.3411 627.065 17.4893 623.574C11.4622 620.503 6.56214 615.603 3.49121 609.576C9.64915e-05 602.724 0 593.754 0 575.815V361.461C0 343.522 0.000107178 334.552 3.49121 327.7C6.56216 321.673 11.4622 316.772 17.4893 313.701C24.3411 310.21 33.311 310.211 51.25 310.211H591.5ZM1212.22 0C1229.91 7.03937e-05 1244.25 14.3409 1244.25 32.0312V230.132C1244.25 247.822 1229.91 262.163 1212.22 262.163H32.0312C14.3409 262.163 0 247.822 0 230.132V80.6133C6.51922e-05 74.8641 2.95022 69.3504 8.20117 65.2852C13.4522 61.2198 20.5739 58.9355 28 58.9355H149.625C165.089 58.9355 177.625 49.2308 177.625 37.2588V21.6777C177.625 15.9286 180.575 10.4149 185.826 6.34961C191.077 2.28428 198.199 0 205.625 0H1212.22Z";

export default function FooterImageShape({
  size = 1245,
  imageSrc,
  imageAlt = "",
  fill = "#E0F2FF",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `footer-img-clip-${rawId}`;

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
        <path d={PATH_D} fill={fill} fillRule="evenodd" />
      )}
    </svg>
  );
}
