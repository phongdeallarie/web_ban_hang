-- =========================================================
-- Web bán hàng - MySQL 8 schema đồng bộ backend/frontend
-- Charset utf8mb4 + unicode_ci để hiển thị tiếng Việt mượt nhất
-- =========================================================

CREATE DATABASE IF NOT EXISTS shopdatabase
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shopdatabase;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS WishlistItem;
DROP TABLE IF EXISTS OrderItem;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS Address;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Coupon;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS User;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE User (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  fullName VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NULL,
  avatar VARCHAR(500) NULL,
  loyaltyPoint INT NOT NULL DEFAULT 0,
  role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_email (email),
  KEY idx_user_role (role),
  KEY idx_user_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Category (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  description TEXT NULL,
  imageUrl VARCHAR(500) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_category_name (name),
  UNIQUE KEY uq_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Product (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  compareAtPrice DECIMAL(10,2) NULL,
  stock INT NOT NULL DEFAULT 0,
  imageUrl VARCHAR(500) NULL,
  imagePublicId VARCHAR(255) NULL,
  brand VARCHAR(191) NULL,
  tag VARCHAR(100) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  rating FLOAT NOT NULL DEFAULT 0,
  ratingCount INT NOT NULL DEFAULT 0,
  categoryId INT NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_slug (slug),
  KEY idx_product_category (categoryId),
  KEY idx_product_active (active),
  KEY idx_product_featured (featured),
  KEY idx_product_createdAt (createdAt),
  CONSTRAINT fk_product_category FOREIGN KEY (categoryId)
    REFERENCES Category (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Address (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  label VARCHAR(100) NULL,
  receiverName VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(191) NOT NULL,
  district VARCHAR(191) NULL,
  ward VARCHAR(191) NULL,
  line1 VARCHAR(255) NOT NULL,
  isDefault TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_address_user (userId),
  KEY idx_address_default (isDefault),
  CONSTRAINT fk_address_user FOREIGN KEY (userId)
    REFERENCES User (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE WishlistItem (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  productId INT NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlist_user_product (userId, productId),
  KEY idx_wishlist_product (productId),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (userId)
    REFERENCES User (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (productId)
    REFERENCES Product (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Coupon (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(80) NOT NULL,
  description VARCHAR(255) NULL,
  discountType VARCHAR(20) NOT NULL,
  discountValue DECIMAL(10,2) NOT NULL,
  minOrderValue DECIMAL(10,2) NULL,
  maxDiscountValue DECIMAL(10,2) NULL,
  usageLimit INT NULL,
  usedCount INT NOT NULL DEFAULT 0,
  startsAt DATETIME(3) NULL,
  endsAt DATETIME(3) NULL,
  isActive TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupon_code (code),
  KEY idx_coupon_active (isActive),
  KEY idx_coupon_endsAt (endsAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Order` (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  userId INT NULL,
  addressId INT NULL,
  couponId INT NULL,
  customerName VARCHAR(191) NOT NULL,
  customerEmail VARCHAR(191) NOT NULL,
  customerPhone VARCHAR(50) NOT NULL,
  shippingLine1 VARCHAR(255) NOT NULL,
  shippingWard VARCHAR(191) NOT NULL,
  shippingDistrict VARCHAR(191) NOT NULL,
  shippingCity VARCHAR(191) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discountAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shippingFee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  paymentMethod ENUM('COD', 'BANK_TRANSFER') NOT NULL DEFAULT 'COD',
  paymentStatus ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  status ENUM('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  note TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_order_code (code),
  KEY idx_order_user (userId),
  KEY idx_order_address (addressId),
  KEY idx_order_coupon (couponId),
  KEY idx_order_status (status),
  KEY idx_order_payment_status (paymentStatus),
  KEY idx_order_createdAt (createdAt),
  CONSTRAINT fk_order_user FOREIGN KEY (userId)
    REFERENCES User (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_order_address FOREIGN KEY (addressId)
    REFERENCES Address (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_order_coupon FOREIGN KEY (couponId)
    REFERENCES Coupon (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE OrderItem (
  id INT NOT NULL AUTO_INCREMENT,
  orderId INT NOT NULL,
  productId INT NULL,
  productName VARCHAR(191) NOT NULL,
  productImage VARCHAR(500) NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_orderitem_order (orderId),
  KEY idx_orderitem_product (productId),
  CONSTRAINT fk_orderitem_order FOREIGN KEY (orderId)
    REFERENCES `Order` (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_orderitem_product FOREIGN KEY (productId)
    REFERENCES Product (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Review (
  id INT NOT NULL AUTO_INCREMENT,
  rating INT NOT NULL,
  comment TEXT NULL,
  userId INT NOT NULL,
  productId INT NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_review_user_product (userId, productId),
  KEY idx_review_product (productId),
  KEY idx_review_rating (rating),
  CONSTRAINT fk_review_user FOREIGN KEY (userId)
    REFERENCES User (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_review_product FOREIGN KEY (productId)
    REFERENCES Product (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sau khi import SQL:
-- 1. Cập nhật backend/.env với DATABASE_URL đúng MySQL
-- 2. Chạy: npx prisma generate
-- 3. Nếu đang dùng DB mới hoàn toàn, có thể chạy thêm: npx prisma db push
-- 4. Đã seed sẵn tài khoản:
--    - admin@test.com / Admin@123 (ADMIN)
--    - customer@test.com / Customer@123 (CUSTOMER)

-- =========================================================
-- DỮ LIỆU MẪU: USERS / CATEGORIES / PRODUCTS
-- =========================================================

INSERT INTO User (email, passwordHash, fullName, phone, role) VALUES
('admin@test.com', '$2a$10$B.dTPWg52u4K.VcmYZGc7.Al9spQeXB2MGxeR0R9JI7gci0l4JukK', 'Quản trị viên', '0900000001', 'ADMIN'),
('customer@test.com', '$2a$10$rJ8z3taf2mbk9OxuJ47iA.MxsmD2QHCmqOBS96Zo2VvYoNISz/hU2', 'Khách hàng mẫu', '0900000002', 'CUSTOMER');

INSERT INTO Category (id, name, slug, description, imageUrl) VALUES
(1, 'Điện thoại', 'dien-thoai', 'Điện thoại chính hãng, hiệu năng ổn định, bảo hành rõ ràng.', 'https://example.com/images/categories/dien-thoai.jpg'),
(2, 'Laptop', 'laptop', 'Laptop học tập, văn phòng và gaming với nhiều phân khúc giá.', 'https://example.com/images/categories/laptop.jpg'),
(3, 'Tai nghe', 'tai-nghe', 'Tai nghe không dây và chụp tai cho nhu cầu giải trí, làm việc.', 'https://example.com/images/categories/tai-nghe.jpg'),
(4, 'Đồng hồ thông minh', 'dong-ho-thong-minh', 'Đồng hồ theo dõi sức khỏe, luyện tập và thông báo tiện lợi.', 'https://example.com/images/categories/dong-ho-thong-minh.jpg'),
(5, 'Phụ kiện', 'phu-kien', 'Phụ kiện công nghệ thiết yếu cho điện thoại và máy tính.', 'https://example.com/images/categories/phu-kien.jpg'),
(6, 'Gia dụng thông minh', 'gia-dung-thong-minh', 'Thiết bị gia dụng hiện đại giúp tối ưu cuộc sống hàng ngày.', 'https://example.com/images/categories/gia-dung-thong-minh.jpg');

INSERT INTO Product
(name, slug, description, price, compareAtPrice, stock, imageUrl, imagePublicId, brand, tag, featured, active, rating, ratingCount, categoryId)
VALUES
('iPhone 15 128GB', 'iphone-15-128gb', 'Thiết kế cao cấp, camera sắc nét, hiệu năng mượt mà cho nhu cầu hằng ngày.', 19990000.00, 21990000.00, 35, 'https://example.com/images/products/iphone-15-128gb.jpg', 'products/iphone-15-128gb', 'Apple', 'ban-chay', 1, 1, 4.8, 156, 1),
('Samsung Galaxy S24 256GB', 'samsung-galaxy-s24-256gb', 'Màn hình đẹp, AI tiện ích, pin bền phù hợp làm việc và giải trí.', 18490000.00, 20990000.00, 42, 'https://example.com/images/products/samsung-galaxy-s24-256gb.jpg', 'products/samsung-galaxy-s24-256gb', 'Samsung', 'moi', 1, 1, 4.7, 121, 1),
('Xiaomi Redmi Note 13 Pro', 'xiaomi-redmi-note-13-pro', 'Cấu hình mạnh trong tầm giá, camera độ phân giải cao.', 7890000.00, 8990000.00, 58, 'https://example.com/images/products/xiaomi-redmi-note-13-pro.jpg', 'products/xiaomi-redmi-note-13-pro', 'Xiaomi', 'gia-tot', 0, 1, 4.5, 87, 1),
('OPPO Reno11 F 5G', 'oppo-reno11-f-5g', 'Thiết kế thời trang, chụp chân dung đẹp, sạc nhanh tiện lợi.', 9290000.00, 10490000.00, 30, 'https://example.com/images/products/oppo-reno11-f-5g.jpg', 'products/oppo-reno11-f-5g', 'OPPO', 'moi', 0, 1, 4.4, 63, 1),
('vivo V30 Lite', 'vivo-v30-lite', 'Màn hình AMOLED sáng rõ, pin tốt cho nhu cầu sử dụng cả ngày.', 8490000.00, 9490000.00, 27, 'https://example.com/images/products/vivo-v30-lite.jpg', 'products/vivo-v30-lite', 'vivo', 'giam-gia', 0, 1, 4.3, 41, 1),
('MacBook Air M2 13 inch', 'macbook-air-m2-13-inch', 'Laptop mỏng nhẹ, pin lâu, tối ưu tốt cho học tập và công việc.', 25990000.00, 28990000.00, 18, 'https://example.com/images/products/macbook-air-m2-13-inch.jpg', 'products/macbook-air-m2-13-inch', 'Apple', 'ban-chay', 1, 1, 4.9, 98, 2),
('ASUS Vivobook 15 OLED', 'asus-vivobook-15-oled', 'Màn OLED sống động, hiệu năng ổn định cho dân văn phòng.', 15990000.00, 17990000.00, 24, 'https://example.com/images/products/asus-vivobook-15-oled.jpg', 'products/asus-vivobook-15-oled', 'ASUS', 'moi', 0, 1, 4.6, 74, 2),
('Dell Inspiron 14 5430', 'dell-inspiron-14-5430', 'Thiết kế bền bỉ, bàn phím êm, phù hợp làm việc dài giờ.', 16990000.00, 18990000.00, 21, 'https://example.com/images/products/dell-inspiron-14-5430.jpg', 'products/dell-inspiron-14-5430', 'Dell', 'van-phong', 0, 1, 4.5, 66, 2),
('Lenovo IdeaPad Slim 5', 'lenovo-ideapad-slim-5', 'Cân bằng giữa hiệu năng và trọng lượng, phù hợp sinh viên.', 15490000.00, 17490000.00, 29, 'https://example.com/images/products/lenovo-ideapad-slim-5.jpg', 'products/lenovo-ideapad-slim-5', 'Lenovo', 'gia-tot', 0, 1, 4.4, 59, 2),
('Acer Aspire 7 Gaming', 'acer-aspire-7-gaming', 'Laptop gaming tầm trung, card rời đáp ứng game phổ biến.', 18990000.00, 20990000.00, 12, 'https://example.com/images/products/acer-aspire-7-gaming.jpg', 'products/acer-aspire-7-gaming', 'Acer', 'gaming', 1, 0, 4.2, 33, 2),
('AirPods Pro 2 USB-C', 'airpods-pro-2-usb-c', 'Chống ồn chủ động, âm thanh chi tiết, kết nối nhanh với iPhone.', 5790000.00, 6490000.00, 46, 'https://example.com/images/products/airpods-pro-2-usb-c.jpg', 'products/airpods-pro-2-usb-c', 'Apple', 'ban-chay', 1, 1, 4.8, 142, 3),
('Sony WH-1000XM5', 'sony-wh-1000xm5', 'Tai nghe chụp tai cao cấp với chống ồn hàng đầu phân khúc.', 7490000.00, 8490000.00, 20, 'https://example.com/images/products/sony-wh-1000xm5.jpg', 'products/sony-wh-1000xm5', 'Sony', 'cao-cap', 1, 1, 4.9, 95, 3),
('JBL Tune 770NC', 'jbl-tune-770nc', 'Âm bass mạnh, pin lâu, phù hợp nghe nhạc mỗi ngày.', 2390000.00, 2790000.00, 37, 'https://example.com/images/products/jbl-tune-770nc.jpg', 'products/jbl-tune-770nc', 'JBL', 'giam-gia', 0, 1, 4.5, 68, 3),
('SoundPEATS Air4 Lite', 'soundpeats-air4-lite', 'Tai nghe true wireless nhỏ gọn, âm thanh rõ, đàm thoại tốt.', 990000.00, 1290000.00, 55, 'https://example.com/images/products/soundpeats-air4-lite.jpg', 'products/soundpeats-air4-lite', 'SoundPEATS', 'gia-tot', 0, 1, 4.3, 52, 3),
('Anker Soundcore R50i', 'anker-soundcore-r50i', 'Lựa chọn tiết kiệm với chất âm cân bằng, kết nối ổn định.', 690000.00, 890000.00, 64, 'https://example.com/images/products/anker-soundcore-r50i.jpg', 'products/anker-soundcore-r50i', 'Anker', 'gia-tot', 0, 1, 4.2, 39, 3),
('Apple Watch SE 2023 40mm', 'apple-watch-se-2023-40mm', 'Theo dõi sức khỏe cơ bản, đồng bộ mượt với hệ sinh thái Apple.', 6990000.00, 7990000.00, 28, 'https://example.com/images/products/apple-watch-se-2023-40mm.jpg', 'products/apple-watch-se-2023-40mm', 'Apple', 'ban-chay', 1, 1, 4.7, 84, 4),
('Samsung Galaxy Watch6 44mm', 'samsung-galaxy-watch6-44mm', 'Màn hình lớn, nhiều tính năng tập luyện và theo dõi giấc ngủ.', 5990000.00, 6990000.00, 26, 'https://example.com/images/products/samsung-galaxy-watch6-44mm.jpg', 'products/samsung-galaxy-watch6-44mm', 'Samsung', 'moi', 1, 1, 4.6, 73, 4),
('Xiaomi Watch S3', 'xiaomi-watch-s3', 'Thiết kế trẻ trung, pin tốt, hỗ trợ nhiều chế độ thể thao.', 3290000.00, 3790000.00, 40, 'https://example.com/images/products/xiaomi-watch-s3.jpg', 'products/xiaomi-watch-s3', 'Xiaomi', 'gia-tot', 0, 1, 4.4, 48, 4),
('Huawei Watch Fit 3', 'huawei-watch-fit-3', 'Kiểu dáng thời trang, phù hợp người dùng cần thiết bị nhẹ.', 2790000.00, 3290000.00, 44, 'https://example.com/images/products/huawei-watch-fit-3.jpg', 'products/huawei-watch-fit-3', 'Huawei', 'moi', 0, 1, 4.5, 57, 4),
('Amazfit GTR 4', 'amazfit-gtr-4', 'Đồng hồ bền bỉ, pin dài ngày, hỗ trợ luyện tập toàn diện.', 3990000.00, 4590000.00, 22, 'https://example.com/images/products/amazfit-gtr-4.jpg', 'products/amazfit-gtr-4', 'Amazfit', 'the-thao', 0, 1, 4.4, 46, 4),
('Sạc nhanh Anker 67W', 'sac-nhanh-anker-67w', 'Củ sạc công suất cao, hỗ trợ nhiều chuẩn sạc nhanh phổ biến.', 890000.00, 1090000.00, 70, 'https://example.com/images/products/sac-nhanh-anker-67w.jpg', 'products/sac-nhanh-anker-67w', 'Anker', 'phu-kien-hot', 1, 1, 4.7, 91, 5),
('Cáp USB-C to C Baseus 100W', 'cap-usb-c-to-c-baseus-100w', 'Cáp bọc dù bền chắc, truyền dữ liệu và sạc nhanh ổn định.', 159000.00, 199000.00, 120, 'https://example.com/images/products/cap-usb-c-to-c-baseus-100w.jpg', 'products/cap-usb-c-to-c-baseus-100w', 'Baseus', 'gia-tot', 0, 1, 4.5, 110, 5),
('Đế điện thoại Ugreen hợp kim', 'de-dien-thoai-ugreen-hop-kim', 'Đế đặt điện thoại chắc chắn, gập gọn tiện mang theo.', 249000.00, 299000.00, 80, 'https://example.com/images/products/de-dien-thoai-ugreen-hop-kim.jpg', 'products/de-dien-thoai-ugreen-hop-kim', 'Ugreen', 'tien-ich', 0, 1, 4.4, 62, 5),
('Pin dự phòng Xiaomi 20000mAh', 'pin-du-phong-xiaomi-20000mah', 'Dung lượng lớn, hỗ trợ sạc nhiều thiết bị khi di chuyển.', 690000.00, 790000.00, 65, 'https://example.com/images/products/pin-du-phong-xiaomi-20000mah.jpg', 'products/pin-du-phong-xiaomi-20000mah', 'Xiaomi', 'ban-chay', 1, 1, 4.6, 88, 5),
('Bàn phím cơ AKKO 3087', 'ban-phim-co-akko-3087', 'Bàn phím cơ gõ êm, layout gọn phù hợp làm việc và chơi game.', 1290000.00, 1490000.00, 33, 'https://example.com/images/products/ban-phim-co-akko-3087.jpg', 'products/ban-phim-co-akko-3087', 'AKKO', 'gaming', 0, 1, 4.5, 54, 5),
('Máy hút bụi Xiaomi G10', 'may-hut-bui-xiaomi-g10', 'Lực hút mạnh, thiết kế không dây, dễ vệ sinh nhà cửa.', 5490000.00, 6290000.00, 19, 'https://example.com/images/products/may-hut-bui-xiaomi-g10.jpg', 'products/may-hut-bui-xiaomi-g10', 'Xiaomi', 'gia-dung-hot', 1, 1, 4.6, 45, 6),
('Nồi chiên không dầu LocknLock 5L', 'noi-chien-khong-dau-locknlock-5l', 'Dung tích phù hợp gia đình nhỏ, chế biến nhanh và ít dầu mỡ.', 1990000.00, 2390000.00, 31, 'https://example.com/images/products/noi-chien-khong-dau-locknlock-5l.jpg', 'products/noi-chien-khong-dau-locknlock-5l', 'LocknLock', 'ban-chay', 0, 1, 4.5, 77, 6),
('Máy lọc không khí Sharp FP-J40E', 'may-loc-khong-khi-sharp-fp-j40e', 'Lọc bụi mịn hiệu quả, phù hợp phòng ngủ và phòng làm việc.', 3290000.00, 3790000.00, 25, 'https://example.com/images/products/may-loc-khong-khi-sharp-fp-j40e.jpg', 'products/may-loc-khong-khi-sharp-fp-j40e', 'Sharp', 'suc-khoe', 0, 1, 4.4, 51, 6),
('Đèn bàn thông minh Yeelight', 'den-ban-thong-minh-yeelight', 'Điều chỉnh nhiệt độ màu linh hoạt, phù hợp học tập ban đêm.', 990000.00, 1190000.00, 47, 'https://example.com/images/products/den-ban-thong-minh-yeelight.jpg', 'products/den-ban-thong-minh-yeelight', 'Yeelight', 'tien-ich', 0, 1, 4.3, 36, 6),
('Camera an ninh Imou Ranger 2C', 'camera-an-ninh-imou-ranger-2c', 'Giám sát trong nhà, hỗ trợ đàm thoại hai chiều và quay quét.', 690000.00, 890000.00, 53, 'https://example.com/images/products/camera-an-ninh-imou-ranger-2c.jpg', 'products/camera-an-ninh-imou-ranger-2c', 'Imou', 'an-ninh', 1, 1, 4.4, 69, 6);
