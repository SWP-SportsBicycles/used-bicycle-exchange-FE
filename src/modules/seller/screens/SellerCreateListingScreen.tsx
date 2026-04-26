'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Camera, Info, ChevronRight, ChevronLeft, Check, AlertCircle, Video } from 'lucide-react'
import { useCreateListing, useSubmitListing, useUploadMedia } from '@/modules/seller/hooks/useSellerListingMutations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { BRANDS, FRAME_SIZES, GROUPSETS, CONDITIONS, CITIES, CATEGORIES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const steps = [
  { id: 'basics', label: { vi: 'Thông Tin Cơ Bản', en: 'Basic Info' } },
  { id: 'specs', label: { vi: 'Thông Số Kỹ Thuật', en: 'Specifications' } },
  { id: 'photos', label: { vi: 'Hình Ảnh', en: 'Photos' } },
  { id: 'pricing', label: { vi: 'Giá & Xuất Bản', en: 'Pricing & Publish' } },
]

export default function SellerCreateListingScreen() {
  const { language } = useLanguage()
  const createListingMutation = useCreateListing()
  const submitListingMutation = useSubmitListing()
  const uploadMediaMutation = useUploadMedia()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    brand: '',
    model: '',
    condition: '',
    description: '',
    frameSize: '',
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

  // State for files
  const [images, setImages] = useState<File[]>([])
  const [video, setVideo] = useState<File | null>(null)
  const [groupsetPhoto, setGroupsetPhoto] = useState<File | null>(null)

  // Object URLs for preview
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [groupsetPhotoUrl, setGroupsetPhotoUrl] = useState<string | null>(null)

  // File input refs
  const imagesInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const groupsetPhotoInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach(URL.revokeObjectURL)
      if (videoUrl) URL.revokeObjectURL(videoUrl)
      if (groupsetPhotoUrl) URL.revokeObjectURL(groupsetPhotoUrl)
    }
  }, [imageUrls, videoUrl, groupsetPhotoUrl])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'images' | 'video' | 'groupset'
  ) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (type === 'images') {
      const newImages = [...images, ...files].slice(0, 10 - images.length)
      setImages(newImages)
      setImageUrls(newImages.map(file => URL.createObjectURL(file)))
    } else if (type === 'video') {
      const file = files[0]
      setVideo(file)
      if (videoUrl) URL.revokeObjectURL(videoUrl)
      setVideoUrl(URL.createObjectURL(file))
    } else if (type === 'groupset') {
      const file = files[0]
      setGroupsetPhoto(file)
      if (groupsetPhotoUrl) URL.revokeObjectURL(groupsetPhotoUrl)
      setGroupsetPhotoUrl(URL.createObjectURL(file))
    }
    
    // Clear input
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newUrls = imageUrls.filter((_, i) => i !== index)
    URL.revokeObjectURL(imageUrls[index])
    setImages(newImages)
    setImageUrls(newUrls)
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

  const handleSubmitForReview = async () => {
    setSubmitError(null)
    setSubmitSuccess(null)

    // Basic validation
    if (
      !formData.title || !formData.category || !formData.brand || !formData.price ||
      !formData.city || !formData.brakeType || !formData.paint || !formData.overall || !formData.serial
    ) {
      setSubmitError(language === 'vi' ? 'Vui lòng điền đầy đủ các trường bắt buộc (*).' : 'Please fill all required fields (*).')
      return
    }

    if (images.length === 0) {
      setSubmitError(language === 'vi' ? 'Cần ít nhất 1 ảnh xe.' : 'At least 1 bike photo is required.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Tạo listing
      const priceVal = Number(String(formData.price).replace(/,/g, ''))
      const payload = {
        title: formData.title,
        description: formData.description,
        serialNumber: formData.serial,
        category: formData.category,
        brand: formData.brand,
        frameSize: formData.frameSize,
        frameMaterial: formData.frameMaterial,
        condition: formData.condition,
        groupset: formData.groupset,
        operating: formData.usageHistory,
        tireRim: formData.wheelSize,
        price: priceVal,
        city: formData.city,
        paint: formData.paint || 'N/A', // fallback if empty but now added to UI
        overall: formData.overall || 'N/A',
        brakeType: formData.brakeType || 'Chưa Xách Định',
      }

      const createRes = await createListingMutation.mutateAsync(payload)
      const rawData = typeof createRes === 'object' && createRes !== null ? createRes as Record<string, unknown> : {} as Record<string, unknown>
      const nested = rawData.data && typeof rawData.data === 'object' ? rawData.data as Record<string, unknown> : rawData
      const rawId = nested.id ?? nested.listingId
      const listingId = typeof rawId === 'string' ? rawId : String(rawId ?? '')
      
      if (!listingId) {
        throw new Error('Failed to retrieve listingId from response')
      }

      // 2. Upload media
      const allMediaFiles = [...images, video, groupsetPhoto].filter(Boolean) as File[]
      if (allMediaFiles.length > 0) {
        await uploadMediaMutation.mutateAsync({ listingId, files: allMediaFiles })
      }

      // 3. Gửi duyệt (submit)
      await submitListingMutation.mutateAsync(listingId)

      setSubmitSuccess(
        language === 'vi'
          ? 'Đã gửi tin đăng lên hệ thống, vui lòng chờ admin duyệt.'
          : 'Listing submitted successfully and is awaiting admin review.'
      )
      
      // Reset form on success
      setTimeout(() => {
        window.location.href = '/seller/listings'
      }, 2000)

    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : language === 'vi'
            ? 'Không thể gửi tin lúc này. Vui lòng thử lại.'
            : 'Unable to submit listing right now. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
                  <Label htmlFor="title">{language === 'vi' ? 'Tiêu đề' : 'Title'} *</Label>
                  <Input
                    id="title"
                    placeholder={language === 'vi' ? 'VD: Giant TCR Advanced Pro 1 - Full Carbon' : 'E.g., Giant TCR Advanced Pro 1 - Full Carbon'}
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === 'vi' ? 'Loại Xe' : 'Category'} *</Label>
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
                    <Label>{language === 'vi' ? 'Tình Trạng' : 'Condition'} *</Label>
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
                    <Label htmlFor="brand">{language === 'vi' ? 'Thương Hiệu' : 'Brand'} *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="model">{language === 'vi' ? 'Model' : 'Model'}</Label>
                    <Input
                      id="model"
                      placeholder={language === 'vi' ? 'VD: TCR Advanced Pro 1' : 'E.g., TCR Advanced Pro 1'}
                      value={formData.model}
                      onChange={(e) => updateField('model', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{language === 'vi' ? 'Mô Tả' : 'Description'} *</Label>
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
                    <Label htmlFor="frameSize">{language === 'vi' ? 'Kích Cỡ Khung' : 'Frame Size'} *</Label>
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
                        <SelectItem value="carbon">Carbon</SelectItem>
                        <SelectItem value="alloy">Alloy</SelectItem>
                        <SelectItem value="steel">Steel</SelectItem>
                        <SelectItem value="titanium">Titanium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="groupset">{language === 'vi' ? 'Bộ Truyền Động' : 'Groupset'} *</Label>
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
                    <Label htmlFor="wheelSize">{language === 'vi' ? 'Cỡ Bánh' : 'Wheel Size'}</Label>
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
                    <Label htmlFor="brakeType">{language === 'vi' ? 'Loại Phanh' : 'Brake Type'} *</Label>
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
                    <Label htmlFor="paint">{language === 'vi' ? 'Màu Sơn' : 'Paint Color'} *</Label>
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
                    <Label htmlFor="overall">{language === 'vi' ? 'Khấu Hao / Đánh Giá (%)' : 'Overall Condition'} *</Label>
                    <Input
                      id="overall"
                      placeholder={language === 'vi' ? 'VD: Xe mới 95%, ít xước xát' : 'E.g., 95% like new'}
                      value={formData.overall}
                      onChange={(e) => updateField('overall', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="serial">{language === 'vi' ? 'Số Serial' : 'Serial Number'} *</Label>
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
                    <Label htmlFor="city">{language === 'vi' ? 'Thành Phố' : 'City'} *</Label>
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
                    <Label className="text-base">{language === 'vi' ? 'Hình Ảnh Xe' : 'Bike Photos'} *</Label>
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
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => { setVideo(null); setVideoUrl(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full aspect-[21/9] sm:aspect-[21/6] rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 border-border hover:border-primary hover:bg-primary/5">
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
                  <Label htmlFor="price">{language === 'vi' ? 'Giá Bán' : 'Selling Price'} (VND) *</Label>
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
              <Button onClick={nextStep} disabled={isSubmitting} className="gap-2">
                {language === 'vi' ? 'Tiếp theo' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="gap-2" onClick={handleSubmitForReview} disabled={isSubmitting}>
                {isSubmitting ? <Upload className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
                {isSubmitting ? (language === 'vi' ? 'Đang gửi...' : 'Submitting...') : (language === 'vi' ? 'Gửi Duyệt' : 'Submit for Review')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
