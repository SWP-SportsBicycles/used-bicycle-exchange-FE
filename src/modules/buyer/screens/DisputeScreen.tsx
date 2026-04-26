'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, UploadCloud, AlertTriangle, ShieldCheck, PlayCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { useOrderDetail } from '../hooks/useOrders'
import { useDisputeMutation, useUploadMedia, useMyReports } from '../hooks/useDispute'

const disputeSchema = z.object({
  type: z.string().min(1, 'Vui long chon loai khieu nai'),
  reason: z.string().min(20, "Vui lòng mô tả chi tiết ít nhất 20 ký tự"),
  mediaUrls: z.array(z.string()).min(1, "Bắt buộc phải tải lên ít nhất 1 video unbox"),
})

type DisputeFormValues = z.infer<typeof disputeSchema>

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DisputeScreen({ params }: PageProps) {
  const reportTypeOptions = [
    { value: '1', label: 'Không đúng mô tả' },
    { value: '2', label: 'Hư hỏng / Lỗi sản phẩm' },
    { value: '3', label: 'Thiếu phụ kiện / Sai hàng' },
    { value: '4', label: 'Vấn đề vận chuyển' },
    { value: '5', label: 'Khác' },
  ]

  const { id } = use(params)
  const router = useRouter()
  const { data: order, isLoading: isOrderLoading } = useOrderDetail(id)
  const { data: reports, isLoading: isReportsLoading } = useMyReports()
  
  const disputeMutation = useDisputeMutation()
  const uploadMutation = useUploadMedia()

  const existingReport = reports?.find(r => r.orderId === id)
  const isViewMode = order?.status === 'disputed' || existingReport

  const { control, register, handleSubmit, setValue, formState: { errors } } = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: { type: '1', reason: '', mediaUrls: [] }
  })

  const mediaUrls = useWatch({ control, name: 'mediaUrls' }) ?? []

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
    } catch {
      toast.error('Lỗi khi tải video lên')
    }
  }

  const onSubmit = (data: DisputeFormValues) => {
    if (!order) return
    disputeMutation.mutate({ orderId: order.id, data: { type: String(Number(data.type)), reason: data.reason, mediaUrls: data.mediaUrls } }, {
      onSuccess: () => {
        toast.success('Đã gửi yêu cầu khiếu nại thành công. VeloTrust sẽ phản hồi trong 24h.')
        router.push(`/buyer/orders/${order.id}`)
      },
      onError: () => toast.error('Có lỗi xảy ra khi gửi yêu cầu.')
    })
  }

  if (isOrderLoading || (isViewMode && isReportsLoading)) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin mr-2"/> Đang tải...</div>
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

        <div className="rounded-3xl bg-card border border-rose-200 shadow-sm overflow-hidden mt-2">
          {isViewMode ? (
            <div className="bg-amber-50/80 px-6 py-5 flex items-start gap-4 border-b border-amber-100/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-900">Chi tiết khiếu nại</h2>
                <p className="text-sm mt-1.5 text-amber-800/80 leading-relaxed max-w-2xl">
                  {existingReport 
                    ? `Khiếu nại được tạo vào ngày ${new Date(existingReport.createdAt).toLocaleDateString('vi-VN')}. VeloTrust đang trong quá trình xử lý.`
                    : 'Đơn hàng này đang trong trạng thái khiếu nại. VeloTrust sẽ sớm liên hệ với bạn.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50/80 px-6 py-5 flex items-start gap-4 border-b border-rose-100/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-900">Yêu cầu khiếu nại / Hoàn tiền</h2>
                <p className="text-sm mt-1.5 text-rose-800/80 leading-relaxed max-w-2xl">
                  Theo chính sách Escrow, bạn phải cung cấp video mở hộp (unbox) rõ ràng, không cắt ghép làm bằng chứng. Hạn chót gửi khiếu nại là 24h kể từ khi GHN báo giao thành công.
                </p>
              </div>
            </div>
          )}
          
          <div className="p-6 md:p-8">
            {isViewMode ? (
              <div className="space-y-6">
                {existingReport ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Loại khiếu nại</Label>
                      <p className="font-medium text-foreground text-lg">
                        {reportTypeOptions.find(o => o.value === existingReport.type?.toString())?.label || 'Khác'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Video bằng chứng (Unbox Video)</Label>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {existingReport.videoUrl || existingReport.evidenceVideo || existingReport.description ? (
                          (existingReport.videoUrl || existingReport.evidenceVideo || existingReport.description || '').split(',').map((url, i) => (
                            <a href={url} target="_blank" rel="noopener noreferrer" key={i} className="relative h-28 w-40 bg-black rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-md group cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                              <PlayCircle className="h-10 w-10 text-white/70 group-hover:text-white transition-colors" />
                              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2 text-xs font-medium text-white text-center">
                                Xem Video {i+1}
                              </div>
                            </a>
                          ))
                        ) : (
                          <p className="text-sm italic text-muted-foreground">Không có video đính kèm.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Mô tả chi tiết</Label>
                      <div className="p-4 bg-secondary/10 rounded-2xl border border-border/60">
                        <p className="text-base whitespace-pre-wrap leading-relaxed">{existingReport.reason}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Trạng thái xử lý</Label>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/30">
                        <p className="font-bold text-amber-700 dark:text-amber-400 capitalize">
                          {existingReport.status?.replace(/_/g, ' ') || 'Đang xử lý'}
                        </p>
                        {existingReport.resolution && (
                          <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-800/50">
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Quyết định từ VeloTrust:</p>
                            <p className="text-sm text-amber-700 dark:text-amber-400">{existingReport.resolution}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Đang tải thông tin chi tiết khiếu nại...</p>
                  </div>
                )}
                
                <div className="pt-6 border-t border-border/50 flex justify-end gap-4">
                  <Button variant="outline" type="button" onClick={() => router.back()} className="rounded-xl h-12 px-6 font-semibold">
                    Quay lại
                  </Button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold flex items-center gap-1.5">
                  Loại khiếu nại <span className="text-destructive">*</span>
                </Label>
                <Select defaultValue="1" onValueChange={(value) => setValue('type', value, { shouldValidate: true })}>
                  <SelectTrigger className="h-12 rounded-2xl bg-secondary/10">
                    <SelectValue placeholder="Chọn loại khiếu nại" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4"/> {errors.type.message}</p>}
              </div>
              <div className="space-y-4">
                <Label className="text-base font-bold flex items-center gap-1.5">
                  Video bằng chứng mở hộp (Unbox Video) <span className="text-destructive">*</span>
                </Label>
                <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer group">
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
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <span className="font-semibold text-lg">Đang tải lên...</span>
                        <span className="text-sm text-muted-foreground mt-2">Vui lòng không đóng trang</span>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                          <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-bold text-lg text-primary">Nhấn để tải video lên</span>
                        <span className="text-sm text-muted-foreground mt-2">Hỗ trợ MP4, MOV (Tối đa 50MB)</span>
                      </>
                    )}
                  </Label>
                </div>
                {errors.mediaUrls && <p className="text-sm text-destructive font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4"/> {errors.mediaUrls.message}</p>}

                {/* Display uploaded videos */}
                {mediaUrls.length > 0 && (
                  <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                    {mediaUrls.map((url, i) => (
                      <div key={i} className="relative h-28 w-40 bg-black rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-md group">
                        <PlayCircle className="h-10 w-10 text-white/70 group-hover:text-white transition-colors" />
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-2 text-xs font-medium text-white">
                          Video {i+1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label htmlFor="reason" className="text-base font-bold flex items-center gap-1.5">
                  Mô tả chi tiết vấn đề <span className="text-destructive">*</span>
                </Label>
                <Textarea 
                  id="reason" 
                  placeholder="Ví dụ: Xe bị móp khung ở sườn trái, không giống như mô tả ban đầu..." 
                  className="min-h-[160px] resize-none rounded-2xl bg-secondary/10 p-4 border-border/60 focus:border-primary/50 text-base"
                  {...register('reason')}
                />
                {errors.reason && <p className="text-sm text-destructive font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4"/> {errors.reason.message}</p>}
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-5 flex gap-4 text-sm text-blue-800 dark:text-blue-300">
                <ShieldCheck className="h-6 w-6 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="block mb-1">Bảo vệ bởi Escrow</strong>
                  VeloTrust sẽ đóng băng khoản tiền và đại diện xử lý công bằng dựa trên video unbox của bạn cùng báo cáo kiểm định ban đầu (nếu có).
                </p>
              </div>

              <div className="pt-6 border-t border-border/50 flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.back()} className="rounded-xl h-12 px-6 font-semibold">
                  Hủy bỏ
                </Button>
                <Button type="submit" variant="destructive" disabled={disputeMutation.isPending || uploadMutation.isPending} className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-rose-500/20">
                  {disputeMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu khiếu nại'}
                </Button>
              </div>
            </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
