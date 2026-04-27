'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, Package, Truck, AlertTriangle, XCircle } from 'lucide-react'
import { BuyerOrder } from '@/lib/api/buyer-api'

interface OrderStatusStepperProps {
  status: BuyerOrder['status']
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const getStepStatus = (stepIndex: number) => {
    // Basic progression logic based on standard e-commerce flow
    const statuses = ['pending', 'paid', 'shipping', 'delivered', 'completed']
    const currentIndex = statuses.indexOf(status)
    
    if (status === 'cancelled' || status === 'disputed') {
       if (stepIndex === 0) return 'completed'
       if (stepIndex === 1 && status === 'disputed') return 'completed'
       return 'error'
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

  // Override labels for cancelled/disputed
  if (status === 'cancelled') {
    steps[3] = { label: 'Đã hủy', icon: XCircle }
  } else if (status === 'disputed') {
    steps[3] = { label: 'Khiếu nại', icon: AlertTriangle }
  }

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative px-2 sm:px-6">
        {/* Progress Bar Background */}
        <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          {/* Active Progress Bar */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-700 ease-out rounded-full"
            style={{ 
              width: status === 'pending' ? '0%' : 
                     status === 'paid' ? '33%' : 
                     status === 'shipping' ? '66%' : 
                     ['delivered', 'completed', 'disputed'].includes(status) ? '100%' : '100%' 
            }}
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
                  stepStatus === 'completed' && "bg-primary text-primary-foreground shadow-primary/30",
                  stepStatus === 'current' && "bg-card border-2 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]",
                  stepStatus === 'error' && "bg-destructive text-destructive-foreground shadow-destructive/30",
                  stepStatus === 'upcoming' && "bg-secondary text-muted-foreground border border-border"
                )}
              >
                <Icon className={cn("h-5 w-5", stepStatus === 'current' && "animate-pulse")} />
              </div>
              <span 
                className={cn(
                  "text-xs sm:text-sm font-bold whitespace-nowrap px-2 py-1 rounded-md",
                  stepStatus === 'upcoming' ? "text-muted-foreground" : "text-foreground bg-secondary/30",
                  stepStatus === 'error' && "text-destructive bg-destructive/10"
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
