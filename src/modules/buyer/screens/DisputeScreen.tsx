'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, UploadCloud, AlertTriangle, ShieldCheck, PlayCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { useOrderDetail } from '../hooks/useOrders'
import { useDisputeMutation, useUploadMedia } from '../hooks/useDispute'

const disputeSchema = z.object({
  reason: z.string().min(20, "Vui lòng mô tả chi tiết ít nhất 20 ký tự"),
  mediaUrls: z.array(z.string()).min(1, "Bắt buộc phải tải lên ít nhất 1 video unbox"),
})

type DisputeFormValues = z.infer<typeof disputeSchema>

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DisputeScreen({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: order, isLoading: isOrderLoading } = useOrderDetail(id)
  
  const disputeMutation = useDisputeMutation()
  const uploadMutation = useUploadMedia()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: { reason: '', mediaUrls: [] }
  })

  const mediaUrls = watch('mediaUrls')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simple validation
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File video không được vượt quá 50MB')
      return
    }

    try {
      const res = await uploadMutation.mutateAsync(file)
      setValue('mediaUrls', [...mediaUrls, res.url], { shouldValidate: true })
      toast.success('Đã tải lên video thành công')
    } catch (error) {
      toast.error('Lỗi khi tải video lên')
    }
  }

  const onSubmit = (data: DisputeFormValues) => {
    if (!order) return
    disputeMutation.mutate({ orderId: order.id, data }, {
      onSuccess: () => {
        toast.success('Đã gửi yêu cầu khiếu nại thành công. VeloTrust sẽ phản hồi trong 24h.')
        router.push(`/buyer/orders/${order.id}`)
      },
      onError: () => toast.error('Có lỗi xảy ra khi gửi yêu cầu.')
    })
  }

  if (isOrderLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Đang tải...</div>
  if (!order) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Không tìm thấy đơn hàng.</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 lg:px-6">
        <nav className="mb-6">
          <Link 
            href={`/buyer/orders/${order.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Trở lại chi tiết đơn hàng
          </Link>
        </nav>

        <Card className="border-rose-200 overflow-hidden shadow-md">
          <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-start gap-3 text-rose-800">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold">Yêu cầu khiếu nại / Hoàn tiền</h2>
              <p className="text-sm mt-1 opacity-90">
                Theo chính sách Escrow, bạn phải cung cấp video mở hộp (unbox) rõ ràng, không cắt ghép làm bằng chứng. Hạn chót gửi khiếu nại là 24h kể từ khi GHN báo giao thành công.
              </p>
            </div>
          </div>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Video bằng chứng mở hộp (Unbox Video) <span className="text-destructive">*</span>
                </Label>
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    id="video-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadMutation.isPending}
                  />
                  <Label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                        <span className="font-medium">Đang tải lên...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                        <span className="font-medium text-primary">Nhấn để tải video lên</span>
                        <span className="text-xs text-muted-foreground mt-1">Hỗ trợ MP4, MOV (Tối đa 50MB)</span>
                      </>
                    )}
                  </Label>
                </div>
                {errors.mediaUrls && <p className="text-sm text-destructive font-medium">{errors.mediaUrls.message}</p>}

                {/* Display uploaded videos */}
                {mediaUrls.length > 0 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto">
                    {mediaUrls.map((url, i) => (
                      <div key={i} className="relative h-24 w-32 bg-black rounded-lg flex items-center justify-center shrink-0">
                        <PlayCircle className="h-8 w-8 text-white/70" />
                        <div className="absolute bottom-1 left-2 text-[10px] text-white">Video {i+1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="reason" className="text-base font-semibold">
                  Mô tả chi tiết vấn đề <span className="text-destructive">*</span>
                </Label>
                <Textarea 
                  id="reason" 
                  placeholder="Ví dụ: Xe bị móp khung ở sườn trái, không giống như mô tả ban đầu..." 
                  className="min-h-[120px] resize-none"
                  {...register('reason')}
                />
                {errors.reason && <p className="text-sm text-destructive font-medium">{errors.reason.message}</p>}
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
                <p>
                  VeloTrust sẽ đóng băng khoản tiền trong Escrow và đại diện xử lý công bằng dựa trên video unbox của bạn và báo cáo kiểm định ban đầu (nếu có).
                </p>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Hủy
                </Button>
                <Button type="submit" variant="destructive" disabled={disputeMutation.isPending || uploadMutation.isPending}>
                  {disputeMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu khiếu nại'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
