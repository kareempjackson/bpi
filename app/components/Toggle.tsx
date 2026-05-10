import type { InputHTMLAttributes, ReactNode } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export default function Toggle({ label, className, ...rest }: Props) {
  const control = (
    <span className="relative inline-flex h-6 w-11 items-center rounded-round bg-gray-200 transition has-[:checked]:bg-primary-500">
      <input type="checkbox" className={`peer sr-only ${className ?? ""}`} {...rest} />
      <span className="absolute left-0.5 size-5 rounded-round bg-white shadow transition peer-checked:translate-x-5" />
    </span>
  );

  if (!label) {
    return (
      <label className="inline-flex items-center cursor-pointer">{control}</label>
    );
  }

  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      {control}
      <span className="text-md text-primary-500">{label}</span>
    </label>
  );
}
