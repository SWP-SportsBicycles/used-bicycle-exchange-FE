'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, MapPinHouse, Save } from 'lucide-react'
import { sellerShippingApi } from '@/lib/api/sellerShippingApi'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

  const redirectTarget = useMemo(() => searchParams.get('redirect') ?? '/seller', [searchParams])

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

  const updateField = (field: keyof ShippingProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const districtId = Number(form.fromDistrictId)
    if (!Number.isFinite(districtId) || districtId <= 0) {
      setErrorMessage(language === 'vi' ? 'Vui long nhap FromDistrictId hop le' : 'Please enter a valid FromDistrictId')
      return
    }

    if (!form.senderName || !form.senderPhone || !form.senderAddress || !form.fromWardCode) {
      setErrorMessage(language === 'vi' ? 'Vui long nhap day du thong tin bat buoc' : 'Please complete all required fields')
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
        fromWardName: form.fromWardName.trim() || undefined,
        fromDistrictName: form.fromDistrictName.trim() || undefined,
        fromProvinceName: form.fromProvinceName.trim() || undefined,
        isDefault: true,
      })
      setSuccessMessage(language === 'vi' ? 'Cap nhat dia chi gui hang thanh cong' : 'Shipping profile updated successfully')
      router.push(redirectTarget)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : language === 'vi' ? 'Cap nhat dia chi gui hang that bai' : 'Failed to update shipping profile')
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
            <Alert className="mb-4">
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
                <Label htmlFor="senderAddress">{language === 'vi' ? 'Địa chỉ người gửi *' : 'Sender address *'}</Label>
                <Input id="senderAddress" value={form.senderAddress} onChange={(e) => updateField('senderAddress', e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fromDistrictId">FromDistrictId *</Label>
                  <Input id="fromDistrictId" inputMode="numeric" value={form.fromDistrictId} onChange={(e) => updateField('fromDistrictId', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromWardCode">FromWardCode *</Label>
                  <Input id="fromWardCode" value={form.fromWardCode} onChange={(e) => updateField('fromWardCode', e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="fromWardName">{language === 'vi' ? 'Tên phường/xã' : 'Ward name'}</Label>
                  <Input id="fromWardName" value={form.fromWardName} onChange={(e) => updateField('fromWardName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromDistrictName">{language === 'vi' ? 'Tên quận/huyện' : 'District name'}</Label>
                  <Input id="fromDistrictName" value={form.fromDistrictName} onChange={(e) => updateField('fromDistrictName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromProvinceName">{language === 'vi' ? 'Tên tỉnh/thành' : 'Province name'}</Label>
                  <Input id="fromProvinceName" value={form.fromProvinceName} onChange={(e) => updateField('fromProvinceName', e.target.value)} />
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
