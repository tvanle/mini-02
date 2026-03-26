import pool from './database.js';

const migrations = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(500)
  );

  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    image VARCHAR(500),
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    stock INT NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name ON products(name);

  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

  CREATE TABLE IF NOT EXISTS order_details (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_order_details_order_id ON order_details(order_id);
  CREATE INDEX IF NOT EXISTS idx_order_details_product_id ON order_details(product_id);
`;

async function migrate() {
  try {
    console.log('Running migrations...');
    await pool.query(migrations);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
