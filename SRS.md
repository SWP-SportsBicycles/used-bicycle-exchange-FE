# Software Requirements Specification (SRS)

**Hệ thống:** Online Exchange System for Used Sports Bicycles  
**Phiên bản tài liệu:** 1.2  
**Tham chiếu:** [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md), [02-mvp-scope.md](./02-mvp-scope.md), [03-platform-policy.md](./03-platform-policy.md)

---

## 1. Giới thiệu

### 1.1 Mục đích

Mô tả yêu cầu chức năng và phi chức năng cho MVP nền tảng kết nối mua bán xe đạp thể thao đã qua sử dụng tại **Hà Nội, TP.HCM, Đà Nẵng**, Seller **cá nhân**, mô hình **cọc 2 lớp** (Soft Reserve 200k-500k và Inspection Deposit 5%-10% trần 2.000.000đ khi yêu cầu kiểm định), quy trình kiểm định tại nhà Seller, Admin duyệt tin (serial + ảnh groupset), trung gian thanh toán + phí thành công **2–3%**, và đánh giá sau giao dịch.

### 1.2 Phạm vi

Trùng [02-mvp-scope.md](./02-mvp-scope.md) và chính sách đã chốt [03-platform-policy.md](./03-platform-policy.md). Luồng cọc/kiểm định/hủy kèo: [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md). Mở rộng chatbot / logistics / cổng thanh toán: **mục 6**; `Payment` / shipment thiết kế sẵn để bật dần.

### 1.3 Định nghĩa & từ viết tắt

- **Listing:** Tin rao một chiếc xe.
- **Order:** Giao dịch mua (full hoặc deposit flow).
- **Inspection:** Quá trình kiểm định gắn với listing (và có thể gắn order).

---

## 2. Mô tả tổng quan

### 2.1 Tác nhân

Guest, Buyer, Seller, Inspector, Admin — như phân tích nghiệp vụ gốc.

### 2.2 Giả định & chính sách neo

- Một listing tại một thời điểm chỉ có **một** giao dịch cọc/mua **active**.
- **Địa lý V1:** chỉ listing / giao dịch trong **Hà Nội, TP.HCM, Đà Nẵng** (validate địa chỉ hoặc tỉnh/thành).
- **PII Seller:** SĐT và địa chỉ đầy đủ chỉ sau **Soft Reserve đã xác nhận** (03-B.2).
- **Sàn:** vừa **cầu nối** vừa **trung gian thanh toán** theo 03-A.1.
- Thời gian máy chủ UTC; hiển thị mặc định `Asia/Ho_Chi_Minh`.

---

## 3. Yêu cầu chức năng

### 3.1 Xác thực & người dùng (FR-AUTH)

| ID | Mô tả | Ưu tiên |
|----|--------|---------|
| FR-AUTH-01 | Đăng ký email + mật khẩu; xác minh email (khuyến nghị MVP). | P0 |
| FR-AUTH-02 | Đăng nhập, đăng xuất, khóa tài khoản sau N lần sai (config). | P0 |
| FR-AUTH-03 | Phân vai trò: `buyer`, `seller`, `inspector`, `admin` (một user có thể nhiều role sau này; MVP: một role chính + flag seller). | P0 |

### 3.2 Listing (FR-LIST)

| ID | Mô tả | Ưu tiên |
|----|--------|---------|
| FR-LIST-01 | Seller **cá nhân** tạo/sửa listing `draft`: tiêu đề, giá, mô tả, category, brand, frame_size, condition, optional usage_history; **địa chỉ thuộc 1 trong 3 TP** được phép vận hành. | P0 |
| FR-LIST-01a | **Bắt buộc** trường **số khung (serial)** để Admin đối chiếu danh sách xe nghi mất cắp trước khi duyệt. | P0 |
| FR-LIST-01b | **Bắt buộc** tối thiểu **01 ảnh cận cảnh groupset** (truyền động). | P0 |
| FR-LIST-02 | Upload ảnh (tối đa theo config), optional video URL. | P0 |
| FR-LIST-03 | Gửi duyệt: `draft` → `pending_review`. | P0 |
| FR-LIST-04 | Admin duyệt: `pending_review` → `published` hoặc `rejected` (lý do); có thể gắn cờ “nghi trùng serial”. | P0 |
| FR-LIST-05 | Seller ẩn/gỡ: `published` → `withdrawn`; không cho nếu có order `active` (trừ Admin). | P0 |
| FR-LIST-06 | Guest/Buyer xem danh sách + chi tiết; **SĐT + địa chỉ đầy đủ của Seller chỉ hiển thị sau khi Buyer có Soft Reserve ở trạng thái đã xác nhận** (không chỉ sau đăng nhập). | P0 |
| FR-LIST-07 | Khi tin `published`: nếu sửa **giá > 10%** hoặc **cấu hình xe vượt ngưỡng 10%** (theo metric spec hoặc danh sách trường major — 03-C.2) → tin về **`pending_review`**; bản chỉnh sửa không public cho đến khi duyệt lại. | P0 |
| FR-LIST-08 | Khi có Order **active** trên listing: **chặn** sửa giá/spec material (01 mục 2). | P0 |
| FR-LIST-09 | Hệ thống lưu **lịch sử thay đổi giá** của listing (`ListingPriceHistory`) gồm giá cũ/giá mới, thời điểm, actor và lý do. | P1 |

### 3.3 Tìm kiếm & wishlist (FR-SEARCH)

| ID | Mô tả | Ưu tiên |
|----|--------|---------|
| FR-SEARCH-01 | Lọc: category, brand, price range, frame_size, condition. | P0 |
| FR-SEARCH-02 | Buyer thêm/xóa listing vào wishlist. | P1 |

### 3.4 Đặt mua & đặt cọc (FR-ORDER)

| ID | Mô tả | Ưu tiên |
|----|--------|---------|
| FR-ORDER-01 | Buyer tạo `Order` trên listing `published` trong phạm vi địa lý cho phép; bước đầu thanh toán **Soft Reserve** để giữ chỗ. | P0 |
| FR-ORDER-01a | Soft Reserve = **200.000đ - 500.000đ** (config Admin theo gói). | P0 |
| FR-ORDER-01b | Khi Buyer bấm yêu cầu kiểm định, hệ thống thu **Inspection Deposit** = `min(rate_inspection × giá niêm yết, 2.000.000đ)` với `rate_inspection` trong khoảng **5%-10%**. | P0 |
| FR-ORDER-02 | Sau khi Soft Reserve được xác nhận, listing → `reserved`; hệ thống cho phép lộ PII Seller cho Buyer trên đơn đó. | P0 |
| FR-ORDER-03 | Hủy kèo / phân bổ cọc / hoàn theo ma trận fault trong [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md): `buyer_no_fault_cancel` 70/30, `buyer_no_show` 80/20, `seller_fault` hoàn 100%, `system_fault` hoàn 100%. | P0 |
| FR-ORDER-04 | Trạng thái đơn tối thiểu: `pending_payment` → `soft_reserved` → `inspection_deposit_pending` → `inspection` / `pending_fulfillment` → `delivered` → `pending_confirmation` → `completed` / `cancelled` / `disputed`. | P0 |
| FR-ORDER-05 | Offline payment: buyer upload chứng từ; seller xác nhận; Admin override; áp dụng cho Inspection Deposit và phần thanh toán còn lại. | P0 |
| FR-ORDER-06 | `completed` khi Buyer bấm **Đã nhận hàng** trong `pending_confirmation` **hoặc** **48h** sau trạng thái `delivered` mà không có khiếu nại mở. | P0 |
| FR-ORDER-07 | Khi `completed`: áp dụng **phí thành công 2–3%** (config Admin) theo 03-A.2. | P0 |
| FR-ORDER-08 | Hệ thống gửi nhắc Buyer ở mốc 24h và 47h trong `pending_confirmation`; nếu có dispute mở thì chặn auto-complete. | P1 |

### 3.5 Kiểm định (FR-INSP)

| ID | Mô tả | Ưu tiên |
|----|--------|---------|
| FR-INSP-01 | **Luồng chuẩn V1 (on-demand):** sau Soft Reserve, Buyer yêu cầu kiểm định + thanh toán Inspection Deposit → Inspector **đến nhà Seller** → upload báo cáo lên app → Buyer chọn **Tiếp tục mua** hoặc **Hủy** (hoàn **100% cọc** nếu lỗi nặng hơn mô tả — 01 mục 5–6). | P0 |
| FR-INSP-02 | Checklist: khung, phanh, truyền động + ảnh/PDF báo cáo; kết quả phục vụ badge / quyết định Buyer. | P0 |
| FR-INSP-03 | **Phí kiểm định:** nếu xe đúng mô tả → **Buyer** trả; nếu sai lệch nghiêm trọng → **Seller** trả (trừ ví / cọc — 01 mục 6). | P0 |
| FR-INSP-04 | SLA nội bộ gợi ý: assign 24h làm việc; báo cáo trong 48h sau buổi kiểm (01 mục 8). | P1 |
| FR-INSP-05 | MVP chỉ triển khai mode `on_demand`; kiến trúc dữ liệu mở sẵn cho mode khác ở hậu MVP. | P1 |

### 3.6 Đánh giá (FR-REV)

| ID | Mô tả | Ưu tiên |
|----|--------|---------|
| FR-REV-01 | Sau `completed`, buyer (và tùy chọn seller) có thể gửi rating + text trong cửa sổ thời gian (vd 14 ngày). | P0 |

### 3.7 Admin & báo cáo (FR-ADM)

| ID | Mô tả | Ưu tiên |
|----|--------|---------|
| FR-ADM-01 | CRUD Category, Brand; FrameSize enum hoặc bảng lookup; **FeeRule**: phí kiểm định, **phí thành công 2–3%**; **phí niêm yết = 0** V1. | P0 |
| FR-ADM-02 | User: xem, khóa/mở, ghi chú nội bộ; cảnh báo / phạt Seller (uy tín hoặc ví). | P0 |
| FR-ADM-03 | Khiếu nại / tranh chấp: ưu tiên tạo từ **nút Khiếu nại trên đơn** — auto đính kèm `order_id`, chat, bên liên quan; email hỗ trợ cho lỗi kỹ thuật/pháp lý nặng (03-F.1). | P0 |
| FR-ADM-04 | SLA: **8h làm việc** xác nhận đã nhận; **48h làm việc** quyết định cuối kể từ đủ bằng chứng (03-F.2). | P0 |
| FR-ADM-05 | Ma trận xử lý Admin theo 03-F.3 (hàng không đúng mô tả, hỏng do VC, Buyer đổi ý, Seller không giao). | P0 |
| FR-ADM-06 | Dashboard: listing/order theo trạng thái, SLA khiếu nại & kiểm định, và 2 chỉ số trust tối thiểu của Seller: `cancel_rate`, `dispute_rate`. | P1 |
| FR-ADM-07 | Quyết định phân bổ cọc bắt buộc gắn `fault_code`, bằng chứng và audit trail cho mỗi case. | P0 |

---

## 4. Yêu cầu phi chức năng (NFR)

| ID | Mô tả |
|----|--------|
| NFR-SEC-01 | HTTPS; mật khẩu băm (argon2id/bcrypt mạnh); không lưu CVV nếu sau này có thẻ. |
| NFR-SEC-02 | RBAC middleware trên mọi API nhạy cảm. |
| NFR-PERF-01 | Danh sách listing phân trang; index DB theo price, brand_id, category_id. |
| NFR-AUDIT-01 | Audit log cho đổi trạng thái order/listing và hành động Admin. |
| NFR-AVAIL-01 | MVP không yêu cầu HA đa vùng; backup DB định kỳ. |
| NFR-DATA-01 | Lưu trữ dữ liệu theo [03-platform-policy.md](./03-platform-policy.md) mục G (tin đóng 12 tháng, KYC 24 tháng sau xóa TK, ảnh SP cold sau 6 tháng). |
| NFR-LEGAL-01 | Content license Seller → Sàn cho mục đích vận hành & quảng bá (03-G.2); không bán PII cho bên thứ ba ngoài mục đích giao dịch/logistics (03-G.3). |

---

## 5. Ràng buộc & phụ thuộc

- Lưu trữ object (ảnh/PDF) qua S3-compatible hoặc local disk dev; job chuyển cold storage theo G.1.
- Email SMTP cho thông báo và kênh hỗ trợ thứ 2.
- Module **SellerWallet** (hoặc tương đương) khuyến nghị để thực hiện phạt tiền / trừ phí kiểm định theo 01–03.
- Cần job nền để gửi nhắc việc `pending_confirmation` và tự động đóng đơn khi đạt điều kiện timeout.

---

## 6. Mở rộng v1.1+ (ngoài phạm vi MVP, triển khai theo lộ trình)

Các mục dưới đây bổ sung **yêu cầu chức năng mở rộng** (FR-EXT), tích hợp, và rủi ro — để triển khai sau khi MVP ổn định. Thứ tự đề xuất: **(1) thanh toán online / escrow** (giảm rủi ro tiền) → **(2) logistics** (hoàn thiện vòng đời giao hàng) → **(3) chatbot** (giảm tải CSKH, không chặn luồng giao dịch).

### 6.1 Chatbot chăm sóc khách hàng

**Mục tiêu:** Trả lời câu hỏi thường gặp (đăng tin, lọc xe, phí, kiểm định, tranh chấp cơ bản), hướng dẫn điều hướng trong app/web, và **chuyển tiếp** sang ticket/người khi vượt ngưỡng độ tin cậy hoặc yêu cầu pháp lý.

**Phạm vi nghiệp vụ**

- FAQ đồng bộ với nội dung Admin (bài viết / snippet có phiên bản), không “bịa” chính sách.
- Ngữ cảnh theo vai trò (guest vs buyer vs seller): ví dụ không hiển thị số dư/chi tiết đơn người khác.
- **Escalation:** tạo `SupportTicket` hoặc gắn `conversation_id` với bộ phận vận hành; chatbot không quyết định hoàn tiền/tranh chấp.

**FR-EXT (Chatbot)**

| ID | Mô tả | Ghi chú |
|----|--------|---------|
| FR-EXT-CHAT-01 | Widget/SDK nhúng (web) và entry point trong app; lịch sử phiên theo `user_id` (đã đăng nhập) hoặc session ẩn danh có TTL. | P1 sau MVP |
| FR-EXT-CHAT-02 | Retrieval từ knowledge base (vector store + metadata theo locale); fallback “không chắc” → đề xuất bài viết + nút tạo ticket. | P1 |
| FR-EXT-CHAT-03 | Guardrail: từ chối tư vấn pháp lý chuyên sâu; không lộ PII người dùng khác; log audit prompt/response (theo chính sách bảo mật). | P0 khi bật |
| FR-EXT-CHAT-04 | Admin: CRUD FAQ/knowledge chunk, xem thống kê intent top, đánh dấu câu trả lời sai để huấn luyện lại. | P2 |

**Phi chức năng:** Latency mục tiêu dưới 3 giây cho câu FAQ; rate limit theo IP/user; không lưu thẻ thanh toán trong luồng chat.

---

### 6.2 Kết nối đơn vị logistics

**Mục tiêu:** Cho phép tạo **đơn vận chuyển** từ địa chỉ lấy hàng (seller / điểm kiểm định) đến buyer, **theo dõi trạng thái**, đồng bộ với `Order` (và tùy chọn: chỉ giao sau khi thanh toán/escrow đạt trạng thái cho phép).

**Phạm vi nghiệp vụ**

- Hỗ trợ **COD / không COD** theo cấu hình đối tác; phí ship ước tính trước khi tạo shipment (quote API).
- Trạng thái tối thiểu: `created` → `picked_up` → `in_transit` → `delivered` / `failed` / `returned`.
- Tranh chấp: đính kèm mã vận đơn, ảnh POD (proof of delivery) nếu đối tác cung cấp.

**FR-EXT (Logistics)**

| ID | Mô tả | Ghi chú |
|----|--------|---------|
| FR-EXT-LOG-01 | Tạo `Shipment` gắn `order_id`, địa chỉ lấy/giao chuẩn hóa, kích thước/cân nặng gói hàng (có thể preset “xe đạp road/MTB”). | P1 |
| FR-EXT-LOG-02 | Webhook / job đồng bộ trạng thái từ đối tác → cập nhật `Order` + thông báo buyer/seller. | P1 |
| FR-EXT-LOG-03 | Admin: cấu hình `CarrierAccount`, mapping mã dịch vụ, phí markup nền tảng (nếu có). | P2 |
| FR-EXT-LOG-04 | Hủy shipment theo quy tắc đối tác; rollback trạng thái order theo chính sách (không tự động hoàn tiền nếu chưa tích hợp payment). | P1 |

**Rủi ro:** Phụ thuộc SLA đối tác; cần **idempotency key** khi tạo vận đơn và khi nhận webhook trùng.

---

### 6.3 Thanh toán online & escrow

**Mục tiêu:** Thu **cọc / toàn bộ** qua cổng thanh toán; tùy chọn **giữ tiền (escrow)** đến khi buyer xác nhận nhận xe hoặc hết SLA xác nhận, rồi **payout** cho seller trừ phí nền tảng.

**Phạm vi nghiệp vụ**

- Các phương thức: thẻ nội địa/quốc tế (qua PSP), ví điện tử (theo từng thị trường), chuyển khoản có đối soát nếu PSP hỗ trợ.
- Trạng thái `Payment`: `initiated` → `authorized` / `captured` → `settled` hoặc `refunded` / `failed`; với escrow: liên kết `hold_until` và sự kiện `release` / `refund` theo `Order`.
- Hoàn tiền một phần/toàn phần theo tranh chấp (Admin) với audit.

**FR-EXT (Payment / Escrow)**

| ID | Mô tả | Ghi chú |
|----|--------|---------|
| FR-EXT-PAY-01 | Initiate payment intent từ `Order`; không double-charge (idempotency key). | P0 khi bật |
| FR-EXT-PAY-02 | Webhook PSP: xác nhận thành công/thất bại; chỉ backend xử lý, ký HMAC secret. | P0 |
| FR-EXT-PAY-03 | Escrow: khóa payout cho đến `buyer_confirm_receipt` hoặc timeout + quy tắc mặc định (ghi rõ trong điều khoản). | P1 |
| FR-EXT-PAY-04 | Payout seller (tuần suất batch hoặc theo đơn); báo cáo thuế/hóa đơn theo quy định địa phương (out of scope kỹ thuật chi tiết — cần tư vấn kế toán). | P2 |
| FR-EXT-PAY-05 | Admin: đóng băng/hoàn tay trong sự cố; cảnh báo gian lận (velocity, địa chỉ). | P1 |

**Tuân thủ & bảo mật:** Không lưu dữ liệu thẻ đầy đủ (dùng tokenization PSP); PCI DSS do PSP đảm nhận khi dùng hosted fields / redirect; log không ghi PAN/CVV.

---

### 6.4 Tổng hợp FR-EXT theo ưu tiên

| Nhóm | Ưu tiên triển khai | Phụ thuộc |
|------|---------------------|-----------|
| Thanh toán + webhook + escrow tối thiểu | Cao | Tài khoản merchant PSP, điều khoản pháp lý |
| Logistics + webhook | Trung bình | Hợp đồng carrier, thử nghiệm sandbox |
| Chatbot + KB | Trung bình | Nội dung FAQ, chính sách moderation |

---

### 6.5 Thực thể dữ liệu bổ sung (gợi ý)

- `SupportTicket`, `ChatSession`, `ChatMessage` (hoặc ủy quyền cho nền tảng chat bên thứ ba qua `external_thread_id`).
- `Shipment`, `ShipmentEvent`, `CarrierAccount`.
- Mở rộng `Payment`: `provider`, `provider_ref`, `idempotency_key`, `escrow_state`, `released_at`.

Chi tiết quan hệ & endpoint: [ERD-and-API.md](./ERD-and-API.md) (mục 5).

---

## 7. Truy vết

Chi tiết thực thể & API (MVP và mở rộng): [ERD-and-API.md](./ERD-and-API.md).
