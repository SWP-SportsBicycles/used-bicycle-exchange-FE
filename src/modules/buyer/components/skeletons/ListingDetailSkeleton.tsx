export function ListingDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10 animate-pulse">
      <div className="h-5 w-64 bg-secondary rounded mb-6"></div>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Gallery */}
        <div className="space-y-4">
          <div className="aspect-4/3 w-full bg-secondary/80 rounded-2xl"></div>
          <div className="flex gap-4 overflow-x-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-20 shrink-0 bg-secondary/80 rounded-xl"></div>
            ))}
          </div>
        </div>
        
        {/* Right Column - Info */}
        <div className="flex flex-col">
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-20 bg-secondary rounded-full"></div>
            <div className="h-6 w-20 bg-secondary rounded-full"></div>
          </div>
          <div className="h-10 w-3/4 bg-secondary rounded mb-4"></div>
          <div className="h-12 w-1/3 bg-secondary rounded mb-6"></div>
          
          <div className="h-24 w-full bg-secondary/50 rounded-2xl mb-8"></div>
          
          <div className="space-y-4 mb-8">
            <div className="h-6 w-32 bg-secondary rounded mb-2"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full bg-secondary/30 rounded-lg"></div>
            ))}
          </div>
          
          <div className="mt-auto pt-6 border-t border-border/60 space-y-4">
            <div className="h-14 w-full bg-secondary rounded-xl"></div>
            <div className="h-14 w-full bg-secondary/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
