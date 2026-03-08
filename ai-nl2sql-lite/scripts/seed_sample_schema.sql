-- NL2SQL-Lite: Sample schema for E2E testing
-- Run in PostgreSQL or Supabase SQL Editor (as postgres or table owner)
-- Compatible with read-only user (nl2sql_readonly) after migration

-- Drop if exists (for re-running)
DROP TABLE IF EXISTS t2s_sales;
DROP TABLE IF EXISTS t2s_products;
DROP TABLE IF EXISTS t2s_customers;

-- Products
CREATE TABLE t2s_products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price NUMERIC(10, 2)
);

INSERT INTO t2s_products (id, name, category, price) VALUES
  (1, 'Laptop', 'Electronics', 29990.00),
  (2, 'Mouse', 'Electronics', 599.00),
  (3, 'Keyboard', 'Electronics', 1290.00),
  (4, 'Desk Chair', 'Furniture', 4590.00),
  (5, 'Bookshelf', 'Furniture', 3290.00),
  (6, 'Notebook', 'Stationery', 45.00),
  (7, 'Pen Set', 'Stationery', 120.00),
  (8, 'Monitor', 'Electronics', 8990.00);

-- Customers
CREATE TABLE t2s_customers (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  region VARCHAR(50)
);

INSERT INTO t2s_customers (id, name, region) VALUES
  (1, 'สมชาย ใจดี', 'ภาคเหนือ'),
  (2, 'สมหญิง รักเรียน', 'ภาคกลาง'),
  (3, 'John Smith', 'North'),
  (4, 'Jane Doe', 'South'),
  (5, 'วิชัย เก่งมาก', 'ภาคตะวันออก'),
  (6, 'Mary Johnson', 'North'),
  (7, 'ประเสริฐ สุขใจ', 'ภาคใต้');

-- Sales
CREATE TABLE t2s_sales (
  id INTEGER PRIMARY KEY,
  product_id INTEGER REFERENCES t2s_products(id),
  amount NUMERIC(10, 2),
  sale_date DATE,
  customer_id INTEGER REFERENCES t2s_customers(id)
);

INSERT INTO t2s_sales (id, product_id, amount, sale_date, customer_id) VALUES
  (1, 1, 29990.00, '2024-01-15', 1),
  (2, 2, 1198.00, '2024-01-16', 2),
  (3, 1, 29990.00, '2024-01-20', 3),
  (4, 4, 4590.00, '2024-02-01', 1),
  (5, 6, 225.00, '2024-02-05', 5),
  (6, 8, 8990.00, '2024-02-10', 2),
  (7, 3, 2580.00, '2024-02-15', 4),
  (8, 1, 29990.00, '2024-03-01', 6),
  (9, 5, 3290.00, '2024-03-05', 7),
  (10, 2, 599.00, '2024-03-10', 3);
