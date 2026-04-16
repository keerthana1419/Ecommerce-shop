-- Run this in MySQL Workbench or terminal: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS shopzone;
USE shopzone;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  items JSON NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sample products
INSERT INTO products (name, category, price, image) VALUES
('Wireless Headphones', 'Electronics', 59.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
('Running Shoes', 'Clothing', 89.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
('JavaScript Book', 'Books', 29.99, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
('Smart Watch', 'Electronics', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
('Desk Lamp', 'Home', 34.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'),
('Backpack', 'Clothing', 49.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
('Bluetooth Speaker', 'Electronics', 79.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'),
('Coffee Maker', 'Home', 44.99, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400');
