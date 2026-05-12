import type { SVGAttributes } from "react";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Rendered width & height in px. Default 44. */
  size?: number;
  /** Arrow direction. `prev` mirrors horizontally. */
  direction?: "next" | "prev";
};

export default function ArrowCircle({
  size = 44,
  direction = "next",
  className,
  style,
  ...rest
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={
        direction === "prev"
          ? { ...style, transform: "scaleX(-1)" }
          : style
      }
      aria-hidden
      {...rest}
    >
      <rect
        x="0.5"
        y="0.5"
        width="43"
        height="43"
        rx="21.5"
        stroke="currentColor"
        strokeDasharray="4 4"
      />
      <path
        d="M13.75 22H30.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 15.25L30.25 22L23.5 28.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
