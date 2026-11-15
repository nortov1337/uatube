import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98] disabled:bg-red-300",
  secondary:
    "border border-neutral-300 bg-surface text-neutral-900 hover:bg-neutral-100 active:scale-[0.98] disabled:text-neutral-400",
  ghost:
    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:scale-[0.98] disabled:text-neutral-400",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
