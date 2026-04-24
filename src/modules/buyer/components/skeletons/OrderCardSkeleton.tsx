export function OrderCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden animate-pulse">
      <div className="bg-secondary/30 px-5 py-3 border-b border-border/60 flex justify-between">
        <div className="h-5 w-40 bg-secondary rounded"></div>
        <div className="h-6 w-24 bg-secondary rounded-full"></div>
      </div>
      <div className="p-5 flex flex-wrap lg:flex-nowrap gap-6 items-center">
        <div className="h-24 w-24 rounded-lg bg-secondary shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 w-3/4 bg-secondary rounded"></div>
          <div className="h-4 w-40 bg-secondary rounded"></div>
          <div className="h-4 w-56 bg-secondary rounded"></div>
        </div>
        <div className="w-full lg:w-auto shrink-0 flex gap-3">
          <div className="h-10 w-full lg:w-32 bg-secondary rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
