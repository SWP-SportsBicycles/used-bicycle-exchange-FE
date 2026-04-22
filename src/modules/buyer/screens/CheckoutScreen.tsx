'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, ShieldCheck, CreditCard, MapPin, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { AddressForm } from '../components/AddressForm'
import { CheckoutTimer } from '../components/CheckoutTimer'
import { PayosQrDisplay } from '../components/PayosQrDisplay'
import { useCheckoutMutation, useOrderStatusPolling, usePaymentLinkMutation } from '../hooks/useCheckout'
import { useListingDetail } from '../hooks/useListingDetail'
import { formatVND } from '@/lib/mock-data'
import { CheckoutResponse } from '@/lib/api/buyer-api'

const checkoutSchema = z.object({
  receiverName: z.string().min(2, "Vui lòng nhập họ tên hợp lệ"),
  receiverPhone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  provinceId: z.number({ required_error: "Vui lòng chọn Tỉnh/Thành phố" }),
  toDistrictId: z.number({ required_error: "Vui lòng chọn Quận/Huyện" }),
  toWardCode: z.string({ required_error: "Vui lòng chọn Phường/Xã" }).min(1, "Vui lòng chọn Phường/Xã"),
  receiverAddress: z.string().min(5, "Vui lòng nhập chi tiết số nhà, tên đường"),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listingId')

  const { data: listing, isLoading: isLoadingListing } = useListingDetail(listingId)
  const checkoutMutation = useCheckoutMutation()

  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null)
  
  // Polling will run automatically if checkoutData.orderId is set
  const { data: orderStatusData } = useOrderStatusPolling(checkoutData?.orderId)

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      toWardCode: '',
    }
  })

  // Watch for successful payment
  useEffect(() => {
    if (orderStatusData?.status === 'payos_paid') {
      toast.success('Thanh toán thành công! Đơn hàng đã được ghi nhận.')
      router.push(`/buyer/orders/${orderStatusData.orderId}`)
    } else if (orderStatusData?.status === 'cancelled') {
      toast.error('Đơn hàng đã bị hủy do quá hạn thanh toán.')
      router.push('/marketplace')
    }
  }, [orderStatusData?.status, router, orderStatusData?.orderId])

  const paymentLinkMutation = usePaymentLinkMutation()

  const onSubmit = (data: CheckoutFormValues) => {
    checkoutMutation.mutate({
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      receiverAddress: data.receiverAddress,
      toDistrictId: data.toDistrictId,
      toWardCode: data.toWardCode,
    }, {
      onSuccess: (res) => {
        // Backend trả về orderId, giờ cần gọi payment để lấy QR PayOS
        paymentLinkMutation.mutate(res.orderId, {
          onSuccess: (payRes) => {
            setCheckoutData({
              ...res,
              payosQrUrl: payRes.qrCode || payRes.checkoutUrl
            })
            toast.success('Đã lên đơn! Vui lòng thanh toán trong vòng 5 phút.')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          },
          onError: () => {
            toast.error('Lỗi khi tạo mã thanh toán PayOS.')
          }
        })
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi tạo đơn hàng từ giỏ hàng.')
      }
    })
  }

  const handleTimerExpire = () => {
    toast.error('Hết thời gian thanh toán! Đơn hàng đã bị hủy.')
    router.push('/marketplace')
  }

  if (isLoadingListing) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Đang tải...</div>
  }

  if (!listing) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Không tìm thấy sản phẩm.</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          
          {checkoutData && (
            <CheckoutTimer expiresAt={checkoutData.expiresAt} onExpire={handleTimerExpire} />
          )}
        </div>

        <h1 className="text-3xl font-extrabold mb-8" style={{ fontFamily: 'var(--font-archivo)' }}>
          {checkoutData ? 'Thanh toán Escrow' : 'Xác nhận đơn hàng'}
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Address Form OR Display Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Địa chỉ nhận hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!checkoutData ? (
                  <FormProvider {...methods}>
                    <form id="checkout-form" onSubmit={methods.handleSubmit(onSubmit)}>
                      <AddressForm />
                    </form>
                  </FormProvider>
                ) : (
                  <div className="space-y-2 text-sm p-4 rounded-lg bg-secondary/50 border border-border">
                    <p><span className="font-semibold">Người nhận:</span> {methods.getValues('receiverName')} - {methods.getValues('receiverPhone')}</p>
                    <p><span className="font-semibold">Địa chỉ:</span> {methods.getValues('receiverAddress')}</p>
                    <p className="text-muted-foreground text-xs mt-2 italic">* Bạn không thể thay đổi địa chỉ sau khi đã xác nhận.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: PayOS QR (Only shown after Step 1) */}
            {checkoutData && (
              <Card className="border-primary shadow-athletic overflow-hidden">
                <div className="bg-primary/5 px-6 py-4 border-b border-primary/20">
                  <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <CreditCard className="h-5 w-5" />
                    Thanh toán bảo mật
                  </CardTitle>
                </div>
                <CardContent className="pt-8 pb-10">
                  <PayosQrDisplay 
                    qrUrl={checkoutData.payosQrUrl} 
                    totalPrice={checkoutData.totalPrice} 
                    orderId={checkoutData.orderId} 
                  />
                  
                  <div className="mt-8 bg-slate-100 p-4 rounded-lg flex gap-3 text-sm text-slate-600">
                    <ShieldCheck className="h-5 w-5 text-[#407F3E] shrink-0" />
                    <p>
                      <strong>Escrow Protection:</strong> Tiền của bạn được giữ an toàn trên hệ thống. 
                      Người bán chỉ nhận được tiền sau khi bạn xác nhận đã nhận hàng và hoàn toàn hài lòng với xe đạp.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Tổng quan đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-secondary shrink-0 border border-border">
                    <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-between">
                    <p className="font-semibold text-sm line-clamp-2 leading-tight">{listing.title}</p>
                    <p className="font-bold text-primary text-sm">{formatVND(listing.price)}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatVND(listing.price)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" /> Phí vận chuyển (GHN)
                    </span>
                    <span className="font-medium">
                      {checkoutData ? formatVND(checkoutData.shippingFee) : 'Tính ở bước sau'}
                    </span>
                  </div>

                  {listing.isVeloSafeVerified && (
                    <div className="flex justify-between text-success">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Phí kiểm định
                      </span>
                      <span>Miễn phí</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-end mb-6">
                  <span className="font-bold text-foreground">Tổng cộng</span>
                  <span className="text-2xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
                    {checkoutData ? formatVND(checkoutData.totalPrice) : formatVND(listing.price)}
                  </span>
                </div>

                {!checkoutData && (
                  <Button 
                    type="submit" 
                    form="checkout-form"
                    className="w-full h-12 text-base font-bold"
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? 'Đang xử lý...' : 'Xác nhận & Thanh toán'}
                  </Button>
                )}

                {checkoutData && (
                  <Button 
                    variant="outline"
                    className="w-full mt-3 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn hủy thanh toán và xả khóa xe này?")) {
                        // Call cancel API implicitly and go back
                        router.push('/marketplace')
                      }
                    }}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
