# Chính sách nền tảng (đã chốt — v3.1)

Tài liệu tổng hợp các quyết định nghiệp vụ A, B, C, F, G — **source of truth** cùng [01-order-and-payment-rules.md](./01-order-and-payment-rules.md). Cập nhật phiên bản Không Cọc - Mua Trực Tiếp.

---

## A. Vai trò sàn, phí, phạm vi địa lý (V1)

### A.1 Định vị & mô hình vận hành

Sàn đóng **hai vai trò đồng thời:**
1. **Cầu nối thông tin:** kết nối Buyer–Seller, công cụ đăng tin, xem kiểm định Online, tích hợp vận chuyển thẳng GHN.
2. **Ký quỹ thanh toán tự động (Auto-Escrow):** Dành quyền thanh toán API PayOS. Sàn giữ 100% dòng tiền của Buyer, sau đó hệ thống tự động giải ngân cho Seller khi có trạng thái GHN hoàn tất (Delivered + 48h).

### A.2 Hệ thống Mô hình phí

| Loại phí / Số tiền | Ký hiệu | Giải thích |
|--------------------|--------|------------|
| **Giá đề nghị của Seller** | `X` | Số tiền cuối cùng mà Seller "muốn kiếm được" từ món hàng bán ra (Chưa bị trừ hoa hồng sàn). |
| **Phí dịch vụ (Sự an tâm cho Buyer)** | 5% * X | Thuế bảo đảm rủi ro (Nằm ngoài X). Nâng tổng số tiền Buyer phải trả lên thành `X + 5%*X`. |
| **Giá niêm yết (Listed Price)** | `X + 5%*X` | Mức giá Public hiện trên App cho User thấy. `Giá Niêm Yết = Giá Đề Nghị + Phí dịch vụ 5%`. |
| **Phí Hoa Hồng Sàn** | 5% * X | Khi bán thành công xe, Sàn sẽ trừ vào tổng khoản tiền của Seller. |
| **Phí Duyệt Tin (Kiểm định Online)** | 100.000đ | Phí cứng cố định trả cho Inspector desk review. Cũng bị trừ thẳng trên dòng tiền của Seller lúc rút ra. |

**Công thức Giải Ngân (Cho Seller):**  
`Tiền Giải Ngân = Giá Niêm Yết - 100.000đ - (X * 5% Hoa hồng sàn) - (X * 5% Phí dịch vụ)`
*(Hay rút gọn lại: Tiền Giải Ngân = X - 100.000đ - 5% X Hoa hồng).*

### A.3 Phạm vi địa lý V1

Hoạt động tập trung ba thành phố: **Hà Nội**, **TP. Hồ Chí Minh**, **Đà Nẵng**. Vận chuyển chịu sự phủ của Giao Hàng Nhanh (GHN).

---

## B. Người bán & hiển thị PII

**Quy tắc hiển thị SĐT & địa chỉ cụ thể:**

| Đối tượng | SĐT hoặc Địa chỉ Seller | 
|-----------|-------------------------|
| Guest / Buyer chưa/đang thanh toán | ❌ **Ẩn hoàn toàn** (Chỉ thấy quận/huyện mức thô) |
| Buyer sau khi **thanh toán PayOS thành công** | ✅ Hiện đầy đủ để tiện trao đổi nếu cần |
| Admin / Inspector | ✅ Hiện đầy đủ |

**Mục đích:** Vẫn phải bảo vệ quyền riêng tư cá nhân cho User và chống rò rỉ dữ liệu, phòng tránh bị quấy rối hoặc bị lách luật mua bán không thông qua Escrow của nền tảng nếu rò rỉ SĐT.

---

## C. Kiểm duyệt tin & không chỉnh sửa

### C.1 Tiêu chí duyệt tin 

Bắt buộc **Full Pipeline Duyệt**:
1. Seller post ảnh hông, cổ xe, xích/đề xe, bộ truyền động, số khung. Video quanh xe.
2. Inspector xem Online báo cáo pass/reject. Trả về `Suggested Price`.
3. Admin Approve. Bài lên kệ.

### C.2 Không chỉnh sửa

Khi bài đã đăng (Published) -> **Tuyệt đối cấm sửa nội dung**. Seller chỉ có quyền `Ẩn` (Hidden) hoặc `Xóa` (Deleted) để viết lại bài mới.

---

## D. Kiểm định (Inspector) — 100% ONLINE

Thay vì xách xe qua nhà, công việc kiểm định giờ chỉ tốn **Desk-Time**. Phân bổ Task qua thuật toán **Round Robin (Tự động chia đều cho Inspector)** có sẵn trong vòng 24h.
- Inspector log vào Portal, xem clip, xem ảnh zoom, check serial mất cắp.
- Xuất file kết quả theo Checklist định sẵn trên giao diện. Bóp giá hoặc tư vấn giá hợp lí.
- **Tốc độ nhanh** giúp lượng listings trên sàn tăng mạnh.

---

## E. Logistics & Chatbot

Hệ thống tích hợp đâm sâu vào Open API của GHN và PayOS:
- Render mã Code và QR trực tiếp với thời gian Timeout 5 phút trên Front-end, có Websocket để lắng nghe.
- Create Tracking ID tức thời để map order nội bộ với Waybill GHN.
- Tracking thời gian thực để Buyer theo dõi hành trình đơn hàng.

---

## F. Khiếu nại, SLA & ma trận xử lý (Admin)

### F.1 Kênh tiếp nhận

Tự động đính kèm `order_id` khi click vào nút "Khiếu Nại" ở giao diện chi tiết vận chuyển. Yêu cầu **bắt buộc Cung Cấp Video Unbox Mở Hộp** trong vòng 24 tiếng kể từ khi ấn nút khiếu nại. Quá hạn tự động bị ép xử Thua, Giải Ngân Cho Seller.

### F.2 Ma trận quyết định bồi thường (Penalty)

Bắt buộc trừng phạt bằng tài chính nếu "Lật Lọng" giao dịch giữa chừng hoặc "Vô trách nhiệm". 

| Tình huống | Chế Tài Phạt | Thất thoát Ship chiều đi | Thất thoát Ship hoàn về |
|------------|--------------|-------------------------|-------------------------|
| **Seller không chuẩn bị hàng (Quá 12 tiếng)** | Seller bị Phạt rớt điểm tín nhiệm. Hệ thống Refund hoàn 100% cho Buyer. | Chưa phát sinh | Chưa phát sinh |
| **Buyer tự ý chuyển tiền THIẾU vào PayOS** | Hủy đơn. Tiền thiếu sẽ bị treo chờ CSKH hoàn thủ công. | Lỗi thanh toán, chưa phát sinh Ship. | Chưa Phát sinh | 
| **Buyer Hủy TRƯỚC Hạn (Chưa giao cho GHN)** | Phạt 5% Giá Niêm Yết. (Sàn lấy 2, Seller giữ 3). | (Hàng chưa đi nên Sàn hoàn 100% tiền Ship cho Buyer). | (Chưa phát sinh). |
| **Buyer Bom Hàng (Không nhận máy / Hoàn hàng GHN)** | **Phạt 10% Giá Niêm Yết hoặc Mức Tiền Phí Ship 2 chiều.**, mức nào lớn hơn thì lấy. | Buyer chịu | Buyer trả. (Trích từ tiền phạt gửi Seller để Seller bù lỗ). |
| **Tranh Chấp: Seller sai mô tả hoặc xe gãy nứt** | Hoàn Đủ Tiền cho Buyer. | Sàn móc túi Seller đền bù lại cho Buyer. | Seller chịu. |

---

## G. Lưu trữ dữ liệu & quyền nội dung

Sàn bắt buộc Seller phải Khai Báo **Thông tin Tài Khoản Ngân Hàng** (Tên Chủ Tài Khoản, STK, Ngân Hàng) ở trong trang Profile thì hệ thống mới cho Auto Payout giải ngân sau khi ký quỹ 48h hoàn tất. Lịch sử bài bán khóa cứng trên đám mây sau 12 tháng đóng sổ. Tương tự, nếu không khai báo Bank Info, chức năng Admin Manual Refund cũng không trơn tru.
