import { http } from "@/lib/api/http";

type ListingStatus = "pending" | "approved" | "rejected";

export interface AdminListingMedia {
  id: string;
  image: string | null;
  videoUrl: string | null;
  type?: number;
}

export interface AdminBikeDetail {
  brand?: string;
  category?: string;
  frameSize?: string;
  price?: number;
}

export interface AdminListing {
  id: string;
  title: string;
  serial: string;
  city: string;
  price: number;
  brand?: string;
  model?: string;
  submittedAt?: string;
  status: ListingStatus;
  images: string[];
}

export interface AdminListingDetail extends AdminListing {
  description: string;
  bike: AdminBikeDetail;
  medias: AdminListingMedia[];
}

export interface CreateInspectorPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export type AdminOrderStatus = "Locked" | "Confirmed" | "Completed" | string;

export interface AdminOrder {
  orderId: string;
  status: AdminOrderStatus;
  totalAmount: number;
  bikeTitle: string;
  sellerName: string;
  completedAt: string | null;
  paidOutAt: string | null;
}

export type UserRole = "BUYER" | "SELLER" | "ADMIN" | "INSPECTOR";
export type UserStatus = "Active" | "InActive" | "Banned";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  phoneNumber?: string;
  avtUrl?: string;
  firebaseUID?: string;
  walletBalance?: number;
  status?: UserStatus;
  totalOrders?: number;
  completedOrders?: number;
  totalListings?: number;
  totalRevenue?: number;
  totalSpent?: number | null;
  senderName?: string | null;
  senderPhone?: string | null;
  senderAddress?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  pickupAddress?: string;
  pickupDistrictId?: number;
  pickupWardCode?: string;
  pickupWardName?: string;
  pickupDistrictName?: string;
  pickupProvinceName?: string;
}

function extractPayloadObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const maybe = payload as Record<string, unknown>;
  const nested = maybe.data && typeof maybe.data === "object" ? (maybe.data as Record<string, unknown>) : undefined;
  return nested ?? maybe;
}

function extractArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const maybe = payload as Record<string, unknown>;
  const candidates = [maybe.data, maybe.items, maybe.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.items)) return nested.items;
      if (Array.isArray(nested.results)) return nested.results;
      if (Array.isArray(nested.data)) return nested.data;
    }
  }

  return [];
}

function pickString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (typeof source[key] === "string" && source[key]) {
      return source[key] as string;
    }
  }
  return "";
}

function toListingStatus(value: unknown): ListingStatus {
  if (typeof value !== "string") return "pending";
  const normalized = value.toLowerCase();
  if (
    normalized.includes("approved") ||
    normalized.includes("published") ||
    normalized.includes("pendinginspection")
  ) {
    return "approved";
  }
  if (normalized.includes("reject")) return "rejected";
  return "pending";
}

function normalizeMedia(raw: unknown): AdminListingMedia | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const source = raw as Record<string, unknown>;

  return {
    id: pickString(source, ["id"]) || crypto.randomUUID(),
    image: typeof source.image === "string" && source.image ? source.image : null,
    videoUrl: typeof source.videoUrl === "string" && source.videoUrl ? source.videoUrl : null,
    type: typeof source.type === "number" ? source.type : undefined,
  };
}

function extractImageList(source: Record<string, unknown>): string[] {
  const images = Array.isArray(source.images)
    ? source.images.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];

  const thumbnail = typeof source.thumbnail === "string" && source.thumbnail ? [source.thumbnail] : [];
  const medias = Array.isArray(source.medias) ? source.medias : [];
  const mediaImages = medias
    .map(normalizeMedia)
    .filter((item): item is AdminListingMedia => Boolean(item))
    .map((item) => item.image)
    .filter((item): item is string => Boolean(item));

  return Array.from(new Set([...thumbnail, ...images, ...mediaImages]));
}

function extractBike(source: Record<string, unknown>): Record<string, unknown> {
  if (source.bike && typeof source.bike === "object") {
    return source.bike as Record<string, unknown>;
  }
  return {};
}

function normalizeListing(raw: unknown): AdminListing {
  const source = extractPayloadObject(raw);
  const bike = extractBike(source);
  const maybePrice =
    typeof source.price === "number"
      ? source.price
      : Number(source.price ?? bike.price);
  const imageList = extractImageList(source);

  return {
    id: pickString(source, ["id", "listingId"]) || crypto.randomUUID(),
    title: pickString(source, ["title", "listingTitle"]) || "Untitled listing",
    serial: pickString(source, ["serial", "serialNumber", "frameNumber"]),
    city: pickString(source, ["city", "location"]),
    price: Number.isFinite(maybePrice) ? maybePrice : 0,
    brand: pickString(source, ["brand"]) || pickString(bike, ["brand"]),
    model: pickString(source, ["model"]) || pickString(bike, ["category"]),
    submittedAt: pickString(source, ["submittedAt", "createdAt", "submitDate"]) || undefined,
    status: toListingStatus(source.status),
    images: imageList,
  };
}

function normalizeListingDetail(raw: unknown): AdminListingDetail {
  const source = extractPayloadObject(raw);
  const bikeSource = extractBike(source);
  const base = normalizeListing(source);
  const medias = (Array.isArray(source.medias) ? source.medias : [])
    .map(normalizeMedia)
    .filter((item): item is AdminListingMedia => Boolean(item));

  return {
    ...base,
    description: pickString(source, ["description", "content"]),
    bike: {
      brand: pickString(bikeSource, ["brand"]) || undefined,
      category: pickString(bikeSource, ["category"]) || undefined,
      frameSize: pickString(bikeSource, ["frameSize"]) || undefined,
      price:
        typeof bikeSource.price === "number"
          ? bikeSource.price
          : Number.isFinite(Number(bikeSource.price))
          ? Number(bikeSource.price)
          : undefined,
    },
    medias,
  };
}

function normalizeUserRole(value: unknown): UserRole {
  const role = typeof value === "string" ? value.toUpperCase() : "";
  if (role === "SELLER" || role === "ADMIN" || role === "INSPECTOR") return role;
  return "BUYER";
}

function normalizeUser(raw: unknown): AdminUser {
  const source = extractPayloadObject(raw);
  const role = normalizeUserRole(source.role);
  const isActive = typeof source.isActive === "boolean" ? source.isActive : undefined;

  return {
    id: pickString(source, ["id", "userId"]) || crypto.randomUUID(),
    fullName: pickString(source, ["fullName", "name"]) || "",
    email: pickString(source, ["email"]) || "",
    role,
    isActive,
    createdAt: pickString(source, ["createdAt"]) || undefined,
    phoneNumber: pickString(source, ["phoneNumber"]) || undefined,
    avtUrl: pickString(source, ["avtUrl", "avatar", "avatarUrl", "image"]) || undefined,
    firebaseUID: pickString(source, ["firebaseUID", "firebase_uid", "firebaseId"]) || undefined,
    walletBalance:
      typeof source.walletBalance === "number" ? source.walletBalance : Number(source.walletBalance) || undefined,
    status: isActive === undefined ? undefined : isActive ? "Active" : "InActive",
    totalOrders: typeof source.totalOrders === "number" ? source.totalOrders : undefined,
    completedOrders: typeof source.completedOrders === "number" ? source.completedOrders : undefined,
    totalListings: typeof source.totalListings === "number" ? source.totalListings : undefined,
    totalRevenue: typeof source.totalRevenue === "number" ? source.totalRevenue : undefined,
    totalSpent: typeof source.totalSpent === "number" ? source.totalSpent : null,
    senderName: typeof source.senderName === "string" ? source.senderName : null,
    senderPhone: typeof source.senderPhone === "string" ? source.senderPhone : null,
    senderAddress: typeof source.senderAddress === "string" ? source.senderAddress : null,
    bankName: typeof source.bankName === "string" ? source.bankName : null,
    bankAccountNumber: typeof source.bankAccountNumber === "string" ? source.bankAccountNumber : null,
    bankAccountName: typeof source.bankAccountName === "string" ? source.bankAccountName : null,
    pickupAddress: pickString(source, ["pickupAddress", "pickup_address", "address"]) || undefined,
    pickupDistrictId: typeof source.pickupDistrictId === "number" ? source.pickupDistrictId : undefined,
    pickupWardCode: pickString(source, ["pickupWardCode", "pickup_ward_code"]) || undefined,
    pickupWardName: pickString(source, ["pickupWardName", "pickup_ward_name"]) || undefined,
    pickupDistrictName: pickString(source, ["pickupDistrictName", "pickup_district_name"]) || undefined,
    pickupProvinceName: pickString(source, ["pickupProvinceName", "pickup_province_name"]) || undefined,
  };
}

function normalizeOrder(raw: unknown): AdminOrder {
  const source = extractPayloadObject(raw);
  return {
    orderId: pickString(source, ["orderId", "id"]) || crypto.randomUUID(),
    status: pickString(source, ["status"]) || "Locked",
    totalAmount:
      typeof source.totalAmount === "number" ? source.totalAmount : Number(source.totalAmount) || 0,
    bikeTitle: pickString(source, ["bikeTitle", "title"]),
    sellerName: pickString(source, ["sellerName", "seller"]),
    completedAt: pickString(source, ["completedAt"]) || null,
    paidOutAt: pickString(source, ["paidOutAt"]) || null,
  };
}

function extractTotalItems(payload: unknown): number {
  const source = extractPayloadObject(payload);
  if (typeof source.totalItems === "number") return source.totalItems;
  return extractArray(payload).length;
}

export const adminApi = {
  async getAllListings() {
    const response = await http.get<unknown>("/api/admin-listing/all");
    return extractArray(response).map(normalizeListing);
  },

  async getListings() {
    const response = await http.get<unknown>("/api/admin-listing");
    return extractArray(response).map(normalizeListing);
  },

  async getListingDetail(listingId: string) {
    const response = await http.get<unknown>(`/api/admin-listing/${listingId}`);
    return normalizeListingDetail(response);
  },

  approveListing(listingId: string) {
    return http.post<unknown>(`/api/admin-listing/${listingId}/approve`);
  },

  rejectListing(listingId: string, reason: string) {
    return http.post<unknown>(`/api/admin-listing/${listingId}/reject`, { reason });
  },

  createInspector(payload: CreateInspectorPayload) {
    return http.post<unknown>("/api/AdminAccount/admin/create-inspector", payload);
  },

  async getUsers(): Promise<AdminUser[]> {
    const response = await http.get<unknown>("/api/AdminUser");
    return extractArray(response).map(normalizeUser);
  },

  async getSellerUsers(): Promise<AdminUser[]> {
    const response = await http.get<unknown>("/api/AdminUser/sellers");
    return extractArray(response).map(normalizeUser);
  },

  async getBuyerUsers(): Promise<AdminUser[]> {
    const response = await http.get<unknown>("/api/AdminUser/buyers");
    return extractArray(response).map(normalizeUser);
  },

  async getUsersTotalCount(): Promise<number> {
    const response = await http.get<unknown>("/api/AdminUser");
    return extractTotalItems(response);
  },

  async getSellerUsersTotalCount(): Promise<number> {
    const response = await http.get<unknown>("/api/AdminUser/sellers");
    return extractTotalItems(response);
  },

  async getBuyerUsersTotalCount(): Promise<number> {
    const response = await http.get<unknown>("/api/AdminUser/buyers");
    return extractTotalItems(response);
  },

  async getUserById(userId: string): Promise<AdminUser | null> {
    const response = await http.get<unknown>(`/api/AdminUser/${userId}`);
    const normalized = normalizeUser(response);
    return normalized.id ? normalized : null;
  },

  async getOrders(params?: { page?: number; size?: number; status?: number }): Promise<AdminOrder[]> {
    const search = new URLSearchParams();
    search.set("page", String(params?.page ?? 1));
    search.set("size", String(params?.size ?? 10));
    if (typeof params?.status === "number") {
      search.set("status", String(params.status));
    }
    const response = await http.get<unknown>(`/api/AdminOrder?${search.toString()}`);
    return extractArray(response).map(normalizeOrder);
  },

  async getOrderById(orderId: string): Promise<AdminOrder | null> {
    const orders = await this.getOrders({ page: 1, size: 100 });
    return orders.find((order) => order.orderId === orderId) ?? null;
  },

  notifySeller(orderId: string) {
    return http.post<unknown>(`/api/AdminOrder/${orderId}/notify-seller`);
  },

  confirmPayout(orderId: string) {
    return http.post<unknown>(`/api/AdminOrder/${orderId}/confirm-payout`);
  },
};
