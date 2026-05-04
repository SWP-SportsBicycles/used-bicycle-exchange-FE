'use client'

import { ShipmentInfo } from '@/lib/api/buyer-api'
import { Truck, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GhnTrackerProps {
  shipment: ShipmentInfo | undefined
  isLoading: boolean
}

export function GhnTracker({ shipment, isLoading }: GhnTrackerProps) {
  if (isLoading) {
    return <div className="animate-pulse h-40 bg-muted rounded-lg" />
  }

  if (!shipment) {
    return null
  }

  // Guard: API có thể trả về shipment nhưng không có events
  const events = shipment.events ?? []

  return (
    <div className="rounded-3xl bg-card border border-border/40 shadow-sm overflow-hidden">
      <div className="bg-secondary/30 px-6 py-4 flex items-center justify-between border-b border-border/40">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Lịch trình giao hàng (GHN)
        </h2>
        <span className="text-sm font-medium text-muted-foreground bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-primary/10">
          Mã vận đơn: <span className="font-bold text-foreground">{shipment.waybillCode}</span>
        </span>
      </div>
      <div className="p-6 md:p-8">
        <div className="space-y-6 relative">
          {/* Main vertical line */}
          {events.length > 1 && (
            <div className="absolute left-[15px] top-4 bottom-8 w-0.5 bg-border/50" />
          )}

          {events.map((event, index) => (
            <div key={index} className="flex gap-5 relative group">
              <div className="flex flex-col items-center z-10 mt-0.5">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-4 ring-card transition-colors",
                  index === 0 
                    ? "bg-primary text-primary-foreground shadow-primary/20" 
                    : "bg-secondary border border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                )}>
                  {index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-2.5 w-2.5 rounded-full bg-current" />}
                </div>
              </div>
              
              <div className={cn(
                "flex-1 pb-4",
                index !== events.length - 1 && "border-b border-border/40"
              )}>
                <p className={cn(
                  "text-base font-bold",
                  index === 0 ? "text-foreground" : "text-muted-foreground"
                )}>
                  {event.status}
                </p>
                <p className="text-sm text-foreground mt-1.5 leading-relaxed">{event.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(event.time).toLocaleString('vi-VN')}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                      <span className="text-primary">•</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center text-muted-foreground py-8 text-sm flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p>Chưa có thông tin cập nhật từ đối tác vận chuyển.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
