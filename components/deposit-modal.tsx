'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard,
  Wallet,
  Building2,
  ArrowRight,
  Info,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { type Listing, formatVND, calculateDeposit } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface DepositModalProps {
  listing: Listing
  isOpen: boolean
  onClose: () => void
  flowType?: 'soft_reserve' | 'inspection_deposit'
  onSuccess?: (flowType: 'soft_reserve' | 'inspection_deposit') => void
}

type Step = 'review' | 'payment' | 'confirmation'

const paymentMethods = [
  { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: Building2, description: 'Chuyển khoản nội địa' },
  { id: 'card', label: 'Thẻ Visa/Mastercard', icon: CreditCard, description: 'Thanh toán quốc tế' },
  { id: 'wallet', label: 'Ví điện tử', icon: Wallet, description: 'Momo, ZaloPay, VNPay' },
]

export function DepositModal({
  listing,
  isOpen,
  onClose,
  flowType = 'inspection_deposit',
  onSuccess,
}: DepositModalProps) {
  const [step, setStep] = useState<Step>('review')
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const inspectionDepositAmount = calculateDeposit(listing.price)
  const softReserveAmount = Math.min(Math.round(listing.price * 0.02), 500000)
  const isSoftReserve = flowType === 'soft_reserve'
  const depositAmount = isSoftReserve ? softReserveAmount : inspectionDepositAmount
  const tenPercent = listing.price * 0.1
  const isMaxCapped = tenPercent > 2000000

  const handleProceedToPayment = () => {
    if (!agreedToTerms) return
    setStep('payment')
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep('confirmation')
    onSuccess?.(flowType)
  }

  const handleClose = () => {
    setStep('review')
    setPaymentMethod('bank')
    setAgreedToTerms(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <AnimatePresence mode="wait">
          {/* Step 1: Review */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {isSoftReserve ? 'Soft Reserve' : 'Đặt Cọc Kiểm Định'}
                </DialogTitle>
                <DialogDescription>
                  {isSoftReserve
                    ? 'Thanh toán Soft Reserve để giữ xe và mở khóa thông tin người bán'
                    : 'Xác nhận đặt cọc để kích hoạt dịch vụ kiểm định VeloSafe'}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Listing Summary */}
                <div className="flex gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground line-clamp-2">{listing.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{listing.brand} - {listing.frameSize}</p>
                    <p className="text-lg font-bold text-primary mt-1">{formatVND(listing.price)}</p>
                  </div>
                </div>

                {/* Deposit Calculation */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    {isSoftReserve ? 'Chi tiết Soft Reserve' : 'Chi tiết cọc kiểm định'}
                  </h4>
                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giá niêm yết</span>
                      <span className="text-foreground">{formatVND(listing.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{isSoftReserve ? 'Soft Reserve 2%' : 'Cọc 10%'}</span>
                      <span className="text-foreground">{formatVND(isSoftReserve ? listing.price * 0.02 : tenPercent)}</span>
                    </div>
                    {!isSoftReserve && isMaxCapped && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Giới hạn tối đa</span>
                        <Badge variant="secondary" className="font-normal">
                          Max 2.000.000đ
                        </Badge>
                      </div>
                    )}
                    {isSoftReserve && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Giới hạn Soft Reserve</span>
                        <Badge variant="secondary" className="font-normal">
                          Max 500.000đ
                        </Badge>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Số tiền cọc</span>
                      <span className="text-primary text-lg">{formatVND(depositAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* What happens next */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">{isSoftReserve ? 'Sau khi Soft Reserve' : 'Sau khi đặt cọc'}</h4>
                  <div className="space-y-2">
                    {(isSoftReserve
                      ? [
                          'Tin đăng được giữ chỗ trong hàng đợi giao dịch',
                          'SĐT và địa chỉ chi tiết của Seller được mở khóa',
                          'Bạn có thể chuyển sang bước đặt cọc kiểm định',
                          'Soft Reserve giúp giảm rủi ro bị bán cho người khác',
                        ]
                      : [
                          'Inspector VeloSafe sẽ liên hệ Seller để hẹn lịch kiểm tra xe',
                          'Báo cáo kiểm định chi tiết sẽ được gửi cho bạn trong 48h',
                          'Bạn có quyền hủy và hoàn 100% cọc nếu xe có lỗi nghiêm trọng',
                          'Thông tin liên hệ của Seller đã được mở khóa từ bước Soft Reserve',
                        ]).map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms Agreement */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 rounded border-muted-foreground"
                  />
                  <span className="text-sm text-muted-foreground">
                    Tôi đồng ý với{' '}
                    <a href="#" className="text-primary hover:underline">{isSoftReserve ? 'Điều khoản Soft Reserve' : 'Điều khoản đặt cọc'}</a>
                    {' '}và{' '}
                    <a href="#" className="text-primary hover:underline">Chính sách hủy/hoàn tiền</a>
                    {' '}của VeloTrust
                  </span>
                </label>

                {/* Action */}
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!agreedToTerms}
                  onClick={handleProceedToPayment}
                >
                  {isSoftReserve ? 'Tiếp tục Soft Reserve' : 'Tiếp tục thanh toán'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
                <DialogDescription>
                  Thanh toán {formatVND(depositAmount)} để hoàn tất {isSoftReserve ? 'Soft Reserve' : 'đặt cọc kiểm định'}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                          paymentMethod === method.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <method.icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{method.label}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>

                {/* Payment Summary */}
                <div className="rounded-lg bg-secondary/50 border border-border p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tổng thanh toán</span>
                    <span className="text-2xl font-bold text-primary">{formatVND(depositAmount)}</span>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Đây là bản demo. Trong phiên bản chính thức, bạn sẽ được chuyển đến cổng thanh toán an toàn.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setStep('review')}
                  >
                    Quay lại
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Xác nhận thanh toán
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 mb-6"
              >
                <CheckCircle2 className="h-8 w-8 text-success" />
              </motion.div>

              <h3 className="text-xl font-bold text-foreground mb-2">{isSoftReserve ? 'Soft Reserve thành công!' : 'Đặt cọc thành công!'}</h3>
              <p className="text-muted-foreground mb-6">
                Mã đơn hàng: <span className="font-mono text-foreground">VT-{Date.now().toString(36).toUpperCase()}</span>
              </p>

              <div className="rounded-lg bg-success/10 border border-success/30 p-4 mb-6 text-left">
                <h4 className="font-medium text-success mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  {isSoftReserve ? 'Tin đăng đã được giữ chỗ và mở khóa liên hệ' : 'Dịch vụ kiểm định đã được kích hoạt'}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {isSoftReserve ? (
                    <>
                      <li>Bạn đã có thể xem thông tin liên hệ chi tiết của Seller</li>
                      <li>Bước tiếp theo: Đặt cọc kiểm định để kích hoạt Inspector</li>
                    </>
                  ) : (
                    <>
                      <li>Inspector sẽ liên hệ Seller trong 24h làm việc</li>
                      <li>Báo cáo kiểm định sẽ có trong 48h sau buổi kiểm</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="rounded-lg bg-primary/10 border border-primary/30 p-4 mb-6 text-left">
                <h4 className="font-medium text-primary mb-2">
                  Thông tin liên hệ Seller
                </h4>
                <p className="text-sm text-foreground">
                  <strong>Tên:</strong> {listing.seller.name}
                </p>
                <p className="text-sm text-foreground">
                  <strong>SĐT:</strong> 0912 345 678
                </p>
                <p className="text-sm text-foreground">
                  <strong>Địa chỉ:</strong> 123 Nguyễn Trãi, Thanh Xuân, Hà Nội
                </p>
              </div>

              <Button className="w-full" onClick={handleClose}>
                Xem đơn hàng của tôi
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
