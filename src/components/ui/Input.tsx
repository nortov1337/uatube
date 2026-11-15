import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid = false, className = "", ...props }: InputProps) {
  const border = invalid ? "border-red-500" : "border-neutral-300";
  return (
    <input
      className={`h-11 w-full rounded-xl border ${border} bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 ${className}`}
      {...props}
    />
  );
}
