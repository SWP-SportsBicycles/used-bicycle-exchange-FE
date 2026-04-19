import type { ReactNode } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

interface DetailPageLoadingProps {
  maxWidthClassName?: string
  contentClassName?: string
  breadcrumbSkeletonClassName?: string
  showLeadSkeleton?: boolean
  gridClassName?: string
  primaryColumnClassName?: string
  secondaryColumnClassName?: string
  primarySkeleton?: ReactNode
  secondarySkeleton?: ReactNode
}

export function DetailPageLoading({
  maxWidthClassName = 'max-w-5xl',
  contentClassName,
  breadcrumbSkeletonClassName = 'mb-6 h-5 w-48 animate-pulse rounded bg-muted',
  showLeadSkeleton = true,
  gridClassName = 'grid gap-8 lg:grid-cols-3',
  primaryColumnClassName = 'lg:col-span-2 h-80 animate-pulse rounded-2xl bg-muted',
  secondaryColumnClassName = 'h-80 animate-pulse rounded-2xl bg-muted',
  primarySkeleton,
  secondarySkeleton,
}: DetailPageLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className={cn('flex-1 mx-auto w-full px-4 py-8 lg:px-8', maxWidthClassName, contentClassName)}>
        <div className={breadcrumbSkeletonClassName} />
        {showLeadSkeleton && <div className="mb-8 h-24 animate-pulse rounded-2xl bg-muted" />}
        <div className={gridClassName}>
          {primarySkeleton ?? <div className={primaryColumnClassName} />}
          {secondarySkeleton ?? <div className={secondaryColumnClassName} />}
        </div>
      </main>
      <Footer />
    </div>
  )
}
