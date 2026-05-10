import { useId, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  errorText?: string;
};

export default function Textarea({
  label,
  helperText,
  errorText,
  id,
  disabled,
  className,
  rows = 4,
  ...rest
}: Props) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const hasError = Boolean(errorText);
  const labelTone = disabled ? "text-gray-400" : "text-primary-500";
  const helperTone = hasError ? "text-error-700" : "text-gray-500";
  const helperContent = errorText ?? helperText;

  const base =
    "w-full rounded-lg px-5 py-3 text-md outline-none resize-none disabled:cursor-not-allowed";
  const tone = disabled
    ? "border border-gray-200 bg-gray-50 text-gray-400"
    : hasError
      ? "border border-error-500 bg-white text-primary-500 focus:ring-4 focus:ring-error-500/15"
      : "border border-gray-200 bg-white text-primary-500 placeholder:text-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10";

  const field = (
    <textarea
      id={fieldId}
      rows={rows}
      disabled={disabled}
      className={`${base} ${tone} ${className ?? ""}`}
      {...rest}
    />
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
