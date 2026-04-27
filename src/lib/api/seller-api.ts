import { http, httpMultipart } from "@/lib/api/http";

// ===== Listing Types =====

export interface SellerListingFormData {
  title: string;
  description: string;
  serialNumber: string;
  category: string;
  brand: string;
  frameSize: string;
  frameMaterial?: string;
  condition: string;
  paint: string;
  groupset: string;
  operating?: string;
  tireRim?: string;
  brakeType: string;
  overall: string;
  price: number;
  city: string;
}

export interface SellerListing {
  id: string;
  title: string;
  description: string;
  serialNumber: string;
  category: string;
  brand: string;
  model: string;
  frameSize: string;
  frameMaterial: string;
  condition: string;
  price: number;
  city: string;
  status: 'draft' | 'pending_review' | 'published' | 'sold' | 'withdrawn' | string;
  isVeloSafeVerified: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SellerListingPage {
  items: SellerListing[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface SellerOrder {
  orderId: string;
  /** ID của tin đăng (listing) liên kết với đơn hàng — trả về từ backend */
  listingId?: string;
  listing?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    serialNumber?: string;
  };
  buyer?: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    address?: string;
  };
  bikeName?: string;
  serialNumber?: string;
  buyerName?: string;
  buyerPhone?: string;
  receiverAddress?: string;
  status:
    | 'Pending'
    | 'Paid'
    | 'Confirmed'
    | 'Locked'
    | 'Shipping'
    | 'Delivered'
    | 'Completed'
    | 'Cancelled'
    | 'pending_seller_confirm'
    | 'seller_confirmed'
    | 'pending_inspection'
    | 'inspection_passed'
    | 'inspection_failed'
    | 'shipping'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | string;
  depositAmount?: number;
  totalAmount?: number;
  totalPrice?: number;
  price?: number;
  isPaidOut?: boolean;
  isDelivered?: boolean;
  paidOutAt?: string | null;
  payoutAmount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SellerOrderPage {
  items: SellerOrder[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// ===== API =====

export const sellerApi = {
  // --- Listings ---

  /** POST /api/seller-listing — multipart/form-data (text fields only) */
  createListing(data: SellerListingFormData) {
    const form = new FormData();
    (Object.keys(data) as Array<keyof SellerListingFormData>).forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });
    return httpMultipart<{ data?: { id?: string; listingId?: string }; id?: string; listingId?: string }>(
      "/api/seller-listing",
      form,
    );
  },

  /** POST /api/seller-media/upload-multiple — upload images/videos after listing created */
  uploadMedia(listingId: string, files: File[]) {
    const form = new FormData();
    form.append("listingId", listingId);
    files.forEach((file) => form.append("files", file));
    return httpMultipart<unknown>("/api/seller-media/upload-multiple", form);
  },

  /** POST /api/Upload/image — upload single image, returns URL */
  uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);
    return httpMultipart<{ url?: string; imageUrl?: string; data?: string } | string>(
      "/api/Upload/image",
      form,
    );
  },

  /** POST /api/Upload/video — upload single video, returns URL */
  uploadVideo(file: File) {
    const form = new FormData();
    form.append("file", file);
    return httpMultipart<{ url?: string; videoUrl?: string; data?: string } | string>(
      "/api/Upload/video",
      form,
    );
  },

  getListings(pageNumber = 1, pageSize = 10) {
    return http.get<SellerListingPage>(`/api/seller-listing?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  getListingDetail(listingId: string) {
    return http.get<SellerListing>(`/api/seller-listing/${listingId}`);
  },

  submitListing(listingId: string) {
    return http.post<unknown>(`/api/seller-listing/${listingId}/submit`);
  },

  resubmitListing(listingId: string) {
    return http.post<unknown>(`/api/seller-listing/${listingId}/resubmit`);
  },

  withdrawListing(listingId: string) {
    return http.post<unknown>(`/api/seller-listing/${listingId}/withdraw`);
  },

  updateListing(listingId: string, data: SellerListingFormData) {
    return http.put<unknown>(`/api/seller-listing/${listingId}`, data);
  },

  deleteListing(listingId: string) {
    return http.delete<unknown>(`/api/seller-listing/${listingId}`);
  },

  // --- Orders (GET /api/SellerOrder) ---

  getOrders(page = 1, size = 10) {
    return http.get<SellerOrderPage>(`/api/SellerOrder?page=${page}&size=${size}`);
  },

  getOrderDetail(orderId: string) {
    return http.get<SellerOrder>(`/api/SellerOrder/${orderId}`);
  },

  confirmOrder(orderId: string) {
    return http.post<unknown>(`/api/SellerOrder/${orderId}/confirm`);
  },

  /** Seller xác nhận đã giao hàng cho đơn vị vận chuyển (GHN) */
  shipOrder(orderId: string) {
    return http.post<unknown>(`/api/seller-shipment/${orderId}/create`);
  },

  cancelOrder(orderId: string) {
    return http.post<unknown>(`/api/SellerOrder/${orderId}/cancel`);
  },

  // --- Bank Info (TODO: endpoint chưa có trong Swagger) ---
  // updateBankInfo(data: { bankAccountName: string; bankAccountNumber: string; bankName: string }) {
  //   return http.post<unknown>("/api/seller/profile/bank-info", data);
  // },
};
