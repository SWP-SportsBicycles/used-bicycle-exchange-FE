export function CheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 animate-pulse">
      <div className="h-12 w-full bg-secondary rounded-xl mb-8"></div>
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-8">
          <div className="h-64 w-full bg-secondary/50 rounded-2xl"></div>
          <div className="h-40 w-full bg-secondary/50 rounded-2xl"></div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-[400px] w-full bg-secondary/50 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}
