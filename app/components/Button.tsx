import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "tertiary-light";
type TextSize = "sm" | "md";
type IconSize = "sm" | "md" | "lg" | "xl";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: TextSize;
  iconOnly?: IconSize;
  onDark?: boolean;
};

const TEXT_SIZES: Record<TextSize, string> = {
  sm: "text-sm font-semibold px-5 py-2",
  md: "text-md font-semibold px-6 py-3",
};

const ICON_SIZES: Record<IconSize, string> = {
  sm: "size-9",
  md: "size-11",
  lg: "size-12",
  xl: "size-14",
};

function variantClasses(variant: Variant, onDark: boolean): string {
  if (onDark && variant === "tertiary") {
    return "border border-dashed border-white/60 bg-transparent text-white hover:bg-white/10 hover:border-white/80";
  }
  switch (variant) {
    case "primary":
      return "border border-dashed border-primary-500/45 bg-error-500 text-primary-500 hover:bg-error-400 hover:border-primary-500/70 hover:shadow-[0_6px_18px_-8px_rgba(0,0,54,0.35)]";
    case "secondary":
      return "border border-gray-200 bg-white text-primary-500 hover:bg-gray-50 hover:border-gray-300 hover:shadow-[0_4px_14px_-8px_rgba(0,0,54,0.18)]";
    case "tertiary":
      return "border border-dashed border-primary-500/60 bg-transparent text-primary-500 hover:bg-primary-500/5 hover:border-primary-500/90";
    case "tertiary-light":
      return "border border-dashed border-primary-500/30 bg-transparent text-primary-500 hover:border-primary-500/50 hover:bg-primary-500/5";
  }
}

export default function Button({
  variant = "primary",
  size = "md",
  iconOnly,
  onDark = false,
  type = "button",
  className,
  children,
  ...rest
}: Props) {
  const layout = iconOnly
    ? `${ICON_SIZES[iconOnly]} inline-flex items-center justify-center`
    : `${TEXT_SIZES[size]} inline-flex items-center gap-2`;

  const motion = iconOnly
    ? "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.06] active:scale-95 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500/40"
    : "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500/40";

  return (
    <button
      type={type}
      className={`group/btn rounded-round ${motion} ${variantClasses(variant, onDark)} ${layout} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
