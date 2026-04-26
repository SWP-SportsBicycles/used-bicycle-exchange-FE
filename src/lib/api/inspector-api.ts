import { http } from "@/lib/api/http";

export interface InspectorPendingListing {
  id: string;
  title: string;
  city: string;
  price: number;
  brand: string;
  status: string;
  thumbnail: string | null;
  totalImages: number;
  hasVideo: boolean;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerAddress?: string;
}

export interface InspectorListingMedia {
  id: string;
  image: string | null;
  videoUrl: string | null;
  type: string;
}

export interface InspectorListingBike {
  bikeId: string;
  serialNumber: string;
  brand: string;
  category: string;
  frameSize: string;
  frameMaterial: string;
  condition: string;
  paint: string;
  groupset: string;
  operating: string;
  tireRim: string;
  brakeType: string;
  overall: string;
  price: number;
  city: string;
  medias: InspectorListingMedia[];
}

export interface InspectorListingDetail {
  listingId: string;
  title: string;
  description: string;
  city: string;
  status: string;
  rejectReason: string | null;
  seller: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  bikes: InspectorListingBike[];
}

export interface SubmitInspectionPayload {
  comment: string;
  frame: boolean;
  paintCondition: boolean;
  drivetrain: boolean;
  brakes: boolean;
  forcePass: boolean;
  isFlagged: boolean;
}

export interface InspectorHistory {
  id: string;
  userId: string;
  user: unknown | null;
  frame: boolean;
  paintCondition: boolean;
  drivetrain: boolean;
  brakes: boolean;
  score: number;
  comment: string;
  inspectionDate: string;
  bike: unknown | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface InspectorHistoryPaginated {
  items: InspectorHistory[];
  totalItems: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
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
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const root = payload as Record<string, unknown>;
  const candidates = [root.data, root.items, root.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.items)) return nested.items;
      if (Array.isArray(nested.results)) return nested.results;
      if (Array.isArray(nested.data)) return nested.data;
    }
  }

  return [];
}

function pickString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    if (typeof source[key] === "string" && source[key]) {
      return source[key] as string;
    }
  }
  return "";
}

function pickBoolean(source: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    if (typeof source[key] === "boolean") {
      return source[key] as boolean;
    }
  }
  return false;
}

function pickNumber(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function normalizePendingListing(raw: unknown): InspectorPendingListing {
  const source = extractPayloadObject(raw);
  const sellerRaw = source.seller && typeof source.seller === "object" ? (source.seller as Record<string, unknown>) : {};

  return {
    id: pickString(source, ["id", "listingId"]) || crypto.randomUUID(),
    title: pickString(source, ["title", "listingTitle"]) || "Untitled listing",
    city: pickString(source, ["city"]),
    price: pickNumber(source, ["price"]),
    brand: pickString(source, ["brand"]),
    status: pickString(source, ["status"]),
    thumbnail: pickString(source, ["thumbnail"]) || null,
    totalImages: pickNumber(source, ["totalImages"]),
    hasVideo: pickBoolean(source, ["hasVideo"]),
    sellerName: pickString(source, ["sellerName", "fullName"]) || pickString(sellerRaw, ["fullName", "name"]) || undefined,
    sellerEmail: pickString(source, ["sellerEmail", "email"]) || pickString(sellerRaw, ["email"]) || undefined,
    sellerPhone: pickString(source, ["sellerPhone", "phoneNumber"]) || pickString(sellerRaw, ["phoneNumber", "phone"]) || undefined,
    sellerAddress: pickString(source, ["sellerAddress", "address"]) || pickString(sellerRaw, ["address", "city"]) || undefined,
  };
}

function normalizeMedia(raw: unknown): InspectorListingMedia | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const source = raw as Record<string, unknown>;
  return {
    id: pickString(source, ["id"]) || crypto.randomUUID(),
    image: pickString(source, ["image"]) || null,
    videoUrl: pickString(source, ["videoUrl"]) || null,
    type: pickString(source, ["type"]) || "Normal",
  };
}

function normalizeBike(raw: unknown): InspectorListingBike {
  const source = extractPayloadObject(raw);
  const medias = extractArray(source.medias).map(normalizeMedia).filter((item): item is InspectorListingMedia => Boolean(item));

  return {
    bikeId: pickString(source, ["bikeId", "id"]) || crypto.randomUUID(),
    serialNumber: pickString(source, ["serialNumber", "serial"]),
    brand: pickString(source, ["brand"]),
    category: pickString(source, ["category"]),
    frameSize: pickString(source, ["frameSize"]),
    frameMaterial: pickString(source, ["frameMaterial"]),
    condition: pickString(source, ["condition"]),
    paint: pickString(source, ["paint"]),
    groupset: pickString(source, ["groupset"]),
    operating: pickString(source, ["operating"]),
    tireRim: pickString(source, ["tireRim"]),
    brakeType: pickString(source, ["brakeType"]),
    overall: pickString(source, ["overall"]),
    price: pickNumber(source, ["price"]),
    city: pickString(source, ["city"]),
    medias,
  };
}

function normalizeListingDetail(payload: unknown): InspectorListingDetail {
  const source = extractPayloadObject(payload);
  const sellerRaw = source.seller && typeof source.seller === "object" ? (source.seller as Record<string, unknown>) : {};
  const bikes = extractArray(source.bikes).map(normalizeBike);

  return {
    listingId: pickString(source, ["listingId", "id"]),
    title: pickString(source, ["title"]) || "Untitled listing",
    description: pickString(source, ["description"]),
    city: pickString(source, ["city"]),
    status: pickString(source, ["status"]),
    rejectReason: pickString(source, ["rejectReason"]) || null,
    seller: {
      userId: pickString(sellerRaw, ["userId"]),
      fullName: pickString(sellerRaw, ["fullName", "name"]),
      email: pickString(sellerRaw, ["email"]),
      phoneNumber: pickString(sellerRaw, ["phoneNumber", "phone"]),
    },
    bikes,
  };
}

export const inspectorApi = {
  async getPendingListings() {
    const response = await http.get<unknown>("/api/inspector-listing/pending");
    return extractArray(response).map(normalizePendingListing);
  },

  async getListingDetail(listingId: string) {
    const response = await http.get<unknown>(`/api/inspector-listing/${listingId}`);
    return normalizeListingDetail(response);
  },

  submitToAdmin(listingId: string, payload: SubmitInspectionPayload) {
    return http.post<unknown>(`/api/inspector-listing/${listingId}/submit-to-admin`, payload);
  },

  // Inspector History APIs
  async getHistory(pageNumber = 1, pageSize = 10): Promise<InspectorHistoryPaginated> {
    const response = await http.get<unknown>(`/api/inspector/history?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    const source = extractPayloadObject(response);
    const data = source.data && typeof source.data === "object" ? (source.data as Record<string, unknown>) : source;

    return {
      items: extractArray(data.items).map(normalizeHistory),
      totalItems: pickNumber(data, ["totalItems", "totalCount"]),
      totalPages: pickNumber(data, ["totalPages"]),
      pageNumber: pickNumber(data, ["pageNumber", "page"]),
      pageSize: pickNumber(data, ["pageSize", "limit"]),
    };
  },

  async getHistoryById(inspectionId: string): Promise<InspectorHistory | null> {
    const response = await http.get<unknown>(`/api/inspector/history/${inspectionId}`);
    const normalized = normalizeHistory(response);
    return normalized.id ? normalized : null;
  },
};

function normalizeHistory(raw: unknown): InspectorHistory {
  const source = extractPayloadObject(raw);

  return {
    id: pickString(source, ["id", "inspectionId"]) || crypto.randomUUID(),
    userId: pickString(source, ["userId"]) || "",
    user: source.user ?? null,
    frame: pickBoolean(source, ["frame"]),
    paintCondition: pickBoolean(source, ["paintCondition", "paint_condition"]),
    drivetrain: pickBoolean(source, ["drivetrain"]),
    brakes: pickBoolean(source, ["brakes"]),
    score: pickNumber(source, ["score"]),
    comment: pickString(source, ["comment", "notes"]) || "",
    inspectionDate: pickString(source, ["inspectionDate", "inspection_date", "date"]) || "",
    bike: source.bike ?? null,
    createdAt: pickString(source, ["createdAt", "created_at"]) || "",
    updatedAt: pickString(source, ["updatedAt", "updated_at"]) || "",
    isDeleted: pickBoolean(source, ["isDeleted", "is_deleted", "deleted"]),
  };
}
