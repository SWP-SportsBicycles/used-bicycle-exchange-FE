'use client'

import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProvinces, useDistricts, useWards } from '../hooks/useGhnAddress'

export function AddressForm() {
  const { register, setValue, watch, formState: { errors } } = useFormContext()
  
  const provinceId = watch('provinceId')
  const districtId = watch('toDistrictId')

  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces()
  const { data: districts, isLoading: isLoadingDistricts } = useDistricts(provinceId)
  const { data: wards, isLoading: isLoadingWards } = useWards(districtId)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="receiverName">Họ và tên người nhận <span className="text-destructive">*</span></Label>
          <Input id="receiverName" placeholder="Nguyễn Văn A" {...register('receiverName')} />
          {errors.receiverName && <p className="text-xs text-destructive">{errors.receiverName.message as string}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="receiverPhone">Số điện thoại <span className="text-destructive">*</span></Label>
          <Input id="receiverPhone" placeholder="0901234567" {...register('receiverPhone')} />
          {errors.receiverPhone && <p className="text-xs text-destructive">{errors.receiverPhone.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tỉnh/Thành phố <span className="text-destructive">*</span></Label>
          <Select 
            disabled={isLoadingProvinces} 
            onValueChange={(val) => {
              setValue('provinceId', Number(val))
              const prov = provinces?.find(p => p.ProvinceID.toString() === val)
              if (prov) setValue('toProvinceName', prov.ProvinceName)
              setValue('toDistrictId', undefined as unknown as number) // reset cascade
              setValue('toDistrictName', '')
              setValue('toWardCode', '')
              setValue('toWardName', '')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
            </SelectTrigger>
            <SelectContent>
              {provinces?.map(p => (
                <SelectItem key={p.ProvinceID} value={p.ProvinceID.toString()}>{p.ProvinceName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.provinceId && <p className="text-xs text-destructive">Vui lòng chọn Tỉnh/Thành phố</p>}
        </div>

        <div className="space-y-2">
          <Label>Quận/Huyện <span className="text-destructive">*</span></Label>
          <Select 
            disabled={!provinceId || isLoadingDistricts} 
            onValueChange={(val) => {
              setValue('toDistrictId', Number(val))
              const dist = districts?.find(d => d.DistrictID.toString() === val)
              if (dist) setValue('toDistrictName', dist.DistrictName)
              setValue('toWardCode', '')
              setValue('toWardName', '')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn Quận/Huyện" />
            </SelectTrigger>
            <SelectContent>
              {districts?.map(d => (
                <SelectItem key={d.DistrictID} value={d.DistrictID.toString()}>{d.DistrictName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.toDistrictId && <p className="text-xs text-destructive">Vui lòng chọn Quận/Huyện</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phường/Xã <span className="text-destructive">*</span></Label>
          <Select 
            disabled={!districtId || isLoadingWards} 
            onValueChange={(val) => {
              setValue('toWardCode', val)
              const ward = wards?.find(w => w.WardCode === val)
              if (ward) setValue('toWardName', ward.WardName)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn Phường/Xã" />
            </SelectTrigger>
            <SelectContent>
              {wards?.map(w => (
                <SelectItem key={w.WardCode} value={w.WardCode}>{w.WardName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.toWardCode && <p className="text-xs text-destructive">Vui lòng chọn Phường/Xã</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="receiverAddress">Địa chỉ chi tiết (Số nhà, đường) <span className="text-destructive">*</span></Label>
          <Input id="receiverAddress" placeholder="Số 123, Đường ABC..." {...register('receiverAddress')} />
          {errors.receiverAddress && <p className="text-xs text-destructive">{errors.receiverAddress.message as string}</p>}
        </div>
      </div>
    </div>
  )
}
