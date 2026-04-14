'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Camera, 
  Check,
  AlertTriangle,
  X,
  Upload,
  ChevronRight,
  ChevronLeft,
  Info,
  MapPin,
  Phone,
  User
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useLanguage } from '@/lib/language-context'
import { MOCK_INSPECTOR_ASSIGNMENTS, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type CheckStatus = 'pass' | 'warning' | 'fail' | ''

interface ChecklistItemState {
  status: CheckStatus
  notes: string
  photos: string[]
}

const checklistItems = [
  { 
    id: 'frame', 
    label: { vi: 'Khung Xe', en: 'Frame' },
    description: { 
      vi: 'Kiểm tra vết nứt, biến dạng, và độ thẳng của khung', 
      en: 'Check for cracks, deformation, and frame alignment' 
    }
  },
  { 
    id: 'brakes', 
    label: { vi: 'Hệ Thống Phanh', en: 'Brake System' },
    description: { 
      vi: 'Kiểm tra má phanh, dây phanh, và hiệu quả phanh', 
      en: 'Check brake pads, cables, and braking effectiveness' 
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
    id: 'wheels', 
    label: { vi: 'Bánh Xe', en: 'Wheels' },
    description: { 
      vi: 'Kiểm tra vành, nan hoa, và lốp', 
      en: 'Check rims, spokes, and tires' 
    }
  },
  { 
    id: 'suspension', 
    label: { vi: 'Giảm Xóc', en: 'Suspension' },
    description: { 
      vi: 'Kiểm tra phuộc và giảm xóc sau (nếu có)', 
      en: 'Check fork and rear shock (if applicable)' 
    }
  },
]

const steps = [
  { id: 'verify', label: { vi: 'Xác Minh', en: 'Verify' } },
  { id: 'inspect', label: { vi: 'Kiểm Định', en: 'Inspect' } },
  { id: 'summary', label: { vi: 'Tổng Kết', en: 'Summary' } },
]

export default function InspectionPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  
  const assignment = MOCK_INSPECTOR_ASSIGNMENTS.find(a => a.id === params.id) || MOCK_INSPECTOR_ASSIGNMENTS[0]
  
  const [currentStep, setCurrentStep] = useState(0)
  const [serialVerified, setSerialVerified] = useState(false)
  const [serialPhoto, setSerialPhoto] = useState('')
  const [checklist, setChecklist] = useState<Record<string, ChecklistItemState>>(() => 
    Object.fromEntries(checklistItems.map(item => [item.id, { status: '', notes: '', photos: [] }]))
  )
  const [overallNotes, setOverallNotes] = useState('')

  const updateChecklist = (id: string, field: keyof ChecklistItemState, value: ChecklistItemState[keyof ChecklistItemState]) => {
    setChecklist(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }))
  }

  const addMockPhoto = (id: string) => {
    const mockPhoto = `https://images.unsplash.com/photo-${Date.now()}?w=400&q=80`
    setChecklist(prev => ({
      ...prev,
      [id]: { ...prev[id], photos: [...prev[id].photos, mockPhoto].slice(0, 5) }
    }))
  }

  const calculateGrade = (): 'A' | 'B' | 'C' | 'D' | 'F' => {
    const statuses = Object.values(checklist).map(c => c.status)
    const failCount = statuses.filter(s => s === 'fail').length
    const warningCount = statuses.filter(s => s === 'warning').length
    
    if (failCount >= 2) return 'F'
    if (failCount === 1) return 'D'
    if (warningCount >= 3) return 'C'
    if (warningCount >= 1) return 'B'
    return 'A'
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    // Mock submit
    router.push('/inspector')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight truncate">
            {language === 'vi' ? 'Kiểm Định:' : 'Inspect:'} {assignment.listing.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {assignment.listing.brand} {assignment.listing.model} - {formatVND(assignment.listing.price)}
          </p>
        </div>
      </div>

      {/* Seller Info */}
      <Card className="mb-6 bg-muted/50">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{assignment.seller.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{assignment.seller.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{assignment.seller.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  index < currentStep 
                    ? 'bg-success text-success-foreground'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  'text-xs mt-2 hidden sm:block',
                  index === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {step.label[language]}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'h-0.5 w-16 sm:w-32 mx-2',
                  index < currentStep ? 'bg-success' : 'bg-muted'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].label[language]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && (language === 'vi' ? 'Xác minh số serial và thông tin xe' : 'Verify serial number and bike information')}
            {currentStep === 1 && (language === 'vi' ? 'Kiểm tra từng bộ phận của xe' : 'Inspect each component of the bike')}
            {currentStep === 2 && (language === 'vi' ? 'Xem lại và gửi báo cáo' : 'Review and submit report')}
          </CardDescription>
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
                      {assignment.listing.serial}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {language === 'vi' ? 'Chụp Ảnh Số Serial Trên Xe' : 'Photo of Serial on Bike'} *
                    </Label>
                    <button
                      type="button"
                      onClick={() => setSerialPhoto('mock-serial.jpg')}
                      className={cn(
                        'w-full aspect-video max-w-md rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2',
                        serialPhoto 
                          ? 'border-success bg-success/10'
                          : 'border-border hover:border-primary hover:bg-primary/5'
                      )}
                    >
                      {serialPhoto ? (
                        <>
                          <Check className="h-8 w-8 text-success" />
                          <span className="text-sm text-success">
                            {language === 'vi' ? 'Đã chụp' : 'Photo taken'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {language === 'vi' ? 'Chụp ảnh serial' : 'Take serial photo'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="serialVerified"
                      checked={serialVerified}
                      onChange={(e) => setSerialVerified(e.target.checked)}
                      className="h-5 w-5 rounded border-border"
                    />
                    <Label htmlFor="serialVerified" className="cursor-pointer">
                      {language === 'vi' 
                        ? 'Tôi xác nhận số serial trên xe khớp với đăng ký'
                        : 'I confirm the serial on the bike matches the registration'}
                    </Label>
                  </div>
                </div>

                {/* Bike Images Reference */}
                <div className="space-y-2">
                  <Label className="text-base">
                    {language === 'vi' ? 'Hình Ảnh Tham Khảo' : 'Reference Images'}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {assignment.listing.images.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={img} alt={`Bike ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Inspect */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {checklistItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold">{item.label[language]}</h4>
                        <p className="text-sm text-muted-foreground">{item.description[language]}</p>
                      </div>
                      {checklist[item.id].status && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs',
                            checklist[item.id].status === 'pass' && 'bg-success/20 text-success',
                            checklist[item.id].status === 'warning' && 'bg-accent/20 text-accent-foreground',
                            checklist[item.id].status === 'fail' && 'bg-destructive/20 text-destructive'
                          )}
                        >
                          {checklist[item.id].status === 'pass' && (language === 'vi' ? 'Đạt' : 'Pass')}
                          {checklist[item.id].status === 'warning' && (language === 'vi' ? 'Cảnh báo' : 'Warning')}
                          {checklist[item.id].status === 'fail' && (language === 'vi' ? 'Không đạt' : 'Fail')}
                        </Badge>
                      )}
                    </div>

                    {/* Status Selection */}
                    <RadioGroup
                      value={checklist[item.id].status}
                      onValueChange={(value) => updateChecklist(item.id, 'status', value as CheckStatus)}
                      className="flex gap-2 mb-4"
                    >
                      <Label
                        htmlFor={`${item.id}-pass`}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                          checklist[item.id].status === 'pass'
                            ? 'border-success bg-success/10 text-success'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <RadioGroupItem value="pass" id={`${item.id}-pass`} className="sr-only" />
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">{language === 'vi' ? 'Đạt' : 'Pass'}</span>
                      </Label>
                      <Label
                        htmlFor={`${item.id}-warning`}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                          checklist[item.id].status === 'warning'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <RadioGroupItem value="warning" id={`${item.id}-warning`} className="sr-only" />
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{language === 'vi' ? 'Cảnh báo' : 'Warning'}</span>
                      </Label>
                      <Label
                        htmlFor={`${item.id}-fail`}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                          checklist[item.id].status === 'fail'
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border hover:bg-muted'
                        )}
                      >
                        <RadioGroupItem value="fail" id={`${item.id}-fail`} className="sr-only" />
                        <X className="h-4 w-4" />
                        <span className="text-sm font-medium">{language === 'vi' ? 'Không đạt' : 'Fail'}</span>
                      </Label>
                    </RadioGroup>

                    {/* Notes */}
                    <Textarea
                      placeholder={language === 'vi' ? 'Ghi chú về tình trạng...' : 'Notes about condition...'}
                      value={checklist[item.id].notes}
                      onChange={(e) => updateChecklist(item.id, 'notes', e.target.value)}
                      rows={2}
                      className="mb-3"
                    />

                    {/* Photos */}
                    <div className="flex gap-2 flex-wrap">
                      {checklist[item.id].photos.map((_, idx) => (
                        <div key={idx} className="h-16 w-16 rounded-lg bg-success/20 flex items-center justify-center">
                          <Check className="h-6 w-6 text-success" />
                        </div>
                      ))}
                      {checklist[item.id].photos.length < 5 && (
                        <button
                          type="button"
                          onClick={() => addMockPhoto(item.id)}
                          className="h-16 w-16 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
                        >
                          <Camera className="h-5 w-5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Summary */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Overall Grade */}
                <div className="text-center p-6 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'vi' ? 'Đánh Giá Tổng Thể' : 'Overall Grade'}
                  </p>
                  <div className={cn(
                    'inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold',
                    calculateGrade() === 'A' && 'bg-success/20 text-success',
                    calculateGrade() === 'B' && 'bg-primary/20 text-primary',
                    calculateGrade() === 'C' && 'bg-amber-500/20 text-amber-600',
                    calculateGrade() === 'D' && 'bg-orange-500/20 text-orange-600',
                    calculateGrade() === 'F' && 'bg-destructive/20 text-destructive'
                  )}>
                    {calculateGrade()}
                  </div>
                </div>

                {/* Checklist Summary */}
                <div className="space-y-2">
                  <h4 className="font-semibold">
                    {language === 'vi' ? 'Kết Quả Kiểm Tra' : 'Inspection Results'}
                  </h4>
                  <div className="space-y-2">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm">{item.label[language]}</span>
                        <div className="flex items-center gap-2">
                          {checklist[item.id].status === 'pass' && (
                            <Badge variant="outline" className="bg-success/20 text-success">
                              <Check className="h-3 w-3 mr-1" />
                              {language === 'vi' ? 'Đạt' : 'Pass'}
                            </Badge>
                          )}
                          {checklist[item.id].status === 'warning' && (
                            <Badge variant="outline" className="bg-amber-500/20 text-amber-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {language === 'vi' ? 'Cảnh báo' : 'Warning'}
                            </Badge>
                          )}
                          {checklist[item.id].status === 'fail' && (
                            <Badge variant="outline" className="bg-destructive/20 text-destructive">
                              <X className="h-3 w-3 mr-1" />
                              {language === 'vi' ? 'Không đạt' : 'Fail'}
                            </Badge>
                          )}
                          {!checklist[item.id].status && (
                            <Badge variant="outline" className="text-muted-foreground">
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
                  <Label>{language === 'vi' ? 'Ghi Chú Tổng Kết' : 'Summary Notes'}</Label>
                  <Textarea
                    placeholder={language === 'vi' 
                      ? 'Nhận xét tổng quan về xe...' 
                      : 'Overall comments about the bike...'}
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
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
                disabled={currentStep === 0 && !serialVerified}
              >
                {language === 'vi' ? 'Tiếp theo' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2">
                <Check className="h-4 w-4" />
                {language === 'vi' ? 'Gửi Báo Cáo' : 'Submit Report'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
