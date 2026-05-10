import { useId, type InputHTMLAttributes } from "react";

type Variant = "default" | "dashed" | "dashed-light" | "pill-light";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  variant?: Variant;
  label?: string;
  helperText?: string;
  errorText?: string;
};

function inputClasses(
  variant: Variant,
  hasError: boolean,
  disabled: boolean | undefined,
): string {
  const base =
    "w-full rounded-round px-5 py-3 text-md outline-none disabled:cursor-not-allowed";

  if (disabled) {
    return `${base} border border-gray-200 bg-gray-50 text-gray-400`;
  }

  if (hasError) {
    return `${base} border border-error-500 bg-white text-primary-500 focus:ring-4 focus:ring-error-500/15`;
  }

  switch (variant) {
    case "dashed":
      return `${base} border-2 border-dashed border-primary-500 bg-transparent text-primary-500 placeholder:text-gray-400 focus:bg-primary-500/5 focus:ring-4 focus:ring-primary-500/10`;
    case "dashed-light":
      return `${base} border-2 border-dashed border-primary-500/30 bg-transparent text-primary-500 placeholder:text-gray-400 focus:border-primary-500/60 focus:bg-primary-500/5 focus:ring-4 focus:ring-primary-500/10`;
    case "pill-light":
      return `${base} bg-white text-primary-500 placeholder:text-gray-400 focus:ring-4 focus:ring-error-500/30`;
    default:
      return `${base} border border-gray-200 bg-white text-primary-500 placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10`;
  }
}

export default function Input({
  variant = "default",
  label,
  helperText,
  errorText,
  id,
  disabled,
  className,
  ...rest
}: Props) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const hasError = Boolean(errorText);
  const labelTone = disabled ? "text-gray-400" : "text-primary-500";
  const helperTone = hasError ? "text-error-700" : "text-gray-500";
  const helperContent = errorText ?? helperText;

  const field = (
    <input
      id={inputId}
      disabled={disabled}
      className={`${inputClasses(variant, hasError, disabled)} ${className ?? ""}`}
      {...rest}
    />
  );

  if (!label && !helperContent) return field;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium ${labelTone} mb-1.5`}
        >
          {label}
        </label>
      )}
      {field}
      {helperContent && (
        <p className={`text-sm ${helperTone} mt-1.5`}>{helperContent}</p>
      )}
    </div>
  );
}
