# ERD & API Boundary

**Hệ thống:** VeloTrust (Online Exchange System for Used Sports Bicycles)  
**Tương thích Specs:** [business-spec.md](./business-spec.md) | **Version:** 3.2 (Direct Buy - Cart Lock)

---

## 1. Sơ đồ ERD (Mermaid)

```mermaid
erDiagram
  User ||--o| SellerProfile : "has (Cần Bank Profile)"
  User ||--o| BuyerProfile : "has"
  User }o--o{ UserRole : "has"
  Role ||--o{ UserRole : "assigned"

  User ||--o{ Listing : "sells"
  Category ||--o{ Listing : "classifies"
  Brand ||--o{ Listing : "classifies"
  Listing ||--o{ ListingMedia : "contains"
  Listing ||--o{ WishlistItem : "bookmarked"
  User ||--o{ WishlistItem : "saves"

  Listing ||--o{ Order : "generates"
  User ||--o{ Order : "buys"
  Order ||--o{ OrderStatusHistory : "logs"

  Listing ||--o| Inspection : "mandatory desk-review"
  User ||--o{ Inspection : "performs"
  Inspection ||--o| InspectionReport : "produces"

  Order ||--o{ Dispute : "may_have"
  Order ||--o{ PayoutRequest : "triggers_after_48h"
  PayoutRequest }o--|| User : "paid_to_seller"

  User {
    uuid id PK
    string email UK
    string password_hash
    string display_name
    timestamptz created_at
  }

  Role {
    int id PK
    string code UK
  }

  SellerProfile {
    uuid user_id PK_FK
    string phone
    text bio
    decimal reputation_score
    string bank_account_name
    string bank_account_number
    string bank_name
  }

  BuyerProfile {
    uuid user_id PK_FK
    string phone
  }

  Category {
    int id PK
    string name
    int parent_id FK
  }

  Brand {
    int id PK
    string name UK
  }

  Listing {
    uuid id PK
    uuid seller_id FK
    int category_id FK
    int brand_id FK
    string title
    string frame_serial
    decimal listed_price
    decimal seller_expected_price
    string status_enum
    timestamptz created_at
  }

  ListingMedia {
    uuid id PK
    uuid listing_id FK
    string url
    string kind_enum
    int sort_order
  }

  Order {
    uuid id PK
    uuid listing_id FK
    uuid buyer_id FK
    string status_enum
    decimal total_price
    decimal shipping_fee
    string payos_transaction_id
    string ghn_waybill_code
    timestamptz cart_expires_at
    timestamptz created_at
  }

  OrderStatusHistory {
    uuid id PK
    uuid order_id FK
    string status
    timestamptz at
  }

  PayoutRequest {
    uuid id PK
    uuid order_id FK
    uuid seller_id FK
    decimal amount
    string status_enum
    timestamptz created_at
  }

  Inspection {
    uuid id PK
    uuid listing_id FK
    uuid inspector_id FK
    string status_enum
    timestamptz assigned_at
  }

  InspectionReport {
    uuid id PK
    uuid inspection_id FK
    json checklist_json
    decimal suggested_price
    string report_url
  }

  Dispute {
    uuid id PK
    uuid order_id FK
    string status_enum
    timestamptz media_upload_deadline
    boolean has_media_proof
  }

  WishlistItem {
    uuid user_id PK_FK
    uuid listing_id PK_FK
  }
```

**Ghi chú:**
- Bảng `Order` không còn các cột tiền cọc lặt vặt. Sinh ra là khóa `cart_expires_at` đếm ngược 5 phút. `status_enum`: `timer_draft` -> `payos_paid` -> `ghn_picking_up` -> `ghn_in_transit` -> `ghn_delivered` -> `pending_escrow` -> `completed_and_payout`.
- Bảng `SellerProfile` bổ sung bắt buộc `bank_...` để giải ngân.
- Bảng `PayoutRequest`: Cấu trúc cho phương án "Dễ", Admin vào xem danh sách rồi bấm thanh toán bằng App ngân hàng ở ngoài, chọn `status = Paid`.

---

## 2. Ranh giới API Mới (Bounded Context V3.2)

### 2.1 Auth & File
- `/api/v1/auth/register`, `/login`, `/me`
- `/api/v1/upload/image`, `/video`

### 2.2 Category & Brand & Wishlist
- `GET /api/v1/categories`, `/brands`
- `POST /api/v1/wishlist/{listingId}` | `GET /api/v1/wishlist`

### 2.3 Người Bán (Seller)
- `POST /api/v1/seller/profile/bank-info` (Cập nhật Profile lấy tiền)
- `POST /api/v1/seller/listings` (Đăng xe, trạng thái sẽ là `pending_review_online`)
- `GET /api/v1/seller/orders` (Xem danh sách đơn đã chốt)
- `POST /api/v1/seller/orders/{id}/confirm-ready` (Bắt buộc bấm trong 12H để gọi GHN qua lấy)

### 2.4 Người Mua (Buyer) - Luồng Cart & PayOS quan trọng
- `POST /api/v1/orders/checkout` -> **Mới:** Truyền vào `listingId`, `toWardCode`. Nó sẽ khóa giỏ, call API nội bộ hoặc tự tính phí ship, trả về String `payos_qr_url` và con số đếm ngược `expires_at`.
- `GET /api/v1/orders/{id}` -> Xem trạng thái (Mã vận chuyển GHN)
- `POST /api/v1/orders/{id}/dispute` -> Khởi tạo khiếu nại (bắt Upload video 24h).

### 2.5 Webhooks (Tầng Server)
- `POST /api/v1/webhooks/payos` -> Lắng nghe PayOS ting ting. Kiểm tra `Amount`. Nhả lock giỏ hoặc Confirmed.
- `POST /api/v1/webhooks/ghn` -> Nhận thông tin bưu tá lấy/giao hàng.

### 2.6 Admin & Payout & Inspector
- `GET /api/v1/inspector/assignments` (Round-Robin Auto Assign).
- `POST /api/v1/inspector/assignments/{id}/report` (Desk review checklist).
- `GET /api/v1/admin/payouts/pending` (Lấy file excel xuất tiền).
- `POST /api/v1/admin/payouts/{id}/mark-paid` (Xác nhận đã bắn tiền tài khoản Seller).
- `POST /api/v1/admin/disputes/{id}/resolve` (Phán xử tranh chấp bom hàng / sai mô tả).
