import type { SVGAttributes, ReactNode } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 1090:342 aspect ratio. */
  size?: number;
  /** Fill color for the band. Defaults to the brand light-blue (#ABE8FE). */
  fill?: string;
  /** Optional content rendered on top of the shape. */
  children?: ReactNode;
};

const VIEWBOX = "0 0 1090 342";
const ASPECT = 342 / 1090;
const PATH_D =
  "M0.910138 32.4414C0.910139 14.7683 15.237 0.441374 32.9101 0.441376L1057.12 0.441516C1074.79 0.441518 1089.12 14.7684 1089.12 32.4415L1089.12 236.586C1089.12 244.064 1086.54 251.236 1081.94 256.524C1077.35 261.811 1071.12 264.783 1064.63 264.783L958.257 264.782C944.732 264.782 933.768 277.406 933.768 292.979L933.768 313.245C933.768 320.723 931.188 327.895 926.595 333.182C922.003 338.47 915.775 341.441 909.28 341.441L32.9101 341.441C15.237 341.441 0.910121 327.114 0.910122 309.441L0.910138 32.4414Z";

export default function FooterShape({
  size = 1090,
  fill = "#ABE8FE",
  className,
  children,
  ...rest
}: Props) {
  if (!children) {
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
        <path d={PATH_D} fill={fill} />
      </svg>
    );
  }

  return (
    <div
      className={`relative inline-block ${className ?? ""}`}
      style={{ width: size, height: size * ASPECT }}
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
        <path d={PATH_D} fill={fill} />
      </svg>
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
