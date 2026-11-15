export function CommentSkeleton() {
  return (
    <div className="flex animate-pulse gap-3">
      <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-neutral-200" />
        <div className="h-3 w-full rounded bg-neutral-200" />
        <div className="h-3 w-2/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}
