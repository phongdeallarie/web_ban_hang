-- shopdatabase.sql
-- Tạo database thủ công cho project ShopNow (MySQL)
-- Tương thích với cấu trúc backend MySQL/Vercel-ready

CREATE DATABASE IF NOT EXISTS shopdatabase
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shopdatabase;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa bảng theo thứ tự phụ thuộc nếu cần chạy lại file
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- 1) USERS
-- =========================
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  loyalty_point INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 2) CATEGORIES
-- =========================
CREATE TABLE categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 3) PRODUCTS
-- =========================
CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  detail LONGTEXT NULL,
  price DOUBLE NOT NULL,
  old_price DOUBLE NULL,
  discount_pct DOUBLE NULL DEFAULT 0,
  final_price DOUBLE NULL,
  rating DOUBLE NOT NULL DEFAULT 4.5,
  tag VARCHAR(191) NULL,
  image TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category_id INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_products_category_id (category_id),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 4) ORDERS
-- =========================
CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DOUBLE NOT NULL,
  payment_method VARCHAR(191) NOT NULL DEFAULT 'mock',
  payment_status VARCHAR(191) NOT NULL DEFAULT 'paid',
  status VARCHAR(191) NOT NULL DEFAULT 'completed',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_orders_user_id (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- 5) ORDER ITEMS
-- =========================
CREATE TABLE order_items (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DOUBLE NOT NULL,
  total_price DOUBLE NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- DỮ LIỆU MẪU
-- =========================
INSERT INTO categories (name) VALUES
('Điện tử'),
('Thời trang'),
('Phụ kiện'),
('Gia dụng');

-- Mật khẩu bên dưới chỉ là placeholder đã hash sẵn để demo
-- Bạn có thể thay bằng tài khoản tạo qua API sau này
INSERT INTO users (full_name, email, password, role, loyalty_point) VALUES
('Admin ShopNow', 'admin@shopnow.com', '$2a$10$4r4q5uPz8u4W9iF7K5g0nO4oA6n3dH5Q2t7j9M1xYp2kLmN8QvW7C', 'ADMIN', 0),
('Nguyễn Văn A', 'user@shopnow.com', '$2a$10$4r4q5uPz8u4W9iF7K5g0nO4oA6n3dH5Q2t7j9M1xYp2kLmN8QvW7C', 'CUSTOMER', 0);

INSERT INTO products
(name, description, detail, price, old_price, discount_pct, final_price, rating, tag, image, stock, category_id)
VALUES
(
  'Tai nghe Bluetooth AirBeat Pro',
  'Âm thanh rõ, pin lâu, kết nối ổn định cho học tập và làm việc.',
  'Tai nghe Bluetooth AirBeat Pro có thiết kế hiện đại, thời lượng pin dài, phù hợp cho học tập, làm việc và giải trí hằng ngày.',
  890000,
  1190000,
  25,
  892500,
  4.8,
  'Bán chạy',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  50,
  1
),
(
  'Giày thể thao Urban Sprint',
  'Nhẹ chân, êm ái và phù hợp cho đi học, đi làm, dạo phố.',
  'Giày Urban Sprint có đế êm, phong cách trẻ trung, thích hợp cho di chuyển hằng ngày.',
  1250000,
  1490000,
  16,
  1251600,
  4.7,
  'Mới',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  35,
  2
),
(
  'Balo laptop chống nước FlexPack',
  'Chống nước tốt, nhiều ngăn tiện lợi, hợp laptop 15.6 inch.',
  'Balo FlexPack phù hợp sinh viên và dân văn phòng, có nhiều ngăn, chất liệu bền.',
  590000,
  720000,
  10,
  648000,
  4.6,
  'Ưu đãi',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
  40,
  3
);

-- =========================
-- GỢI Ý:
-- 1. Nếu bạn muốn đồng bộ tuyệt đối với Prisma, sau khi import file này
--    hãy đặt DATABASE_URL trỏ tới shopdatabase và dùng Prisma db pull hoặc migrate.
-- 2. Mật khẩu mẫu phía trên là hash placeholder, nên đăng nhập bằng API có thể không khớp
--    nếu backend đang mong đợi hash từ seed khác. Cách an toàn hơn là:
--    - import cấu trúc + categories/products
--    - rồi dùng API /register để tạo user thật.
