import { useId, type SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  helperText?: string;
  errorText?: string;
};

export default function Select({
  label,
  helperText,
  errorText,
  id,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const hasError = Boolean(errorText);
  const labelTone = disabled ? "text-gray-400" : "text-primary-500";
  const helperTone = hasError ? "text-error-700" : "text-gray-500";
  const helperContent = errorText ?? helperText;

  const base =
    "w-full rounded-round px-5 py-3 text-md outline-none disabled:cursor-not-allowed";
  const tone = disabled
    ? "border border-gray-200 bg-gray-50 text-gray-400"
    : hasError
      ? "border border-error-500 bg-white text-primary-500 focus:ring-4 focus:ring-error-500/15"
      : "border border-gray-200 bg-white text-primary-500 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10";

  const field = (
    <select
      id={fieldId}
      disabled={disabled}
      className={`${base} ${tone} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </select>
  );

  if (!label && !helperContent) return field;

  return (
    <div>
      {label && (
        <label
          htmlFor={fieldId}
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
