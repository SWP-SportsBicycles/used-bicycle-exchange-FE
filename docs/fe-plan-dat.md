# 👤 Đạt (Lead) — Public + Buyer + Foundation

**Mục tiêu:** Xây dựng toàn bộ trải nghiệm Buyer — từ trang chủ, marketplace, chi tiết xe, đến **luồng mua trực tiếp Cart Lock 5 phút** (nhập địa chỉ → GHN tính phí ship → QR PayOS → tracking vận đơn → khiếu nại). Setup foundation (API client, Auth context) cho cả team dùng.

> **Nghiệp vụ tham chiếu:** [01-order-and-payment-rules.md](../01-order-and-payment-rules.md) | [business-spec.md](../business-spec.md)

---

## Màn hình & Component cần build

| # | Màn hình | Route | Độ phức tạp |
|---|---------|-------|-------------|
| 1 | Foundation (API client + Auth Context) | `src/lib/` | 🔴 |
| 2 | Homepage (Landing page) | `/` | 🟡 |
| 3 | Marketplace (Browse + Search + Filter) | `/marketplace` | 🟡 |
| 4 | Listing Detail (PDP) — PII ẩn | `/marketplace/[id]` | 🔴 |
| 5 | **Checkout Flow (Cart Lock 5 phút)** | `/buyer/checkout?listingId=xxx` | 🔴🔴 |
| 6 | My Orders (danh sách đơn) | `/buyer/orders` | 🟡 |
| 7 | Order Detail (tracking GHN + trạng thái) | `/buyer/orders/[id]` | 🔴 |
| 8 | Wishlist | `/buyer/wishlist` | 🟢 |
| 9 | **Dispute (Khiếu nại)** | `/buyer/orders/[id]/dispute` | 🟡 |

---

## Danh sách công việc

### Sprint 1 — Foundation + Marketplace (4 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| D1 | Setup API client `src/lib/api/http.ts` | File `http.ts` với `api.get/post/put/delete/upload`, auto refresh token, error handling | 3h | - |
| D2 | Setup Auth Context + Provider | File `auth-context.tsx`: `useAuth()` hook trả `user, isAuthenticated, login, logout`. Wrap trong `providers.tsx` | 4h | D1 |
| D3 | Setup `buyer-api.ts` | File service với tất cả buyer API calls (listings, orders, wishlist, checkout, dispute) | 2h | D1 |
| D4 | Trang Homepage cơ bản | Route `(public)/page.tsx` → `HomepageScreen.tsx`: Hero section, featured listings (gọi `GET /api/buyer-listing?pageSize=6`), CTA | 4h | D1 |
| D5 | Marketplace — listing grid + pagination | Route `(public)/marketplace/page.tsx` → `MarketplaceScreen.tsx`: Grid card listing, pagination, loading skeleton | 4h | D3 |
| D6 | Marketplace — search + filter sidebar | Component `ListingFilters.tsx`: keyword, brand, category, price range, frameSize, condition. Gọi `GET /api/buyer-listing/search` | 3h | D5 |

### Sprint 2 — PDP + Checkout Cart Lock (4 ngày) ⭐ LUỒNG MỚI QUAN TRỌNG

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| D7 | Listing Detail Page (PDP) | Gallery ảnh, specs table, **Giá niêm yết hiển thị**, seller info **PII ẨN** (chỉ quận/huyện), nút "Mua ngay", nút "Thêm Wishlist" | 4h | D3 |
| D8 | **Checkout — Bước 1: Khởi tạo & Địa chỉ** | Khi bấm "Mua ngay" → **FE gọi ngầm API `POST /api/buyer-cart/add`** và redirect sang trang Checkout. Form nhập địa chỉ bắt buộc sử dụng Dropdown Tỉnh/Quận/Phường (load từ GHN API) để lấy được `toDistrictId` (int) và `toWardCode` (string) truyền xuống Backend. | 5h | D3 |
| D9 | **Checkout — Bước 2: Thanh toán PayOS** | Gọi API `POST /api/buyer-cart/checkout` với payload `CreateOrderFromCartDTO` (kèm ID quận/phường). BE trả về order, FE tiếp tục gọi `/api/payment/{orderId}` để lấy PayOS QR. Hiển thị QR Code đếm ngược. Lắng nghe BE biết thanh toán thành công → redirect Order Detail. | 5h | D8 |
| D10 | **Checkout — Timeout & Hủy** | Nếu Timer hết hạn mà chưa thanh toán → redirect về Marketplace. (Note: Logic lock listing 5 phút sẽ do BE tự động xử lý khi tạo cart/order, FE chỉ quản lý UI timer). | 2h | D9 |
| D11 | Wishlist Page + Toggle Button | Route `(buyer)/buyer/wishlist/page.tsx` → Grid listing đã lưu. Component `WishlistButton.tsx` dùng chung trên PDP và Marketplace card. Optimistic update. | 2h | D3 |

### Sprint 3 — Order Management + Dispute (3 ngày)

| # | Công việc | Kết quả đầu ra | Ước tính | Phụ thuộc |
|---|-----------|----------------|----------|-----------|
| D12 | My Orders List | Table/card list đơn hàng, **status badge theo màu** (`timer_draft`, `payos_paid`, `shipping`, `delivered`, `completed`, `cancelled`, `disputed`), filter theo status | 3h | D3 |
| D13 | Order Detail — Tracking UI | Stepper hiển thị trạng thái vận chuyển GHN (picking_up → in_transit → delivered). Hiển thị **Mã vận đơn GHN Waybill**. **PII Seller hiện đầy đủ** (đã thanh toán). Nút "Hủy đơn" chỉ hiện khi trạng thái cho phép. | 4h | D12 |
| D14 | **Hủy đơn — Buyer** | Nút "Hủy đơn" → Dialog cảnh báo **phí phạt** (5% nếu chưa ship, 10% nếu đã ship + mất phí ship). Gọi API hủy. | 2h | D13 |
| D15 | **Dispute — Khiếu nại** | Route `buyer/orders/[id]/dispute`. Form: lý do + **bắt buộc upload Video Unbox** (gọi `POST /api/Upload/video` lấy URL). Hiện **cảnh báo: phải upload trong 24h**. Gọi API `POST /api/buyer-order/{orderId}/dispute`. | 3h | D13 |

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
├── checkout/
│   └── page.tsx                   ← ⭐ Checkout Flow (Cart Lock 5 phút)
├── orders/
│   ├── page.tsx                   ← My Orders
│   └── [id]/
│       ├── page.tsx               ← Order Detail + Tracking
│       └── dispute/
│           └── page.tsx           ← Mở Khiếu Nại
└── wishlist/
    └── page.tsx                   ← Wishlist

src/modules/buyer/
├── screens/
│   ├── HomepageScreen.tsx
│   ├── MarketplaceScreen.tsx
│   ├── ListingDetailScreen.tsx
│   ├── CheckoutScreen.tsx          ← ⭐ MỚI: Cart Lock + GHN + PayOS
│   ├── OrderListScreen.tsx
│   ├── OrderDetailScreen.tsx
│   ├── DisputeScreen.tsx           ← ⭐ MỚI: Khiếu nại
│   └── WishlistScreen.tsx
├── components/
│   ├── ListingCard.tsx
│   ├── ListingFilters.tsx
│   ├── ListingGallery.tsx
│   ├── CheckoutTimer.tsx           ← ⭐ MỚI: Đồng hồ đếm ngược 5 phút
│   ├── AddressForm.tsx             ← ⭐ MỚI: Form nhập địa chỉ + GHN dropdown
│   ├── PayosQrDisplay.tsx          ← ⭐ MỚI: Hiển thị QR Code PayOS
│   ├── OrderStatusStepper.tsx
│   ├── GhnTracker.tsx              ← ⭐ MỚI: Step tracker GHN
│   ├── CancelOrderDialog.tsx       ← ⭐ MỚI: Confirm hủy + hiện phí phạt
│   └── WishlistButton.tsx
└── hooks/
    ├── useListings.ts
    ├── useListingDetail.ts
    ├── useCheckout.ts              ← ⭐ MỚI: Lock listing + poll payment status
    ├── useGhnAddress.ts            ← ⭐ MỚI: Gọi GHN API lấy Tỉnh/Quận/Phường
    ├── useOrders.ts
    ├── useOrderDetail.ts
    ├── useCancelOrder.ts           ← ⭐ MỚI: Mutation hủy đơn
    ├── useDispute.ts               ← ⭐ MỚI: Mutation mở khiếu nại
    └── useWishlist.ts
```

### API Endpoints & Payload

```typescript
// src/lib/api/buyer-api.ts
import { api } from "./http";

// ===== GHN OPEN API (FE gọi trực tiếp, KHÔNG qua BE) =====
const GHN_API = "https://online-gateway.ghn.vn/shiip/public-api/master-data";
const GHN_TOKEN = process.env.NEXT_PUBLIC_GHN_TOKEN ?? "";

export const ghnApi = {
  getProvinces: () =>
    fetch(`${GHN_API}/province`, {
      headers: { Token: GHN_TOKEN },
    }).then(r => r.json()),

  getDistricts: (provinceId: number) =>
    fetch(`${GHN_API}/district?province_id=${provinceId}`, {
      headers: { Token: GHN_TOKEN },
    }).then(r => r.json()),

  getWards: (districtId: number) =>
    fetch(`${GHN_API}/ward?district_id=${districtId}`, {
      headers: { Token: GHN_TOKEN },
    }).then(r => r.json()),
};

// ===== BUYER API (qua BE) =====
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

  // ⭐ Checkout (Cart Lock 5 phút) — API MỚI (cần BE bổ sung)
  // Gửi listingId + địa chỉ nhận → BE khóa listing, call GHN, tạo PayOS QR
  // Trả về: { orderId, payosQrUrl, shippingFee, totalPrice, expiresAt }
  checkout: (data: {
    listingId: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    toDistrictId: number;
    toWardCode: string;
  }) => api.post("/api/buyer-order/checkout", data),

  // Polling: kiểm tra trạng thái thanh toán (PayOS webhook đã nổ chưa?)
  getOrderStatus: (orderId: string) =>
    api.get(`/api/buyer-order/${orderId}/status`),

  // Orders
  getOrders: (page = 1, size = 10) =>
    api.get(`/api/buyer-order?pageNumber=${page}&pageSize=${size}`),

  getOrderDetail: (orderId: string) =>
    api.get(`/api/buyer-order/${orderId}`),

  // Hủy đơn (kèm penalty logic phía BE)
  cancelOrder: (orderId: string) =>
    api.post(`/api/buyer-order/${orderId}/cancel`),

  // Dispute — Khiếu nại
  createDispute: (orderId: string, data: {
    reason: string;
    mediaUrls: string[]; // Video unbox URLs (bắt buộc)
  }) => api.post(`/api/buyer-order/${orderId}/dispute`, data),

  // Wishlist
  getWishlist: (page = 1, size = 10) =>
    api.get(`/api/wishlist?pageNumber=${page}&pageSize=${size}`),

  addToWishlist: (bikeId: string) =>
    api.post(`/api/wishlist/${bikeId}`),

  removeFromWishlist: (bikeId: string) =>
    api.delete(`/api/wishlist/${bikeId}`),

  // Shipment tracking
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
| 2 | Listing đã `locked` bởi người khác | Hiển thị toast "Xe này đang được người khác thanh toán" + disable nút "Mua ngay" |
| 3 | **Timer Checkout hết 5:00** | Modal "Hết thời gian" → redirect `/marketplace`. BE tự xả lock. |
| 4 | **PayOS chuyển thiếu tiền** | Polling trả về `status: failed` → hiển thị "Thanh toán thất bại, vui lòng liên hệ CSKH". Xả lock listing. |
| 5 | PDP — PII Seller | SĐT hiển thị `****`, địa chỉ chỉ "Quận X, TP.HCM". **Chỉ hiện đầy đủ sau khi thanh toán thành công** (đọc từ Order Detail). |
| 6 | **Hủy đơn — cảnh báo phí phạt** | Trước khi gọi API cancel: Dialog hiện rõ "Bạn sẽ bị trừ 5% giá niêm yết" hoặc "10% + mất phí ship" tùy trạng thái. |
| 7 | **Dispute — thiếu video** | Zod schema `mediaUrls.min(1)` block submit. Hiện warning "Bắt buộc quay video mở hộp". |
| 8 | Wishlist — toggle nhanh | Optimistic update: cập nhật UI trước, rollback nếu API fail |

### Prompt sẵn cho Đạt dùng với AI

> "Tôi đang build **Buyer Flow (Cart Lock + PayOS + GHN)** cho SBE marketplace bằng **Next.js 15 App Router + TanStack Query + Radix UI + Tailwind 4 + React Hook Form + Zod**.
> Task hiện tại là **[task #DX]: [mô tả]**.
> API base: `https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net`
> API cần gọi: `[method] [endpoint]` — payload: `[copy từ buyer-api.ts]`
> Nghiệp vụ quan trọng: Cart Lock 5 phút, PayOS QR thanh toán, PII Seller ẩn đến khi trả tiền, GHN tính phí ship real-time.
> Tham chiếu: `docs/fe-plan-dat.md`, `01-order-and-payment-rules.md`, `business-spec.md`.
> File đặt tại: `src/modules/buyer/screens/[ScreenName].tsx`.
> Hãy giúp tôi triển khai bước này."
