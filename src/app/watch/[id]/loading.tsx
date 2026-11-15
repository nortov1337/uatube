export default function WatchLoading() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
      <div className="min-w-0 space-y-3">
        <div className="skeleton aspect-video w-full rounded-2xl" />
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-3 w-40 rounded" />
        <div className="skeleton h-20 w-full rounded-xl" />
      </div>
      <div className="mt-8 space-y-3 lg:mt-0">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex gap-2">
            <div className="skeleton aspect-video w-40 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
