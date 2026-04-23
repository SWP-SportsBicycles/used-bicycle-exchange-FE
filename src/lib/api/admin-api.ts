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

export type UserRole = 'Buyer' | 'Seller' | 'Admin' | 'Inspector';
export type UserStatus = 'Active' | 'InActive' | 'Banned';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  avtUrl?: string;
  firebaseUID?: string;
  role: UserRole;
  walletBalance: number;
  status: UserStatus;
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

function normalizeUser(raw: unknown): AdminUser {
  const source = extractPayloadObject(raw);
  
  const role = (pickString(source, ["role"]) || "Buyer") as UserRole;
  const status = (pickString(source, ["status"]) || "InActive") as UserStatus;
  
  return {
    id: pickString(source, ["id", "userId"]) || crypto.randomUUID(),
    email: pickString(source, ["email"]) || "",
    fullName: pickString(source, ["fullName", "full_name", "name"]) || "",
    phoneNumber: pickString(source, ["phoneNumber", "phone_number", "phone"]) || "",
    password: pickString(source, ["password"]) || "",
    avtUrl: pickString(source, ["avtUrl", "avatar", "avatarUrl", "image"]) || undefined,
    firebaseUID: pickString(source, ["firebaseUID", "firebase_uid", "firebaseId"]) || undefined,
    role,
    walletBalance: typeof source.walletBalance === "number" ? source.walletBalance : Number(source.walletBalance) || 0,
    status,
    pickupAddress: pickString(source, ["pickupAddress", "pickup_address", "address"]) || undefined,
    pickupDistrictId: typeof source.pickupDistrictId === "number" ? source.pickupDistrictId : undefined,
    pickupWardCode: pickString(source, ["pickupWardCode", "pickup_ward_code"]) || undefined,
    pickupWardName: pickString(source, ["pickupWardName", "pickup_ward_name"]) || undefined,
    pickupDistrictName: pickString(source, ["pickupDistrictName", "pickup_district_name"]) || undefined,
    pickupProvinceName: pickString(source, ["pickupProvinceName", "pickup_province_name"]) || undefined,
  };
}

// Mock data for users until API is ready
const MOCK_USERS: AdminUser[] = [
  {
    id: "1",
    email: "buyer1@example.com",
    fullName: "Nguyễn Văn A",
    phoneNumber: "0901234567",
    password: "password123",
    avtUrl: "https://i.pravatar.cc/150?u=1",
    role: "Buyer",
    walletBalance: 1500000,
    status: "Active",
    pickupAddress: "123 Đường Lê Lợi",
    pickupDistrictId: 1,
    pickupWardCode: "W001",
    pickupWardName: "Phường Bến Nghé",
    pickupDistrictName: "Quận 1",
    pickupProvinceName: "TP.HCM",
  },
  {
    id: "2",
    email: "seller1@example.com",
    fullName: "Trần Thị B",
    phoneNumber: "0912345678",
    password: "sellerpass456",
    avtUrl: "https://i.pravatar.cc/150?u=2",
    role: "Seller",
    walletBalance: 5000000,
    status: "Active",
    pickupAddress: "456 Đường Nguyễn Huệ",
    pickupDistrictId: 2,
    pickupWardCode: "W002",
    pickupWardName: "Phường Bến Thành",
    pickupDistrictName: "Quận 1",
    pickupProvinceName: "TP.HCM",
  },
  {
    id: "3",
    email: "buyer2@example.com",
    fullName: "Lê Văn C",
    phoneNumber: "0923456789",
    password: "buyerpass789",
    role: "Buyer",
    walletBalance: 0,
    status: "InActive",
  },
  {
    id: "4",
    email: "seller2@example.com",
    fullName: "Phạm Thị D",
    phoneNumber: "0934567890",
    password: "sellerpass012",
    avtUrl: "https://i.pravatar.cc/150?u=4",
    role: "Seller",
    walletBalance: 2500000,
    status: "Active",
    pickupAddress: "789 Đường Trần Hưng Đạo",
    pickupDistrictId: 3,
    pickupWardCode: "W003",
    pickupWardName: "Phường Cầu Ông Lãnh",
    pickupDistrictName: "Quận 1",
    pickupProvinceName: "TP.HCM",
  },
  {
    id: "5",
    email: "inspector1@example.com",
    fullName: "Hoàng Văn E",
    phoneNumber: "0945678901",
    password: "inspectorpass",
    avtUrl: "https://i.pravatar.cc/150?u=5",
    role: "Inspector",
    walletBalance: 3000000,
    status: "Active",
  },
  {
    id: "6",
    email: "admin@example.com",
    fullName: "Admin User",
    phoneNumber: "0956789012",
    password: "adminpass",
    role: "Admin",
    walletBalance: 10000000,
    status: "Active",
  },
];

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

  // User management - using mock data for now, will switch to real API later
  async getUsers(): Promise<AdminUser[]> {
    // TODO: Replace with real API call when backend is ready
    // const response = await http.get<unknown>("/api/admin/users");
    // return extractArray(response).map(normalizeUser);
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_USERS), 300);
    });
  },

  async getUserById(userId: string): Promise<AdminUser | null> {
    // TODO: Replace with real API call when backend is ready
    // const response = await http.get<unknown>(`/api/admin/users/${userId}`);
    // const normalized = normalizeUser(response);
    // return normalized.id ? normalized : null;
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.id === userId) || null;
        resolve(user);
      }, 300);
    });
  },
};
