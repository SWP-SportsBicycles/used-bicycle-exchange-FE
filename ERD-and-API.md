# ERD & API Boundary

**Hệ thống:** Online Exchange System for Used Sports Bicycles  
**Đi kèm:** [SRS.md](./SRS.md)

---

## 1. Sơ đồ ERD (Mermaid)

```mermaid
erDiagram
  User ||--o| SellerProfile : has
  User ||--o| BuyerProfile : has
  User }o--o{ UserRole : has
  Role ||--o{ UserRole : assigned

  User ||--o{ Listing : sells
  Category ||--o{ Listing : classifies
  Brand ||--o{ Listing : classifies
  Listing ||--o{ ListingMedia : contains
  Listing ||--o{ WishlistItem : bookmarked
  User ||--o{ WishlistItem : saves

  Listing ||--o{ Order : generates
  User ||--o{ Order : buys
  Order ||--o{ Payment : has
  Order ||--o{ OrderStatusHistory : logs
  Listing ||--o{ ListingPriceHistory : tracks_price

  Listing ||--o| Inspection : optional
  User ||--o{ Inspection : performs
  Inspection ||--o| InspectionReport : produces

  Order ||--o{ Review : after_complete
  User ||--o{ Review : writes

  Listing ||--o{ Report : receives
  Order ||--o{ Dispute : may_have
  Dispute ||--o{ DisputeMessage : contains
  User ||--o{ DisputeMessage : sends

  AdminAction }o--|| User : by_admin
  FeeRule }o--|| AdminAction : optional_audit

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

  UserRole {
    uuid user_id FK
    int role_id FK
  }

  SellerProfile {
    uuid user_id PK_FK
    string phone
    text bio
    decimal reputation_score
    decimal cancel_rate
    decimal dispute_rate
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
    string frame_size
    string condition_enum
    string title
    text description
    text usage_history
    decimal price
    string status_enum
    boolean request_inspection
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
    string type_enum
    string status_enum
    decimal amount_total
    decimal soft_reserve_amount
    decimal inspection_deposit_amount
    timestamptz deposit_expires_at
    timestamptz created_at
  }

  Payment {
    uuid id PK
    uuid order_id FK
    string method_enum
    string status_enum
    decimal amount
    string proof_url
    timestamptz confirmed_at
  }

  ListingPriceHistory {
    uuid id PK
    uuid listing_id FK
    decimal old_price
    decimal new_price
    uuid actor_id FK
    string reason
    timestamptz changed_at
  }

  OrderStatusHistory {
    uuid id PK
    uuid order_id FK
    uuid actor_id FK
    string from_status
    string to_status
    string reason
    timestamptz at
  }

  Inspection {
    uuid id PK
    uuid listing_id FK
    uuid inspector_id FK
    string mode_enum
    string status_enum
    string outcome_enum
    timestamptz scheduled_at
    timestamptz completed_at
  }

  InspectionReport {
    uuid id PK
    uuid inspection_id FK
    string report_url
    json checklist_json
  }

  Review {
    uuid id PK
    uuid order_id FK
    uuid author_id FK
    int rating
    text comment
    timestamptz created_at
  }

  WishlistItem {
    uuid user_id FK
    uuid listing_id FK
  }

  Report {
    uuid id PK
    uuid listing_id FK
    uuid reporter_id FK
    string reason
    string status_enum
  }

  Dispute {
    uuid id PK
    uuid order_id FK
    string status_enum
  }

  DisputeMessage {
    uuid id PK
    uuid dispute_id FK
    uuid sender_id FK
    text body
    timestamptz at
  }

  FeeRule {
    int id PK
    string code UK
    json config_json
  }

  AdminAction {
    uuid id PK
    uuid admin_id FK
    string entity_type
    uuid entity_id
    string action_code
    json payload_json
    timestamptz at
  }
```

**Ghi chú triển khai:**

- `condition_enum`, `listing.status`, `order.type`, `order.status` nên là enum DB hoặc bảng lookup để đồng bộ với SRS.
- `WishlistItem` khóa chính tổ hợp `(user_id, listing_id)`.
- **V1.2 nghiệp vụ:** `Listing` thêm `frame_serial` (bắt buộc trước duyệt), cờ `groupset_photo_ok`, `city_code` (HN/SG/DN); PII Seller không trả qua API public cho đến khi Soft Reserve `confirmed` — xử lý tại tầng API.
- `Order.status` cần có `soft_reserved`, `inspection_deposit_pending`, `delivered`, `pending_confirmation` để chuẩn hóa state machine tiền và giao nhận.
- `Inspection.mode_enum` mở sẵn cho hậu MVP; **MVP chỉ dùng `on_demand`**.
- **SellerWallet** (khuyến nghị): `user_id`, `balance`, `ledger` (nạp/trừ phạt, phí kiểm định Seller trả) — chi tiết bảng ledger tách riêng khi triển khai.

---

## 2. Ranh giới API (theo bounded context)

### 2.1 Public / Guest + Buyer browse

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| GET | `/api/v1/listings` | Danh sách + filter query params. |
| GET | `/api/v1/listings/{id}` | Chi tiết (PII seller theo policy). |
| GET | `/api/v1/meta/categories` | Cây danh mục. |
| GET | `/api/v1/meta/brands` | Thương hiệu. |

### 2.2 Auth

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| POST | `/api/v1/auth/register` | Đăng ký. |
| POST | `/api/v1/auth/login` | JWT/session. |
| POST | `/api/v1/auth/logout` | Thu hồi refresh token nếu có. |

### 2.3 Seller — Listing

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| POST | `/api/v1/seller/listings` | seller |
| PATCH | `/api/v1/seller/listings/{id}` | seller (owner) |
| POST | `/api/v1/seller/listings/{id}/submit` | seller |
| POST | `/api/v1/seller/listings/{id}/media` | seller |

### 2.4 Buyer — Order & Wishlist

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| POST | `/api/v1/orders` | buyer (body: listingId, type, softReservePackage) |
| POST | `/api/v1/orders/{id}/request-inspection` | buyer (khởi tạo Inspection Deposit) |
| GET | `/api/v1/orders/{id}` | buyer (owner) hoặc seller của listing |
| POST | `/api/v1/orders/{id}/payments` | buyer — upload offline proof |
| POST | `/api/v1/orders/{id}/confirm-receipt` | buyer |
| POST | `/api/v1/orders/{id}/seller-confirm-payment` | seller |
| POST | `/api/v1/wishlist/{listingId}` | buyer |
| DELETE | `/api/v1/wishlist/{listingId}` | buyer |

### 2.5 Inspector

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| GET | `/api/v1/inspector/assignments` | inspector |
| PATCH | `/api/v1/inspector/inspections/{id}` | inspector |
| POST | `/api/v1/inspector/inspections/{id}/report` | inspector |

### 2.6 Admin

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| GET | `/api/v1/admin/listings?status=pending_review` | admin |
| POST | `/api/v1/admin/listings/{id}/moderate` | admin |
| GET/PATCH | `/api/v1/admin/users/...` | admin |
| GET | `/api/v1/admin/stats/overview` | admin |
| GET | `/api/v1/admin/stats/trust` | admin (gồm `cancel_rate`, `dispute_rate`) |
| CRUD | `/api/v1/admin/categories`, `/brands`, `/fee-rules` | admin |

### 2.7 Báo cáo & tranh chấp

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| POST | `/api/v1/reports/listings` | authenticated |
| POST | `/api/v1/orders/{id}/disputes` | buyer hoặc seller — **ưu tiên** luồng từ nút **Khiếu nại** trên đơn (auto context theo [03-platform-policy.md](./03-platform-policy.md)). |
| PATCH | `/api/v1/admin/disputes/{id}` | admin — SLA 8h/48h làm việc (03-F). |

### 2.8 Listing pricing history

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| GET | `/api/v1/listings/{id}/price-history` | public/authenticated theo policy |
| GET | `/api/v1/admin/listings/{id}/price-history` | admin |

---

## 3. Sự kiện nội bộ (tùy chọn kiến trúc)

Các chuyển trạng thái `Order` nên phát sinh **domain event** (async) cho: email thông báo, cập nhật `Listing.status`, ghi `OrderStatusHistory`, và nhắc việc ở `pending_confirmation`.

---

## 4. Phiên bản & tương thích

- Tiền tố `/api/v1/`; breaking changes → v2.
- Client web/mobile chỉ gọi qua API này; không expose DB trực tiếp.

---

## 5. Mở rộng (v1.1+): thực thể & API

Tham chiếu yêu cầu nghiệp vụ: [SRS.md — mục 6](./SRS.md). Phần này mô tả **bổ sung** model và ranh giới API; không thay thế bảng MVP ở mục 2.

### 5.1 Thực thể bổ sung (ERD gợi ý)

| Thực thể | Khóa & quan hệ | Mục đích |
|----------|----------------|----------|
| `ChatSession` | `id`, `user_id` (nullable), `channel` (web/app), `external_thread_id` | Phiên chatbot / handoff. |
| `ChatMessage` | `session_id` FK, `role` (user/bot/system), `content`, `metadata_json` | Lịch sử; có thể lưu tối giản nếu dùng SaaS chat. |
| `SupportTicket` | `id`, `user_id`, `status`, `priority`, `source` (chat/email), `order_id` optional | Escalation từ chatbot. |
| `Shipment` | `id`, `order_id` FK, `carrier_code`, `service_code`, `tracking_number`, `status`, `pickup_address`, `delivery_address`, `idempotency_key` UK | Đơn vận chuyển. |
| `ShipmentEvent` | `shipment_id` FK, `status`, `raw_payload_json`, `occurred_at` | Lịch sử từ webhook/job. |
| `CarrierAccount` | `id`, `carrier_code`, `credentials_ref` (secret store), `is_sandbox` | Cấu hình đối tác. |
| `Payment` (mở rộng) | Thêm `provider`, `provider_payment_id`, `idempotency_key`, `escrow_state` (`none`, `held`, `released`, `refunded`), `released_at` | Đồng bộ PSP và escrow. |

**Quan hệ:** `Order` 1—0..1 `Shipment` (MVP sau này có thể nhiều chặng — v1.1 giữ 1 shipment chính). `Order` 1—N `Payment` (nhiều lần thử / partial capture theo chính sách PSP).

### 5.2 API bổ sung (đề xuất đặt sau `/api/v1/` hoặc `/api/v1/ext/`)

**Thanh toán & escrow**

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| POST | `/api/v1/orders/{id}/payments/intent` | buyer — tạo intent (amount, method). |
| POST | `/api/v1/webhooks/payments/{provider}` | server-to-server (ký webhook) |
| POST | `/api/v1/orders/{id}/escrow/release` | hệ thống / admin — sau điều kiện xác nhận. |
| POST | `/api/v1/orders/{id}/escrow/refund` | admin — hoàn tranh chấp. |

**Logistics**

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| POST | `/api/v1/orders/{id}/shipments` | buyer hoặc seller (theo policy ai book) |
| GET | `/api/v1/shipments/{id}` | các bên liên quan đơn |
| POST | `/api/v1/webhooks/logistics/{carrier}` | server-to-server |

**Chatbot & hỗ trợ**

| Phương thức | Đường dẫn | RBAC |
|-------------|-----------|------|
| POST | `/api/v1/support/chat/sessions` | guest (session) / authenticated |
| POST | `/api/v1/support/chat/sessions/{id}/messages` | same |
| POST | `/api/v1/support/tickets` | authenticated — tạo ticket thủ công hoặc từ bot |
| GET/PATCH | `/api/v1/admin/support/tickets` | admin |

### 5.3 Sự kiện nội bộ (bổ sung)

- `PaymentCaptured`, `EscrowReleased`, `ShipmentDelivered` — kích hoạt thông báo, cập nhật `Order.status`, và (với escrow) job payout.

---

*Tài liệu có thể import vào công cụ ERD để tinh chỉnh kiểu dữ liệu cột theo DB cụ thể (PostgreSQL khuyến nghị).*
