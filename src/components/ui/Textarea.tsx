import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid = false, className = "", rows = 4, ...props }: TextareaProps) {
  const border = invalid ? "border-red-500" : "border-neutral-300";
  return (
    <textarea
      rows={rows}
      className={`w-full resize-y rounded-xl border ${border} bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 ${className}`}
      {...props}
    />
  );
}
