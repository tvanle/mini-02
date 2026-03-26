import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

dotenv.config();

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);

    await query(
      `INSERT INTO users (username, password, full_name, email)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', hashedPassword, 'Admin User', 'admin@example.com']
    );

    const categoryRows = [
      ['Điện thoại', 'Các dòng smartphone phổ biến', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
      ['Laptop', 'Laptop văn phòng và gaming', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
      ['Tablet', 'Thiết bị tablet học tập và giải trí', 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'],
      ['Phụ kiện', 'Tai nghe, sạc, bàn phím, chuột', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800'],
    ] as const;

    for (const [name, description, image] of categoryRows) {
      await query(
        `INSERT INTO categories (name, description, image)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [name, description, image]
      );
    }

    const categories = await query('SELECT id, name FROM categories');
    const categoryMap = new Map<string, number>();
    for (const row of categories.rows) {
      categoryMap.set(row.name as string, row.id as number);
    }

    const products = [
      ['iPhone 15', 'Điện thoại Apple iPhone 15 128GB', 22990000, 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800', 'Điện thoại', 20],
      ['Samsung Galaxy S24', 'Điện thoại Samsung flagship', 20990000, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 'Điện thoại', 18],
      ['Xiaomi 14', 'Hiệu năng cao, giá tốt', 15990000, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 'Điện thoại', 25],
      ['MacBook Air M3', 'Laptop mỏng nhẹ cho công việc', 28990000, 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=800', 'Laptop', 10],
      ['Dell XPS 13', 'Laptop cao cấp màn hình đẹp', 31990000, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 'Laptop', 8],
      ['ASUS ROG Zephyrus', 'Laptop gaming mạnh mẽ', 35990000, 'https://images.unsplash.com/photo-1593642702744-d377ab507dc8?w=800', 'Laptop', 6],
      ['iPad Air', 'Tablet đa năng cho học tập và giải trí', 16990000, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 'Tablet', 12],
      ['Galaxy Tab S9', 'Tablet Android cao cấp', 18990000, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', 'Tablet', 9],
      ['Tai nghe Sony WH-1000XM5', 'Tai nghe chống ồn chủ động', 7990000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 'Phụ kiện', 30],
      ['Sạc nhanh 65W', 'Bộ sạc nhanh USB-C', 690000, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', 'Phụ kiện', 50],
      ['Chuột Logitech MX Master 3S', 'Chuột không dây cao cấp', 2490000, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 'Phụ kiện', 35],
    ] as const;

    for (const [name, description, price, image, categoryName, stock] of products) {
      const categoryId = categoryMap.get(categoryName);
      if (!categoryId) {
        continue;
      }

      await query(
        `INSERT INTO products (name, description, price, image, category_id, stock)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [name, description, price, image, categoryId, stock]
      );
    }

    console.log('Seed data completed');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
