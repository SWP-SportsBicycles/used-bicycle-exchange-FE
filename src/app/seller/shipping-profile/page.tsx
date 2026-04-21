'use client'

import { useEffect, useMemo, useState } from 'react'
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
}

function isNotFoundError(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return message.includes('not found') || message.includes('404')
}

export default function SellerShippingProfilePage() {
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
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null)

  const redirectTarget = useMemo(() => searchParams.get('redirect') ?? '/seller', [searchParams])

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

  // Auto-deduce province ID if we only have the name from profile loading
  useEffect(() => {
    if (provinces.length > 0 && form.fromProvinceName && !selectedProvinceId) {
      const p = provinces.find(x => x.provinceName === form.fromProvinceName)
      if (p) {
        setSelectedProvinceId(p.provinceId)
      }
    }
  }, [provinces, form.fromProvinceName, selectedProvinceId])

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvinceId) {
      locationApi.getDistricts(selectedProvinceId).then(setDistricts).catch(console.error)
    } else {
      setDistricts([])
    }
  }, [selectedProvinceId])

  // Fetch wards when district changes
  useEffect(() => {
    const dId = Number(form.fromDistrictId)
    if (dId > 0) {
      locationApi.getWards(dId).then(setWards).catch(console.error)
    } else {
      setWards([])
    }
  }, [form.fromDistrictId])

  const updateField = (field: keyof ShippingProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleProvinceChange = (provinceIdStr: string) => {
    const id = Number(provinceIdStr)
    setSelectedProvinceId(id)
    const pname = provinces.find(p => p.provinceId === id)?.provinceName || ''
    
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

    if (!form.senderName || !form.senderPhone || !form.senderAddress || !form.fromWardCode || !selectedProvinceId) {
      setErrorMessage(language === 'vi' ? 'Vui lòng nhập đầy đủ thông tin bắt buộc' : 'Please complete all required fields')
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
            {language === 'vi' ? 'Cập nhật địa chỉ lấy hàng' : 'Update pickup address'}
          </CardTitle>
          <CardDescription>
            {language === 'vi'
              ? 'Thông tin này dùng để shipper đến lấy hàng và hệ thống tính phí vận chuyển.'
              : 'This information is used for shipment pickup and shipping fee estimation.'}
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

              <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {language === 'vi' ? 'Lưu địa chỉ gửi hàng' : 'Save shipping profile'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
