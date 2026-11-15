import { Loader2 } from "lucide-react";

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-neutral-600">
      <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      {label ? <span>{label}</span> : <span className="sr-only">Загрузка</span>}
    </span>
  );
}
