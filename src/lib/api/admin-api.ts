import { http } from "@/lib/api/http";

type ListingStatus = "pending" | "approved" | "rejected";

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

export interface CreateInspectorPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
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
  if (value === "approved") return "approved";
  if (value === "rejected") return "rejected";
  return "pending";
}

function normalizeListing(raw: unknown): AdminListing {
  const source = extractPayloadObject(raw);
  const maybePrice = typeof source.price === "number" ? source.price : Number(source.price);
  const imageList = Array.isArray(source.images)
    ? source.images.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id: pickString(source, ["id", "listingId"]) || crypto.randomUUID(),
    title: pickString(source, ["title", "listingTitle"]) || "Untitled listing",
    serial: pickString(source, ["serial", "serialNumber", "frameNumber"]),
    city: pickString(source, ["city", "location"]),
    price: Number.isFinite(maybePrice) ? maybePrice : 0,
    brand: pickString(source, ["brand"]),
    model: pickString(source, ["model"]),
    submittedAt: pickString(source, ["submittedAt", "createdAt", "submitDate"]) || undefined,
    status: toListingStatus(source.status),
    images: imageList,
  };
}

export const adminApi = {
  async getListings() {
    const response = await http.get<unknown>("/api/admin-listing");
    return extractArray(response).map(normalizeListing);
  },

  async getListingDetail(listingId: string) {
    const response = await http.get<unknown>(`/api/admin-listing/${listingId}`);
    return normalizeListing(response);
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
};
