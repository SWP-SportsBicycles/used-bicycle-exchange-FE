import { http } from '@/lib/api/http'

export interface Province {
  provinceId: number
  provinceName: string
}

export interface District {
  districtId: number
  districtName: string
}

export interface Ward {
  wardCode: string
  wardName: string
}

interface LocationResponse<T> {
  data?: T[]
  isSuccess?: boolean
  message?: string
}

export const locationApi = {
  async getProvinces(): Promise<Province[]> {
    const res = await http.get<LocationResponse<Province>>('/api/location/provinces')
    return res?.data || []
  },

  async getDistricts(provinceId: number): Promise<District[]> {
    const res = await http.get<LocationResponse<District>>(`/api/location/districts?provinceId=${provinceId}`)
    return res?.data || []
  },

  async getWards(districtId: number): Promise<Ward[]> {
    const res = await http.get<LocationResponse<Ward>>(`/api/location/wards?districtId=${districtId}`)
    return res?.data || []
  }
}
