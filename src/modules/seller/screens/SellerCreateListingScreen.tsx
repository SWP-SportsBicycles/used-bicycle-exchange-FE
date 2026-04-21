'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Camera, Info, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react'
import { useCreateListing } from '@/modules/seller/hooks/useSellerListingMutations'
import { listingSchema } from '@/modules/seller/schemas/listing-schema'
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
  const [currentStep, setCurrentStep] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
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
    images: [] as string[],
    serialPhoto: '',
    groupsetPhoto: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const addMockImage = () => {
    const mockImages = [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80',
    ]
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)]
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, randomImage].slice(0, 10),
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmitForReview = async () => {
    setSubmitError(null)
    setSubmitSuccess(null)

    const medias = [
      ...formData.images.map((image) => ({ image, type: 0 as const })),
      ...(formData.serialPhoto ? [{ image: formData.serialPhoto, type: 0 as const }] : []),
      ...(formData.groupsetPhoto ? [{ image: formData.groupsetPhoto, type: 0 as const }] : []),
    ]

    const payload = {
      title: formData.title,
      description: formData.description,
      serialNumber: formData.serial,
      category: formData.category,
      brand: formData.brand,
      frameSize: formData.frameSize,
      frameMaterial: formData.frameMaterial || undefined,
      condition: formData.condition,
      paint: undefined,
      groupset: formData.groupset,
      operating: formData.usageHistory || undefined,
      tireRim: formData.wheelSize || undefined,
      brakeType: undefined,
      overall: undefined,
      price: Number(String(formData.price).replace(/,/g, '')),
      city: formData.city,
      medias,
    }

    const validationResult = listingSchema.safeParse(payload)
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0]
      setSubmitError(firstIssue?.message ?? (language === 'vi' ? 'Du lieu khong hop le' : 'Invalid listing data'))
      return
    }

    try {
      await createListingMutation.mutateAsync(validationResult.data)
      setSubmitSuccess(
        language === 'vi'
          ? 'Da gui tin dang len he thong, vui long cho admin duyet.'
          : 'Listing submitted successfully and is awaiting admin review.',
      )
      setCurrentStep(0)
      setFormData({
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
        images: [],
        serialPhoto: '',
        groupsetPhoto: '',
      })
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : language === 'vi'
            ? 'Khong the gui tin luc nay. Vui long thu lai.'
            : 'Unable to submit listing right now. Please try again.',
      )
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
            {currentStep === 2 && (language === 'vi' ? 'Tải lên hình ảnh chất lượng cao' : 'Upload high-quality photos')}
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
                    <Label htmlFor="model">{language === 'vi' ? 'Model' : 'Model'} *</Label>
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
                    <Label htmlFor="frameMaterial">{language === 'vi' ? 'Chất Liệu Khung' : 'Frame Material'} *</Label>
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
                    <Label htmlFor="wheelSize">{language === 'vi' ? 'Cỡ Bánh' : 'Wheel Size'} *</Label>
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
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">{language === 'vi' ? 'Hình Ảnh Xe' : 'Bike Photos'} *</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi'
                        ? 'Tải lên ít nhất 3 ảnh chất lượng cao (tối đa 10 ảnh)'
                        : 'Upload at least 3 high-quality photos (max 10)'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image src={img} alt={`Bike ${index + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
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

                    {formData.images.length < 10 && (
                      <button
                        type="button"
                        onClick={addMockImage}
                        className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{language === 'vi' ? 'Thêm ảnh' : 'Add photo'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-base">{language === 'vi' ? 'Ảnh Số Serial' : 'Serial Number Photo'} *</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              {language === 'vi'
                                ? 'Ảnh rõ ràng của số serial trên khung xe để admin xác minh'
                                : 'Clear photo of serial number on frame for admin verification'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField('serialPhoto', 'mock-serial-photo.jpg')}
                      className={cn(
                        'w-full aspect-video rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2',
                        formData.serialPhoto ? 'border-success bg-success/10' : 'border-border hover:border-primary hover:bg-primary/5',
                      )}
                    >
                      {formData.serialPhoto ? (
                        <>
                          <Check className="h-8 w-8 text-success" />
                          <span className="text-sm text-success">{language === 'vi' ? 'Đã tải lên' : 'Uploaded'}</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {language === 'vi' ? 'Tải ảnh số serial' : 'Upload serial photo'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-base">{language === 'vi' ? 'Ảnh Groupset' : 'Groupset Photo'} *</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">
                              {language === 'vi'
                                ? 'Ảnh rõ ràng của bộ truyền động để xác minh model'
                                : 'Clear photo of groupset to verify model'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField('groupsetPhoto', 'mock-groupset-photo.jpg')}
                      className={cn(
                        'w-full aspect-video rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2',
                        formData.groupsetPhoto ? 'border-success bg-success/10' : 'border-border hover:border-primary hover:bg-primary/5',
                      )}
                    >
                      {formData.groupsetPhoto ? (
                        <>
                          <Check className="h-8 w-8 text-success" />
                          <span className="text-sm text-success">{language === 'vi' ? 'Đã tải lên' : 'Uploaded'}</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {language === 'vi' ? 'Tải ảnh groupset' : 'Upload groupset photo'}
                          </span>
                        </>
                      )}
                    </button>
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
                      ? 'Phí hoa hồng 5% sẽ được trừ khi giao dịch hoàn tất'
                      : '5% commission fee will be deducted upon completion'}
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
                      <span className="text-muted-foreground">{language === 'vi' ? 'Hình ảnh' : 'Photos'}</span>
                      <span className="font-medium">{formData.images.length} / 10</span>
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
                        ? 'Tin đăng của bạn sẽ được Admin xét duyệt trong 24h. Sau khi duyệt, xe sẽ hiển thị trên marketplace.'
                        : 'Your listing will be reviewed by Admin within 24h. Once approved, it will appear on the marketplace.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {language === 'vi' ? 'Quay lại' : 'Back'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={nextStep} className="gap-2">
                {language === 'vi' ? 'Tiếp theo' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="gap-2" onClick={handleSubmitForReview} disabled={createListingMutation.isPending}>
                {createListingMutation.isPending ? <Upload className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
                {language === 'vi' ? 'Gửi Duyệt' : 'Submit for Review'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
