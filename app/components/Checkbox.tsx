import type { InputHTMLAttributes, ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export default function Checkbox({ label, className, ...rest }: Props) {
  const input = (
    <input
      type="checkbox"
      className={`mt-0.5 size-5 rounded-sm border-gray-300 text-primary-500 accent-primary-500 ${className ?? ""}`}
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
