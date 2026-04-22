'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCancelOrder } from '../hooks/useCancelOrder'
import { BuyerOrder } from '@/lib/api/buyer-api'
import { formatVND } from '@/lib/mock-data'

interface CancelOrderDialogProps {
  order: BuyerOrder
}

export function CancelOrderDialog({ order }: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const cancelMutation = useCancelOrder()

  // Business Rule Calculation
  const isShipped = order.status === 'shipping'
  const penaltyRate = isShipped ? 0.10 : 0.05 // 10% nếu đã ship, 5% nếu chưa ship
  const penaltyAmount = order.totalPrice * penaltyRate

  const handleCancel = () => {
    cancelMutation.mutate(order.id, {
      onSuccess: () => {
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
          Hủy đơn hàng
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Xác nhận hủy đơn hàng
          </DialogTitle>
          <DialogDescription className="pt-3 space-y-3">
            <p className="text-foreground">
              Bạn đang yêu cầu hủy đơn hàng <strong>{order.id.split('-')[0].toUpperCase()}</strong>.
            </p>
            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-destructive text-sm">
              <p className="font-semibold mb-1">Cảnh báo phí phạt hủy đơn (SLA Policy):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Đơn hàng {isShipped ? 'đã bắt đầu vận chuyển' : 'chưa vận chuyển'}.</li>
                <li>Phí phạt áp dụng: <strong>{penaltyRate * 100}% giá trị đơn hàng</strong>.</li>
                <li>Số tiền phạt dự kiến: <strong>{formatVND(penaltyAmount)}</strong>.</li>
                {isShipped && <li>Bạn sẽ không được hoàn lại phí vận chuyển ({formatVND(order.shippingFee)}).</li>}
              </ul>
            </div>
            <p className="text-sm">
              Số tiền còn lại sẽ được hoàn về ví/tài khoản của bạn trong vòng 3-5 ngày làm việc.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={cancelMutation.isPending}>
            Đóng, không hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Đang xử lý...' : 'Đồng ý hủy & Chịu phạt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
