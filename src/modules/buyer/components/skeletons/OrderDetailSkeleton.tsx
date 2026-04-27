import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'

export function OrderDetailSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 lg:px-6">
        {/* Nav */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Status Stepper */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between px-6 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Body */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left col */}
          <div className="space-y-8 lg:col-span-8">
            {/* Product card */}
            <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/40 bg-secondary/30 px-6 py-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
              <div className="flex gap-6 p-6">
                <Skeleton className="h-32 w-32 shrink-0 rounded-2xl" />
                <div className="flex flex-1 flex-col justify-center gap-4">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-2 rounded-2xl bg-secondary/30 p-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-48 mt-2" />
              </div>
            </div>

            <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm space-y-4">
              <Skeleton className="h-5 w-24" />
              <div className="flex items-end justify-between border-b border-border/50 pb-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
