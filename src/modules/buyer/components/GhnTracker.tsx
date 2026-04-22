'use client'

import { ShipmentInfo } from '@/lib/api/buyer-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <Card>
      <CardHeader className="bg-secondary/30 pb-4">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Lịch sử giao hàng (GHN)
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            Mã vận đơn: <span className="font-bold text-foreground">{shipment.waybillCode}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {shipment.events.map((event, index) => (
            <div key={index} className="flex gap-4 relative">
              {/* Timeline Connector */}
              {index !== shipment.events.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-border" />
              )}
              
              <div className="flex flex-col items-center mt-1 z-10">
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                  index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary border border-border"
                )}>
                  {index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground" />}
                </div>
              </div>
              
              <div className="flex-1 pb-2">
                <p className={cn(
                  "text-sm font-semibold",
                  index === 0 ? "text-foreground" : "text-muted-foreground"
                )}>
                  {event.status}
                </p>
                <p className="text-sm text-foreground mt-1">{event.description}</p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(event.time).toLocaleString('vi-VN')}</span>
                  {event.location && (
                    <>
                      <span>•</span>
                      <span>{event.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {shipment.events.length === 0 && (
            <div className="text-center text-muted-foreground py-4 text-sm">
              Chưa có thông tin cập nhật từ GHN.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
