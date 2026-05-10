import type { InputHTMLAttributes, ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export default function Radio({ label, className, ...rest }: Props) {
  const input = (
    <input
      type="radio"
      className={`mt-0.5 size-5 accent-primary-500 ${className ?? ""}`}
      {...rest}
    />
  );

  if (!label) return input;

  return (
    <label className="flex items-start gap-3 cursor-pointer">
      {input}
      <span className="text-md text-primary-500">{label}</span>
    </label>
  );
}
