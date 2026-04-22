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
    const statuses = ['timer_draft', 'payos_paid', 'shipping', 'delivered', 'completed']
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
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
          style={{ 
            width: status === 'timer_draft' ? '0%' : 
                   status === 'payos_paid' ? '33%' : 
                   status === 'shipping' ? '66%' : 
                   status === 'completed' ? '100%' : '100%' 
          }}
        />

        {steps.map((step, index) => {
          const stepStatus = getStepStatus(index)
          const Icon = step.icon

          return (
            <div key={index} className="relative z-10 flex flex-col items-center gap-2 bg-background px-2">
              <div 
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  stepStatus === 'completed' && "bg-primary border-primary text-primary-foreground",
                  stepStatus === 'current' && "bg-background border-primary text-primary animate-pulse",
                  stepStatus === 'error' && "bg-destructive border-destructive text-destructive-foreground",
                  stepStatus === 'upcoming' && "bg-background border-border text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span 
                className={cn(
                  "text-xs font-semibold whitespace-nowrap",
                  stepStatus === 'upcoming' ? "text-muted-foreground" : "text-foreground",
                  stepStatus === 'error' && "text-destructive"
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
