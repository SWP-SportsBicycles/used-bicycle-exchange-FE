import { http } from "@/lib/api/http";

export interface SellerShippingProfileRequest {
  senderName: string
  senderPhone: string
  senderAddress: string
  fromDistrictId: number
  fromWardCode: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
}

export interface SellerShippingProfileResponse {
  senderName: string
  senderPhone: string
  senderAddress: string
  fromDistrictId: number
  fromWardCode: string
  fromWardName?: string
  fromDistrictName?: string
  fromProvinceName?: string
  isDefault?: boolean
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
}

export type SellerShippingProfileDraft = Partial<SellerShippingProfileResponse>

function extractPayloadObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const maybe = payload as Record<string, unknown>;
  const nested =
    maybe.data && typeof maybe.data === "object"
      ? (maybe.data as Record<string, unknown>)
      : undefined;
  return nested ?? maybe;
}

function toDraftProfile(payload: unknown): SellerShippingProfileDraft {
  const source = extractPayloadObject(payload);
  const maybeDistrictId =
    typeof source.fromDistrictId === "number"
      ? source.fromDistrictId
      : Number(source.fromDistrictId);

  return {
    senderName: typeof source.senderName === "string" ? source.senderName : undefined,
    senderPhone: typeof source.senderPhone === "string" ? source.senderPhone : undefined,
    senderAddress: typeof source.senderAddress === "string" ? source.senderAddress : undefined,
    fromDistrictId: Number.isFinite(maybeDistrictId) ? maybeDistrictId : undefined,
    fromWardCode: typeof source.fromWardCode === "string" ? source.fromWardCode : undefined,
    fromWardName: typeof source.fromWardName === "string" ? source.fromWardName : undefined,
    fromDistrictName: typeof source.fromDistrictName === "string" ? source.fromDistrictName : undefined,
    fromProvinceName: typeof source.fromProvinceName === "string" ? source.fromProvinceName : undefined,
    isDefault: typeof source.isDefault === "boolean" ? source.isDefault : undefined,
    bankName: typeof source.bankName === "string" ? source.bankName : undefined,
    bankAccountNumber: typeof source.bankAccountNumber === "string" ? source.bankAccountNumber : undefined,
    bankAccountName: typeof source.bankAccountName === "string" ? source.bankAccountName : undefined,
  };
}

export const sellerShippingApi = {
  async getMyProfile() {
    const response = await http.get<unknown>("/api/SellerShippingProfile");
    return toDraftProfile(response);
  },

  async upsertProfile(payload: SellerShippingProfileRequest) {
    return http.post<unknown>('/api/SellerShippingProfile', payload)
  },
};
