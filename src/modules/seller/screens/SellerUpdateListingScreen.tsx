'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Camera, Info, ChevronRight, ChevronLeft, Check, AlertCircle, Video } from 'lucide-react'
import { useUpdateListing, useUploadMedia, useResubmitListing } from '@/modules/seller/hooks/useSellerListingMutations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLanguage } from '@/lib/language-context'
import { BRANDS, FRAME_SIZES, GROUPSETS, CONDITIONS, CITIES, CATEGORIES, BRAKE_TYPES, WHEEL_SIZES, FRAME_MATERIAL_OPTIONS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const steps = [
  { id: 'basics', label: { vi: 'Thông Tin Cơ Bản', en: 'Basic Info' } },
  { id: 'specs', label: { vi: 'Thông Số Kỹ Thuật', en: 'Specifications' } },
  { id: 'photos', label: { vi: 'Hình Ảnh', en: 'Photos' } },
  { id: 'pricing', label: { vi: 'Giá & Xuất Bản', en: 'Pricing & Publish' } },
]



const REQUIRED_FIELD_LABELS: Record<string, string> = {
  Title: 'tiêu đề',
  Description: 'mô tả',
  SerialNumber: 'số serial',
  Category: 'loại xe',
  Brand: 'thương hiệu',
  FrameSize: 'kích cỡ khung',
  Condition: 'tình trạng',
  Groupset: 'bộ truyền động',
  TireRim: 'cỡ bánh',
  BrakeType: 'loại phanh',
  Paint: 'màu sơn',
  Overall: 'khấu hao / đánh giá',
  Price: 'giá bán',
  City: 'thành phố',
  Weight: 'trọng lượng',
}

const formatApiErrorMessage = (message: string): string => {
  const parts = message.split(' | ').map((part) => part.trim()).filter(Boolean)
  const mapped = parts.map((part) => {
    const match = part.match(/The\s+([A-Za-z0-9_]+)\s+field\s+is\s+required\.?/i)
    if (match) {
      const key = match[1]
      const label = REQUIRED_FIELD_LABELS[key]
      if (label) {
        return `Vui lòng nhập ${label}.`
      }
    }
    return part
  })
  return mapped.join(' ')
}

interface SellerUpdateListingScreenProps {
  listingId: string
  initialData: Record<string, unknown>
}

type MediaSeed = {
  imageUrls: string[]
  videoUrl: string | null
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function collectNestedRecords(root: unknown, maxDepth = 4): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = []
  const visited = new WeakSet<object>()

  const walk = (node: unknown, depth: number) => {
    if (!node || depth > maxDepth) return

    if (Array.isArray(node)) {
      node.forEach((entry) => walk(entry, depth + 1))
      return
    }

    const record = toRecord(node)
    if (!record) return
    if (visited.has(record)) return

    visited.add(record)
    records.push(record)

    Object.values(record).forEach((entry) => walk(entry, depth + 1))
  }

  walk(root, 0)
  return records
}

function getValueByKey(source: Record<string, unknown>, key: string): unknown {
  if (Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key]
  }

  const lowered = key.toLowerCase()
  const matched = Object.keys(source).find((candidate) => candidate.toLowerCase() === lowered)
  return matched ? source[matched] : undefined
}

function pickString(records: Record<string, unknown>[], keys: string[]): string {
  for (const record of records) {
    for (const key of keys) {
      const value = getValueByKey(record, key)
      if (typeof value === 'string' && value.trim().length > 0) {
        return value
      }
    }
  }
  return ''
}

function pickNumber(records: Record<string, unknown>[], keys: string[]): number {
  for (const record of records) {
    for (const key of keys) {
      const value = getValueByKey(record, key)
      const parsed = typeof value === 'number' ? value : Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return 0
}

function isVideoUrl(url: string): boolean {
  const normalized = url.toLowerCase()
  return (
    normalized.includes('/video/upload/') ||
    normalized.endsWith('.mp4') ||
    normalized.endsWith('.webm') ||
    normalized.endsWith('.ogg') ||
    normalized.endsWith('.mov') ||
    normalized.startsWith('data:video/')
  )
}

function extractMediaSeed(initialData: unknown): MediaSeed {
  const records = collectNestedRecords(initialData)
  const mediaKeys = ['mediaFiles', 'medias', 'media', 'images']
  const entries: unknown[] = []

  for (const record of records) {
    for (const key of mediaKeys) {
      const value = getValueByKey(record, key)
      if (Array.isArray(value)) {
        entries.push(...value)
      }
    }
  }

  const imageUrls: string[] = []
  const videoUrls: string[] = []

  entries.forEach((entry) => {
    if (typeof entry === 'string') {
      if (isVideoUrl(entry)) {
        videoUrls.push(entry)
      } else {
        imageUrls.push(entry)
      }
      return
    }

    const mediaRecord = toRecord(entry)
    if (!mediaRecord) return

    const url = pickString([mediaRecord], ['url', 'image', 'videoUrl', 'path', 'thumbnail'])
    if (!url) return

    const typeHint = pickString([mediaRecord], ['type', 'mediaType', 'resourceType', 'mimeType']).toLowerCase()
    if (typeHint.includes('video') || typeHint === '1' || isVideoUrl(url)) {
      videoUrls.push(url)
    } else {
      imageUrls.push(url)
    }
  })

  const thumbnail = pickString(records, ['thumbnail'])
  if (thumbnail && !isVideoUrl(thumbnail)) {
    imageUrls.unshift(thumbnail)
  }

  const dedupImages = Array.from(new Set(imageUrls))
  const dedupVideos = Array.from(new Set(videoUrls))

  return {
    imageUrls: dedupImages,
    videoUrl: dedupVideos[0] ?? null,
  }
}

function normalizeValue(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[._/-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function normalizeOptionValue(input: string, options: Array<{ value: string; label: string }>): string {
  if (!input) return ''
  const normalized = normalizeValue(input)
  const match = options.find((option) =>
    normalizeValue(option.value) === normalized || normalizeValue(option.label) === normalized
  )
  return match ? match.value : input
}

function normalizeStringOption(input: string, options: string[]): string {
  if (!input) return ''
  const normalized = normalizeValue(input)
  const match = options.find((option) => normalizeValue(option) === normalized)
  return match ?? input
}

function normalizeCityValue(input: string): string {
  if (!input) return ''
  const normalized = normalizeValue(input)
  if (normalized === 'hcm' || normalized.includes('ho chi minh') || normalized.includes('tp hcm') || normalized.includes('tphcm')) {
    return 'TP.HCM'
  }
  if (normalized === 'hanoi' || normalized.includes('ha noi')) {
    return 'Hà Nội'
  }
  if (normalized === 'danang' || normalized.includes('da nang')) {
    return 'Đà Nẵng'
  }
  return input
}

export default function SellerUpdateListingScreen({ listingId, initialData }: SellerUpdateListingScreenProps) {
  const { language } = useLanguage()
  const updateListingMutation = useUpdateListing()
  const uploadMediaMutation = useUploadMedia()
  const resubmitMutation = useResubmitListing()
  const mediaSeed = useMemo(() => extractMediaSeed(initialData), [initialData])
  
  // Track original status to determine which API to call after update
  const [originalStatus] = useState(() => {
    const status = typeof initialData?.status === 'string' ? initialData.status.trim() : ''
    // Normalize status similar to detail page
    const normalized = status
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
    
    if (normalized === 'published' || normalized === 'active') return 'published'
    if (normalized === 'pending_review' || normalized === 'pending' || normalized === 'pending_inspection') return 'pending_review'
    if (normalized === 'rejected') return 'rejected'
    if (normalized === 'withdrawn' || normalized === 'cancelled' || normalized === 'canceled') return 'withdrawn'
    if (normalized === 'sold' || normalized === 'completed') return 'sold'
    return 'draft'
  })
  
  const [currentStep, setCurrentStep] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Chỉ hiện với listing bị rejected: cho phép gửi duyệt lại ngay sau khi cập nhật
  const [shouldResubmit, setShouldResubmit] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  // Combined loading state
  const isLoading = isSubmitting || 
    updateListingMutation.isPending || 
    uploadMediaMutation.isPending ||
    resubmitMutation.isPending
  
  const [formData, setFormData] = useState(() => {
    const records = collectNestedRecords(initialData)
    const root = toRecord(initialData) || {}
    const sources = [root, ...records]

    const rawCategory = pickString(sources, ['category', 'bikeType', 'type'])
    const rawCondition = pickString(sources, ['condition', 'bikeCondition'])
    const rawCity = pickString(sources, ['city', 'cityName', 'location'])
    const rawFrameMaterial = pickString(sources, ['frameMaterial', 'material'])
    const rawFrameSize = pickString(sources, ['frameSize', 'size'])
    const rawGroupset = pickString(sources, ['groupset'])
    const rawWheelSize = pickString(sources, ['wheelSize', 'tireRim', 'rimSize'])
    const rawBrakeType = pickString(sources, ['brakeType', 'brake'])
    const rawBrand = pickString(sources, ['brand', 'brandName'])
    const rawTitle = pickString(sources, ['title', 'listingTitle', 'name'])
    const rawDescription = pickString(sources, ['description', 'desc'])
    const rawSerial = pickString(sources, ['serialNumber', 'serial', 'frameNumber'])
    const rawUsageHistory = pickString(sources, ['usageHistory', 'operating'])
    const rawPaint = pickString(sources, ['paint', 'color'])
    const rawOverall = pickString(sources, ['overall', 'rating', 'depreciation'])
    const rawPrice = pickNumber(sources, ['price', 'listingPrice'])
    const rawWeight = pickNumber(sources, ['weight'])

    return {
      title: rawTitle,
      category: normalizeOptionValue(rawCategory, CATEGORIES),
      brand: normalizeStringOption(rawBrand, BRANDS),
      condition: normalizeOptionValue(rawCondition, CONDITIONS),
      description: rawDescription,
      frameSize: normalizeStringOption(rawFrameSize, FRAME_SIZES),
      weight: rawWeight ? String(rawWeight) : '',
      frameMaterial: normalizeOptionValue(rawFrameMaterial, FRAME_MATERIAL_OPTIONS),
      groupset: normalizeStringOption(rawGroupset, GROUPSETS),
      wheelSize: normalizeStringOption(rawWheelSize, WHEEL_SIZES),
      usageHistory: rawUsageHistory,
      serial: rawSerial ? rawSerial.toUpperCase() : '',
      city: normalizeOptionValue(normalizeCityValue(rawCity), CITIES),
      price: rawPrice ? String(rawPrice) : '',
      paint: rawPaint,
      brakeType: normalizeStringOption(rawBrakeType, BRAKE_TYPES),
      overall: rawOverall,
    }
  })

  // State for files
  const [images, setImages] = useState<File[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(mediaSeed.imageUrls)
  const [video, setVideo] = useState<File | null>(null)
  const [groupsetPhoto, setGroupsetPhoto] = useState<File | null>(null)

  // Object URLs for preview
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(mediaSeed.videoUrl)
  const [groupsetPhotoUrl, setGroupsetPhotoUrl] = useState<string | null>(null)

  // File input refs
  const imagesInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const groupsetPhotoInputRef = useRef<HTMLInputElement>(null)

  // Keep track of all object URLs ever created to clean them up on unmount
  const objectUrlsRef = useRef<Set<string>>(new Set())

  const createTrackedObjectURL = (file: File) => {
    const url = URL.createObjectURL(file)
    objectUrlsRef.current.add(url)
    return url
  }

  // Clean up object URLs only on unmount
  useEffect(() => {
    const trackedUrls = objectUrlsRef.current
    return () => {
      trackedUrls.forEach(URL.revokeObjectURL)
      trackedUrls.clear()
    }
  }, [])

  const displayImageUrls = [...existingImageUrls, ...imageUrls]

  const updateField = (field: string, value: string) => {
    const nextValue = field === 'serial' ? value.toUpperCase() : value
    setFormData((prev) => ({ ...prev, [field]: nextValue }))
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'images' | 'video' | 'groupset'
  ) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (type === 'images') {
      const remainingSlots = Math.max(0, 10 - displayImageUrls.length)
      const accepted = files.slice(0, remainingSlots)
      if (accepted.length === 0) return

      const newImages = [...images, ...accepted]
      setImages(newImages)
      setImageUrls((prev) => [...prev, ...accepted.map((file) => createTrackedObjectURL(file))])
    } else if (type === 'video') {
      const file = files[0]
      setVideo(file)
      if (videoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl)
        objectUrlsRef.current.delete(videoUrl)
      }
      setVideoUrl(createTrackedObjectURL(file))
    } else if (type === 'groupset') {
      const file = files[0]
      setGroupsetPhoto(file)
      if (groupsetPhotoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(groupsetPhotoUrl)
        objectUrlsRef.current.delete(groupsetPhotoUrl)
      }
      setGroupsetPhotoUrl(createTrackedObjectURL(file))
    }
    
    // Clear input
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    if (index < existingImageUrls.length) {
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index))
      return
    }

    const localIndex = index - existingImageUrls.length
    const targetUrl = imageUrls[localIndex]
    if (targetUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(targetUrl)
      objectUrlsRef.current.delete(targetUrl)
    }

    setImages((prev) => prev.filter((_, i) => i !== localIndex))
    setImageUrls((prev) => prev.filter((_, i) => i !== localIndex))
  }

  const validateStep = (stepIndex: number) => {
    const errors: Record<string, string> = {}
    const isVi = language === 'vi'

    if (stepIndex === 0) {
      if (!formData.title.trim()) errors.title = isVi ? 'Vui lòng nhập tiêu đề.' : 'Please enter a title.'
      if (!formData.category) errors.category = isVi ? 'Vui lòng chọn loại xe.' : 'Please select a category.'
      if (!formData.condition) errors.condition = isVi ? 'Vui lòng chọn tình trạng.' : 'Please select a condition.'
      if (!formData.brand) errors.brand = isVi ? 'Vui lòng chọn thương hiệu.' : 'Please select a brand.'
      if (!formData.description.trim()) errors.description = isVi ? 'Vui lòng nhập mô tả.' : 'Please enter a description.'
    }

    if (stepIndex === 1) {
      if (!formData.frameSize) errors.frameSize = isVi ? 'Vui lòng chọn kích cỡ khung.' : 'Please select a frame size.'
      if (!formData.groupset) errors.groupset = isVi ? 'Vui lòng chọn groupset.' : 'Please select a groupset.'
      if (!formData.wheelSize) errors.wheelSize = isVi ? 'Vui lòng chọn cỡ bánh.' : 'Please select a wheel size.'
      if (!formData.brakeType) errors.brakeType = isVi ? 'Vui lòng chọn loại phanh.' : 'Please select a brake type.'
      if (!formData.paint.trim()) errors.paint = isVi ? 'Vui lòng nhập màu sơn.' : 'Please enter the paint color.'
      if (!formData.overall.trim()) errors.overall = isVi ? 'Vui lòng nhập khấu hao/đánh giá.' : 'Please enter the overall condition.'
      if (!formData.serial.trim()) errors.serial = isVi ? 'Vui lòng nhập số serial.' : 'Please enter the serial number.'
      if (!formData.city) errors.city = isVi ? 'Vui lòng chọn thành phố.' : 'Please select a city.'
      const weightValue = Number(formData.weight)
      if (!Number.isFinite(weightValue) || weightValue <= 0) {
        errors.weight = isVi ? 'Vui lòng nhập trọng lượng hợp lệ.' : 'Please enter a valid weight.'
      }
    }

    if (stepIndex === 2) {
      if (displayImageUrls.length === 0) errors.images = isVi ? 'Cần ít nhất 1 ảnh xe.' : 'At least 1 bike photo is required.'
    }

    if (stepIndex === 3) {
      const priceValue = Number(String(formData.price).replace(/,/g, ''))
      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        errors.price = isVi ? 'Vui lòng nhập giá bán hợp lệ.' : 'Please enter a valid price.'
      }
    }

    return errors
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const errors = validateStep(currentStep)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }
      setFieldErrors({})
      setSubmitError(null)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmitForReview = async () => {
    setSubmitError(null)
    setSubmitSuccess(null)

    // Validate tất cả step trước khi submit
    const stepErrors = [0, 1, 2, 3].map((step) => validateStep(step))
    const firstErrorIndex = stepErrors.findIndex((errs) => Object.keys(errs).length > 0)
    if (firstErrorIndex !== -1) {
      setFieldErrors(stepErrors[firstErrorIndex])
      setCurrentStep(firstErrorIndex)
      setSubmitError(language === 'vi' ? 'Vui lòng hoàn tất các trường bắt buộc.' : 'Please complete the required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare payload for update
      const priceVal = Number(String(formData.price).replace(/,/g, ''))
      const payload = {
        title: formData.title,
        description: formData.description,
        serialNumber: formData.serial.toUpperCase(),
        category: formData.category,
        brand: formData.brand,
        frameSize: formData.frameSize,
        weight: Number(formData.weight),
        frameMaterial: formData.frameMaterial,
        condition: formData.condition,
        groupset: formData.groupset,
        operating: formData.usageHistory,
        tireRim: formData.wheelSize,
        price: priceVal,
        city: normalizeCityValue(formData.city),
        paint: formData.paint || 'N/A',
        overall: formData.overall || 'N/A',
        brakeType: formData.brakeType || 'Chưa Xác Định',
      }

      await updateListingMutation.mutateAsync({
        listingId,
        data: payload
      })

      // Upload new media files if any
      const newMediaFiles = [...images, video, groupsetPhoto].filter(Boolean) as File[]
      if (newMediaFiles.length > 0) {
        await uploadMediaMutation.mutateAsync({ listingId, files: newMediaFiles })
      }

      // Nếu rejected và user chọn gửi duyệt lại ngay
      if (originalStatus === 'rejected' && shouldResubmit) {
        await resubmitMutation.mutateAsync(listingId)
        setSubmitSuccess(
          language === 'vi'
            ? 'Cập nhật thành công và đã gửi duyệt lại. Vui lòng chờ kiểm duyệt.'
            : 'Updated and resubmitted for review successfully.'
        )
      } else {
        setSubmitSuccess(
          originalStatus === 'draft'
            ? (language === 'vi' ? 'Cập nhật bản nháp thành công. Vui lòng gửi duyệt tại trang chi tiết.' : 'Draft updated. Submit for review from the detail page.')
            : (language === 'vi' ? 'Cập nhật tin đăng thành công.' : 'Listing updated successfully.')
        )
      }
      
      // Navigate back after success
      setTimeout(() => {
        window.location.href = `/seller/listings/${listingId}`
      }, 2000)

    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? formatApiErrorMessage(error.message)
          : 'Không thể cập nhật tin lúc này. Vui lòng thử lại.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'vi' ? 'Cập Nhật Tin Đăng' : 'Update Listing'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'vi' ? 'Chỉnh sửa thông tin xe đạp của bạn' : 'Edit details for your bicycle'}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    index < currentStep
                      ? 'bg-success text-success-foreground'
                      : index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 hidden sm:block',
                    index === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground',
                  )}
                >
                  {step.label[language]}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn('h-0.5 w-12 sm:w-24 mx-2', index < currentStep ? 'bg-success' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].label[language]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && (language === 'vi' ? 'Thông tin cơ bản về xe' : 'Basic bike information')}
            {currentStep === 1 && (language === 'vi' ? 'Chi tiết thông số kỹ thuật' : 'Technical specifications')}
            {currentStep === 2 && (language === 'vi' ? 'Tải lên hình ảnh và video thực tế' : 'Upload real photos and video')}
            {currentStep === 3 && (language === 'vi' ? 'Đặt giá và xuất bản' : 'Set price and publish')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert className="mb-6 border-success/30 bg-success/10 text-success">
              <Check className="h-4 w-4" />
              <AlertDescription>{submitSuccess}</AlertDescription>
            </Alert>
          )}

          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {language === 'vi' ? 'Tiêu đề' : 'Title'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder={language === 'vi' ? 'VD: Giant TCR Advanced Pro 1 - Full Carbon' : 'E.g., Giant TCR Advanced Pro 1 - Full Carbon'}
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      {language === 'vi' ? 'Loại Xe' : 'Category'} <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.category}
                      onValueChange={(value) => updateField('category', value)}
                      className="grid grid-cols-2 gap-2"
                    >
                      {CATEGORIES.map((cat) => (
                        <Label
                          key={cat.value}
                          htmlFor={cat.value}
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                            formData.category === cat.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted',
                          )}
                        >
                          <RadioGroupItem value={cat.value} id={cat.value} className="sr-only" />
                          <span className="text-sm">{cat.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {language === 'vi' ? 'Tình Trạng' : 'Condition'} <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.condition}
                      onValueChange={(value) => updateField('condition', value)}
                      className="space-y-2"
                    >
                      {CONDITIONS.map((cond) => (
                        <Label
                          key={cond.value}
                          htmlFor={cond.value}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                            formData.condition === cond.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={cond.value} id={cond.value} className="sr-only" />
                            <span className="text-sm font-medium">{cond.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{cond.description}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brand">
                      {language === 'vi' ? 'Thương Hiệu' : 'Brand'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.brand} onValueChange={(value) => updateField('brand', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn thương hiệu' : 'Select brand'} />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANDS.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {language === 'vi' ? 'Mô Tả' : 'Description'} <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={
                      language === 'vi'
                        ? 'Mô tả chi tiết về xe: tình trạng, lịch sử sử dụng, lý do bán...'
                        : 'Detailed description: condition, usage history, reason for selling...'
                    }
                    rows={4}
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="frameSize">
                      {language === 'vi' ? 'Kích Cỡ Khung' : 'Frame Size'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.frameSize} onValueChange={(value) => updateField('frameSize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn size' : 'Select size'} />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAME_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frameMaterial">{language === 'vi' ? 'Chất Liệu Khung' : 'Frame Material'}</Label>
                    <Select value={formData.frameMaterial} onValueChange={(value) => updateField('frameMaterial', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn chất liệu' : 'Select material'} />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAME_MATERIAL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="groupset">
                      {language === 'vi' ? 'Bộ Truyền Động' : 'Groupset'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.groupset} onValueChange={(value) => updateField('groupset', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn groupset' : 'Select groupset'} />
                      </SelectTrigger>
                      <SelectContent>
                        {GROUPSETS.map((gs) => (
                          <SelectItem key={gs} value={gs}>
                            {gs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wheelSize">
                      {language === 'vi' ? 'Cỡ Bánh' : 'Wheel Size'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.wheelSize} onValueChange={(value) => updateField('wheelSize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn cỡ bánh' : 'Select wheel size'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="700c">700c</SelectItem>
                        <SelectItem value="650b">650b</SelectItem>
                        <SelectItem value="29">29&quot;</SelectItem>
                        <SelectItem value="27.5">27.5&quot;</SelectItem>
                        <SelectItem value="26">26&quot;</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brakeType">
                      {language === 'vi' ? 'Loại Phanh' : 'Brake Type'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.brakeType} onValueChange={(value) => updateField('brakeType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn loại phanh' : 'Select brake type'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rim Brake">Phanh Vành (Rim Brake)</SelectItem>
                        <SelectItem value="Mechanical Disc Brake">Phanh Đĩa Cơ</SelectItem>
                        <SelectItem value="Hydraulic Disc Brake">Phanh Đĩa Thủy Lực</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paint">
                      {language === 'vi' ? 'Màu Sơn' : 'Paint Color'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="paint"
                      placeholder={language === 'vi' ? 'VD: Đen bóng / Nhám' : 'E.g., Gloss Black'}
                      value={formData.paint}
                      onChange={(e) => updateField('paint', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="overall">
                      {language === 'vi' ? 'Khấu Hao / Đánh Giá (%)' : 'Overall Condition'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="overall"
                      placeholder={language === 'vi' ? 'VD: Xe mới 95%, ít xước xát' : 'E.g., 95% like new'}
                      value={formData.overall}
                      onChange={(e) => updateField('overall', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      {language === 'vi' ? 'Trọng Lượng (kg)' : 'Weight (kg)'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="7.5"
                      value={formData.weight}
                      onChange={(e) => updateField('weight', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="serial">
                      {language === 'vi' ? 'Số Serial' : 'Serial Number'} <span className="text-red-500">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">
                            {language === 'vi'
                              ? 'Số serial giúp xác minh nguồn gốc xe và ngăn chặn hàng gian lận'
                              : 'Serial number helps verify bike origin and prevent fraud'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="serial"
                    placeholder="VD: GNT2023TCR001234"
                    value={formData.serial}
                    onChange={(e) => updateField('serial', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usageHistory">{language === 'vi' ? 'Lịch Sử Sử Dụng' : 'Usage History'}</Label>
                  <Textarea
                    id="usageHistory"
                    placeholder={
                      language === 'vi'
                        ? 'VD: 3000km trong 18 tháng, chủ yếu đi weekend, bảo dưỡng định kỳ'
                        : 'E.g., 3000km in 18 months, mostly weekend rides, regular maintenance'
                    }
                    rows={3}
                    value={formData.usageHistory}
                    onChange={(e) => updateField('usageHistory', e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      {language === 'vi' ? 'Thành Phố' : 'City'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.city} onValueChange={(value) => updateField('city', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn thành phố' : 'Select city'} />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                
                {/* Images */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">
                      {language === 'vi' ? 'Hình Ảnh Xe' : 'Bike Photos'} <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi'
                        ? 'Tải lên ít nhất 1 ảnh chất lượng cao (tối đa 10 ảnh)'
                        : 'Upload at least 1 high-quality photos (max 10)'}
                    </p>
                  </div>

                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    ref={imagesInputRef} 
                    onChange={(e) => handleFileChange(e, 'images')} 
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {displayImageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image src={url} alt={`Bike ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                        {index < existingImageUrls.length ? (
                          <Badge className="absolute top-2 right-2 bg-emerald-600 text-white">
                            {language === 'vi' ? 'Đang giữ' : 'Kept'}
                          </Badge>
                        ) : (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2">{language === 'vi' ? 'Ảnh chính' : 'Main'}</Badge>
                        )}
                      </div>
                    ))}

                    {displayImageUrls.length < 10 && (
                      <button
                        type="button"
                        onClick={() => imagesInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{language === 'vi' ? 'Thêm ảnh' : 'Add photo'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Option */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">{language === 'vi' ? 'Video Thực Tế' : 'Live Video'} (Khuyên dùng)</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Quay 1 vòng quanh xe để tăng độ tin cậy' : 'Take a full 360 tour to increase trust'}
                    </p>
                  </div>
                  <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} />
                  
                  {videoUrl ? (
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                      {video ? (
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => { setVideo(null); if (videoUrl?.startsWith('blob:')) URL.revokeObjectURL(videoUrl); setVideoUrl(mediaSeed.videoUrl); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Badge className="absolute top-2 right-2 bg-emerald-600 text-white">
                          {language === 'vi' ? 'Đang giữ' : 'Kept'}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full aspect-21/9 sm:aspect-21/6 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 border-border hover:border-primary hover:bg-primary/5">
                      <Video className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{language === 'vi' ? 'Tải lên video' : 'Upload video'}</span>
                    </button>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-base">{language === 'vi' ? 'Ảnh Groupset' : 'Groupset Photo'}</Label>
                    </div>
                    <input type="file" accept="image/*" className="hidden" ref={groupsetPhotoInputRef} onChange={(e) => handleFileChange(e, 'groupset')} />
                    
                    {groupsetPhotoUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                         <Image src={groupsetPhotoUrl} alt="Groupset" fill className="object-cover" />
                         <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => { setGroupsetPhoto(null); setGroupsetPhotoUrl(null); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => groupsetPhotoInputRef.current?.click()}
                        className="w-full aspect-video rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 border-border hover:border-primary hover:bg-primary/5"
                      >
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {language === 'vi' ? 'Tải ảnh groupset' : 'Upload groupset photo'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {language === 'vi' ? 'Giá Bán' : 'Selling Price'} (VND) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="text"
                      placeholder="45,000,000"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      className="pl-4 pr-16 text-lg font-semibold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">VND</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'vi'
                      ? 'Nền tảng thu 5% phí trên giá bán khi giao dịch thành công.'
                      : 'Platform takes a 5% fee on selling price upon successful transaction.'}
                  </p>
                </div>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">{language === 'vi' ? 'Tóm Tắt Tin Đăng' : 'Listing Summary'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'vi' ? 'Tiêu đề' : 'Title'}</span>
                      <span className="font-medium">{formData.title || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'vi' ? 'Thương hiệu' : 'Brand'}</span>
                      <span className="font-medium">{formData.brand || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'vi' ? 'Groupset' : 'Groupset'}</span>
                      <span className="font-medium">{formData.groupset || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'vi' ? 'Files đính kèm' : 'Attachments'}</span>
                      <span className="font-medium">{displayImageUrls.length + (videoUrl ? 1 : 0) + (groupsetPhotoUrl ? 1 : 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'vi' ? 'Thành phố' : 'City'}</span>
                      <span className="font-medium">{CITIES.find((c) => c.value === formData.city)?.label || '-'}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg border mb-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">
                        {language === 'vi' ? 'Lưu ý khi cập nhật' : 'Update Note'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === 'vi'
                          ? 'Cập nhật tin sẽ thay đổi các thông tin hiển thị ngay lập tức (nếu là nháp).'
                          : 'Updating listing will change details immediately (if draft).'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkbox gửi duyệt lại — chỉ hiện khi tin đang bị Rejected */}
                {originalStatus === 'rejected' && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 mb-2">
                    <Checkbox
                      id="shouldResubmit"
                      checked={shouldResubmit}
                      onCheckedChange={(checked) => setShouldResubmit(Boolean(checked))}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <label
                        htmlFor="shouldResubmit"
                        className="text-sm font-medium leading-none cursor-pointer text-orange-800 dark:text-orange-200"
                      >
                        {language === 'vi' ? 'Gửi duyệt lại ngay sau khi cập nhật' : 'Resubmit for review after saving'}
                      </label>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        {language === 'vi'
                          ? 'Sau khi lưu, tin sẽ được gửi tới inspector để kiểm duyệt lại. Đảm bảo bạn đã sửa đủ nội dung theo yêu cầu.'
                          : 'After saving, your listing will be sent to an inspector for re-review. Make sure you have addressed all rejection reasons.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || isLoading} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {language === 'vi' ? 'Quay lại' : 'Back'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} disabled={isLoading} className="gap-2">
                {language === 'vi' ? 'Tiếp theo' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="gap-2"
                onClick={handleSubmitForReview}
                disabled={isLoading}
                variant={originalStatus === 'rejected' && shouldResubmit ? 'default' : 'default'}
              >
                {isLoading ? <Upload className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
                {isLoading
                  ? (language === 'vi' ? 'Đang xử lý...' : 'Processing...')
                  : originalStatus === 'rejected' && shouldResubmit
                    ? (language === 'vi' ? 'Lưu & Gửi duyệt lại' : 'Save & Resubmit')
                    : (language === 'vi' ? 'Lưu cập nhật' : 'Save Changes')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
