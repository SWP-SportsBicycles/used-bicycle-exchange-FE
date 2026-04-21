# Software Requirements Specification (SRS)

**Hệ thống:** Online Exchange System for Used Sports Bicycles (VeloTrust)  
**Phiên bản tài liệu:** 3.0 (Trực tiếp, Auto Escrow, Không Cọc)  
**Tham chiếu:** [01-order-and-payment-rules.md](./01-order-and-payment-rules.md), [02-mvp-scope.md](./02-mvp-scope.md), [03-platform-policy.md](./03-platform-policy.md)

---

## 1. Giới thiệu

### 1.1 Mục đích

Mô tả yêu cầu chức năng và phi chức năng cho MVP nền tảng kết nối mua bán xe đạp thể thao đã qua sử dụng tại **Hà Nội, TP.HCM, Đà Nẵng**, Seller **cá nhân**, mô hình **Mua Trực Tiếp Khóa Giỏ 5 Phút** thanh toán 100% qua PayOS, vận hành Logistic thông qua GHN và quá trình kiểm duyệt ảnh/video Online của Inspector. Sàn làm vai trò Ký quỹ Giữ tiền (Escrow) xử lý thanh toán và hoàn tác dòng tiền tự động.

### 1.2 Phạm vi

Chi tiết quy chuẩn dòng tiền, hủy đơn phạt 5%-10% xem tại [01-order-and-payment-rules.md](./01-order-and-payment-rules.md)

---

## 2. Mô tả tổng quan

### 2.1 Tác nhân

Guest, Buyer, Seller, Inspector, Admin.

### 2.2 Giả định & chính sách neo

- Thanh toán 100% bằng PayOS. (Không quét bill bằng mắt Admin).
- Việc đăng bán tốn một khoản phí KĐ nhỏ 100k nhưng **chỉ bị trừ khi bán được hàng**. Trạch m nhiệm làm cho bài thật chau chuốt thuộc về tay Seller.
- Hệ thống cần CRON JOBS / Scheduler Engine bền bỉ cao để quét trạng thái đơn chạy trễ hẹn (Giỏ hàng xả sau 5 phút).

---

## 3. Yêu cầu chức năng

### 3.1 Xác thực & người dùng (FR-AUTH)

| ID | Mô tả | 
|----|--------|
| FR-AUTH-01 | Đăng ký/đăng nhập email password. Khóa sai pass. |
| FR-AUTH-02 | RBAC Phân quyền cứng Guest, Buyer, Seller, Inspector, Admin. | 

### 3.2 Listing (FR-LIST)

| ID | Mô tả |
|----|--------|
| FR-LIST-01 | CRUD Listing nháp. Ảnh hông, xích, cấu trúc, số serial bắt buộc điền. |
| FR-LIST-02 | **CẤM SỬA CHỮA**: Khi Listing đã đi qua quy trình duyệt gắt gao của Inspector Online thì cấm Seller update đổi tráo xe khác. Bắt ẩn và làm listing khác. |
| FR-LIST-03 | Quản lý File Uploads Video, Ảnh dung lượng vừa đủ cho Inspector cắm rễ xem. |

### 3.3 Mua hàng Giao Vận (FR-ORDER) - **THAY ĐỔI LỚN**

| ID | Mô tả | Ưu tiên |
|----|--------|---------|
| FR-ORDER-01 | **Lock 5 mins:** Khi khách bấm Mua, API cấm toàn bộ request Get/Put vào ID Listing này. | P0 |
| FR-ORDER-02 | Giao diện Điền địa chỉ + Tự động bóc API GHN ra phí ship tổng gộp vào giá xe. | P0 |
| FR-ORDER-03 | QR PayOS: Gọi API ngân hàng OpenBanking tự sinh mã VietQR. | P0 |
| FR-ORDER-04 | Background Worker: Lắng nghe hết 5 phút chưa nhận Webhook từ PayOs thì nhả Lock Listing, chọc Database hủy Đơn Draft. | P0 |
| FR-ORDER-05 | Webhooks: Lắng nghe trạng thái Giao hàng (Lấy hàng, trung chuyển, Delivery Done) tự động từ GHN đẩy sang. Cập nhật Status Order UI. | P0 |
| FR-ORDER-06 | Auto-Release Money: Escrow Release tự đóng `completed` nếu sau 48h từ lúc GHN báo thành công không có cãi vã kiện tụng từ Buyer. | P0 |

### 3.4 Kiểm định Online (FR-INSP)

| ID | Mô tả |
|----|--------|
| FR-INSP-01 | Table Danh sách Việc của Inpector Online. Download và Xem cận cảnh. |
| FR-INSP-02 | Đẩy file Checklist Inspection Form (Có gợi ý mức giá bán) nộp lên hệ thống nội bộ. | 

### 3.5 Báo Cáo Chế Tài Admin (FR-ADM)

| ID | Mô tả | 
|----|--------|
| FR-ADM-01 | Cấu Hình Nền: Chỉnh mức % Phí bảo hiểm rủi ro, Phí hoa hồng Admin theo Database. |
| FR-ADM-02 | Action Refund: Admin được quyền chạy lệnh refund tiền (Bấm Refund qua link PayOS). Chấp nhận quy tắc trừ phạt 5% - 10% như mô tả 01-rule. |

---

## 4. Yêu cầu phi chức năng (NFR)

* NFR-SEC-01: **WEBHOOK SECURITY**. GHN và PayOS gọi ngược server phải có giải mã Signature Header verify_token xác thực tránh tấn công ddos làm giả bill trả tiền.
* NFR-PERF-01: CRON JOB hủy giỏ hàng phải xử lý nhẹ, không nghẽn cổ chai chặn process chính.
* NFR-LEGAL-01: Mọi chính sách phạt hủy, mất ship đều được Pop-up To rõng rạc trên web cho User đọc nhấp I AGREE. Nắm pháp lý bảo vệ nền tảng.
