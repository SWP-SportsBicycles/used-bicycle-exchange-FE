// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'api', 'buyer-api.ts');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = 'function normalizeOrder(raw: Record<string, unknown>): BuyerOrder {';
const endMarker = '// ===== BUYER API (qua BE) =====';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found! start:', startIdx, 'end:', endIdx);
  process.exit(1);
}

console.log('Patching normalizeOrder at index', startIdx, '->', endIdx);

const newFn = `function normalizeOrder(raw: Record<string, unknown>): BuyerOrder {
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

`;

const newContent = content.slice(0, startIdx) + newFn + '\n' + content.slice(endIdx);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done! normalizeOrder patched. Length diff:', newContent.length - content.length);
