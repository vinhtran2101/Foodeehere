-- ===============================
--  FOODEE DATABASE - FINAL VERSION
--  Fully includes: Users, Roles, Orders, Products, VNPay, Reset Password
-- ===============================

DROP DATABASE IF EXISTS foodee;
CREATE DATABASE foodee CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE foodee;

SET FOREIGN_KEY_CHECKS=0;

-- ===============================
-- USERS
-- ===============================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255),
  enabled BIT(1) NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  fullname VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- ROLES
-- ===============================
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_role_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- USER ROLES (Many-to-Many)
-- ===============================
DROP TABLE IF EXISTS user_roles;
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- CATEGORIES
-- ===============================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- PRODUCT TYPES
-- ===============================
DROP TABLE IF EXISTS product_types;
CREATE TABLE product_types (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_producttype_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- PRODUCTS
-- ===============================
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id BIGINT NOT NULL AUTO_INCREMENT,
  description VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  discount DOUBLE NOT NULL,
  discounted_price DOUBLE NOT NULL,
  img VARCHAR(255),
  original_price DOUBLE NOT NULL,
  status VARCHAR(255) NOT NULL,
  category_id BIGINT,
  product_type_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_products_producttype FOREIGN KEY (product_type_id) REFERENCES product_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- CARTS
-- ===============================
DROP TABLE IF EXISTS carts;
CREATE TABLE carts (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- CART ITEMS
-- ===============================
DROP TABLE IF EXISTS cart_items;
CREATE TABLE cart_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  quantity INT NOT NULL,
  subtotal DOUBLE NOT NULL,
  cart_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_cartitems_cart FOREIGN KEY (cart_id) REFERENCES carts(id),
  CONSTRAINT fk_cartitems_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- ORDERS
-- ===============================
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id BIGINT NOT NULL AUTO_INCREMENT,
  delivery_address VARCHAR(255) NOT NULL,
  delivery_date DATETIME(6),
  email VARCHAR(255) NOT NULL,
  fullname VARCHAR(255) NOT NULL,
  order_date DATETIME(6) NOT NULL,
  order_status ENUM('CANCELLED','CANCEL_REQUESTED','CONFIRMED','DELIVERED','PENDING','SHIPPING') NOT NULL,
  payment_status ENUM('FAILED','PAID','PENDING','REFUNDED') NOT NULL,
  phone_number VARCHAR(255),
  total_amount DOUBLE NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- ORDER ITEMS
-- ===============================
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  quantity INT NOT NULL,
  subtotal DOUBLE NOT NULL,
  unit_price DOUBLE NOT NULL,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_orderitems_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_orderitems_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- PAYMENTS
-- ===============================
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  payment_method ENUM('CASH_ON_DELIVERY','ONLINE_PAYMENT') NOT NULL,
  order_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_payment_order (order_id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- BOOKINGS
-- ===============================
DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  area VARCHAR(255),
  booking_date DATE NOT NULL,
  booking_time TIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  number_of_guests INT NOT NULL,
  phone_number VARCHAR(255) NOT NULL,
  special_requests VARCHAR(255),
  status ENUM('CANCELLED','CANCEL_REQUESTED','CONFIRMED','PENDING') NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- NEWS
-- ===============================
DROP TABLE IF EXISTS news;
CREATE TABLE news (
  id BIGINT NOT NULL AUTO_INCREMENT,
  description TEXT,
  image_url VARCHAR(255),
  timestamp DATETIME(6) NOT NULL,
  news_url VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================
-- PASSWORD RESET TOKENS (NEW TABLE)
-- ===============================
DROP TABLE IF EXISTS password_reset_tokens;
CREATE TABLE password_reset_tokens (
  id BIGINT NOT NULL AUTO_INCREMENT,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiry_date DATETIME NOT NULL,
  used BIT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_passwordtoken_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;

-- ===============================
-- END OF STRUCTURE
-- ===============================
