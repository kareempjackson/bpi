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
    return "border-2 border-dashed border-white/60 bg-transparent text-white hover:bg-white/10";
  }
  switch (variant) {
    case "primary":
      return "bg-error-500 text-primary-500 hover:bg-error-400";
    case "secondary":
      return "border border-gray-200 bg-white text-primary-500 hover:bg-gray-50";
    case "tertiary":
      return "border-2 border-dashed border-primary-500 bg-transparent text-primary-500 hover:bg-primary-500/5";
    case "tertiary-light":
      return "border-2 border-dashed border-primary-500/30 bg-transparent text-primary-500 hover:border-primary-500/50 hover:bg-primary-500/5";
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

  return (
    <button
      type={type}
      className={`rounded-round transition ${variantClasses(variant, onDark)} ${layout} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
