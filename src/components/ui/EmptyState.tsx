import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex animate-fade-up flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-surface-muted/40 px-6 py-16 text-center">
      {icon ? <div className="mb-4 text-neutral-400">{icon}</div> : null}
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-neutral-600">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
