export default function HomeLoading() {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex animate-pulse flex-col gap-3">
          <div className="aspect-video w-full rounded-xl bg-neutral-200" />
          <div className="flex gap-3">
            <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/2 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
