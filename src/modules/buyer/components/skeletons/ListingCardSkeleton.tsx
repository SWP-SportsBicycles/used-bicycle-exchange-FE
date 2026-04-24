export function ListingCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm animate-pulse">
      <div className="aspect-4/3 w-full bg-secondary/80"></div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="h-6 w-24 bg-secondary rounded"></div>
          <div className="h-4 w-12 bg-secondary rounded"></div>
        </div>
        <div className="h-12 w-full bg-secondary/50 rounded-xl"></div>
        <div className="h-5 w-full bg-secondary rounded mt-1"></div>
        <div className="flex gap-1.5 mt-1">
          <div className="h-5 w-12 bg-secondary rounded"></div>
          <div className="h-5 w-16 bg-secondary rounded"></div>
        </div>
        <div className="my-1 h-px w-full bg-border/60"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 w-20 bg-secondary rounded"></div>
        </div>
      </div>
    </div>
  )
}
