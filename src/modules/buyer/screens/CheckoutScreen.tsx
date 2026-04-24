'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, ShieldCheck, CreditCard, MapPin, Truck, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Footer } from '@/components/footer'
import { AddressForm } from '../components/AddressForm'
import { CheckoutTimer } from '../components/CheckoutTimer'
import { PayosQrDisplay } from '../components/PayosQrDisplay'
import { CheckoutSkeleton } from '../components/skeletons/CheckoutSkeleton'
import { useCheckoutMutation, useOrderStatusPolling, usePaymentLinkMutation } from '../hooks/useCheckout'
import { useCart } from '../hooks/useCart'
import { useCancelOrder } from '../hooks/useCancelOrder'
import { useListingDetail } from '../hooks/useListingDetail'
import { useOrderDetail } from '../hooks/useOrders'
import { formatVND } from '@/lib/mock-data'
import { type BuyerListing, type CheckoutResponse } from '@/lib/api/buyer-api'
import { cn } from '@/lib/utils'
import { saveExpiringOrder, removeExpiringOrder } from '@/lib/order-expiry'

const checkoutSchema = z.object({
  receiverName: z.string().min(2, 'Vui lòng nhập họ tên hợp lệ'),
  receiverPhone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  provinceId: z.number({ required_error: 'Vui lòng chọn Tỉnh/Thành phố' }),
  toDistrictId: z.number({ required_error: 'Vui lòng chọn Quận/Huyện' }),
  toWardCode: z.string({ required_error: 'Vui lòng chọn Phường/Xã' }).min(1, 'Vui lòng chọn Phường/Xã'),
  receiverAddress: z.string().min(5, 'Vui lòng nhập chi tiết số nhà, tên đường'),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listingId')
  const orderId = searchParams.get('orderId')
  const isOrderPaymentMode = Boolean(orderId)

  const { data: listing, isLoading: isLoadingListing } = useListingDetail(listingId)
  const { data: cart, isLoading: isLoadingCart } = useCart()
  const { data: existingOrder, isLoading: isLoadingOrder } = useOrderDetail(orderId)
  const checkoutMutation = useCheckoutMutation()
  const paymentLinkMutation = usePaymentLinkMutation()
  const cancelOrderMutation = useCancelOrder()

  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null)

  const selectedCartItems = cart?.items.filter((item) => item.isSelected) ?? []
  const primaryCartItem = selectedCartItems[0] ?? cart?.items[0]
  const summaryListing: Pick<BuyerListing, 'title' | 'images' | 'price'> | undefined =
    existingOrder?.listing ?? listing ?? primaryCartItem?.listing
  const summaryPrice = existingOrder?.totalPrice ?? cart?.subtotal ?? summaryListing?.price ?? 0
  const canSubmitCheckout = isOrderPaymentMode ? existingOrder?.status === 'pending' : selectedCartItems.length > 0
  const isLoadingScreen = isOrderPaymentMode
    ? isLoadingOrder
    : (Boolean(listingId) && isLoadingListing) || isLoadingCart
  const isExistingOrderLocked = Boolean(existingOrder && existingOrder.status !== 'pending')
  // Chỉ hiện timer khi: có expiresAt VÀ đơn còn pending (không hết hạn redirect ngay)
  const timerExpiresAt = checkoutData?.expiresAt ?? (
    existingOrder?.status === 'pending' ? existingOrder?.expiresAt : undefined
  )
  const showInspectionFeeFree =
    summaryListing && 'isVeloSafeVerified' in summaryListing && Boolean(summaryListing.isVeloSafeVerified)
  // Task 2.3: nút hủy hiện ngay cả khi chưa bấm "Tiếp tục thanh toán" (chưa có checkoutData)
  const canCancelActivePayment = Boolean(
    checkoutData?.orderId ||
    (isOrderPaymentMode && existingOrder?.status === 'pending')
  )

  const { data: orderStatusData } = useOrderStatusPolling(checkoutData?.orderId)

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      toWardCode: '',
    },
  })

  useEffect(() => {
    if (orderStatusData?.status === 'paid') {
      removeExpiringOrder(orderStatusData.orderId)
      toast.success('Thanh toán thành công. Đơn hàng đã được ghi nhận.')
      router.push(`/buyer/orders/${orderStatusData.orderId}`)
    } else if (orderStatusData?.status === 'cancelled') {
      if (orderStatusData.orderId) removeExpiringOrder(orderStatusData.orderId)
      toast.error('Đơn hàng đã bị hủy.')
      router.push(isOrderPaymentMode && orderId ? `/buyer/orders/${orderId}` : '/buyer/cart')
    }
  }, [isOrderPaymentMode, orderId, orderStatusData?.orderId, orderStatusData?.status, router])

  const onSubmit = (data: CheckoutFormValues) => {
    if (isOrderPaymentMode) {
      return
    }

    if (!canSubmitCheckout) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm trong giỏ hàng.')
      return
    }

    checkoutMutation.mutate(
      {
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        receiverAddress: data.receiverAddress,
        toDistrictId: data.toDistrictId,
        toWardCode: data.toWardCode,
      },
      {
        onSuccess: (res) => {
          const expiresAt = res.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000).toISOString()

          if (res.payosQrUrl && res.payosQrUrl !== 'undefined' && res.payosQrUrl.startsWith('http')) {
            setCheckoutData(res)
            saveExpiringOrder(res.orderId, expiresAt)
            toast.success('Đã lên đơn. Vui lòng thanh toán trong vòng 5 phút.')
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
          }

          paymentLinkMutation.mutate(res.orderId, {
            onSuccess: (payRes) => {
              const newCheckoutData = {
                ...res,
                payosQrUrl: payRes.checkoutUrl || payRes.qrCode || res.payosQrUrl || '',
              }
              setCheckoutData(newCheckoutData)
              saveExpiringOrder(res.orderId, expiresAt)
              toast.success('Đã lên đơn. Vui lòng thanh toán trong vòng 5 phút.')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            },
            onError: () => {
              toast.error('Không thể tạo mã thanh toán PayOS.')
            },
          })
        },
        onError: () => {
          toast.error('Có lỗi khi tạo đơn hàng từ giỏ hàng.')
        },
      },
    )
  }

  // Task 1.3: tái dùng link PayOS đã có, tránh gọi API thừa
  const handleOpenPendingOrderPayment = () => {
    if (!existingOrder || existingOrder.status !== 'pending') {
      toast.error('Đơn hàng này không còn ở trạng thái chờ thanh toán.')
      return
    }

    if (existingOrder.payosQrUrl?.startsWith('http')) {
      const expiresAt = existingOrder.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000).toISOString()
      setCheckoutData({
        orderId: existingOrder.id,
        shippingFee: existingOrder.shippingFee,
        totalPrice: existingOrder.totalPrice,
        expiresAt,
        payosQrUrl: existingOrder.payosQrUrl,
      })
      saveExpiringOrder(existingOrder.id, expiresAt)
      toast.success('Đã tải link thanh toán. Đang chuyển hướng...')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    paymentLinkMutation.mutate(existingOrder.id, {
      onSuccess: (payRes) => {
        const expiresAt = existingOrder.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000).toISOString()
        setCheckoutData({
          orderId: existingOrder.id,
          shippingFee: existingOrder.shippingFee,
          totalPrice: existingOrder.totalPrice,
          expiresAt,
          payosQrUrl: payRes.checkoutUrl || payRes.qrCode || existingOrder.payosQrUrl || '',
        })
        saveExpiringOrder(existingOrder.id, expiresAt)
        toast.success('Đã tải lại mã thanh toán cho đơn hàng đang chờ.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      onError: () => {
        toast.error('Không thể tạo lại mã thanh toán cho đơn hàng này.')
      },
    })
  }

  const handleTimerExpire = () => {
    const activeOrderId = checkoutData?.orderId ?? existingOrder?.id
    if (activeOrderId) {
      removeExpiringOrder(activeOrderId)
      toast.info('Hết thời gian thanh toán. Đang hủy đơn...')
      cancelOrderMutation.mutate(activeOrderId, {
        onSuccess: () => {
          toast.error('Hết thời gian thanh toán. Đơn hàng đã bị hủy.')
          router.push(isOrderPaymentMode && orderId ? `/buyer/orders/${orderId}` : '/buyer/cart')
        },
        onError: () => {
          toast.error('Hết thời gian thanh toán.')
          router.push(isOrderPaymentMode && orderId ? `/buyer/orders/${orderId}` : '/buyer/cart')
        },
      })
    } else {
      toast.error('Hết thời gian thanh toán. Đơn hàng đã bị hủy.')
      router.push(isOrderPaymentMode && orderId ? `/buyer/orders/${orderId}` : '/buyer/cart')
    }
  }

  const handleCancelOrder = () => {
    const activeOrderId = checkoutData?.orderId ?? existingOrder?.id
    if (!activeOrderId) return

    removeExpiringOrder(activeOrderId)
    cancelOrderMutation.mutate(activeOrderId, {
      onSuccess: () => {
        router.push(isOrderPaymentMode && orderId ? `/buyer/orders/${orderId}` : '/buyer/cart')
      },
    })
  }

  if (isLoadingScreen) {
    return (
      <div className="bg-page flex min-h-screen flex-col">
        <Header />
        <CheckoutSkeleton />
        <Footer />
      </div>
    )
  }

  if (!summaryListing) {
    return (
      <div className="bg-page flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Không có sản phẩm nào sẵn sàng checkout</h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            {isOrderPaymentMode
              ? 'Đơn hàng này không tồn tại hoặc không thuộc tài khoản của bạn.'
              : cart?.items.length
              ? 'Vui lòng quay lại giỏ hàng để kiểm tra item đã chọn.'
              : 'Hãy thêm xe vào giỏ hàng trước khi checkout.'}
          </p>
          <Button asChild className="mt-6">
            <Link href={isOrderPaymentMode ? '/buyer/orders' : cart?.items.length ? '/buyer/cart' : '/marketplace'}>
              {isOrderPaymentMode ? 'Quay lại đơn hàng' : cart?.items.length ? 'Quay lại giỏ hàng' : 'Khám phá Marketplace'}
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Đơn hàng không còn ở trạng thái có thể thanh toán ────────────────────
  if (isOrderPaymentMode && isExistingOrderLocked && !checkoutData) {
    const statusLabelMap: Record<string, string> = {
      paid: 'Đã thanh toán',
      shipping: 'Đang vận chuyển',
      delivered: 'Đã giao hàng',
      completed: 'Hoàn tất',
      cancelled: 'Đã hủy',
      disputed: 'Đang khiếu nại',
    }
    const currentLabel = statusLabelMap[existingOrder?.status ?? ''] ?? existingOrder?.status ?? 'Không xác định'

    return (
      <div className="bg-page flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Đơn hàng không cần thanh toán</h2>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Đơn hàng #{existingOrder?.id?.split('-')[0]?.toUpperCase()} đang ở trạng thái{' '}
            <strong className="text-foreground">{currentLabel}</strong> — không thể thanh toán lại.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="rounded-xl font-semibold">
              <Link href="/buyer/orders">Danh sách đơn hàng</Link>
            </Button>
            {existingOrder?.id && (
              <Button asChild className="rounded-xl font-bold shadow-athletic">
                <Link href={`/buyer/orders/${existingOrder.id}`}>Xem chi tiết đơn</Link>
              </Button>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-page flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 lg:px-6">
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              className="gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-extrabold lg:text-3xl" style={{ fontFamily: 'var(--font-archivo)' }}>
              {checkoutData ? 'Thanh toán an toàn' : isOrderPaymentMode ? 'Tiếp tục thanh toán' : 'Xác nhận đơn hàng'}
            </h1>
            <div className="w-24" />
          </div>

          {/* Task 1.4: timer luôn hiện nếu có expiresAt, không cần checkoutData */}
          {timerExpiresAt && (
            <div className="mb-8">
              <CheckoutTimer expiresAt={timerExpiresAt} onExpire={handleTimerExpire} />
            </div>
          )}

          <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
            <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-border/50" />
            <div
              className={cn(
                'absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-primary transition-all duration-700',
                checkoutData ? 'w-full' : 'w-1/2',
              )}
            />

            <div className="flex w-full justify-between px-4">
              <div className="flex flex-col items-center gap-2 bg-page px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-page">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Địa chỉ</span>
              </div>

              <div className="flex flex-col items-center gap-2 bg-page px-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full font-bold ring-4 ring-page transition-all duration-500',
                    checkoutData ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground',
                  )}
                >
                  2
                </div>
                <span
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider transition-colors duration-500',
                    checkoutData ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  Thanh toán
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Địa chỉ nhận hàng</h2>
              </div>

              {!checkoutData && !isOrderPaymentMode ? (
                <FormProvider {...methods}>
                  <form id="checkout-form" onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                    <AddressForm />
                  </form>
                </FormProvider>
              ) : (
                <div className="space-y-3 rounded-2xl border border-border/40 bg-secondary/30 p-5">
                  <div className="flex items-start justify-between">
                    <p className="text-base font-bold">{existingOrder?.receiverName || methods.getValues('receiverName')}</p>
                    <p className="font-medium text-primary">{existingOrder?.receiverPhone || methods.getValues('receiverPhone')}</p>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    {existingOrder?.receiverAddress || methods.getValues('receiverAddress')}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {isOrderPaymentMode
                      ? 'Đơn hàng này đã có địa chỉ nhận hàng cố định. Bạn chỉ có thể tiếp tục thanh toán.'
                      : 'Không thể thay đổi địa chỉ sau khi xác nhận'}
                  </p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {checkoutData && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-athletic-lg">
                    <div className="border-b border-primary/10 bg-primary/5 px-8 py-5">
                      <h2 className="flex items-center gap-3 text-xl font-bold text-primary">
                        <CreditCard className="h-6 w-6" />
                        Thanh toán qua PayOS
                      </h2>
                    </div>
                    <div className="p-8">
                      <PayosQrDisplay
                        qrUrl={checkoutData.payosQrUrl}
                        totalPrice={checkoutData.totalPrice}
                        orderId={checkoutData.orderId}
                      />

                      <div className="mt-8 flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900/50">
                        <ShieldCheck className="h-6 w-6 shrink-0 text-[#407F3E]" />
                        <div className="space-y-1">
                          <p className="font-bold text-foreground">Bảo vệ bởi Escrow VeloTrust</p>
                          <p className="leading-relaxed">
                            Tiền của bạn được hệ thống giữ an toàn. Người bán chỉ nhận được tiền sau khi bạn đã kiểm tra
                            và xác nhận hài lòng với xe.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Tổng quan đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                    <Image
                      src={summaryListing.images[0] || '/placeholder.png'}
                      alt={summaryListing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <p className="line-clamp-2 text-sm font-semibold leading-tight">{summaryListing.title}</p>
                    <p className="text-sm font-bold text-primary">{formatVND(summaryListing.price)}</p>
                    {selectedCartItems.length > 1 && (
                      <p className="text-xs text-muted-foreground">Đang checkout {selectedCartItems.length} sản phẩm đã chọn</p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatVND(summaryPrice)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Truck className="h-3.5 w-3.5" /> Phí vận chuyển (GHN)
                    </span>
                    <span className="font-medium">
                      {checkoutData
                        ? formatVND(checkoutData.shippingFee)
                        : existingOrder
                          ? formatVND(existingOrder.shippingFee)
                          : 'Tính ở bước sau'}
                    </span>
                  </div>

                  {showInspectionFeeFree && (
                    <div className="flex justify-between text-success">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Phí kiểm định
                      </span>
                      <span>Miễn phí</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="mb-6 flex items-end justify-between">
                  <span className="font-bold text-foreground">Tổng thanh toán (100%)</span>
                  <span className="text-2xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
                    {checkoutData ? formatVND(checkoutData.totalPrice) : formatVND(summaryPrice)}
                  </span>
                </div>

                {!checkoutData && (
                  <>
                    {isOrderPaymentMode ? (
                      <Button
                        type="button"
                        className="h-12 w-full text-base font-bold shadow-athletic animate-pulse-glow"
                        disabled={paymentLinkMutation.isPending || !canSubmitCheckout || isExistingOrderLocked}
                        onClick={handleOpenPendingOrderPayment}
                      >
                        {paymentLinkMutation.isPending ? 'Đang tải mã thanh toán...' : 'Tiếp tục thanh toán đơn hàng'}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        form="checkout-form"
                        className="h-12 w-full text-base font-bold shadow-athletic animate-pulse-glow"
                        disabled={checkoutMutation.isPending || !canSubmitCheckout}
                      >
                        {checkoutMutation.isPending ? 'Đang xử lý...' : 'Xác nhận và chuyển tới thanh toán'}
                      </Button>
                    )}

                    {!canSubmitCheckout && (
                      <p className="mt-3 rounded-xl border border-border/50 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                        {isOrderPaymentMode
                          ? 'Đơn hàng này không còn ở trạng thái chờ thanh toán.'
                          : 'Vui lòng chọn ít nhất 1 sản phẩm trong giỏ hàng trước khi checkout.'}
                      </p>
                    )}
                  </>
                )}

                {/* Task 2.3: canCancelActivePayment cũng true khi order mode + pending, dù chưa có checkoutData */}
                {canCancelActivePayment && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                    disabled={cancelOrderMutation.isPending || isExistingOrderLocked}
                    onClick={handleCancelOrder}
                  >
                    {cancelOrderMutation.isPending ? 'Đang hủy đơn...' : 'Hủy thanh toán'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
