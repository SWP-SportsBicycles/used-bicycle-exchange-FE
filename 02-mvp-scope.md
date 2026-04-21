# Phạm vi MVP — Used Sports Bicycle Exchange

Tài liệu chốt phạm vi **phiên bản 1 (MVP)** — đồng bộ với [03-platform-policy.md](./03-platform-policy.md) và [01-order-and-payment-rules.md](./01-order-and-payment-rules.md).

## 0. Chốt kinh doanh V1

| Hạng mục | Quyết định |
|----------|------------|
| **Địa lý** | Chỉ vận hành tại **Hà Nội**, **TP. Hồ Chí Minh**, **Đà Nẵng**. |
| **Seller** | Chỉ **cá nhân**. |
| **Vai trò sàn** | Cầu nối + Trung gian đảm bảo an toàn giao dịch qua Escrow. Quản lý dòng tiền tự động 100%. |
| **Phí** | Phí kiểm định duyệt hồ sơ online: 100k. Phí đảm bảo (mở rộng trên giá): 5%. Hoa hồng sàn: 5%. (Chỉ thu trên đơn thành công). |
| **Mô hình mua bán** | **Trực tiếp (Cart Lock 5 phút)** — Không cọc. Thanh toán 100% qua PayOS trong thời gian khóa giỏ hàng 5 phút. |
| **PII Seller** | Mặc định **ẨN** SĐT và địa chỉ cụ thể của Seller đối với tất cả Guest/Buyer bình thường để chống nhảy deal. **Chỉ hiển thị thông tin liên hệ của Seller TRÊN DUY NHẤT ĐƠN HÀNG ĐÓ sau khi Buyer đã quét PayOS thanh toán thành công 100%**. |
| **Escrow** | **Hệ thống tự động** (PayOS). Sàn giữ tiền + chuyển cho seller sau 48h giao thành công (delivered). |

## 1. Vai trò trong v1

| Vai trò | MVP? | Ghi chú |
|---------|------|---------|
| **Guest** | ✅ | Xem listing + chi tiết. (Không thể thấy SĐT/địa chỉ Seller). Dùng Chatbot FAQ. |
| **Buyer** | ✅ | Đăng ký, tìm kiếm chức năng, lọc, **Thêm xe vào Wishlist (Danh sách yêu thích)**. Bỏ giỏ hàng (Cart lock), thanh toán PayOS, check tracking vận đơn online, khiếu nại, đánh giá. |
| **Seller** | ✅ | Đăng tin đầy đủ form dữ liệu, qua Inspector online duyệt mới được Publish. **Quản lý đơn hàng đặt mua xe của mình, xác nhận đóng gói chờ GHN đến lấy, xem lịch sử Tracking ID**. |
| **Admin** | ✅ | Quản lý User. **Vận hành thư mục: CRUD Categories (Thể loại), Danh mục Brands (Thương hiệu), Quản lý mọi giao dịch (Transaction) & phí thanh toán. Xem Dashboard thống kê hệ thống toàn sàn**. Xử lý tranh chấp. |
| **Inspector** | ✅ | **100% Cố định Online / Desk review**. Duyệt ảnh, video do seller cung cấp, đưa ra **báo cáo và tham mưu giá**. |

## 2. Thanh toán trong MVP (100% Auto)

| Phương thức | Quyết định |
|-------------|------------|
| **Cổng thanh toán PayOS** | **BẮT BUỘC TRONG MVP**. Tự tạo QR Code biến động theo Giá niêm yết + Phí Ship. Bắt Webhook tự động chốt đơn sau 5 phút. |

## 3. Logistics trong MVP (GHN API)

Tích hợp API của Giao Hàng Nhanh (**GHN**):
- **Tính phí Real-time:** Ngay thời điểm Buyer điền form giao hàng trong lúc đếm ngược 5 phút.
- **Tạo đơn Booking:** Sau khi PayOS báo ting ting, Backend tự động Confirm mã vận đơn với GHN.
- **Theo dõi Tracking:** Webhook nhận `picking_up`, `in_transit`, `delivered`,... hiển thị vào Quản lý đơn hàng cấp độ UI cho Seller và Buyer.

## 4. Chatbot CSKH trong MVP

**Floating chat widget** góc phải màn hình — không cần đăng nhập. Rule-based FAQ về quy trình mua/bán, kiểm định, escrow, khiếu nại. Câu không giải quyết được → hướng đến email hỗ trợ / Admin.

## 5. Chức năng theo sprint (gợi ý)

**Sprint 1 — Niêm yết & Auth & KĐ Online, CRUD Foundation**
- Auth. Đăng tin chuẩn config form chi tiết. 
- Role Inspector xem Online và Tham mưu giá ➔ Admin Duyệt Publish. Chặn sửa tin.
- Admin xây nền móng CRUD Categories, Brands, Users.

**Sprint 2 — Thanh toán & Vận chuyển PayOS/GHN**
- Luồng Giỏ hàng (Lock 5 mins) -> Nhập Address -> Tính phí Ship GHN.
- Render PayOS -> Webhook chốt đơn.
- Giao diện Quản lý Đơn hảng của Seller (Tương tác với trạng thái vận chuyển lấy kho).

**Sprint 3 — Escrow, Dashboard, Mở Rộng**
- User Dashboard, Admin Dashboard (Thống kê giao dịch, luồng tiền).
- Logic Escrow đếm ngược 48h từ lúc Delivered tự động giải ngân chuyển khoản Admin->Seller.
- Đánh giá (Review), Wishlist.

**Sprint 4 — Tranh chấp (Dispute)**
- Nút Khiếu nại, logic ngâm tiền Escrow, hoàn trả tiền theo 4 scenario C1, C2, C3, C4.

## 6. Tiêu chí "Done" MVP

1. Seller đăng tin đầy đủ ảnh ➔ Inspector ra giá -> Admin Approve ➔ Publish.
2. Buyer chọn mua ➔ Lock ➔ Thanh toán PayOS ➔ Seller mới thấy thông tin hiển thị lên "Quản lý đơn".
3. Lệnh tạo booking GHN hoàn tất, mang mã Vận đơn (Waybill) hiển thị cho Seller đi gửi / GHN đến tự lấy phụ thuộc settings.
4. Một đơn giao thành công ➔ Qua 48h Escrow ➔ Giải ngân cho Seller.

## 7. Phi chức năng tối thiểu

- Cấu trúc API cho phép Timeout Job (dùng Background job: BullMQ/Redis hoặc CRON) xóa giỏ sau 5 phút.
- HTTPS, hash mật khẩu, jwt.
- Phân quyền Guest / Buyer / Seller / Inspector / Admin. 
