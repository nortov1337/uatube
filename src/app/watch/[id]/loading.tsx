export default function WatchLoading() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
      <div className="min-w-0 animate-pulse space-y-3">
        <div className="aspect-video w-full rounded-2xl bg-neutral-200" />
        <div className="h-5 w-2/3 rounded bg-neutral-200" />
        <div className="h-3 w-40 rounded bg-neutral-200" />
        <div className="h-20 w-full rounded-xl bg-neutral-200" />
      </div>
      <div className="mt-8 space-y-3 lg:mt-0">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex animate-pulse gap-2">
            <div className="aspect-video w-40 shrink-0 rounded-xl bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full rounded bg-neutral-200" />
              <div className="h-3 w-2/3 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
