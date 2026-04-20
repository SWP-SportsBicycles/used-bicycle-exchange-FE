import { http } from "@/lib/api/http";

export interface SellerMediaItem {
  image: string;
  videoUrl?: string;
  type: 0 | 1;
}

export interface SellerListingPayload {
  title: string;
  description: string;
  serialNumber: string;
  category: string;
  brand: string;
  frameSize: string;
  frameMaterial?: string;
  condition: string;
  paint?: string;
  groupset: string;
  operating?: string;
  tireRim?: string;
  brakeType?: string;
  overall?: string;
  price: number;
  city: string;
  medias: SellerMediaItem[];
}

export const sellerApi = {
  createListing(payload: SellerListingPayload) {
    return http.post<unknown>("/api/seller-listing", payload);
  },

  getListings(pageNumber = 1, pageSize = 10) {
    return http.get<unknown>(`/api/seller-listing?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  getListingDetail(listingId: string) {
    return http.get<unknown>(`/api/seller-listing/${listingId}`);
  },

  updateListing(listingId: string, payload: SellerListingPayload) {
    return http.put<unknown>(`/api/seller-listing/${listingId}`, payload);
  },

  submitListing(listingId: string) {
    return http.post<unknown>(`/api/seller-listing/${listingId}/submit`);
  },

  withdrawListing(listingId: string) {
    return http.post<unknown>(`/api/seller-listing/${listingId}/withdraw`);
  },

  deleteListing(listingId: string) {
    return http.delete<unknown>(`/api/seller-listing/${listingId}`);
  },
};
