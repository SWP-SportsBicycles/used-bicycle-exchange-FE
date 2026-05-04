'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, MapPinHouse, Save } from 'lucide-react'
import { sellerShippingApi } from '@/lib/api/sellerShippingApi'
import { locationApi, Province, District, Ward } from '@/lib/api/location-api'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ShippingProfileForm = {
  senderName: string
  senderPhone: string
  senderAddress: string
  fromDistrictId: string
  fromWardCode: string
  fromWardName: string
  fromDistrictName: string
  fromProvinceName: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
}

const EMPTY_FORM: ShippingProfileForm = {
  senderName: '',
  senderPhone: '',
  senderAddress: '',
  fromDistrictId: '',
  fromWardCode: '',
  fromWardName: '',
  fromDistrictName: '',
  fromProvinceName: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountName: '',
}

function isNotFoundError(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return message.includes('not found') || message.includes('404') || message.includes('chưa có profile') || message.includes('chua co profile')
}

import { Suspense } from 'react'

export default function SellerShippingProfilePage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-3xl py-10 text-center text-muted-foreground">
        <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
        Đang tải thông tin...
      </div>
    }>
      <ShippingProfileContent />
    </Suspense>
  )
}

function ShippingProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()

  const [form, setForm] = useState<ShippingProfileForm>(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Location mapping states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const hasResolvedProvinceRef = useRef(false)

  const redirectTarget = useMemo(() => searchParams.get('redirect') ?? '/seller', [searchParams])
  const selectedProvinceId = useMemo(() => {
    if (!form.fromProvinceName) return null
    const matchedProvince = provinces.find((province) => province.provinceName === form.fromProvinceName)
    return matchedProvince?.provinceId ?? null
  }, [form.fromProvinceName, provinces])

  // Load provinces on mount
  useEffect(() => {
    locationApi.getProvinces().then(setProvinces).catch(console.error)
  }, [])

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const profile = await sellerShippingApi.getMyProfile()
        if (!active) return
        setForm({
          senderName: profile.senderName ?? '',
          senderPhone: profile.senderPhone ?? '',
          senderAddress: profile.senderAddress ?? '',
          fromDistrictId: profile.fromDistrictId ? String(profile.fromDistrictId) : '',
          fromWardCode: profile.fromWardCode ?? '',
          fromWardName: profile.fromWardName ?? '',
          fromDistrictName: profile.fromDistrictName ?? '',
          fromProvinceName: profile.fromProvinceName ?? '',
          bankName: profile.bankName ?? '',
          bankAccountNumber: profile.bankAccountNumber ?? '',
          bankAccountName: profile.bankAccountName ?? '',
        })
      } catch (error) {
        if (!active) return
        if (!isNotFoundError(error)) {
          setErrorMessage(error instanceof Error ? error.message : language === 'vi' ? 'Khong the tai du lieu dia chi gui hang' : 'Unable to load shipping profile')
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [language])

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvinceId) return
    locationApi.getDistricts(selectedProvinceId).then(setDistricts).catch(console.error)
  }, [selectedProvinceId])

  useEffect(() => {
    if (hasResolvedProvinceRef.current) return
    if (!form.fromDistrictId || form.fromProvinceName || provinces.length === 0) return

    let active = true

    const resolveProvince = async () => {
      for (const province of provinces) {
        try {
          const districtList = await locationApi.getDistricts(province.provinceId)
          if (!active) return
          const matchedDistrict = districtList.find(
            (district) => String(district.districtId) === String(form.fromDistrictId),
          )
          if (matchedDistrict) {
            setDistricts(districtList)
            setForm((prev) => ({
              ...prev,
              fromProvinceName: province.provinceName,
              fromDistrictName: prev.fromDistrictName || matchedDistrict.districtName,
            }))
            hasResolvedProvinceRef.current = true
            return
          }
        } catch {
          // Ignore and continue searching other provinces
        }
      }
      hasResolvedProvinceRef.current = true
    }

    void resolveProvince()

    return () => {
      active = false
    }
  }, [form.fromDistrictId, form.fromProvinceName, provinces])

  // Fetch wards when district changes
  useEffect(() => {
    const dId = Number(form.fromDistrictId)
    if (dId <= 0) return
    locationApi.getWards(dId).then(setWards).catch(console.error)
  }, [form.fromDistrictId])

  useEffect(() => {
    if (!form.fromDistrictId || form.fromDistrictName || districts.length === 0) return
    const matchedDistrict = districts.find(
      (district) => String(district.districtId) === String(form.fromDistrictId),
    )
    if (!matchedDistrict) return
    setForm((prev) => ({
      ...prev,
      fromDistrictName: matchedDistrict.districtName,
    }))
  }, [districts, form.fromDistrictId, form.fromDistrictName])

  useEffect(() => {
    if (!form.fromWardCode || form.fromWardName || wards.length === 0) return
    const matchedWard = wards.find((ward) => ward.wardCode === form.fromWardCode)
    if (!matchedWard) return
    setForm((prev) => ({
      ...prev,
      fromWardName: matchedWard.wardName,
    }))
  }, [form.fromWardCode, form.fromWardName, wards])

  const updateField = (field: keyof ShippingProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleProvinceChange = (provinceIdStr: string) => {
    const id = Number(provinceIdStr)
    const pname = provinces.find(p => p.provinceId === id)?.provinceName || ''
    setDistricts([])
    setWards([])
    
    setForm(prev => ({
      ...prev,
      fromProvinceName: pname,
      fromDistrictId: '',
      fromDistrictName: '',
      fromWardCode: '',
      fromWardName: ''
    }))
  }

  const handleDistrictChange = (districtIdStr: string) => {
    const id = Number(districtIdStr)
    const dname = districts.find(d => d.districtId === id)?.districtName || ''
    setWards([])
    setForm(prev => ({
      ...prev,
      fromDistrictId: districtIdStr,
      fromDistrictName: dname,
      fromWardCode: '',
      fromWardName: ''
    }))
  }

  const handleWardChange = (wardCode: string) => {
    const wname = wards.find(w => w.wardCode === wardCode)?.wardName || ''
    setForm(prev => ({
      ...prev,
      fromWardCode: wardCode,
      fromWardName: wname
    }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const districtId = Number(form.fromDistrictId)
    if (!Number.isFinite(districtId) || districtId <= 0) {
      setErrorMessage(language === 'vi' ? 'Vui lòng chọn Quận/Huyện' : 'Please select a District')
      return
    }

    if (!form.senderName || !form.senderPhone || !form.senderAddress || !form.fromWardCode || !selectedProvinceId || !form.bankName || !form.bankAccountNumber || !form.bankAccountName) {
      setErrorMessage(language === 'vi' ? 'Vui lòng nhập đầy đủ thông tin bắt buộc, bao gồm cả thông tin ngân hàng' : 'Please complete all required fields, including bank information')
      return
    }

    setIsSaving(true)
    try {
      await sellerShippingApi.upsertProfile({
        senderName: form.senderName.trim(),
        senderPhone: form.senderPhone.trim(),
        senderAddress: form.senderAddress.trim(),
        fromDistrictId: districtId,
        fromWardCode: form.fromWardCode.trim(),
        bankName: form.bankName?.trim(),
        bankAccountNumber: form.bankAccountNumber?.trim(),
        bankAccountName: form.bankAccountName?.trim(),
      })
      setSuccessMessage(language === 'vi' ? 'Cập nhật địa chỉ gửi hàng thành công' : 'Shipping profile updated successfully')
      router.push(redirectTarget)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : language === 'vi' ? 'Cập nhật địa chỉ gửi hàng thất bại' : 'Failed to update shipping profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinHouse className="h-5 w-5" />
            {language === 'vi' ? 'Cập nhật thông tin người bán' : 'Update seller information'}
          </CardTitle>
          <CardDescription>
            {language === 'vi'
              ? 'Cập nhật thông tin địa chỉ và tài khoản ngân hàng để nhận thanh toán và giao hàng.'
              : 'Update address and bank information for payment and shipping.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 border-success/30 bg-success/10 text-success">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>{language === 'vi' ? 'Đang tải dữ liệu...' : 'Loading...'}</span>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="senderName">{language === 'vi' ? 'Tên người gửi *' : 'Sender name *'}</Label>
                <Input id="senderName" value={form.senderName} onChange={(e) => updateField('senderName', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderPhone">{language === 'vi' ? 'Số điện thoại người gửi *' : 'Sender phone *'}</Label>
                <Input id="senderPhone" value={form.senderPhone} onChange={(e) => updateField('senderPhone', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderAddress">{language === 'vi' ? 'Địa chỉ người gửi chi tiết (Số nhà, đường) *' : 'Sender specific address *'}</Label>
                <Input id="senderAddress" value={form.senderAddress} onChange={(e) => updateField('senderAddress', e.target.value)} placeholder={language === 'vi' ? 'VD: 12A Ngõ 123 Phố X' : 'E.g., 12A St.'} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{language === 'vi' ? 'Tỉnh/Thành phố *' : 'Province *'}</Label>
                  <Select value={selectedProvinceId ? String(selectedProvinceId) : ''} onValueChange={handleProvinceChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'vi' ? 'Chọn Tỉnh/Thành' : 'Select Province'} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem key={p.provinceId} value={String(p.provinceId)}>
                          {p.provinceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'vi' ? 'Quận/Huyện *' : 'District *'}</Label>
                  <Select value={form.fromDistrictId} onValueChange={handleDistrictChange} disabled={!selectedProvinceId || districts.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'vi' ? 'Chọn Quận/Huyện' : 'Select District'} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d.districtId} value={String(d.districtId)}>
                          {d.districtName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'vi' ? 'Phường/Xã *' : 'Ward *'}</Label>
                  <Select value={form.fromWardCode} onValueChange={handleWardChange} disabled={!form.fromDistrictId || wards.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'vi' ? 'Chọn Phường/Xã' : 'Select Ward'} />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((w) => (
                        <SelectItem key={w.wardCode} value={w.wardCode}>
                          {w.wardName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">
                  {language === 'vi' ? 'Thông tin ngân hàng' : 'Bank Information'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' 
                    ? 'Thông tin tài khoản ngân hàng để nhận thanh toán khi bán xe.' 
                    : 'Bank account information to receive payments when selling bicycles.'}
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="bankName">{language === 'vi' ? 'Ngân hàng *' : 'Bank *'}</Label>
                  <Input 
                    id="bankName" 
                    value={form.bankName || ''} 
                    onChange={(e) => updateField('bankName', e.target.value)}
                    placeholder={language === 'vi' ? 'VD: Vietcombank' : 'E.g., Vietcombank'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">{language === 'vi' ? 'Số tài khoản *' : 'Account Number *'}</Label>
                  <Input 
                    id="bankAccountNumber" 
                    value={form.bankAccountNumber || ''} 
                    onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                    placeholder={language === 'vi' ? 'VD: 1234567890' : 'E.g., 1234567890'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAccountName">{language === 'vi' ? 'Tên chủ tài khoản *' : 'Account Holder Name *'}</Label>
                  <Input 
                    id="bankAccountName" 
                    value={form.bankAccountName || ''} 
                    onChange={(e) => updateField('bankAccountName', e.target.value)}
                    placeholder={language === 'vi' ? 'VD: Nguyễn Văn A' : 'E.g., John Doe'}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {language === 'vi' ? 'Lưu thông tin' : 'Save Information'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
