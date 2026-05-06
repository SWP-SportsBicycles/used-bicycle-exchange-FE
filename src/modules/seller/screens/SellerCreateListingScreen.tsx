'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, X, Camera, Info, ChevronRight, ChevronLeft, Check, AlertCircle, Video } from 'lucide-react'
import { useCreateListing, useSubmitListing, useUpdateListing, useUploadMedia } from '@/modules/seller/hooks/useSellerListingMutations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLanguage } from '@/lib/language-context'
import { BRANDS, FRAME_SIZES, GROUPSETS, CONDITIONS, CITIES, CATEGORIES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const steps = [
  { id: 'basics', label: { vi: 'Thông Tin Cơ Bản', en: 'Basic Info' } },
  { id: 'specs', label: { vi: 'Thông Số Kỹ Thuật', en: 'Specifications' } },
  { id: 'photos', label: { vi: 'Hình Ảnh', en: 'Photos' } },
  { id: 'pricing', label: { vi: 'Giá & Xuất Bản', en: 'Pricing & Publish' } },
]

const DRAFT_FORM_KEY = 'sellerListingDraftForm'
const DRAFT_ID_KEY = 'sellerListingDraftId'

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

const normalizeSellerCity = (value: string): string => {
  const raw = value.trim()
  if (!raw) return raw
  const normalized = raw
    .toLowerCase()
    .replace(/[._/-]+/g, ' ')
    .replace(/\s+/g, ' ')

  if (normalized === 'hanoi' || normalized.includes('ha noi')) return 'Hà Nội'
  if (normalized === 'danang' || normalized.includes('da nang')) return 'Đà Nẵng'
  if (normalized === 'hcm') return 'TP.HCM'
  if (normalized.includes('tp hcm') || normalized.includes('tphcm') || normalized.includes('ho chi minh')) {
    return 'TP.HCM'
  }
  return raw
}

const hasAnyDraftData = (data: Record<string, string>) =>
  Object.values(data).some((value) => value.trim().length > 0)

const isReadyForApiDraft = (data: Record<string, string>) =>
  Boolean(
    data.title && data.category && data.brand && data.price &&
    data.city && data.brakeType && data.paint && data.overall && data.serial &&
    data.weight && data.frameSize && data.condition && data.groupset && data.wheelSize
  )

export default function SellerCreateListingScreen() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const createListingMutation = useCreateListing()
  const updateListingMutation = useUpdateListing()
  const submitListingMutation = useSubmitListing()
  const uploadMediaMutation = useUploadMedia()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftListingId, setDraftListingId] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    brand: '',
    condition: '',
    description: '',
    frameSize: '',
    weight: '',
    frameMaterial: '',
    groupset: '',
    wheelSize: '',
    usageHistory: '',
    serial: '',
    city: '',
    price: '',
    paint: '',
    brakeType: '',
    overall: '',
  })

  const formDataRef = useRef(formData)
  const draftIdRef = useRef(draftListingId)
  const isSubmittingRef = useRef(isSubmitting)
  const hasSavedDraftRef = useRef(false)
  // Flag để ngăn saveDraftOnExit chạy sau khi submit thành công
  const hasSubmittedRef = useRef(false)
  // Khi bắt đầu form mới (?new=1), chờ user nhập gì mới save vào localStorage
  const isNewListingRef = useRef(searchParams.get('new') === '1')

  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  useEffect(() => {
    draftIdRef.current = draftListingId
  }, [draftListingId])

  useEffect(() => {
    isSubmittingRef.current = isSubmitting
  }, [isSubmitting])

  useEffect(() => {
    if (!isConfirmOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasAgreedTerms(false)
    }
  }, [isConfirmOpen])

  // State for files
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [groupsetPhoto, setGroupsetPhoto] = useState<File | null>(null)

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
      if (images.length === 0) errors.images = isVi ? 'Cần ít nhất 1 ảnh xe.' : 'At least 1 bike photo is required.'
    }

    if (stepIndex === 3) {
      const priceValue = Number(String(formData.price).replace(/,/g, ''))
      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        errors.price = isVi ? 'Vui lòng nhập giá bán hợp lệ.' : 'Please enter a valid price.'
      }
    }

    return errors
  }

  useEffect(() => {
    const nextErrors = validateStep(currentStep)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFieldErrors((prev) => {
      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(nextErrors)
      if (
        prevKeys.length === nextKeys.length &&
        prevKeys.every((key) => prev[key] === nextErrors[key])
      ) {
        return prev
      }
      return nextErrors
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, formData, images, language])

  // Object URLs for preview
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
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

  const updateField = (field: string, value: string) => {
    const nextValue = field === 'serial' ? value.toUpperCase() : value
    setFormData((prev) => ({ ...prev, [field]: nextValue }))
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const markTouched = (field: string) => {
    setTouchedFields((prev) => (prev[field] ? prev : { ...prev, [field]: true }))
  }

  const shouldShowError = (field: string) => Boolean(touchedFields[field])


  useEffect(() => {
    if (typeof window === 'undefined') return

    // Nếu user bấm "Tạo tin mới" (có param ?new=1), xóa draft cũ và bắt đầu form trắng
    if (searchParams.get('new') === '1') {
      window.localStorage.removeItem(DRAFT_FORM_KEY)
      window.localStorage.removeItem(DRAFT_ID_KEY)
      return
    }

    const storedForm = window.localStorage.getItem(DRAFT_FORM_KEY)
    if (storedForm) {
      try {
        const parsed = JSON.parse(storedForm) as Partial<typeof formData>
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData((prev) => ({ ...prev, ...parsed }))
      } catch {
        // Ignore malformed storage
      }
    }

    const storedId = window.localStorage.getItem(DRAFT_ID_KEY)
    if (storedId) {
      setDraftListingId(storedId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Nếu bắt đầu với ?new=1 và form vẫn rỗng, bỏ qua — tránh ghi đè localStorage vừa xóa
    if (isNewListingRef.current && !hasAnyDraftData(formData)) return
    // User đã nhập gì đó → reset flag, auto-save bình thường
    isNewListingRef.current = false
    window.localStorage.setItem(DRAFT_FORM_KEY, JSON.stringify(formData))
  }, [formData])

  const clearDraftStorage = () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(DRAFT_FORM_KEY)
    window.localStorage.removeItem(DRAFT_ID_KEY)
  }

  const persistDraftId = (listingId: string) => {
    setDraftListingId(listingId)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DRAFT_ID_KEY, listingId)
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'images' | 'video' | 'groupset'
  ) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (type === 'images') {
      const remainingSlots = Math.max(0, 10 - images.length)
      const accepted = files.slice(0, remainingSlots)
      if (accepted.length === 0) return

      const newImages = [...images, ...accepted]
      setImages(newImages)
      setImageUrls((prev) => [...prev, ...accepted.map(file => createTrackedObjectURL(file))])
      setFieldErrors((prev) => {
        if (!prev.images) return prev
        const next = { ...prev }
        delete next.images
        return next
      })
    } else if (type === 'video') {
      const file = files[0]
      setVideo(file)
      if (videoUrl) {
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
    const targetUrl = imageUrls[index]
    if (targetUrl) {
      URL.revokeObjectURL(targetUrl)
      objectUrlsRef.current.delete(targetUrl)
    }
    const newImages = images.filter((_, i) => i !== index)
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImages(newImages)
    setImageUrls(newUrls)
  }

  const validateAllSteps = () => {
    const stepErrors = [0, 1, 2, 3].map((step) => validateStep(step))
    const firstErrorIndex = stepErrors.findIndex((errors) => Object.keys(errors).length > 0)
    if (firstErrorIndex === -1) {
      setFieldErrors({})
      return true
    }

    setFieldErrors(stepErrors[firstErrorIndex])
    setCurrentStep(firstErrorIndex)
    setSubmitError(language === 'vi' ? 'Vui lòng hoàn tất các trường bắt buộc.' : 'Please complete the required fields.')
    return false
  }

  const isCurrentStepValid = useMemo(
    () => Object.keys(validateStep(currentStep)).length === 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStep, formData, images, language]
  )

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

  const openSubmitConfirm = () => {
    if (!validateAllSteps()) return
    setSubmitError(null)
    setIsConfirmOpen(true)
  }

  const handleSubmitForReview = async () => {
    setSubmitError(null)
    setSubmitSuccess(null)

    if (!validateAllSteps()) return

    setIsSubmitting(true)

    try {
      // 1. Tạo hoặc cập nhật listing nháp
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
        city: normalizeSellerCity(formData.city),
        paint: formData.paint || 'N/A', // fallback if empty but now added to UI
        overall: formData.overall || 'N/A',
        brakeType: formData.brakeType || 'Chưa Xác Định',
      }

      let listingId = draftListingId
      if (listingId) {
        await updateListingMutation.mutateAsync({ listingId, data: payload })
      } else {
        const createRes = await createListingMutation.mutateAsync(payload)
        const rawData = typeof createRes === 'object' && createRes !== null ? createRes as Record<string, unknown> : {} as Record<string, unknown>
        const nested = rawData.data && typeof rawData.data === 'object' ? rawData.data as Record<string, unknown> : rawData
        const rawId = nested.id ?? nested.listingId
        listingId = typeof rawId === 'string' ? rawId : String(rawId ?? '')
        // M1: persistDraftId chỉ khi vừa tạo mới, không gọi thừa khi đã có draftId
        if (listingId) persistDraftId(listingId)
      }

      if (!listingId) {
        throw new Error('Không lấy được ID tin đăng')
      }

      // 2. Upload media
      const allMediaFiles = [...images, video, groupsetPhoto].filter(Boolean) as File[]
      if (allMediaFiles.length > 0) {
        await uploadMediaMutation.mutateAsync({ listingId, files: allMediaFiles })
      }

      // 3. Submit listing for review
      await submitListingMutation.mutateAsync(listingId)

      clearDraftStorage()
      hasSubmittedRef.current = true  // Ngăn saveDraftOnExit chạy khi unmount
      setSubmitSuccess(language === 'vi' ? 'Gửi duyệt tin thành công.' : 'Listing submitted for review.')
      
      // Redirect sau khi thành công
      setTimeout(() => {
        window.location.href = `/seller/listings/${listingId}`
      }, 2000)

    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? formatApiErrorMessage(error.message)
          : 'Không thể tạo tin lúc này. Vui lòng thử lại.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveDraftOnExit = async () => {
    if (hasSubmittedRef.current) return  // Đã submit thành công, không lưu draft nữa
    if (isSubmittingRef.current) return
    if (hasSavedDraftRef.current) return
    hasSavedDraftRef.current = true

    const data = formDataRef.current
    if (!hasAnyDraftData(data)) {
      hasSavedDraftRef.current = false
      return
    }

    const draftId = draftIdRef.current
    // Chỉ gọi API nếu data đủ điều kiện — tránh ghi đè dữ liệu hợp lệ với payload thiếu field
    if (!isReadyForApiDraft(data)) {
      hasSavedDraftRef.current = false
      return
    }

    try {
      const priceVal = Number(String(data.price).replace(/,/g, ''))
      const payload = {
        title: data.title,
        description: data.description,
        serialNumber: data.serial.toUpperCase(),
        category: data.category,
        brand: data.brand,
        frameSize: data.frameSize,
        weight: Number(data.weight),
        frameMaterial: data.frameMaterial,
        condition: data.condition,
        groupset: data.groupset,
        operating: data.usageHistory,
        tireRim: data.wheelSize,
        price: Number.isFinite(priceVal) ? priceVal : 0,
        city: normalizeSellerCity(data.city),
        paint: data.paint || 'N/A',
        overall: data.overall || 'N/A',
        brakeType: data.brakeType || 'Chưa Xác Định',
      }

      if (draftId) {
        await updateListingMutation.mutateAsync({ listingId: draftId, data: payload })
      } else {
        const createRes = await createListingMutation.mutateAsync(payload)
        const rawData = typeof createRes === 'object' && createRes !== null ? createRes as Record<string, unknown> : {} as Record<string, unknown>
        const nested = rawData.data && typeof rawData.data === 'object' ? rawData.data as Record<string, unknown> : rawData
        const rawId = nested.id ?? nested.listingId
        const listingId = typeof rawId === 'string' ? rawId : String(rawId ?? '')
        if (listingId) {
          persistDraftId(listingId)
        }
      }
    } catch {
      // Best-effort draft save; ignore errors on exit
    } finally {
      hasSavedDraftRef.current = false
    }
  }

  useEffect(() => {
    const handlePageHide = () => {
      void saveDraftOnExit()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void saveDraftOnExit()
      }
    }

    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void saveDraftOnExit()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {language === 'vi' ? 'Tạo Tin Đăng Mới' : 'Create New Listing'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'vi' ? 'Điền thông tin chi tiết về xe đạp của bạn' : 'Fill in the details about your bicycle'}
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
                    onBlur={() => markTouched('title')}
                  />
                  {fieldErrors.title && shouldShowError('title') && (
                    <p className="text-xs text-destructive">{fieldErrors.title}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      {language === 'vi' ? 'Loại Xe' : 'Category'} <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.category}
                      onValueChange={(value) => updateField('category', value)}
                      onBlur={() => markTouched('category')}
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
                    {fieldErrors.category && shouldShowError('category') && (
                      <p className="text-xs text-destructive">{fieldErrors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {language === 'vi' ? 'Tình Trạng' : 'Condition'} <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={formData.condition}
                      onValueChange={(value) => updateField('condition', value)}
                      onBlur={() => markTouched('condition')}
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
                    {fieldErrors.condition && shouldShowError('condition') && (
                      <p className="text-xs text-destructive">{fieldErrors.condition}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brand">
                      {language === 'vi' ? 'Thương Hiệu' : 'Brand'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.brand} onValueChange={(value) => updateField('brand', value)}>
                      <SelectTrigger onBlur={() => markTouched('brand')}>
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
                    {fieldErrors.brand && shouldShowError('brand') && (
                      <p className="text-xs text-destructive">{fieldErrors.brand}</p>
                    )}
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
                    onBlur={() => markTouched('description')}
                  />
                  {fieldErrors.description && shouldShowError('description') && (
                    <p className="text-xs text-destructive">{fieldErrors.description}</p>
                  )}
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
                      <SelectTrigger onBlur={() => markTouched('frameSize')}>
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
                    {fieldErrors.frameSize && shouldShowError('frameSize') && (
                      <p className="text-xs text-destructive">{fieldErrors.frameSize}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frameMaterial">{language === 'vi' ? 'Chất Liệu Khung' : 'Frame Material'}</Label>
                    <Select value={formData.frameMaterial} onValueChange={(value) => updateField('frameMaterial', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn chất liệu' : 'Select material'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carbon">Carbon</SelectItem>
                        <SelectItem value="alloy">Hợp kim</SelectItem>
                        <SelectItem value="steel">Thép</SelectItem>
                        <SelectItem value="titanium">Titan</SelectItem>
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
                      <SelectTrigger onBlur={() => markTouched('groupset')}>
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
                    {fieldErrors.groupset && shouldShowError('groupset') && (
                      <p className="text-xs text-destructive">{fieldErrors.groupset}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wheelSize">
                      {language === 'vi' ? 'Cỡ Bánh' : 'Wheel Size'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.wheelSize} onValueChange={(value) => updateField('wheelSize', value)}>
                      <SelectTrigger onBlur={() => markTouched('wheelSize')}>
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
                    {fieldErrors.wheelSize && shouldShowError('wheelSize') && (
                      <p className="text-xs text-destructive">{fieldErrors.wheelSize}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brakeType">
                      {language === 'vi' ? 'Loại Phanh' : 'Brake Type'} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.brakeType} onValueChange={(value) => updateField('brakeType', value)}>
                      <SelectTrigger onBlur={() => markTouched('brakeType')}>
                        <SelectValue placeholder={language === 'vi' ? 'Chọn loại phanh' : 'Select brake type'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rim Brake">Phanh Vành (Rim Brake)</SelectItem>
                        <SelectItem value="Mechanical Disc Brake">Phanh Đĩa Cơ</SelectItem>
                        <SelectItem value="Hydraulic Disc Brake">Phanh Đĩa Thủy Lực</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.brakeType && shouldShowError('brakeType') && (
                      <p className="text-xs text-destructive">{fieldErrors.brakeType}</p>
                    )}
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
                      onBlur={() => markTouched('paint')}
                    />
                    {fieldErrors.paint && shouldShowError('paint') && (
                      <p className="text-xs text-destructive">{fieldErrors.paint}</p>
                    )}
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
                      onBlur={() => markTouched('overall')}
                    />
                    {fieldErrors.overall && shouldShowError('overall') && (
                      <p className="text-xs text-destructive">{fieldErrors.overall}</p>
                    )}
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
                      onBlur={() => markTouched('weight')}
                    />
                    {fieldErrors.weight && shouldShowError('weight') && (
                      <p className="text-xs text-destructive">{fieldErrors.weight}</p>
                    )}
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
                    onBlur={() => markTouched('serial')}
                  />
                  {fieldErrors.serial && shouldShowError('serial') && (
                    <p className="text-xs text-destructive">{fieldErrors.serial}</p>
                  )}
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
                      <SelectTrigger onBlur={() => markTouched('city')}>
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
                    {fieldErrors.city && shouldShowError('city') && (
                      <p className="text-xs text-destructive">{fieldErrors.city}</p>
                    )}
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
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image src={url} alt={`Bike ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2">{language === 'vi' ? 'Ảnh chính' : 'Main'}</Badge>
                        )}
                      </div>
                    ))}

                    {images.length < 10 && (
                      <button
                        type="button"
                        onClick={() => {
                          markTouched('images')
                          imagesInputRef.current?.click()
                        }}
                        className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{language === 'vi' ? 'Thêm ảnh' : 'Add photo'}</span>
                      </button>
                    )}
                  </div>
                  {fieldErrors.images && shouldShowError('images') && (
                    <p className="text-xs text-destructive">{fieldErrors.images}</p>
                  )}
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
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => { setVideo(null); setVideoUrl(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
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
                      onBlur={() => markTouched('price')}
                      className="pl-4 pr-16 text-lg font-semibold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">VND</span>
                  </div>
                  {fieldErrors.price && shouldShowError('price') && (
                    <p className="text-xs text-destructive">{fieldErrors.price}</p>
                  )}
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
                      <span className="font-medium">{[...images, video, groupsetPhoto].filter(Boolean).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'vi' ? 'Thành phố' : 'City'}</span>
                      <span className="font-medium">{CITIES.find((c) => c.value === formData.city)?.label || '-'}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">{language === 'vi' ? 'Lưu ý quan trọng' : 'Important Notice'}</p>
                    <p className="text-muted-foreground mt-1">
                      {language === 'vi'
                        ? 'Tin đăng của bạn sẽ được gửi tới Admin để duyệt trước khi xuất bản.'
                        : 'Your listing will be reviewed by an Admin before being published.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {language === 'vi' ? 'Quay lại' : 'Back'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} disabled={isSubmitting || !isCurrentStepValid} className="gap-2">
                {language === 'vi' ? 'Tiếp theo' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="gap-2" onClick={openSubmitConfirm} disabled={isSubmitting || !isCurrentStepValid}>
                {isSubmitting ? <Upload className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
                {isSubmitting ? 'Đang gửi...' : 'Gửi duyệt'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'vi' ? 'Xác nhận gửi duyệt tin đăng' : 'Confirm listing submission'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'vi'
                ? 'Vui lòng kiểm tra lại toàn bộ thông tin, hình ảnh và giá bán. Tin đăng sẽ được chuyển tới quản trị viên xét duyệt. Hãy đọc kỹ điều khoản người dùng trước khi xác nhận.'
                : 'Please review all information, photos, and pricing. Your listing will be sent for admin review. Read the user terms carefully before confirming.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label
            htmlFor="create-terms-ack"
            className="flex cursor-pointer items-start gap-2 rounded-md border border-border/70 bg-muted/20 p-3 text-sm text-foreground"
          >
            <Checkbox
              id="create-terms-ack"
              checked={hasAgreedTerms}
              onCheckedChange={(value) => setHasAgreedTerms(Boolean(value))}
              className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border-2 border-primary/50 bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <span>
              {language === 'vi'
                ? 'Tôi đã đọc và đồng ý với điều khoản người dùng.'
                : 'I have read and agree to the user terms.'}
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitForReview} disabled={!hasAgreedTerms || isSubmitting}>
              {isSubmitting ? (language === 'vi' ? 'Đang gửi...' : 'Submitting...') : language === 'vi' ? 'Xác nhận' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
