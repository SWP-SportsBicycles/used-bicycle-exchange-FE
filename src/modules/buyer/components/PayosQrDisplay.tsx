import { useEffect, useRef } from 'react'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatVND } from '@/lib/mock-data'

interface PayosQrDisplayProps {
  qrUrl: string
  totalPrice: number
  orderId: string
}

function normalizePaymentUrl(value: string) {
  const normalized = value.trim()

  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    return null
  }

  return normalized.startsWith('http') ? normalized : null
}

export function PayosQrDisplay({ qrUrl, totalPrice, orderId }: PayosQrDisplayProps) {
  const redirectUrl = normalizePaymentUrl(qrUrl)
  const hasRedirectedRef = useRef(false)
  const isValidUrl = Boolean(redirectUrl)

  useEffect(() => {
    if (!redirectUrl || hasRedirectedRef.current) {
      return
    }

    hasRedirectedRef.current = true
    window.location.assign(redirectUrl)
  }, [redirectUrl])

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="space-y-1 text-center">
        <h3 className="text-xl font-bold text-foreground">
          {isValidUrl ? 'Dang chuyen huong thanh toan' : 'Loi chuyen huong'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isValidUrl
            ? 'Vui long doi trong giay lat de he thong chuyen den cong thanh toan PayOS...'
            : 'Khong tim thay link thanh toan hop le. Vui long thu lai sau.'}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3 rounded-xl bg-secondary/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Ma don hang</span>
          <span className="text-sm font-medium">{orderId.split('-')[0].toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">So tien thanh toan</span>
          <span className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
            {formatVND(totalPrice)}
          </span>
        </div>
      </div>

      <Button
        onClick={() => {
          if (redirectUrl) {
            window.location.assign(redirectUrl)
          } else {
            toast.error('Khong tim thay link thanh toan')
          }
        }}
        className="w-full max-w-sm gap-2"
        disabled={!isValidUrl}
      >
        <ExternalLink className="h-4 w-4" />
        Nhan vao day neu khong tu dong chuyen huong
      </Button>

      <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-4 py-2 text-sm text-success">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
        </span>
        He thong dang xu ly...
      </div>
    </div>
  )
}
