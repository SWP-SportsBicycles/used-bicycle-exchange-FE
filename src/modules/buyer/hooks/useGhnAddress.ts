'use client'

import { useQuery } from '@tanstack/react-query'
import { ghnApi } from '@/lib/api/buyer-api'

export interface Province {
  ProvinceID: number
  ProvinceName: string
}

export interface District {
  DistrictID: number
  DistrictName: string
}

export interface Ward {
  WardCode: string
  WardName: string
}

export function useProvinces() {
  return useQuery({
    queryKey: ['ghn-provinces'],
    queryFn: async () => {
      const res = await ghnApi.getProvinces()
      return (res.data || []) as Province[]
    },
    staleTime: Infinity,
  })
}

export function useDistricts(provinceId?: number) {
  return useQuery({
    queryKey: ['ghn-districts', provinceId],
    queryFn: async () => {
      if (!provinceId) return []
      const res = await ghnApi.getDistricts(provinceId)
      return (res.data || []) as District[]
    },
    enabled: !!provinceId,
    staleTime: Infinity,
  })
}

export function useWards(districtId?: number) {
  return useQuery({
    queryKey: ['ghn-wards', districtId],
    queryFn: async () => {
      if (!districtId) return []
      const res = await ghnApi.getWards(districtId)
      return (res.data || []) as Ward[]
    },
    enabled: !!districtId,
    staleTime: Infinity,
  })
}
