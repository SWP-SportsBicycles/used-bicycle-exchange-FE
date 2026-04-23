'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft,
  Check,
  AlertTriangle,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  MapPin,
  Phone,
  User,
  Mail
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/lib/language-context'
import { formatVND } from '@/lib/mock-data'
import { inspectorApi, type InspectorListingMedia, type SubmitInspectionPayload } from '@/lib/api/inspector-api'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type InspectionFieldKey = 'frame' | 'paintCondition' | 'drivetrain' | 'brakes'

interface InspectionFieldState {
  result: boolean | null
  notes: string
}

const inspectionFields: Array<{
  id: InspectionFieldKey
  label: { vi: string; en: string }
  description: { vi: string; en: string }
}> = [
  { 
    id: 'frame',
    label: { vi: 'Khung Xe', en: 'Frame' },
    description: { 
      vi: 'Kiểm tra vết nứt, biến dạng, và độ thẳng của khung', 
      en: 'Check for cracks, deformation, and frame alignment' 
    }
  },
  { 
    id: 'paintCondition',
    label: { vi: 'Nước Sơn', en: 'Paint Condition' },
    description: { 
      vi: 'Đánh giá trầy xước, bong sơn và chất lượng lớp phủ', 
      en: 'Assess scratches, coating quality, and paint defects' 
    }
  },
  { 
    id: 'drivetrain', 
    label: { vi: 'Bộ Truyền Động', en: 'Drivetrain' },
    description: { 
      vi: 'Kiểm tra xích, líp, đĩa, và chuyển số', 
      en: 'Check chain, cassette, chainrings, and shifting' 
    }
  },
  { 
    id: 'brakes',
    label: { vi: 'Hệ Thống Phanh', en: 'Brake System' },
    description: { 
      vi: 'Kiểm tra má phanh, dây phanh và hiệu quả phanh', 
      en: 'Check brake pads, cables, and braking effectiveness' 
    }
  },
]

const steps = [
  { id: 'verify', label: { vi: 'Xác Minh', en: 'Verify' } },
  { id: 'inspect', label: { vi: 'Kiểm Định', en: 'Inspect' } },
  { id: 'summary', label: { vi: 'Tổng Kết', en: 'Summary' } },
]

export default function InspectionPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { language } = useLanguage()

  const listingId = params.id

  const listingQuery = useQuery({
    queryKey: ['inspector-listing-detail', listingId],
    queryFn: () => inspectorApi.getListingDetail(listingId),
    enabled: Boolean(listingId),
  })
  
  const [currentStep, setCurrentStep] = useState(0)
  const [serialConfirmed, setSerialConfirmed] = useState(false)
  const [inspection, setInspection] = useState<Record<InspectionFieldKey, InspectionFieldState>>(() => ({
    frame: { result: null, notes: '' },
    paintCondition: { result: null, notes: '' },
    drivetrain: { result: null, notes: '' },
    brakes: { result: null, notes: '' },
  }))
  const [comment, setComment] = useState('')

  const submitMutation = useMutation({
    mutationFn: (payload: SubmitInspectionPayload) => inspectorApi.submitToAdmin(listingId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inspector-listings', 'pending'] })
      toast({
        title: language === 'vi' ? 'Gửi thành công' : 'Submitted successfully',
        description: language === 'vi' ? 'Đã gửi kết quả kiểm định cho admin.' : 'Inspection report was sent to admin.',
      })
      router.push('/inspector/assigned')
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: language === 'vi' ? 'Gửi thất bại' : 'Submit failed',
        description: error instanceof Error ? error.message : language === 'vi' ? 'Không thể gửi báo cáo.' : 'Unable to submit report.',
      })
    },
  })

  const listing = listingQuery.data
  const bike = listing?.bikes[0]
  const mediaList = bike?.medias ?? []
  const imageList = mediaList.map((item) => item.image).filter((item): item is string => Boolean(item))
  const videoList = mediaList.map((item) => item.videoUrl).filter((item): item is string => Boolean(item))

  const evaluatedCount = inspectionFields.filter((field) => inspection[field.id].result !== null).length
  const completeness = Math.round((evaluatedCount / inspectionFields.length) * 100)
  const score = inspectionFields.reduce((sum, field) => sum + (inspection[field.id].result ? 25 : 0), 0)

  const scoreTone = score > 75 ? 'green' : score > 25 ? 'yellow' : 'red'
  const isReadyToSubmit = inspectionFields.every((field) => inspection[field.id].result !== null) && comment.trim().length >= 5

  const updateInspection = (field: InspectionFieldKey, patch: Partial<InspectionFieldState>) => {
    setInspection((prev) => ({
      ...prev,
      [field]: { ...prev[field], ...patch },
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    const payload: SubmitInspectionPayload = {
      comment: comment.trim(),
      frame: inspection.frame.result === true,
      paintCondition: inspection.paintCondition.result === true,
      drivetrain: inspection.drivetrain.result === true,
      brakes: inspection.brakes.result === true,
      forcePass: score > 75,
      isFlagged: inspectionFields.some((field) => inspection[field.id].result === false),
    }

    submitMutation.mutate(payload)
  }

  if (listingQuery.isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        {language === 'vi' ? 'Đang tải thông tin xe...' : 'Loading listing detail...'}
      </div>
    )
  }

  if (listingQuery.error || !listing || !bike) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'vi' ? 'Quay lại' : 'Back'}
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            {listingQuery.error instanceof Error
              ? listingQuery.error.message
              : language === 'vi'
              ? 'Không thể tải dữ liệu kiểm định.'
              : 'Unable to load inspection detail.'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight truncate">
            {language === 'vi' ? 'Kiểm Định:' : 'Inspect:'} {listing.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {bike.brand} {bike.category} - {formatVND(bike.price)}
          </p>
        </div>
      </div>

      {/* Seller Info */}
      <Card className="mb-6 border-emerald-200/70 bg-linear-to-r from-emerald-50/60 via-background to-lime-50/60">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{listing.seller.fullName || (language === 'vi' ? 'Chưa cập nhật' : 'Unknown')}</span>
            </div>
            {listing.seller.email ? (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{listing.seller.email}</span>
              </div>
            ) : null}
            {listing.seller.phoneNumber ? (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{listing.seller.phoneNumber}</span>
              </div>
            ) : null}
            {bike.city || listing.city ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{bike.city || listing.city}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="mb-8 rounded-xl border border-emerald-200/60 bg-linear-to-r from-emerald-50/50 via-background to-lime-50/40 px-3 py-5">
        <div className="flex items-start">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex-1 flex flex-col items-center">
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-[calc(50%+1.25rem)] h-1 w-[calc(100%-2.5rem)] rounded-full bg-emerald-100/90 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-success"
                    initial={false}
                    animate={{ width: index < currentStep ? '100%' : '0%' }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                  />
                </div>
              )}

              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className={cn(
                  'relative z-10 h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium border transition-colors',
                  index < currentStep
                    ? 'bg-success text-success-foreground border-success shadow-sm shadow-success/30'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/35'
                    : 'bg-muted text-muted-foreground border-border'
                )}
                animate={{ scale: index === currentStep ? 1.08 : 1 }}
              >
                {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
              </motion.div>

              <span
                className={cn(
                  'text-xs mt-2 hidden sm:block',
                  index === currentStep ? 'text-foreground font-semibold' : 'text-muted-foreground'
                )}
              >
                {step.label[language]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <Card className="border-primary/20 shadow-sm shadow-emerald-100/70">
        <CardHeader>
          <CardTitle>{steps[currentStep].label[language]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && (language === 'vi' ? 'Xác minh số serial và thông tin xe' : 'Verify serial number and bike information')}
            {currentStep === 1 && (language === 'vi' ? 'Kiểm tra từng bộ phận của xe' : 'Inspect each component of the bike')}
            {currentStep === 2 && (language === 'vi' ? 'Xem lại và gửi báo cáo' : 'Review and submit report')}
          </CardDescription>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{language === 'vi' ? 'Độ đầy đủ bằng chứng' : 'Evidence completeness'}</span>
              <span className="font-medium text-foreground">{completeness}%</span>
            </div>
            <div className="h-2 rounded-full bg-emerald-100/80 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', completeness >= 70 ? 'bg-emerald-500' : 'bg-amber-500')}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Verify */}
            {currentStep === 0 && (
              <div className="space-y-6">
                {/* Serial Verification */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">
                      {language === 'vi' ? 'Số Serial Đăng Ký' : 'Registered Serial'}
                    </Label>
                    <div className="mt-2 p-4 rounded-lg bg-muted font-mono text-lg">
                      {bike.serialNumber || (language === 'vi' ? 'Không có serial' : 'No serial')}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <h4 className="font-medium mb-3">
                      {language === 'vi' ? 'Thông tin xe đã đăng ký' : 'Registered bike specs'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <p><span className="text-muted-foreground">Category:</span> {bike.category || '-'}</p>
                      <p><span className="text-muted-foreground">Frame size:</span> {bike.frameSize || '-'}</p>
                      <p><span className="text-muted-foreground">Frame material:</span> {bike.frameMaterial || '-'}</p>
                      <p><span className="text-muted-foreground">Condition:</span> {bike.condition || '-'}</p>
                      <p><span className="text-muted-foreground">Paint:</span> {bike.paint || '-'}</p>
                      <p><span className="text-muted-foreground">Brake type:</span> {bike.brakeType || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Bike Images Reference */}
                <div className="space-y-2">
                  <Label className="text-base">
                    {language === 'vi' ? 'Hình Ảnh Tham Khảo' : 'Reference Images'}
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {imageList.slice(0, 6).map((img, idx) => (
                      <div key={idx} className="h-44 rounded-lg overflow-hidden border border-border/70 bg-muted">
                        <img src={img} alt={`Bike ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  {videoList.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm text-muted-foreground">
                        {language === 'vi' ? 'Video' : 'Videos'}
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {videoList.map((videoUrl, index) => (
                          <video
                            key={videoUrl}
                            src={videoUrl}
                            controls
                            preload="metadata"
                            className="h-40 w-full rounded-lg border border-border bg-black/90 object-contain"
                          >
                            {language === 'vi' ? `Video ${index + 1}` : `Video ${index + 1}`}
                          </video>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <Checkbox
                      id="serialConfirmed"
                      checked={serialConfirmed}
                      onCheckedChange={(checked) => setSerialConfirmed(checked === true)}
                    />
                    <Label htmlFor="serialConfirmed" className="cursor-pointer">
                      {language === 'vi' 
                        ? 'Tôi xác nhận thông số xe khớp với đăng ký'
                        : 'I confirm bike specs match the listing registration'}
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Inspect */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {inspectionFields.map((item) => {
                  const fieldState = inspection[item.id]

                  return (
                  <div
                    key={item.id}
                    className={cn(
                      'p-4 rounded-lg border transition-colors',
                      fieldState.result === null ? 'border-destructive/35 bg-red-50/40' : 'border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold">{item.label[language]}</h4>
                        <p className="text-sm text-muted-foreground">{item.description[language]}</p>
                      </div>
                      {fieldState.result !== null && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs',
                            fieldState.result === true && 'bg-success/20 text-success',
                            fieldState.result === false && 'bg-destructive/20 text-destructive'
                          )}
                        >
                          {fieldState.result === true && (language === 'vi' ? 'Đạt' : 'Pass')}
                          {fieldState.result === false && (language === 'vi' ? 'Không đạt' : 'Fail')}
                        </Badge>
                      )}
                    </div>

                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => updateInspection(item.id, { result: true })}
                        className={cn(
                          'justify-center gap-2',
                          fieldState.result === true
                            ? 'border-success bg-success/10 text-success'
                            : ''
                        )}
                      >
                        <Check className="h-4 w-4" />
                        {language === 'vi' ? 'Đạt' : 'Pass'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => updateInspection(item.id, { result: false })}
                        className={cn(
                          'justify-center gap-2',
                          fieldState.result === false
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : ''
                        )}
                      >
                        <X className="h-4 w-4" />
                        {language === 'vi' ? 'Không đạt' : 'Fail'}
                      </Button>
                    </div>

                    {imageList.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {imageList.map((img, idx) => (
                          <div key={`${item.id}-${idx}`} className="h-32 rounded-lg overflow-hidden border border-border/60 bg-muted">
                            <img src={img} alt={`${item.id}-${idx}`} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            )}

            {/* Step 3: Summary */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center p-6 rounded-lg bg-linear-to-r from-muted via-muted/90 to-rose-50/50 border border-border/70">
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'vi' ? 'Điểm Tổng Thể' : 'Overall Score'}
                  </p>
                  <div className={cn(
                    'inline-flex min-w-35 h-16 px-4 items-center justify-center rounded-full text-2xl font-bold',
                    scoreTone === 'green' && 'bg-success/20 text-success',
                    scoreTone === 'yellow' && 'bg-amber-500/20 text-amber-700',
                    scoreTone === 'red' && 'bg-destructive/20 text-destructive'
                  )}>
                    {score}/100
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">
                    {language === 'vi' ? 'Kết Quả Kiểm Tra' : 'Inspection Results'}
                  </h4>
                  <div className="space-y-2">
                    {inspectionFields.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border',
                          inspection[item.id].result === null ? 'bg-red-50/60 border-destructive/30' : 'bg-muted/50 border-transparent'
                        )}
                      >
                        <span className="text-sm">{item.label[language]}</span>
                        <div className="flex items-center gap-2">
                          {inspection[item.id].result === true && (
                            <Badge variant="outline" className="bg-success/20 text-success">
                              <Check className="h-3 w-3 mr-1" />
                              {language === 'vi' ? 'Đạt' : 'Pass'}
                            </Badge>
                          )}
                          {inspection[item.id].result === false && (
                            <Badge variant="outline" className="bg-destructive/20 text-destructive">
                              <X className="h-3 w-3 mr-1" />
                              {language === 'vi' ? 'Không đạt' : 'Fail'}
                            </Badge>
                          )}
                          {inspection[item.id].result === null && (
                            <Badge variant="outline" className="bg-red-100 text-destructive border-destructive/40">
                              {language === 'vi' ? 'Chưa kiểm' : 'Not checked'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Notes */}
                <div className="space-y-2">
                  <Label>{language === 'vi' ? 'Ghi chú gửi admin' : 'Comment for admin'}</Label>
                  <Textarea
                    placeholder={language === 'vi' 
                      ? 'Nhập ghi chú cho admin (tối thiểu 5 ký tự)...' 
                      : 'Enter comment for admin (min 5 chars)...'}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {language === 'vi' ? 'Quay lại' : 'Back'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={nextStep} 
                className="gap-2"
                disabled={currentStep === 0 && !serialConfirmed}
              >
                {language === 'vi' ? 'Tiếp theo' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2" disabled={!isReadyToSubmit || submitMutation.isPending}>
                {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {language === 'vi' ? 'Gửi cho admin' : 'Submit to admin'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
