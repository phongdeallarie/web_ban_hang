# QA Bug List & Test Cases (web_ban_hang)

## 1) Danh sách lỗi có bằng chứng từ code

### BUG-01: Không tạo/cập nhật coupon được do sai tên field Prisma
- **Evidence**:
  - `backend/prisma/schema.prisma:135` khai báo field là `maxDiscountValue`
  - `backend/src/routes/coupon.routes.js:82` và `:107` ghi vào field `maxDiscount`
- **Root cause ngắn**: Backend dùng sai tên thuộc tính khi `prisma.coupon.create/update`, dẫn tới lỗi runtime Prisma (`Unknown argument`).

### BUG-02: Sai nghiệp vụ phương thức thanh toán MOMO/VNPAY khi checkout
- **Evidence**:
  - Frontend cho chọn `MOMO`, `VNPAY` tại `frontend/src/pages/OrdersPage.jsx:124-125`
  - Backend chỉ lưu `BANK_TRANSFER` hoặc ép về `COD` tại `backend/src/routes/order.routes.js:131`
  - Đồng thời `paymentStatus` đặt `PAID` cho mọi phương thức khác `COD` tại `backend/src/routes/order.routes.js:132`
- **Root cause ngắn**: Mapping thanh toán không đồng nhất FE/BE; MOMO/VNPAY bị ép thành COD nhưng vẫn đánh dấu đã thanh toán.

### BUG-03: Trang admin hiển thị sai tiền đơn hàng (0đ/NaN)
- **Evidence**:
  - FE dùng `item.totalPrice`, `order.totalAmount` tại `frontend/src/pages/AdminPage.jsx:464,467`
  - API `/orders/admin/all` trả dữ liệu order gốc (`total`, `items[].total`) không serialize sang `totalAmount/totalPrice` tại `backend/src/routes/order.routes.js:260-277`
  - Hàm format ép `undefined` thành 0 tại `frontend/src/utils/format.js:1-3`
- **Root cause ngắn**: FE dùng sai key so với payload backend.

### BUG-04: Giỏ hàng cho phép vượt tồn kho / thêm sản phẩm hết hàng ở luồng context
- **Evidence**:
  - `addToCart` dùng `product.stock || 99` tại `frontend/src/context/ShopContext.jsx:127,135` (stock=0 bị fallback thành 99)
  - `updateCartQuantity` chỉ `Math.max(1, quantity)` không chặn vượt kho tại `frontend/src/context/ShopContext.jsx:149`
- **Root cause ngắn**: Logic giới hạn số lượng trong context không ràng buộc đúng theo tồn kho thực.

---

## 2) Test cases chi tiết để expose lỗi

### TC-BUG-01
- **ID**: TC-BUG-01
- **Title**: Admin tạo coupon có giới hạn giảm tối đa
- **Preconditions**:
  1. Đăng nhập tài khoản ADMIN.
  2. Mở trang `/admin`, tab Coupon.
- **Steps**:
  1. Nhập mã coupon hợp lệ (vd: `MAX50`).
  2. Chọn loại `percent`, giá trị giảm `20`.
  3. Nhập `Giảm tối đa = 50000`.
  4. Bấm `Tạo coupon`.
- **Expected result**:
  - Coupon được tạo thành công và xuất hiện trong danh sách.
- **Actual result (bug behavior)**:
  - API trả lỗi 500 (`Không thể tạo coupon`) do Prisma không nhận field `maxDiscount`.
- **Priority/Severity**: **P1 / High**

### TC-BUG-02
- **ID**: TC-BUG-02
- **Title**: Checkout với MOMO/VNPAY bị lưu sai phương thức
- **Preconditions**:
  1. User đã đăng nhập, có địa chỉ giao hàng.
  2. Giỏ hàng có ít nhất 1 sản phẩm còn hàng.
- **Steps**:
  1. Vào `/orders`.
  2. Chọn phương thức thanh toán `MoMo` (hoặc `VNPay`).
  3. Bấm `Xác nhận thanh toán`.
  4. Kiểm tra đơn hàng vừa tạo trong lịch sử hoặc DB/API admin.
- **Expected result**:
  - `paymentMethod` phản ánh đúng MOMO/VNPAY (hoặc hệ thống không cho chọn nếu chưa hỗ trợ).
- **Actual result (bug behavior)**:
  - Đơn bị lưu `paymentMethod = COD` nhưng `paymentStatus = PAID`.
- **Priority/Severity**: **P1 / Critical**

### TC-BUG-03
- **ID**: TC-BUG-03
- **Title**: Admin xem chi tiết đơn hàng hiển thị sai tổng tiền
- **Preconditions**:
  1. Có ít nhất 1 đơn hàng đã tạo, item có giá > 0.
  2. Đăng nhập ADMIN, vào tab Đơn hàng.
- **Steps**:
  1. Mở danh sách đơn hàng trong `/admin`.
  2. Quan sát tiền từng dòng sản phẩm và tổng tiền đơn.
- **Expected result**:
  - Tiền item/tổng đơn hiển thị đúng theo dữ liệu order.
- **Actual result (bug behavior)**:
  - Nhiều dòng hiển thị `0 ₫` (hoặc sai) do FE đọc `totalPrice/totalAmount` không tồn tại trong payload.
- **Priority/Severity**: **P2 / High**

### TC-BUG-04
- **ID**: TC-BUG-04
- **Title**: Tăng số lượng giỏ hàng vượt tồn kho
- **Preconditions**:
  1. Có sản phẩm tồn kho thấp (vd stock = 1).
  2. User mở app và thêm sản phẩm vào giỏ.
- **Steps**:
  1. Mở Cart Drawer.
  2. Nhấn `+` nhiều lần để tăng số lượng.
  3. Tiến hành checkout.
- **Expected result**:
  - UI chặn số lượng tối đa bằng tồn kho.
- **Actual result (bug behavior)**:
  - UI vẫn tăng được vượt tồn kho; chỉ đến bước checkout backend mới trả lỗi thiếu hàng.
- **Priority/Severity**: **P2 / Medium**
