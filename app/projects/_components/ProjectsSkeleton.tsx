export default function ProjectsSkeleton() {
  return (
    <div className="space-y-lg animate-pulse">
      <div className="flex flex-col space-y-xs pb-md border-b border-hairline">
        <div className="h-8 bg-surface-strong rounded w-64 mb-xs" />
        <div className="h-4 bg-surface-strong rounded w-5/6 sm:w-[480px]" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md mb-lg pt-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-md flex-1">
          <div className="h-10 w-full sm:w-[320px] md:w-[384px] shrink-0 bg-surface-strong rounded-full" />
          <div className="h-10 w-40 bg-surface-strong rounded-full shrink-0" />
        </div>
        <div className="flex items-center gap-md shrink-0">
          <div className="h-10 w-32 bg-surface-strong rounded-sm" />
          <div className="h-10 w-32 bg-surface-strong rounded-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-surface-soft border border-hairline rounded-md p-base h-56 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-md">
                <div className="h-5 w-5 bg-hairline rounded-sm" />
                <div className="h-7 w-7 bg-hairline rounded-full" />
              </div>
              <div className="h-4 bg-hairline rounded w-2/3 mb-sm" />
              <div className="h-3 bg-hairline rounded w-full mb-xs" />
              <div className="h-3 bg-hairline rounded w-5/6" />
            </div>
            <div className="h-8 bg-hairline rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
