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

// ===== RESPONSE UNWRAPPER =====
// Backend bọc TẤT CẢ response trong { isSuccess, data, businessCode, message }.
// Hàm này unwrap lấy phần data bên trong.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(raw: any): T {
  if (
    raw &&
    typeof raw === "object" &&
    ("isSucess" in raw || "isSuccess" in raw || "success" in raw) &&
    "data" in raw
  ) {
    return raw.data as T;
  }
  return raw as T;
}

// ===== TYPES =====

export interface BuyerListing {
  id: string;
  listingId?: string;        // BE có thể trả listingId thay vì id
  title: string;
  brand: string;
  model: string;
  bikeId?: string;
  category: string;           // BE trả "road", "mtb", etc. — dùng string cho flexible
  condition: "like_new" | "excellent" | "good" | "fair";
  price: number;
  frameSize: string;
  frameMaterial: string;
  groupset: string;
  wheelSize: string;
  description: string;
  images: string[];
  thumbnail?: string;         // BE có thể trả thumbnail thay vì images[]
  city: string;
  isVeloSafeVerified: boolean;
  isWishlisted?: boolean;
  isInspected?: boolean;
  isLocked: boolean;
  serial: string;
  status: "draft" | "pending_review" | "published" | "reserved" | "sold" | "withdrawn";
  overall?: string;           // BE inspection overall status
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
  totalItems?: number;  // Backend uses this name
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
  totalItems?: number;
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
  type: string;               // BE expects ReportTypeEnum
  reason: string;
}

export interface WishlistPage {
  items: BuyerListing[];
  totalCount: number;
  totalItems?: number;
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

// ===== NORMALIZERS =====

/**
 * Backend trả totalItems, FE dùng totalCount.
 * Backend có thể trả listing với listingId thay vì id.
 * Backend có thể trả thumbnail thay vì images[].
 * Normalize tất cả ở đây.
 */
function normalizeListing(raw: Record<string, unknown>): BuyerListing {
  const item = raw as Record<string, unknown>;
  const listing = {
    ...item,
    // Ensure id is always set
    id: (item.listingId || item.id || "") as string,
    // Ensure images[] always exists
    images: (item.images as string[]) ??
      (item.thumbnail ? [item.thumbnail as string] : []),
    // Ensure seller object exists
    seller: (item.seller as BuyerListing["seller"]) ?? {
      id: "",
      name: (item.sellerName as string) || "Người bán",
      rating: (item.sellerRating as number) || 4.5,
      totalSales: (item.sellerTotalSales as number) || 0,
      memberSince: (item.sellerMemberSince as string) || "",
    },
    // Default status
    status: (item.status as string) || "published",
    // Default lock
    isLocked: (item.isLocked as boolean) ?? false,
    isVeloSafeVerified: (item.isVeloSafeVerified as boolean) ??
      (item.isInspected as boolean) ?? false,
  } as BuyerListing;

  return listing;
}

function normalizePage(raw: unknown): BuyerListingPage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = raw as any;
  const items = (page?.items ?? []) as Record<string, unknown>[];
  return {
    items: items.map(normalizeListing),
    totalCount: page?.totalCount ?? page?.totalItems ?? items.length,
    pageNumber: page?.pageNumber ?? 1,
    pageSize: page?.pageSize ?? 12,
    totalPages: page?.totalPages ?? 1,
  };
}

function normalizeOrderPage(raw: unknown): BuyerOrderPage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = raw as any;
  const items = page?.items ?? [];
  return {
    items: Array.isArray(items) ? items : [],
    totalCount: page?.totalCount ?? page?.totalItems ?? items.length,
    pageNumber: page?.pageNumber ?? 1,
    pageSize: page?.pageSize ?? 10,
    totalPages: page?.totalPages ?? 1,
  };
}

// ===== BUYER API (qua BE) =====

export const buyerApi = {
  // ---------- Listings ----------

  getListings: async (page = 1, size = 10) => {
    const raw = await http.get<unknown>(
      `/api/buyer-listing?pageNumber=${page}&pageSize=${size}`
    );
    return normalizePage(unwrap(raw));
  },

  getListingDetail: async (id: string) => {
    const raw = await http.get<unknown>(`/api/buyer-listing/${id}`);
    const data = unwrap<Record<string, unknown>>(raw);
    return normalizeListing(data);
  },

  searchListings: async (params: SearchListingsParams) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    const raw = await http.get<unknown>(`/api/buyer-listing/search?${qs}`);
    return normalizePage(unwrap(raw));
  },

  // ---------- Checkout & Payment (Sprint 2) ----------
  
  /**
   * Bước 1: Thêm vào giỏ hàng.
   * Swagger AddToCartDTO: { bikeId: UUID }
   * FE truyền listingId → cần map sang bikeId
   */
  addToCart: (data: { listingId: string; quantity: number }) =>
    http.post<unknown>("/api/buyer-cart/add", { bikeId: data.listingId }),

  /**
   * Bước 2: Checkout từ giỏ hàng.
   * Swagger CreateOrderFromCartDTO: { receiverName, receiverPhone, receiverAddress, toDistrictId, toWardCode, distanceKm? }
   */
  checkout: async (data: Omit<CheckoutPayload, "listingId">) => {
    const raw = await http.post<unknown>("/api/buyer-cart/checkout", {
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      receiverAddress: data.receiverAddress,
      toDistrictId: data.toDistrictId,
      toWardCode: data.toWardCode,
    });
    return unwrap<CheckoutResponse>(raw);
  },

  /**
   * Bước 2b (Alternative): Tạo order trực tiếp (không qua cart)
   * Swagger CreateOrderDTO: { bikeId, receiverName, receiverPhone, receiverAddress, toDistrictId, toWardCode, distanceKm }
   */
  createOrderDirect: async (data: CheckoutPayload) => {
    const raw = await http.post<unknown>("/api/buyer-order", {
      bikeId: data.listingId,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      receiverAddress: data.receiverAddress,
      toDistrictId: data.toDistrictId,
      toWardCode: data.toWardCode,
      distanceKm: 0,
    });
    return unwrap<CheckoutResponse>(raw);
  },

  /** Bước 3: Lấy link/QR PayOS cho Order vừa tạo */
  getPaymentLink: async (orderId: string) => {
    const raw = await http.post<unknown>(`/api/payment/${orderId}`);
    return unwrap<{ checkoutUrl: string; qrCode: string }>(raw);
  },

  /** Polling — kiểm tra trạng thái thanh toán PayOS */
  getOrderStatus: async (orderId: string) => {
    const raw = await http.get<unknown>(`/api/buyer-order/${orderId}`);
    return unwrap<OrderStatusResponse>(raw);
  },

  // ---------- Orders ----------

  getOrders: async (page = 1, size = 10) => {
    const raw = await http.get<unknown>(
      `/api/buyer-order?pageNumber=${page}&pageSize=${size}`
    );
    return normalizeOrderPage(unwrap(raw));
  },

  getOrderDetail: async (orderId: string) => {
    const raw = await http.get<unknown>(`/api/buyer-order/${orderId}`);
    return unwrap<BuyerOrder>(raw);
  },

  /**
   * Xác nhận đã thanh toán (webhook PayOS gọi, nhưng FE có thể trigger).
   * Swagger: POST /api/buyer-order/{orderId}/paid
   */
  confirmPaid: (orderId: string) =>
    http.post<unknown>(`/api/buyer-order/${orderId}/paid`),

  // ---------- Report / Khiếu nại ----------

  /** Upload video/image — trả về URL */
  uploadMedia: (file: File) =>
    http.upload<{ url: string }>("/api/Upload/video", file),

  /**
   * Tạo báo cáo/khiếu nại.
   * Swagger: POST /api/buyer-report/{orderId} — CreateReportDTO { type, reason }
   */
  createDispute: (orderId: string, data: DisputePayload) =>
    http.post<unknown>(`/api/buyer-report/${orderId}`, {
      type: data.type || "other",
      reason: data.reason,
    }),

  /** Lấy danh sách report của buyer */
  getMyReports: async () => {
    const raw = await http.get<unknown>("/api/buyer-report/my");
    return unwrap(raw);
  },

  // ---------- Wishlist ----------

  getWishlist: async (page = 1, size = 10) => {
    const raw = await http.get<unknown>(
      `/api/wishlist?pageNumber=${page}&pageSize=${size}`
    );
    const data = unwrap(raw);
    // BE may return array or paginated object
    if (Array.isArray(data)) {
      return {
        items: data as BuyerListing[],
        totalCount: data.length,
        pageNumber: page,
        pageSize: size,
        totalPages: 1,
      } as WishlistPage;
    }
    return data as WishlistPage;
  },

  addToWishlist: (bikeId: string) =>
    http.post<unknown>(`/api/wishlist/${bikeId}`),

  removeFromWishlist: (bikeId: string) =>
    http.delete<unknown>(`/api/wishlist/${bikeId}`),

  // ---------- Shipment Tracking ----------

  getShipment: async (orderId: string) => {
    const raw = await http.get<unknown>(`/api/buyer-shipment/${orderId}`);
    return unwrap<ShipmentInfo>(raw);
  },

  syncShipment: async (orderId: string) => {
    const raw = await http.post<unknown>(`/api/buyer-shipment/sync/${orderId}`);
    return unwrap<ShipmentInfo>(raw);
  },

  confirmReceived: (orderId: string) =>
    http.post<unknown>(`/api/buyer-shipment/confirm-received/${orderId}`),

  // ---------- Cancel Order ----------
  // NOTE: Backend hiện KHÔNG có endpoint cancel order cho buyer.
  // Nếu cần, hãy báo BE thêm endpoint POST /api/buyer-order/{orderId}/cancel
  cancelOrder: (orderId: string) =>
    http.post<unknown>(`/api/buyer-order/${orderId}/cancel`),
};
