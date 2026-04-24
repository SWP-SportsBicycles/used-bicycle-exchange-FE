'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCancelOrder } from '../hooks/useCancelOrder'
import { BuyerOrder } from '@/lib/api/buyer-api'

interface CancelOrderDialogProps {
  order: BuyerOrder
}

export function CancelOrderDialog({ order }: CancelOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const cancelMutation = useCancelOrder()

  // Business Rule — chỉ hiển thị cảnh báo, không tính số tiền cụ thể vì BE quyết định
  const isShipped = order.status === 'shipping'

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
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl h-11 font-semibold">
          Hủy đơn hàng
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:rounded-3xl border-border/50 shadow-athletic-lg overflow-hidden">
        <DialogHeader className="pt-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Xác nhận hủy đơn hàng
          </DialogTitle>
          <DialogDescription className="pt-3 space-y-4 text-center">
            <p className="text-foreground text-base">
              Bạn đang yêu cầu hủy đơn hàng <strong className="text-primary font-bold tracking-widest">{order.id.split('-')[0].toUpperCase()}</strong>.
            </p>
            <div className="bg-destructive/5 p-4 rounded-2xl border border-destructive/10 text-destructive text-sm text-left">
              <p className="font-bold mb-2 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4"/> Lưu ý chính sách hủy đơn (SLA Policy):</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Đơn hàng <strong>{isShipped ? 'đã bắt đầu vận chuyển' : 'chưa vận chuyển'}</strong>.</li>
                <li>Phí phạt hủy đơn theo chính sách VeloTrust: <strong>5%–10% giá trị đơn hàng</strong>.</li>
                <li>Số tiền hoàn lại cụ thể sẽ được VeloTrust thông báo sau khi xử lý yêu cầu.</li>
                {isShipped && <li>Phí vận chuyển có thể không được hoàn lại.</li>}
              </ul>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Số tiền còn lại sẽ được hoàn về ví/tài khoản của bạn trong vòng 3–5 ngày làm việc.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex sm:justify-center gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={cancelMutation.isPending} className="rounded-xl h-12 px-6 font-semibold flex-1">
            Đóng, không hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={cancelMutation.isPending}
            className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-destructive/20 flex-1"
          >
            {cancelMutation.isPending ? 'Đang xử lý...' : 'Đồng ý hủy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
