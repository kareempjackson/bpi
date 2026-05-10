"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Width of the button in px. Height is derived from the 120:54 aspect ratio. */
  size?: number;
};

export default function HamburgerMenu({
  size = 120,
  className,
  "aria-label": ariaLabel = "Open menu",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={`group inline-flex shrink-0 items-center justify-center transition-transform duration-200 active:scale-[0.97] ${className ?? ""}`}
      {...rest}
    >
      <svg
        width={size}
        height={(size * 54) / 120}
        viewBox="0 0 120 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Blob */}
        <path
          d="M75.7034 5.88216C86.4825 -1.75165 100.411 -0.789398 109.25 6.67905C118.703 14.6682 122.472 28.1991 116.228 39.4485C108.02 54.2275 88.758 56.7218 75.5174 47.1571C69.1245 42.5379 61.3771 41.3582 53.9573 39.9909C43.0622 37.9786 33.1964 39.2781 23.1015 42.9689C15.9097 45.5957 8.11054 42.0376 4.24448 36.5681C0.202698 30.8396 0.470703 22.8673 4.56905 17.3175C8.6674 11.7677 17.4566 8.58583 24.5855 11.7504C41.946 19.4557 59.3824 17.4445 75.7034 5.88216Z"
          className="fill-error-500"
        />

        {/* Hover circle — scales from 0 to 1 with a slight overshoot */}
        <circle
          cx="93"
          cy="27"
          r="21"
          className="fill-error-700 origin-center transform-fill scale-0 transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-100"
        />

        {/* Lines — flip to white on hover and cascade-slide into a centered group */}
        <g
          transform="translate(75.6 18)"
          stroke="currentColor"
          strokeWidth="1.63583"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-500 transition-colors duration-200 group-hover:text-white"
        >
          <path
            d="M2.35156 3.72949L32.3616 3.68077"
            className="transition-transform duration-300 ease-out group-hover:-translate-x-0.5"
          />
          <path
            d="M15.6719 8.53516L32.3665 8.58787"
            className="transition-transform duration-300 delay-75 ease-out group-hover:-translate-x-1.75"
          />
          <path
            d="M9.87109 13.4961H32.3638"
            className="transition-transform duration-300 delay-150 ease-out group-hover:-translate-x-1"
          />
        </g>
      </svg>
    </button>
  );
}
