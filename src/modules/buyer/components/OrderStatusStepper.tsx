'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, Package, Truck, AlertTriangle, XCircle } from 'lucide-react'
import { BuyerOrder } from '@/lib/api/buyer-api'

interface OrderStatusStepperProps {
  status: BuyerOrder['status']
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const isFailed = status === 'cancelled' || status === 'disputed' || status === 'refunded'

  const getStepStatus = (stepIndex: number) => {
    // Map 5 backend statuses to 4 UI steps
    // Step 0: pending
    // Step 1: paid
    // Step 2: shipping
    // Step 3: delivered / completed
    
    const statusMap: Record<string, number> = {
      'pending': 0,
      'paid': 1,
      'shipping': 2,
      'delivered': 3,
      'completed': 4 // Special case: 4 > 3 means step 3 is "completed"
    }

    const currentIndex = statusMap[status] ?? -1

    if (isFailed) {
      // Logic for failed states:
      // - Steps before the failure might be 'completed'
      // - The failure point and after are 'error'
      if (status === 'cancelled') {
         // Usually cancelled happens at pending or paid
         return stepIndex === 0 ? 'completed' : 'error'
      }
      if (status === 'disputed' || status === 'refunded') {
         // Dispute usually happens after shipping/delivered
         return stepIndex <= 2 ? 'completed' : 'error'
      }
    }

    if (currentIndex > stepIndex) return 'completed'
    if (currentIndex === stepIndex) return 'current'
    return 'upcoming'
  }

  const steps = [
    { label: 'Đặt hàng', icon: Clock },
    { label: 'Thanh toán', icon: CheckCircle2 },
    { label: 'Giao hàng', icon: Truck },
    { label: 'Hoàn tất', icon: Package },
  ]

  // Override labels for terminal/failed states
  if (status === 'cancelled') {
    steps[3] = { label: 'Đã hủy', icon: XCircle }
  } else if (status === 'disputed') {
    steps[3] = { label: 'Khiếu nại', icon: AlertTriangle }
  } else if (status === 'refunded') {
    steps[3] = { label: 'Đã hoàn tiền', icon: AlertTriangle }
  }

  const getProgressWidth = () => {
    if (status === 'pending') return '0%'
    if (status === 'paid') return '33%'
    if (status === 'shipping') return '66%'
    return '100%' // delivered, completed, cancelled, disputed, refunded
  }

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative px-2 sm:px-6">
        {/* Progress Bar Background */}
        <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          {/* Active Progress Bar */}
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out rounded-full",
              isFailed ? "bg-destructive/60" : "bg-primary"
            )}
            style={{ width: getProgressWidth() }}
          />
        </div>

        {steps.map((step, index) => {
          const stepStatus = getStepStatus(index)
          const Icon = step.icon

          return (
            <div key={index} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 shadow-sm ring-4 ring-card",
                  stepStatus === 'completed' && (isFailed ? "bg-destructive/40 text-white" : "bg-primary text-primary-foreground shadow-primary/30"),
                  stepStatus === 'current' && "bg-card border-2 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]",
                  stepStatus === 'error' && "bg-destructive text-destructive-foreground shadow-destructive/30",
                  stepStatus === 'upcoming' && "bg-secondary text-muted-foreground border border-border"
                )}
              >
                <Icon className={cn("h-5 w-5", stepStatus === 'current' && "animate-pulse")} />
              </div>
              <span 
                className={cn(
                  "text-xs sm:text-sm font-bold whitespace-nowrap px-2 py-1 rounded-md transition-colors duration-300",
                  stepStatus === 'upcoming' ? "text-muted-foreground" : "text-foreground bg-secondary/30",
                  stepStatus === 'error' && "text-destructive bg-destructive/10",
                  stepStatus === 'completed' && !isFailed && "text-primary-foreground bg-primary/10"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
