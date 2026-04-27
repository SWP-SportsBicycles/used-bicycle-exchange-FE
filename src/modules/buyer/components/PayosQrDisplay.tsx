import { ExternalLink, CreditCard, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatVND } from '@/lib/mock-data'
import { toast } from 'sonner'

interface PayosQrDisplayProps {
  qrUrl: string
  totalPrice: number
  orderId: string
}

function normalizePaymentUrl(value: string | null | undefined) {
  if (!value) return null
  const normalized = String(value).trim()
  if (!normalized || normalized === 'undefined' || normalized === 'null' || normalized === '') {
    return null
  }
  return normalized
}

export function PayosQrDisplay({ qrUrl, totalPrice, orderId }: PayosQrDisplayProps) {
  let redirectUrl = normalizePaymentUrl(qrUrl)
  
  // Thử tự động thêm https:// nếu thiếu protocol nhưng có vẻ là domain của PayOS
  if (redirectUrl && !redirectUrl.startsWith('http') && (redirectUrl.includes('payos.vn') || redirectUrl.includes('pay.payos'))) {
    redirectUrl = 'https://' + redirectUrl
  }

  const isValidUrl = Boolean(redirectUrl) && String(redirectUrl).startsWith('http')

  const handleRedirect = () => {
    if (isValidUrl && redirectUrl) {
      window.open(redirectUrl, '_blank')
    } else {
      toast.error('Link thanh toán không hợp lệ hoặc đã hết hạn. Vui lòng đóng và thử lại.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-2">
      {!isValidUrl && (
        <div className="w-full rounded-xl bg-destructive/10 p-3 text-center border border-destructive/20">
          <p className="text-xs font-medium text-destructive">
            Không tìm thấy link thanh toán hợp lệ từ hệ thống.
          </p>
        </div>
      )}
      {/* Visual Icon Section */}
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CreditCard className="h-14 w-14" />
        <div className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
          <ShieldCheck className="h-6 w-6 text-green-600" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-foreground">Sẵn sàng thanh toán</h3>
        <p className="text-sm text-muted-foreground px-4">
          Nhấn nút bên dưới để chuyển đến cổng thanh toán an toàn của PayOS
        </p>
      </div>

      {/* Order Info Card */}
      <div className="w-full space-y-3 rounded-2xl bg-secondary/40 p-5 border border-border/40 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Mã đơn hàng</span>
          <span className="text-sm font-bold text-foreground font-mono bg-white px-2 py-1 rounded-md border border-border/50 shadow-sm">
            {orderId.split('-')[0].toUpperCase()}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/20">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tổng thanh toán</span>
          <span className="text-2xl font-black text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
            {formatVND(totalPrice)}
          </span>
        </div>
      </div>

      <div className="w-full pt-2">
        <Button
          onClick={handleRedirect}
          className="w-full gap-3 rounded-2xl h-16 text-lg font-extrabold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 bg-primary hover:bg-primary/90"
        >
          Thanh toán ngay qua PayOS
          <ExternalLink className="h-5 w-5" />
        </Button>
        <p className="mt-4 text-[11px] text-center text-muted-foreground leading-relaxed italic">
          * Trình duyệt sẽ mở một tab mới để bạn thực hiện thanh toán an toàn.
        </p>
      </div>
    </div>
  )
}
