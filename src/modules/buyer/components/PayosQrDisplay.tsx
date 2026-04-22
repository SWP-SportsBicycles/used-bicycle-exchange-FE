'use client'

import Image from 'next/image'
import { CheckCircle2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatVND } from '@/lib/mock-data'
import { toast } from 'sonner'

interface PayosQrDisplayProps {
  qrUrl: string
  totalPrice: number
  orderId: string
}

export function PayosQrDisplay({ qrUrl, totalPrice, orderId }: PayosQrDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(totalPrice.toString())
    toast.success('Đã sao chép số tiền')
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-xl text-foreground">Thanh toán qua PayOS</h3>
        <p className="text-muted-foreground text-sm">Quét mã QR dưới đây bằng ứng dụng ngân hàng</p>
      </div>

      <div className="relative h-64 w-64 rounded-xl overflow-hidden border border-border shadow-md bg-white p-2">
        <Image 
          src={qrUrl || "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=demo_qr_code"} 
          alt="PayOS QR Code" 
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      <div className="w-full max-w-sm rounded-xl bg-secondary/50 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Mã đơn hàng</span>
          <span className="font-medium text-sm">{orderId.split('-')[0].toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Số tiền cần chuyển</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-lg" style={{ fontFamily: 'var(--font-archivo)' }}>
              {formatVND(totalPrice)}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-4 py-2 rounded-full border border-success/20">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
        </span>
        Đang chờ thanh toán... Hệ thống tự động cập nhật
      </div>
    </div>
  )
}
