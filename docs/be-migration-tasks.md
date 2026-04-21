# VeloTrust Backend Migration & Missing API Tasks

Tài liệu này tổng hợp lại các thiếu sót (Gap Analysis) từ file Swagger JSON API hiện trạng của team Backend (`https://sportsbicycles-api-cva3a4fgdgavfkbz.southeastasia-01.azurewebsites.net/swagger/v1/swagger.json`) so sánh với **Nghiệp vụ "Mua Trực Tiếp + PayOS + DeskReview" v3.2 mới nhất**.

Team Backend vui lòng cập nhật và thêm các API sau vào sprint tới:

---

## Ưu Tiên Cao Nhất (🔴 HIGH PRIORITY)

### 1. Phá bỏ cấu trúc Approve/Upload Bill Thủ Công và Thêm Webhook PayOS
- **Hiện trạng:** Đang có API `POST /api/buyer-order/{orderId}/paid`. Đây là thiết kế cũ cho luồng manual.
- **Yêu Cầu:** 
  - Tạo Controller Webhook: `POST /api/webhooks/payos`
  - Nhiệm vụ: Khi Webhook PayOS gọi tới, đối chiếu `OrderId` và `Amount` nhận được xem có bằng `Order.TotalPrice` hay không. 
  - Đổi trạng thái Order từ `Draft/Locked` sang `Payos_Confirmed` (Đã thanh toán) để che giấu PII thành hiển thị. Nếu thiếu tiền thì báo Failed.

### 2. Logic "Khóa Giỏ Hàng 5 Phút" (Cart Lock Timer)
- **Yêu cầu:** Sửa lại API `POST /api/buyer-order`. 
  - API này cần tạo 1 đơn hàng tạm thời (status: `locked`).
  - Phải trả về cho Frontend 1 trường `expiresAt` (Lưu 5 phút tính từ Now).
  - Phải tích hợp việc nhả Link/Mã QR PayOS động ngay trong API này.
  - Cần Job Background (Cronjob/Redis) quét `expiresAt` để HỦY đơn nếu buyer không thanh toán.

### 3. Cập nhật DTO Profile của Người Bán (Seller)
- **Hiện trạng:** Thiếu hoàn toàn field nhận tiền giải ngân. Escrow mà không có Tên Ngân Hàng thì không trả tiền đi được.
- **Yêu Cầu:** 
  - Mở rộng Entity DB User/Seller.
  - Sửa API `Auth/me` và API cập nhật User để nhận thêm 3 trường: `BankAccountName`, `BankAccountNumber`, `BankName`. Bắt buộc phải có 3 trường này mới cho phép `POST /api/seller-listing`.

---

## Ưu Tiên Cao (🟡 MEDIUM-HIGH PRIORITY)

### 4. API Tích Hợp GHN Gọn Gàng
- **Phương án giải quyết:** Phía Frontend sẽ tự gọi API public của hệ thống Giao Hàng Nhanh (GHN) để lấy `Province`, `District`, `Ward`. 
- **Yêu cầu Backend:** Hàm `POST /api/buyer-shipment/{orderId}` hiện đang có quá nhiều field lằng nhằng. Xin hãy tối giản.
  - Khi Backend đã thu tiền xong (Webhook PayOS nổ), hệ thống tự động đẩy cURL booking lên server hệ thống GHN và lưu cái ID Booking của hệ thống GHN (`ghn_waybill_code`) vào Database.
  - Khuyến nghị tạo `POST /api/webhooks/ghn` để hứng notification tình trạng bưu kiện.

### 5. API Cho Seller Nhận Lệnh Đóng Gói
- **Yêu Cầu:** SLA 12 tiếng của người bán.
  - Tạo API `POST /api/seller-order/{orderId}/confirm-ready-to-ship`. 
  - Seller gọi API này để hệ thống Trigger GHN điều shipper qua nhà Seller bốc hàng. Quá 12 tiếng không gọi -> Sập đơn phạt Seller.

---

## Ưu Tiên Vừa (🔵 KHỞI TẠO SAU KHI XONG CORE)

### 6. PayoutRequest (Luồng Xuất Tiền Ký Quỹ Escrow)
- Tránh bắt BE phải làm quá phức tạp. Hãy tạo luồng thủ công.
- Tạo Endpoint: `GET /api/admin/payouts/pending`
  - Lấy ra những đơn đã `GHN Delivered` vượt qua 48h (Hết hạn Dispute).
- Tạo Endpoint: `POST /api/admin/payouts/{id}/mark-paid`
  - Cho Admin ấn sau khi thực hiện bấm lệnh chuyển tiền ở ngoài đời qua App điện thoại Vietcombank.

### 7. Form Mở Dispute (Khiếu Nại)
- Khiếu nại v3.2 quy định ép Buyer up video vào form.
- Tạo Endpoint `POST /api/buyer-order/{orderId}/dispute` nhận lý do và List Media VideoURL. Tự động set cờ khóa PayoutRequest của Seller.
