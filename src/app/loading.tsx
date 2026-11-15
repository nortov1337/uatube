export default function HomeLoading() {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <div className="skeleton aspect-video w-full rounded-xl" />
          <div className="flex gap-3">
            <div className="skeleton h-7 w-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
