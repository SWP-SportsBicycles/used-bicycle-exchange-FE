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
  videoUrls?: string[];
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
    | "pending"
    | "paid"
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

export interface CheckoutPreview {
  shippingFee: number;
  totalPrice: number;
  subtotal: number;
  selectedItemCount: number;
}

export interface BuyerCartItem {
  id: string;
  bikeId: string;
  listingId: string;
  isSelected: boolean;
  listing: BuyerListing;
  addedAt?: string;
  updatedAt?: string;
}

export interface BuyerCart {
  items: BuyerCartItem[];
  totalCount: number;
  selectedCount: number;
  subtotal: number;
}

export interface OrderStatusResponse {
  orderId: string;
  status: BuyerOrder["status"];
  payosStatus?: "pending" | "paid" | "failed";
}

export interface DisputePayload {
  type: string;               // BE expects ReportTypeEnum
  reason: string;
  mediaUrls?: string[];       // Video evidence URLs (uploaded via /api/Upload/video)
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
 * Normalize listing từ BE — xử lý 2 dạng response:
 *
 * 1. Listing list  (GET /api/buyer-listing):
 *    Fields phẳng: { listingId, title, brand, price, thumbnail, ... }
 *
 * 2. Listing detail (GET /api/buyer-listing/{id}):
 *    Fields xe nằm trong nested array:
 *    { listingId, title, bikes: [{ brand, price, category, ... }] }
 *
 * Chiến lược: merge bikes[0] LÊN TRÊN item, nhưng với các field quan trọng
 * (price, brand, city, ...) phải ưu tiên bikes[0] vì root-level có thể null/undefined.
 */
function normalizeListing(raw: Record<string, unknown>): BuyerListing {
  const item = raw as Record<string, unknown>;

  // ── Extract bikes[0] if present (detail endpoint) ───────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bikesArr = item.bikes as any[] | undefined;
  const bike0 = Array.isArray(bikesArr) && bikesArr.length > 0 ? bikesArr[0] as Record<string, unknown> : null;

  // Merge strategy: bike0 first (fields from nested bikes[]), then item overrides
  // BUT we must NOT let undefined root-level values override bike0 values.
  // So we merge manually for key fields.
  const merged: Record<string, unknown> = bike0
    ? { ...bike0, ...item }
    : { ...item };

  // ── id ───────────────────────────────────────────────────────────────────
  const id = (merged.listingId || merged.id || "") as string;
  const bikeId = (merged.bikeId || bike0?.bikeId || "") as string;

  // ── price: must come from bikes[0].salePrice / price / unitPrice if root is missing
  // item.price is undefined in detail response; bike0.salePrice or bike0.price has the value
  // merged.unitPrice may be injected from cart item root level
  const rawPrice = merged.price ?? merged.unitPrice ?? bike0?.salePrice ?? bike0?.price ?? 0;
  const price = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice)) || 0;

  const sanitizeUrl = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
  const isVideoUrl = (url: string) => /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url) || url.includes("/video/");

  const mediaItems: unknown[] = [
    ...(Array.isArray(merged.medias) ? merged.medias : []),
    ...(Array.isArray(bike0?.medias) ? bike0.medias : []),
    ...(Array.isArray(merged.media) ? merged.media : []),
    ...(Array.isArray(bike0?.media) ? bike0.media : []),
  ];

  const mediaImageUrls: string[] = [];
  const mediaVideoUrls: string[] = [];
  for (const media of mediaItems) {
    if (typeof media === "string") {
      const url = sanitizeUrl(media);
      if (!url) continue;
      if (isVideoUrl(url)) mediaVideoUrls.push(url);
      else mediaImageUrls.push(url);
      continue;
    }

    if (!media || typeof media !== "object") continue;

    const record = media as Record<string, unknown>;
    const url = sanitizeUrl(record.url);
    const image = sanitizeUrl(record.image) ?? sanitizeUrl(record.imageUrl) ?? sanitizeUrl(record.thumbnail);
    const video = sanitizeUrl(record.videoUrl) ?? sanitizeUrl(record.video);
    const mediaType = sanitizeUrl(record.mediaType)?.toLowerCase() ?? "";
    const type = record.type;
    const isVideoType = type === 1 || mediaType === "video";

    if (image) mediaImageUrls.push(image);
    if (video) mediaVideoUrls.push(video);
    if (url) {
      if (isVideoType || isVideoUrl(url)) mediaVideoUrls.push(url);
      else mediaImageUrls.push(url);
    }
  }

  const directVideoUrls = [
    ...(Array.isArray(merged.videoUrls) ? merged.videoUrls : []),
    ...(Array.isArray(merged.mediaUrls) ? merged.mediaUrls : []),
    ...(Array.isArray(bike0?.videoUrls) ? bike0.videoUrls : []),
    ...(Array.isArray(bike0?.mediaUrls) ? bike0.mediaUrls : []),
  ]
    .map(sanitizeUrl)
    .filter((url): url is string => Boolean(url));

  const uniqueMediaImages = [...new Set(mediaImageUrls)];
  const uniqueVideoUrls = [...new Set([...mediaVideoUrls, ...directVideoUrls])];

  // ── images ───────────────────────────────────────────────────────────────
  const PLACEHOLDER = "https://placehold.co/800x600/1a1a1a/aee86c?text=No+Image";
  const images: string[] =
    Array.isArray(merged.images) && (merged.images as string[]).length > 0
      ? merged.images as string[]
      : merged.thumbnail
        ? [merged.thumbnail as string]
        : uniqueMediaImages.length > 0
          ? uniqueMediaImages
        : [PLACEHOLDER];

  // ── city: BE detail may return "TP.HCM", list returns slug ──────────────
  const rawCity = ((merged.city ?? bike0?.city) as string) || "";
  const cityMap: Record<string, string> = {
    "TP.HCM": "hcm", "tp.hcm": "hcm", "hồ chí minh": "hcm", "ho chi minh": "hcm",
    "Hà Nội": "hanoi", "hà nội": "hanoi",
    "Đà Nẵng": "danang", "đà nẵng": "danang",
  };
  const city = cityMap[rawCity] ?? (rawCity || "");

  // ── serial: "serialNumber" (detail) vs "serial" (list) ──────────────────
  const serial = ((merged.serial ?? merged.serialNumber ?? bike0?.serialNumber) as string) || "";

  // ── condition ────────────────────────────────────────────────────────────
  const condition = ((merged.condition ?? bike0?.condition) as string) || "good";

  // ── wheelSize: "tireRim" in detail ──────────────────────────────────────
  const wheelSize = ((merged.wheelSize ?? merged.tireRim ?? bike0?.tireRim) as string) || "";

  // ── VeloSafe: "Checked" overall → true ──────────────────────────────────
  const overall = ((merged.overall ?? bike0?.overall) as string) || "";
  const isVeloSafeVerified =
    (merged.isVeloSafeVerified as boolean | undefined) ??
    (merged.isInspected as boolean | undefined) ??
    overall.toLowerCase() === "checked";

  // ── createdAt: fallback to now if missing ────────────────────────────────
  const createdAt = (merged.createdAt as string) || "";
  const rawTitle = ((merged.title ?? bike0?.title) as string | undefined)?.trim() || "";
  const fallbackTitle = [
    ((merged.brand ?? bike0?.brand) as string | undefined)?.trim() || "",
    ((merged.model ?? bike0?.model) as string | undefined)?.trim() || "",
  ]
    .filter(Boolean)
    .join(" ");
  const title = rawTitle || fallbackTitle || "Xe dap da qua su dung";
  const category = ((merged.category ?? bike0?.category) as string) || "road";
  const updatedAt = ((merged.updatedAt ?? merged.createdAt) as string) || createdAt;

  const listing: BuyerListing = {
    ...merged,
    id,
    bikeId,
    price,
    images,
    videoUrls: uniqueVideoUrls,
    city,
    serial,
    condition: condition as BuyerListing["condition"],
    wheelSize,
    isVeloSafeVerified,
    createdAt,
    status: normalizeListingStatus(merged.status ?? bike0?.status),
    isLocked: parseBoolean(merged.isLocked ?? bike0?.isLocked),
    // Bike spec fields — prefer bike0 values when root-level is missing
    brand: ((merged.brand ?? bike0?.brand) as string) || "",
    model: ((merged.model ?? bike0?.model) as string) || "",
    frameSize: ((merged.frameSize ?? bike0?.frameSize) as string) || "",
    frameMaterial: ((merged.frameMaterial ?? bike0?.frameMaterial) as string) || "",
    groupset: ((merged.groupset ?? bike0?.groupset) as string) || "",
    description: (merged.description as string) || "",
    seller: (merged.seller as BuyerListing["seller"]) ?? {
      id: "",
      name: (merged.sellerName as string) || "Người bán",
      rating: (merged.sellerRating as number) || 4.5,
      totalSales: (merged.sellerTotalSales as number) || 0,
      memberSince: (merged.sellerMemberSince as string) || "",
    },
    title,
    category,
    updatedAt,
  };

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
    items: Array.isArray(items)
      ? (items as Record<string, unknown>[]).map((item) => normalizeOrder(item))
      : [],
    totalCount: page?.totalCount ?? page?.totalItems ?? items.length,
    pageNumber: page?.pageNumber ?? 1,
    pageSize: page?.pageSize ?? 10,
    totalPages: page?.totalPages ?? 1,
  };
}

function parseNumber(value: unknown) {
  return typeof value === "number" ? value : parseFloat(String(value ?? "")) || 0;
}

function parseOptionalString(value: unknown) {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  if (!normalized || normalized === "undefined" || normalized === "null") {
    return undefined;
  }

  return normalized;
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "locked";
}

function normalizeListingStatus(value: unknown): BuyerListing["status"] {
  const normalized = String(value ?? "").trim().toLowerCase();
  const allowedStatuses: BuyerListing["status"][] = [
    "draft",
    "pending_review",
    "published",
    "reserved",
    "sold",
    "withdrawn",
  ];

  if (allowedStatuses.includes(normalized as BuyerListing["status"])) {
    return normalized as BuyerListing["status"];
  }

  if (normalized === "pending" || normalized.includes("review")) return "pending_review";
  if (normalized === "approved" || normalized === "active" || normalized === "available") return "published";
  if (normalized.includes("publish")) return "published";
  if (normalized.includes("reserve") || normalized.includes("lock")) return "reserved";
  if (normalized.includes("sold")) return "sold";
  if (normalized.includes("withdraw")) return "withdrawn";

  return "published";
}

function normalizeOrderStatus(value: unknown): BuyerOrder["status"] {
  const normalized = String(value ?? "").trim().toLowerCase();
  const allowedStatuses: BuyerOrder["status"][] = [
    "pending",
    "paid",
    "shipping",
    "delivered",
    "completed",
    "cancelled",
    "disputed",
  ];

  if (allowedStatuses.includes(normalized as BuyerOrder["status"])) {
    return normalized as BuyerOrder["status"];
  }

  // Backend trả "Locked" cho đơn vừa tạo (chờ thanh toán) → map về pending
  if (normalized === "locked") return "pending";
  if (normalized.includes("cancel")) return "cancelled";
  if (normalized.includes("disput")) return "disputed";
  if (normalized.includes("deliver")) return "delivered";
  if (normalized.includes("ship")) return "shipping";
  if (normalized.includes("paid") || normalized.includes("payment_success")) return "paid";

  return "pending";
}

function normalizeCartItem(raw: Record<string, unknown>): BuyerCartItem {
  // BE cart item response shape:
  // { cartItemId, bikeId, listingId, unitPrice, isSelected, bike: { salePrice, ... } }
  // unitPrice lives at root level — inject it into listingSource so normalizeListing can pick it up.
  const bikeSource =
    raw.listing && typeof raw.listing === "object"
      ? (raw.listing as Record<string, unknown>)
      : raw.bike && typeof raw.bike === "object"
        ? (raw.bike as Record<string, unknown>)
        : raw;

  // Merge root-level unitPrice / price so normalizeListing's price chain picks them up.
  const listingSource: Record<string, unknown> = {
    ...bikeSource,
    ...(raw.unitPrice != null ? { unitPrice: raw.unitPrice } : {}),
    ...(raw.price != null ? { price: raw.price } : {}),
  };

  const listing = normalizeListing(listingSource);

  return {
    id: ((raw.id ?? raw.cartItemId) as string) || listing.id,
    bikeId: ((raw.bikeId ?? listing.bikeId) as string) || "",
    listingId: ((raw.listingId ?? listing.id) as string) || listing.id,
    isSelected: (raw.isSelected as boolean | undefined) ?? true,
    listing,
    addedAt: (raw.createdAt as string) || undefined,
    updatedAt: (raw.updatedAt as string) || undefined,
  };
}

function normalizeCart(raw: unknown): BuyerCart {
  const data =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  const rawItems =
    (Array.isArray(data.items) ? data.items :
      Array.isArray(data.cartItems) ? data.cartItems :
      Array.isArray(raw) ? raw : []) as Record<string, unknown>[];

  const items = rawItems.map((item) => normalizeCartItem(item));
  const selectedItems = items.filter((item) => item.isSelected);
  const subtotal = selectedItems.reduce((sum, item) => sum + parseNumber(item.listing.price), 0);

  return {
    items,
    totalCount: Number(data.totalCount ?? data.totalItems ?? items.length) || items.length,
    selectedCount: Number(data.selectedCount ?? selectedItems.length) || selectedItems.length,
    subtotal: parseNumber(data.subtotal ?? data.totalPrice ?? subtotal),
  };
}

function normalizeCheckoutPreview(raw: unknown): CheckoutPreview {
  const data =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  return {
    shippingFee: parseNumber(data.shippingFee ?? data.shipFee),
    totalPrice: parseNumber(data.totalPrice ?? data.amount),
    subtotal: parseNumber(data.subtotal ?? data.itemTotal ?? data.bikePrice),
    selectedItemCount:
      Number(data.selectedItemCount ?? data.itemCount ?? data.totalItems) || 1,
  };
}

function normalizeCheckoutResponse(raw: unknown): CheckoutResponse {
  const data =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  const paymentObj = data.payment as Record<string, unknown> | undefined;
  const paymentLink = parseOptionalString(
    paymentObj?.paymentLink ?? paymentObj?.checkoutUrl ?? paymentObj?.qrCode
  );

  return {
    orderId: String(data.orderId ?? data.id ?? ""),
    payosQrUrl:
      parseOptionalString(paymentLink ?? data.checkoutUrl ?? data.payosQrUrl ?? data.qrCode) ?? "",
    shippingFee: parseNumber(data.shippingFee ?? data.shipFee),
    // Phase B: BE trả "totalAmount", không phải "totalPrice"
    totalPrice: parseNumber(data.totalPrice ?? data.totalAmount ?? data.amount ?? data.finalAmount ?? data.subtotal),
    expiresAt: String(data.expiresAt ?? data.expiredAt ?? ""),
  };
}

function normalizeOrder(raw: Record<string, unknown>): BuyerOrder {
  const src = raw as Record<string, unknown>;
  const id = ((src.id ?? src.orderId) as string) || "";

  // items[0]: BE order list thường trả bike info trong items[]
  const items0 =
    Array.isArray(src.items) && src.items.length > 0
      ? (src.items[0] as Record<string, unknown>)
      : null;

  // items[0].bike: BE có thể nest bike object bên trong item
  const items0Bike =
    items0 && items0.bike && typeof items0.bike === "object"
      ? (items0.bike as Record<string, unknown>)
      : items0 && items0.listing && typeof items0.listing === "object"
        ? (items0.listing as Record<string, unknown>)
        : null;

  // Ưu tiên src.listing → items0.bike → items0 (flat) → {}
  const listingSrc: Record<string, unknown> =
    src.listing && typeof src.listing === "object"
      ? (src.listing as Record<string, unknown>)
      : (items0Bike ?? items0 ?? {});

  // listingId: dùng để fallback-fetch nếu thiếu ảnh/title
  const listingId =
    ((src.listingId
      ?? listingSrc.id ?? listingSrc.listingId
      ?? (items0 ? items0.listingId : undefined) ?? (items0 ? items0.bikeId : undefined)
      ?? (items0Bike ? items0Bike.id : undefined) ?? (items0Bike ? items0Bike.listingId : undefined)
    ) as string) || "";

  // title: dò từ nhiều nơi
  const title = (
    (listingSrc.title ?? listingSrc.bikeName ?? listingSrc.name
     ?? (items0 ? items0.bikeName : undefined) ?? (items0 ? items0.title : undefined) ?? (items0 ? items0.name : undefined)
     ?? (items0Bike ? items0Bike.title : undefined) ?? (items0Bike ? items0Bike.bikeName : undefined) ?? (items0Bike ? items0Bike.name : undefined)
     ?? src.listingTitle
    ) as string
  ) || "";

  // price
  const listingPrice = parseNumber(
    listingSrc.price ?? listingSrc.unitPrice ?? listingSrc.salePrice
    ?? (items0 ? items0.unitPrice : undefined) ?? (items0 ? items0.price : undefined) ?? (items0 ? items0.salePrice : undefined)
    ?? (items0Bike ? items0Bike.salePrice : undefined) ?? (items0Bike ? items0Bike.price : undefined)
    ?? 0
  );

  // images: dò qua nhiều field name và cấu trúc lồng nhau
  const collectImages = (obj: Record<string, unknown> | null | undefined): string[] => {
    if (!obj) return [];
    const sanitize = (v: unknown): string | null =>
      typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

    if (Array.isArray(obj.images)) {
      const urls = (obj.images as unknown[]).map(sanitize).filter(Boolean) as string[];
      if (urls.length) return urls;
    }
    if (Array.isArray(obj.medias)) {
      const urls: string[] = [];
      for (const m of obj.medias as unknown[]) {
        if (typeof m === "string") { const s = sanitize(m); if (s) urls.push(s); continue; }
        if (m && typeof m === "object") {
          const rec = m as Record<string, unknown>;
          const u = sanitize(rec.url) ?? sanitize(rec.image) ?? sanitize(rec.imageUrl) ?? sanitize(rec.thumbnail);
          if (u) urls.push(u);
        }
      }
      if (urls.length) return urls;
    }
    const scalar = sanitize(obj.thumbnail) ?? sanitize(obj.imageUrl) ?? sanitize(obj.image) ?? sanitize(obj.avatarUrl);
    if (scalar) return [scalar];
    return [];
  };

  const fromListingSrc = collectImages(listingSrc);
  const fromBike = collectImages(items0Bike ?? undefined);
  const fromItems0 = collectImages(items0 ?? undefined);
  const listingImages = (
    fromListingSrc.length ? fromListingSrc
    : fromBike.length ? fromBike
    : fromItems0
  ).filter((s) => s.length > 0);

  const status = normalizeOrderStatus(src.status);
  const paymentSource =
    src.payment && typeof src.payment === "object"
      ? (src.payment as Record<string, unknown>)
      : undefined;

  return {
    ...src,
    id,
    listingId,
    listing: {
      id: ((listingSrc.id ?? listingId) as string) || listingId,
      title: title || "Xe đạp",
      images: listingImages,
      price: listingPrice,
    },
    status,
    receiverName: (src.receiverName as string) || "",
    receiverPhone: (src.receiverPhone as string) || "",
    receiverAddress: (src.receiverAddress as string) || "",
    shippingFee: parseNumber(src.shippingFee ?? src.shipFee
      ?? (src.shipment && typeof src.shipment === "object"
          ? (src.shipment as Record<string, unknown>).fee
          : undefined)),
    totalPrice: parseNumber(src.totalPrice ?? src.totalAmount ?? src.amount),
    payosQrUrl: parseOptionalString(
      paymentSource?.paymentLink ?? paymentSource?.checkoutUrl ?? src.checkoutUrl ?? src.payosQrUrl
    ),
    waybillCode: (src.waybillCode as string) || undefined,
    expiresAt: (src.expiresAt as string) || undefined,
    seller:
      src.seller && typeof src.seller === "object"
        ? (src.seller as BuyerOrder["seller"])
        : undefined,
    createdAt: (src.createdAt as string) || "",
    updatedAt: (src.updatedAt as string) || "",
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
   */
  addToCart: (data: { bikeId: string; quantity: number }) =>
    http.post<unknown>("/api/buyer-cart/add", { bikeId: data.bikeId }),

  getCart: async () => {
    const raw = await http.get<unknown>("/api/buyer-cart/my-cart");
    return normalizeCart(unwrap(raw));
  },

  updateCartSelection: (cartItemId: string, isSelected: boolean) =>
    http.put<unknown>("/api/buyer-cart/selection", { cartItemId, isSelected }),

  removeCartItem: (cartItemId: string) =>
    http.delete<unknown>(`/api/buyer-cart/items/${cartItemId}`),

  previewCheckout: async (data: Omit<CheckoutPayload, "listingId">) => {
    const raw = await http.post<unknown>("/api/buyer-cart/preview-checkout", {
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      receiverAddress: data.receiverAddress,
      toDistrictId: data.toDistrictId,
      toWardCode: data.toWardCode,
    });
    return normalizeCheckoutPreview(unwrap(raw));
  },

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
    return normalizeCheckoutResponse(unwrap(raw));
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
    return normalizeCheckoutResponse(unwrap(raw));
  },

  /** Bước 3: Lấy link/QR PayOS cho Order vừa tạo */
  getPaymentLink: async (orderId: string) => {
    const raw = await http.post<unknown>(`/api/payment/${orderId}`);
    const data = unwrap<Record<string, unknown>>(raw);
    const paymentSource =
      data.payment && typeof data.payment === "object"
        ? (data.payment as Record<string, unknown>)
        : undefined;

    return {
      checkoutUrl: parseOptionalString(
        paymentSource?.paymentLink ?? data.checkoutUrl ?? data.paymentLink
      ),
      qrCode: parseOptionalString(data.qrCode ?? paymentSource?.qrCode),
    };
  },

  /** Polling — kiểm tra trạng thái thanh toán PayOS */
  getOrderStatus: async (orderId: string) => {
    const raw = await http.get<unknown>(`/api/buyer-order/${orderId}`);
    const data = unwrap<Record<string, unknown>>(raw);
    const order = normalizeOrder(data);
    return {
      orderId: order.id,
      status: order.status,
      payosStatus:
        order.status === "paid"
          ? "paid"
          : order.status === "cancelled"
            ? "failed"
            : "pending",
    } satisfies OrderStatusResponse;
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
    const data = unwrap<Record<string, unknown>>(raw);
    return normalizeOrder(data);
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
      ...(data.mediaUrls && data.mediaUrls.length > 0 ? { mediaUrls: data.mediaUrls } : {}),
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

    // Normalize helper — đảm bảo listing.id luôn có giá trị (BE dùng listingId)
    const normalizeItems = (items: unknown[]): BuyerListing[] =>
      items.map((item) => normalizeListing(item as Record<string, unknown>));

    // BE may return array or paginated object
    if (Array.isArray(data)) {
      return {
        items: normalizeItems(data),
        totalCount: data.length,
        pageNumber: page,
        pageSize: size,
        totalPages: 1,
      } as WishlistPage;
    }

    const obj = data as Record<string, unknown>;
    const rawItems = Array.isArray(obj?.items) ? (obj.items as unknown[]) : [];
    return {
      ...obj,
      items: normalizeItems(rawItems),
    } as WishlistPage;
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
  // Swagger: POST /api/payment/cancel/{orderId} — CancelOrderDTO { reason? }
  cancelOrder: (orderId: string, reason?: string) =>
    http.post<unknown>(`/api/buyer-order/${orderId}/cancel`, reason ? { reason } : {}),
};
