import type { SVGAttributes } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 1414:1073 aspect ratio. */
  size?: number;
  /** Overlay color. Defaults to black. */
  fill?: string;
  /** Overlay opacity (0–1). Defaults to 0.5. */
  fillOpacity?: number;
};

const VIEWBOX = "0 0 1414 1073";
const ASPECT = 1073 / 1414;
const PATH_D =
  "M931.725 0C938.868 2.68943e-05 945.719 2.92699 950.77 8.13672C955.82 13.3464 958.658 20.4127 958.658 27.7803V56.4053C958.658 71.7603 971.106 84.208 986.461 84.208H1387.07L1387.74 84.2168C1394.64 84.3935 1401.22 87.2979 1406.11 92.3447C1411.16 97.5544 1414 104.621 1414 111.988L1414 84.208V1031.3C1414 1054.33 1395.33 1073 1372.29 1073H41.7041C18.6716 1073 0.000123523 1054.33 0 1031.3V111.988C0 104.621 2.83775 97.5545 7.88867 92.3447C12.9396 87.135 19.7904 84.208 26.9336 84.208H152.313C167.669 84.208 180.116 71.7603 180.116 56.4053V27.7803C180.116 20.4127 182.954 13.3464 188.005 8.13672C193.056 2.92699 199.907 1.82352e-05 207.05 0H931.725Z";

export default function HeroShape1({
  size = 600,
  fill = "#000000",
  fillOpacity = 0.5,
  className,
  ...rest
}: Props) {
  return (
    <svg
      width={size}
      height={size * ASPECT}
      viewBox={VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <path d={PATH_D} fill={fill} fillOpacity={fillOpacity} />
    </svg>
  );
}
