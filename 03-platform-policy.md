# Chính sách nền tảng (đã chốt — v2.1)

Tài liệu tổng hợp các quyết định nghiệp vụ A, B, C, F, G — **source of truth** cùng [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md). Cập nhật SRS/ERD khi có thay đổi chính sách.

---

## A. Vai trò sàn, phí, phạm vi địa lý (V1)

### A.1 Định vị & mô hình vận hành

Sàn đóng **hai vai trò đồng thời:**
1. **Cầu nối thông tin:** kết nối Buyer–Seller, công cụ đăng tin, tìm kiếm, kiểm định, hỗ trợ tranh chấp.
2. **Trung gian thanh toán (Platform Escrow):** Thu/chi phân bổ theo quy tắc cọc, phí KĐ, phí thành công, hoàn tiền. Tiền Buyer nộp giữ trong **tài khoản ký quỹ của sàn**. **Admin xác nhận** từng khoản. Seller nhận tiền khi order `completed` (sàn giải ngân, trừ phí thành công).

### A.2 Mô hình phí

| Loại phí | V1 | Ghi chú |
|-----------|-----|---------| 
| **Phí niêm yết** | Miễn phí | Có thể bật sau khi thị trường ổn định. |
| **Soft Reserve** | 200.000đ - 500.000đ (Admin config gói) | Giữ chỗ + mở PII. **Khấu trừ vào giá cuối**. Phân bổ theo ma trận fault khi hủy. |
| **Phí kiểm định** | Theo bảng giá `FeeRule` | Seller-initiated: Seller trả. Buyer-initiated: Buyer trả nếu xe ok, Seller trả nếu severe_mismatch. |
| **Inspection Deposit** | 5%-10% giá xe, trần 2.000.000đ | Thu khi Buyer yêu cầu KĐ; Admin config rate. |
| **Phí thành công** | 2%–3% giá trị giao dịch (Admin config, áp khi `completed`) | Trừ vào tiền giải ngân cho Seller. |

### A.3 Phạm vi địa lý V1

Hoạt động tập trung ba thành phố: **Hà Nội**, **TP. Hồ Chí Minh**, **Đà Nẵng**. Listing/địa chỉ giao–nhận–kiểm định phải nằm trong phạm vi vận hành.

---

## B. Người bán & hiển thị PII

### B.1 Loại Seller (V1)

Chỉ **cá nhân** (không mở cửa hàng đa chi nhánh trong V1).

### B.2 Quy tắc hiển thị SĐT & địa chỉ cụ thể

| Đối tượng | SĐT Seller | Địa chỉ cụ thể |
|-----------|-----------|----------------|
| Guest / Buyer chưa SR | ❌ Ẩn | ❌ Ẩn (chỉ thấy quận/huyện mức thô) |
| Buyer sau SR được Admin confirm | ✅ Hiện đầy đủ | ✅ Hiện đầy đủ |
| Inspector (khi được assign) | ✅ | ✅ |
| Admin | ✅ | ✅ |

**Mục đích:** Giảm "nhảy deal" ra ngoài sàn trốn phí; đảm bảo chỉ Buyer nghiêm túc (đã cọc) mới liên hệ trực tiếp Seller.

---

## C. Kiểm duyệt tin & chỉnh sửa sau khi đăng

### C.1 Tiêu chí duyệt tin (bắt buộc để `published`)

| Yêu cầu | Mô tả |
|---------|--------|
| **Số khung (serial)** | Bắt buộc khai báo; Admin đối chiếu danh sách xe nghi mất cắp. Không duyệt nếu trùng/nghi ngờ cao. |
| **Ảnh groupset cận cảnh** | Tối thiểu **1 ảnh** cận cảnh bộ truyền động. |
| **Thành phố hợp lệ** | Thuộc HN / HCM / ĐN. |

**Ưu tiên duyệt:** Listing đã có badge VeloSafe Certified (Seller-initiated inspection) được Admin ưu tiên xét duyệt nhanh hơn vì đã có báo cáo kỹ thuật độc lập.

### C.2 Chỉnh sửa tin đã `published`

- Sửa giá **>10%** so với bản đã duyệt → tin về **`pending_review`**.
- Sửa **spec nhạy cảm** (groupset, size khung, loại phanh) → tin về **`pending_review`**.
- **Khi có Order đang active:** Khóa hoàn toàn sửa giá/spec — xem [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md) mục 2.

---

## D. Kiểm định (Inspector) — 2 chiều

### D.1 Seller-initiated (Pre-listing Certification)

- Seller chủ động request trước khi submit listing.
- **Seller trả phí KĐ** vào escrow sàn.
- Admin assign Inspector (SLA: 24h).
- Kết quả: `pass`/`minor_issues` → Badge **✅ VeloSafe Certified** gắn lên listing. `severe_mismatch` → Seller biết, không có badge.
- **Nằm ngoài Order flow** — không liên quan đến Buyer.

### D.2 Buyer-initiated (On-demand sau SR)

- Buyer request SAU KHI SR được Admin confirm.
- Buyer nộp **Inspection Deposit** vào escrow sàn.
- Admin assign Inspector (SLA: 24h).
- Inspector đến nhà Seller, upload báo cáo + **suggested_price** trong 48h.
- Buyer đọc báo cáo → tiếp tục mua / hủy.
- **Nằm trong Order flow** — xem chi tiết [01-order-and-deposit-rules.md](./01-order-and-deposit-rules.md) mục 4A.

---

## E. Logistics & Chatbot

### E.1 Logistics (Semi-integrated MVP)

| Bước | Actor | Mô tả |
|------|-------|-------|
| Chọn phương thức giao | Seller | Tự giao (Buyer đến lấy) hoặc Giao qua đơn vị vận chuyển |
| Nhập tracking code | Seller | Mã vận đơn từ GHN / GHTK / Viettel Post |
| Hiển thị tracking | Buyer | Xem mã vận đơn + link theo dõi trên website hãng |
| Đánh dấu đã giao | Seller/Admin | Kéo order từ `pending_fulfillment` sang `delivered` |

**Không tích hợp API thật** của hãng vận chuyển trong MVP. Phase 2: webhook tự động cập nhật trạng thái.

### E.2 Chatbot CSKH (Rule-based MVP)

- Floating chat widget, không cần đăng nhập.
- FAQ: quy trình mua/bán, kiểm định, escrow, khiếu nại, tracking đơn hàng.
- Câu không trả lời được → hướng đến email hỗ trợ.
- Phase 2: tích hợp LLM (OpenRouter API).

---

## F. Khiếu nại, SLA & ma trận xử lý (Admin)

### F.1 Kênh tiếp nhận

| Ưu tiên | Kênh | Ghi chú |
|---------|------|---------|
| **1** | Nút **"Khiếu nại"** trong đơn hàng | Tự động đính kèm `order_id`, lịch sử chat, thông tin các bên. |
| **2** | Email hỗ trợ | Lỗi kỹ thuật tài khoản, vấn đề pháp lý nặng. |

**Khi mở khiếu nại:** Đóng băng chi trả escrow cho đến khi Admin quyết định.

### F.2 SLA

| Sự kiện | SLA |
|---------|-----|
| Xác nhận đã nhận khiếu nại | Trong **8 giờ làm việc** |
| Quyết định xử lý cuối cùng | Trong **48 giờ làm việc** kể từ khi đủ bằng chứng |

### F.3 Ma trận quyết định (đồng bộ với 01 mục 7)

| Tình huống | Bằng chứng cần | Hướng xử lý |
|------------|---------------|-------------|
| **Buyer hủy tự ý** (không lỗi Seller/xe) | Chat log, log hẹn | **C1:** Mất SR → 70% Seller / 30% Sàn |
| **Buyer hủy vì xe sai lệch** (báo cáo Inspector xác nhận) | Báo cáo Inspector `severe_mismatch` | **C2:** Hoàn 100% SR+ID Buyer. Phí KĐ → Seller |
| **Seller hủy / không giao** | Quá hạn vận chuyển, Seller không phản hồi | **C3:** Hoàn 100% Buyer + ghi vi phạm Seller |
| **Hư hỏng vận chuyển** | Clip khui hàng + biên bản logistics | Giữ escrow, làm việc logistics bồi thường |
| **Lỗi hệ thống** | Audit kỹ thuật, incident report | Hoàn 100% Buyer (`system_fault`) |
| **Tranh chấp phức tạp** | Mọi bằng chứng từ hai bên | **C4:** Admin toàn quyền phân bổ |

---

## G. Lưu trữ dữ liệu & quyền nội dung

### G.1 Thời hạn lưu trữ

| Loại dữ liệu | Thời hạn |
|--------------|----------|
| Tin đăng (đã đóng / đã bán) | Tối thiểu **12 tháng** |
| Dữ liệu định danh | Trong suốt thời gian hoạt động + **24 tháng** sau xóa TK |
| Ảnh / video sản phẩm | Sau **6 tháng** kể từ khi tin đóng → có thể chuyển cold storage |

### G.2 Content license (Seller → Sàn)

Khi Seller tải ảnh/video lên, Seller cấp quyền cho Sàn sử dụng, sao chép, hiển thị để vận hành dịch vụ và quảng bá nền tảng.

### G.3 Bảo vệ dữ liệu cá nhân

Sàn **cam kết không bán** SĐT, địa chỉ cụ thể cho bên thứ ba ngoài mục đích thực hiện giao dịch / logistics (chỉ tiết lộ tối thiểu cần thiết cho đối tác vận chuyển khi có shipment).

---

*Phiên bản: 2.1 — đồng bộ với quyết định v2.1 ngày 2026-04-19.*
