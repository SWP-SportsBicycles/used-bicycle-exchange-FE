import { http } from "./http";

// ===== GHN OPEN API (FE gọi trực tiếp, KHÔNG qua BE) =====
const GHN_API = "https://online-gateway.ghn.vn/shiip/public-api/master-data";
const GHN_TOKEN = process.env.NEXT_PUBLIC_GHN_TOKEN ?? "";

export const ghnApi = {
  getProvinces: () =>
    fetch(`${GHN_API}/province`, {
      headers: { Token: GHN_TOKEN },
    }).then((r) => r.json()),

  getDistricts: (provinceId: number) =>
    fetch(`${GHN_API}/district?province_id=${provinceId}`, {
      headers: { Token: GHN_TOKEN },
    }).then((r) => r.json()),

  getWards: (districtId: number) =>
    fetch(`${GHN_API}/ward?district_id=${districtId}`, {
      headers: { Token: GHN_TOKEN },
    }).then((r) => r.json()),
};

// ===== TYPES =====

export interface BuyerListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  category: "road" | "mtb" | "gravel" | "urban";
  condition: "like_new" | "excellent" | "good" | "fair";
  price: number;
  frameSize: string;
  frameMaterial: string;
  groupset: string;
  wheelSize: string;
  description: string;
  images: string[];
  city: "hanoi" | "hcm" | "danang";
  isVeloSafeVerified: boolean;
  isLocked: boolean;
  serial: string;
  status: "draft" | "pending_review" | "published" | "reserved" | "sold" | "withdrawn";
  seller: {
    id: string;
    name: string;
    rating: number;
    totalSales: number;
    memberSince: string;
    // PII — chỉ hiện khi chưa thanh toán
    district?: string;          // "Quận X, TP.HCM" (ẩn SĐT)
    phone?: string;             // null cho đến khi trả tiền
    address?: string;           // null cho đến khi trả tiền
  };
  createdAt: string;
  updatedAt: string;
}

export interface BuyerListingPage {
  items: BuyerListing[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface BuyerOrder {
  id: string;
  listingId: string;
  listing: Pick<BuyerListing, "id" | "title" | "images" | "price">;
  status:
    | "timer_draft"
    | "payos_paid"
    | "shipping"
    | "delivered"
    | "completed"
    | "cancelled"
    | "disputed";
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  shippingFee: number;
  totalPrice: number;
  payosQrUrl?: string;
  waybillCode?: string;         // GHN tracking code
  expiresAt?: string;           // timer_draft expiry (ISO 8601)
  seller?: {                    // Full PII — hiện sau khi thanh toán
    name: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BuyerOrderPage {
  items: BuyerOrder[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CheckoutPayload {
  listingId: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  toDistrictId: number;
  toWardCode: string;
}

export interface CheckoutResponse {
  orderId: string;
  payosQrUrl: string;
  shippingFee: number;
  totalPrice: number;
  expiresAt: string;
}

export interface OrderStatusResponse {
  orderId: string;
  status: BuyerOrder["status"];
  payosStatus?: "pending" | "paid" | "failed";
}

export interface DisputePayload {
  reason: string;
  mediaUrls: string[];
}

export interface WishlistPage {
  items: BuyerListing[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ShipmentInfo {
  orderId: string;
  waybillCode: string;
  status: string;
  statusLabel: string;
  events: {
    time: string;
    status: string;
    description: string;
    location?: string;
  }[];
  estimatedDelivery?: string;
}

export interface SearchListingsParams {
  keyword?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  frameSize?: string;
  condition?: string;
  city?: string;
  pageNumber?: number;
  pageSize?: number;
}

// ===== BUYER API (qua BE) =====
export const buyerApi = {
  // ---------- Listings ----------

  getListings: (page = 1, size = 10) =>
    http.get<BuyerListingPage>(
      `/api/buyer-listing?pageNumber=${page}&pageSize=${size}`
    ),

  getListingDetail: (id: string) =>
    http.get<BuyerListing>(`/api/buyer-listing/${id}`),

  searchListings: (params: SearchListingsParams) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    return http.get<BuyerListingPage>(`/api/buyer-listing/search?${qs}`);
  },

  // ---------- Checkout (Cart Lock 5 phút) ----------

  /** Khóa listing 5 phút + tạo PayOS QR */
  checkout: (data: CheckoutPayload) =>
    http.post<CheckoutResponse>("/api/buyer-order/checkout", data),

  /** Polling — kiểm tra trạng thái thanh toán PayOS */
  getOrderStatus: (orderId: string) =>
    http.get<OrderStatusResponse>(`/api/buyer-order/${orderId}/status`),

  // ---------- Orders ----------

  getOrders: (page = 1, size = 10) =>
    http.get<BuyerOrderPage>(
      `/api/buyer-order?pageNumber=${page}&pageSize=${size}`
    ),

  getOrderDetail: (orderId: string) =>
    http.get<BuyerOrder>(`/api/buyer-order/${orderId}`),

  /** Hủy đơn — BE áp dụng penalty 5% / 10% + mất phí ship */
  cancelOrder: (orderId: string) =>
    http.post<void>(`/api/buyer-order/${orderId}/cancel`),

  // ---------- Dispute (Khiếu nại) ----------

  /** Upload video/image — trả về URL */
  uploadMedia: (file: File) =>
    http.upload<{ url: string }>("/api/Upload/video", file),

  createDispute: (orderId: string, data: DisputePayload) =>
    http.post<void>(`/api/buyer-order/${orderId}/dispute`, data),

  // ---------- Wishlist ----------

  getWishlist: (page = 1, size = 10) =>
    http.get<WishlistPage>(
      `/api/wishlist?pageNumber=${page}&pageSize=${size}`
    ),

  addToWishlist: (bikeId: string) =>
    http.post<void>(`/api/wishlist/${bikeId}`),

  removeFromWishlist: (bikeId: string) =>
    http.delete<void>(`/api/wishlist/${bikeId}`),

  // ---------- Shipment Tracking ----------

  getShipment: (orderId: string) =>
    http.get<ShipmentInfo>(`/api/buyer-shipment/${orderId}`),

  syncShipment: (orderId: string) =>
    http.post<ShipmentInfo>(`/api/buyer-shipment/sync/${orderId}`),
};
