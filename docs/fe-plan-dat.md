# 👤 Đạt (Lead) — Public + Buyer + Foundation

**Mục tiêu:** Xây dựng toàn bộ trải nghiệm Buyer — từ trang chủ, marketplace, chi tiết xe, đến order flow (đặt cọc → thanh toán → tracking → xác nhận nhận hàng). Setup foundation (API client, Auth context) cho cả team dùng.

---

## Màn hình & Component cần build

| # | Màn hình | Route | Độ phức tạp |
|---|---------|-------|-------------|
| 1 | Foundation (API client + Auth Context) | `src/lib/` | 🔴 |
| 2 | Homepage (Landing page) | `/` | 🟡 |
| 3 | Marketplace (Browse + Search + Filter) | `/marketplace` | 🟡 |
| 4 | Listing Detail (PDP) | `/marketplace/[id]` | 🔴 |
| 5 | Order Creation (chọn gói SR + info) | `/buyer/orders/new?listingId=xxx` | 🔴 |
| 6 | My Orders (danh sách đơn) | `/buyer/orders` | 🟡 |
| 7 | Order Detail (state machine UI) | `/buyer/orders/[id]` | 🔴 |
| 8 | Wishlist | `/buyer/wishlist` | 🟢 |

---

## Danh sách công việc

### Sprint 1 — Foundation + Marketplace (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| D1 | Setup API client `src/lib/api/http.ts` | File `http.ts` với `api.get/post/put/delete/upload`, auto refresh token, error handling | 3h | - |
| D2 | Setup Auth Context + Provider | File `auth-context.tsx`: `useAuth()` hook trả `user, isAuthenticated, login, logout`. Wrap trong `providers.tsx` | 4h | D1 |
| D3 | Setup `buyer-api.ts` | File service với tất cả buyer API calls (listings, orders, wishlist, shipment) | 2h | D1 |
| D4 | Trang Homepage cơ bản | Route `(public)/page.tsx` → `HomepageScreen.tsx`: Hero section, featured listings (gọi `GET /api/buyer-listing?pageSize=6`), CTA | 4h | D1 |
| D5 | Marketplace — listing grid + pagination | Route `(public)/marketplace/page.tsx` → `MarketplaceScreen.tsx`: Grid card listing, pagination, loading skeleton | 4h | D3 |
| D6 | Marketplace — search + filter sidebar | Component `ListingFilters.tsx`: keyword, brand, category, price range, frameSize, condition. Gọi `GET /api/buyer-listing/search` | 3h | D5 |

### Sprint 2 — PDP + Order Flow (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| D7 | Listing Detail Page (PDP) | Route `(public)/marketplace/[id]/page.tsx` → Gallery ảnh, specs table, price, seller info (PII ẩn), nút "Đặt mua", nút "Thêm Wishlist" | 4h | D3 |
| D8 | Order Creation Flow | Route `(buyer)/buyer/orders/new/page.tsx` → Form: receiverName, receiverPhone, receiverAddress. Gọi `POST /api/buyer-order` body `{ bikeId, receiverName, receiverPhone, receiverAddress }` | 4h | D3 |
| D9 | My Orders List | Route `(buyer)/buyer/orders/page.tsx` → Table/card list đơn hàng, status badge theo màu, filter theo status | 3h | D3 |
| D10 | Order Detail — State machine UI | Route `(buyer)/buyer/orders/[id]/page.tsx` → Stepper hiển thị trạng thái, payment section, nút "Đã thanh toán" (`POST /api/buyer-order/{id}/paid`), nút "Xác nhận nhận hàng" | 4h | D9 |
| D11 | Wishlist Page | Route `(buyer)/buyer/wishlist/page.tsx` → Grid listing đã lưu, nút remove. API: `GET /api/wishlist`, `DELETE /api/wishlist/{bikeId}` | 2h | D3 |
| D12 | Wishlist — toggle button trên listing card | Component `WishlistButton.tsx` dùng chung trên PDP và Marketplace card. `POST /api/wishlist/{bikeId}` | 1h | D11 |

### Sprint 3 — Shipping + Polish (3 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| D13 | Shipment — tạo đơn vận chuyển | Trong OrderDetail: form tạo shipment (`POST /api/buyer-shipment/{orderId}`) nếu buyer chọn giao hàng | 3h | D10 |
| D14 | Shipment — tracking + sync | Component `ShipmentTracker.tsx`: hiển thị trạng thái giao hàng, nút "Đồng bộ" gọi `POST /api/buyer-shipment/sync/{orderId}` | 2h | D13 |
| D15 | Responsive + Loading states | Skeleton loading cho Marketplace/Orders, empty states, error boundaries | 3h | D5,D9 |
| D16 | Integration test + bug fix | Chạy toàn bộ flow E2E: browse → detail → order → paid → tracking → confirm | 4h | All |

---

## Hướng dẫn triển khai

### Cấu trúc folder

```
src/app/(public)/
├── page.tsx                        ← Homepage
└── marketplace/
    ├── page.tsx                    ← Marketplace browse
    └── [id]/
        └── page.tsx               ← Listing Detail (PDP)

src/app/(buyer)/buyer/
├── layout.tsx                     ← Buyer sidebar layout (cần auth)
├── orders/
│   ├── page.tsx                   ← My Orders
│   ├── new/
│   │   └── page.tsx               ← Create Order
│   └── [id]/
│       └── page.tsx               ← Order Detail
└── wishlist/
    └── page.tsx                   ← Wishlist

src/modules/buyer/
├── screens/
│   ├── HomepageScreen.tsx
│   ├── MarketplaceScreen.tsx
│   ├── ListingDetailScreen.tsx
│   ├── OrderListScreen.tsx
│   ├── OrderDetailScreen.tsx
│   ├── OrderCreateScreen.tsx
│   └── WishlistScreen.tsx
├── components/
│   ├── ListingCard.tsx
│   ├── ListingFilters.tsx
│   ├── ListingGallery.tsx
│   ├── OrderStatusStepper.tsx
│   ├── ShipmentTracker.tsx
│   └── WishlistButton.tsx
└── hooks/
    ├── useListings.ts
    ├── useListingDetail.ts
    ├── useOrders.ts
    ├── useWishlist.ts
    └── useShipment.ts
```

### API Endpoints & Payload

```typescript
// src/lib/api/buyer-api.ts
import { api } from "./http";

export const buyerApi = {
  // Listings
  getListings: (page = 1, size = 10) =>
    api.get(`/api/buyer-listing?pageNumber=${page}&pageSize=${size}`),

  getListingDetail: (id: string) =>
    api.get(`/api/buyer-listing/${id}`),

  searchListings: (params: {
    keyword?: string; brand?: string; category?: string;
    minPrice?: number; maxPrice?: number;
    frameSize?: string; condition?: string;
    pageNumber?: number; pageSize?: number;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    return api.get(`/api/buyer-listing/search?${qs}`);
  },

  // Orders
  createOrder: (data: {
    bikeId: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
  }) => api.post("/api/buyer-order", data),

  markPaid: (orderId: string) =>
    api.post(`/api/buyer-order/${orderId}/paid`),

  // Wishlist
  getWishlist: (page = 1, size = 10) =>
    api.get(`/api/wishlist?pageNumber=${page}&pageSize=${size}`),

  addToWishlist: (bikeId: string) =>
    api.post(`/api/wishlist/${bikeId}`),

  removeFromWishlist: (bikeId: string) =>
    api.delete(`/api/wishlist/${bikeId}`),

  // Shipment
  createShipment: (orderId: string, data: {
    shippingProvider: string;
    senderName: string; senderPhone: string; senderAddress: string;
    fromDistrictId: number; fromWardCode: string;
    distanceKm: number; note?: string; codAmount: number;
    toDistrictId: number; toWardCode: string;
  }) => api.post(`/api/buyer-shipment/${orderId}`, data),

  getShipment: (orderId: string) =>
    api.get(`/api/buyer-shipment/${orderId}`),

  syncShipment: (orderId: string) =>
    api.post(`/api/buyer-shipment/sync/${orderId}`),
};
```

### Edge cases phải xử lý

| # | Edge case | Xử lý |
|---|-----------|-------|
| 1 | Token hết hạn giữa chừng | `http.ts` auto renew → retry. Nếu renew thất bại → redirect `/auth/login` |
| 2 | Listing đã `reserved` khi Buyer bấm "Đặt mua" | Hiển thị toast "Xe này đã có người đặt cọc" + disable nút |
| 3 | Marketplace empty state | Component `EmptyState` khi không có kết quả search |
| 4 | PDP — PII Seller | Nếu chưa có SR confirmed → SĐT hiển thị `0912***789`, địa chỉ "Quận 7, TP.HCM" |
| 5 | Order — double submit | Disable nút sau khi bấm, dùng `isPending` từ `useMutation` |
| 6 | Wishlist — toggle nhanh | Optimistic update: cập nhật UI trước, rollback nếu API fail |

### Prompt sẵn cho Đạt dùng với AI

> "Tôi đang build **Buyer Flow** cho SBE marketplace bằng **Next.js 15 App Router + TanStack Query + Radix UI + Tailwind 4 + React Hook Form + Zod**.
> Task hiện tại là **[task #DX]: [mô tả]**.
> API base: `https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net`
> API cần gọi: `[method] [endpoint]` — payload: `[copy từ buyer-api.ts]`
> Pattern dùng TanStack Query: `useQuery` cho GET, `useMutation` cho POST/PUT/DELETE.
> UI dùng Radix UI primitives + Tailwind. Không dùng component library khác.
> File đặt tại: `src/modules/buyer/screens/[ScreenName].tsx`.
> Hãy giúp tôi triển khai bước này."
