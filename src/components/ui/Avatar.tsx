const COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-rose-500",
];

const SIZES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-20 w-20 text-2xl",
} as const;

interface AvatarProps {
  handle: string;
  name: string;
  size?: keyof typeof SIZES;
}

function hashHandle(handle: string): number {
  let hash = 0;
  for (let index = 0; index < handle.length; index += 1) {
    hash = (hash * 31 + handle.charCodeAt(index)) % 100000;
  }
  return hash;
}

export function Avatar({ handle, name, size = "md" }: AvatarProps) {
  const color = COLORS[hashHandle(handle) % COLORS.length];
  const initial = (name.trim().charAt(0) || "?").toUpperCase();

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase text-white ${color} ${SIZES[size]}`}
    >
      {initial}
    </span>
  );
}
