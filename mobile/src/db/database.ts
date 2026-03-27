import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let ready = false;

type SeedUser = {
  username: string;
  password: string;
  fullName: string;
  email: string;
};

type SeedCategory = {
  name: string;
  description: string | null;
  image: string | null;
};

type SeedProduct = {
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: number;
  stock: number;
  soldCount: number;
};

type SeedProductImage = {
  productName: string;
  colorHex: string;
  imageUrl: string;
  sortOrder: number;
};

const usersSeed: SeedUser[] = [
  { username: 'admin', password: '123456', fullName: 'Admin', email: 'admin@shop.local' },
  { username: 'staff', password: '123456', fullName: 'Sales Staff', email: 'staff@shop.local' },
];

const categoriesSeed: SeedCategory[] = [
  { name: 'Điện thoại', description: 'Smartphone các hãng', image: null },
  { name: 'Laptop', description: 'Laptop văn phòng và gaming', image: null },
  { name: 'Phụ kiện', description: 'Phụ kiện công nghệ', image: null },
  { name: 'Electronics', description: 'Thiết bị điện tử thông minh', image: null },
  { name: 'Fashion', description: 'Sản phẩm thời trang', image: null },
  { name: 'Home', description: 'Đồ gia dụng và nội thất', image: null },
  { name: 'Beauty', description: 'Mỹ phẩm và chăm sóc cá nhân', image: null },
  { name: 'Sports', description: 'Thiết bị thể thao', image: null },
];

const productsSeed: SeedProduct[] = [
  {
    name: 'iPhone 15',
    description:
      'iPhone 15 128GB trang bị chip A16 Bionic, màn hình Super Retina XDR 6.1 inch và camera chính 48MP cho ảnh chi tiết trong nhiều điều kiện ánh sáng.',
    price: 22990000,
    image: null,
    categoryId: 1,
    stock: 10,
    soldCount: 125,
  },
  {
    name: 'Samsung S24',
    description:
      'Samsung Galaxy S24 256GB với màn hình Dynamic AMOLED 2X 120Hz, hiệu năng mạnh mẽ cho đa nhiệm và camera AI tối ưu quay chụp ban đêm.',
    price: 19990000,
    image: null,
    categoryId: 1,
    stock: 12,
    soldCount: 96,
  },
  {
    name: 'MacBook Air M3',
    description:
      'MacBook Air M3 13 inch thiết kế mỏng nhẹ, pin lên đến cả ngày, phù hợp cho học tập, làm việc văn phòng và xử lý nội dung sáng tạo cơ bản.',
    price: 28990000,
    image: null,
    categoryId: 2,
    stock: 5,
    soldCount: 84,
  },
  {
    name: 'ASUS TUF F15',
    description:
      'ASUS TUF F15 cấu hình Core i7, tản nhiệt tốt, màn hình tần số quét cao giúp chơi game ổn định và xử lý tác vụ nặng trong thời gian dài.',
    price: 24990000,
    image: null,
    categoryId: 2,
    stock: 6,
    soldCount: 73,
  },
  {
    name: 'Tai nghe Bluetooth',
    description:
      'Tai nghe Bluetooth chống ồn chủ động, kết nối nhanh, đàm thoại rõ ràng và thời lượng pin dài phù hợp cho di chuyển và làm việc hàng ngày.',
    price: 1490000,
    image: null,
    categoryId: 3,
    stock: 30,
    soldCount: 188,
  },
  {
    name: 'Watch Ultra Pro',
    description:
      'Đồng hồ thông minh Watch Ultra Pro với màn hình sáng, theo dõi sức khỏe, hỗ trợ cuộc gọi Bluetooth và thời lượng pin dài cho hoạt động cả ngày.',
    price: 7990000,
    image: null,
    categoryId: 4,
    stock: 20,
    soldCount: 59,
  },
  {
    name: 'Leather Running Shoes',
    description:
      'Giày chạy bộ chất liệu da tổng hợp, đế đàn hồi tốt, form ôm chân và thoáng khí giúp chạy bộ hoặc đi bộ đường dài thoải mái.',
    price: 2290000,
    image: null,
    categoryId: 8,
    stock: 45,
    soldCount: 112,
  },
  {
    name: 'Studio Camera X1',
    description:
      'Máy ảnh mirrorless Studio Camera X1 với cảm biến lớn, lấy nét nhanh, quay video 4K, phù hợp cho người làm nội dung và nhiếp ảnh bán chuyên.',
    price: 15990000,
    image: null,
    categoryId: 4,
    stock: 8,
    soldCount: 41,
  },
  {
    name: 'Minimal Desk Lamp',
    description:
      'Đèn bàn thiết kế tối giản, ánh sáng dịu mắt, điều chỉnh độ sáng 3 mức và tiết kiệm điện năng cho góc làm việc tại nhà.',
    price: 690000,
    image: null,
    categoryId: 6,
    stock: 60,
    soldCount: 132,
  },
  {
    name: 'Skincare Starter Set',
    description:
      'Bộ chăm sóc da cơ bản gồm sữa rửa mặt, toner và kem dưỡng giúp làm sạch, cấp ẩm, phù hợp cho người mới bắt đầu skincare.',
    price: 1190000,
    image: null,
    categoryId: 7,
    stock: 32,
    soldCount: 77,
  },
  {
    name: 'Yoga Mat Pro',
    description:
      'Thảm yoga chống trượt cao cấp, độ dày 8mm giảm chấn tốt, dễ vệ sinh và bền bỉ cho luyện tập tại nhà hoặc phòng tập.',
    price: 550000,
    image: null,
    categoryId: 8,
    stock: 80,
    soldCount: 156,
  },
  {
    name: 'Retro Sunglasses',
    description:
      'Kính mát phong cách retro với tròng chống tia UV400, gọng nhẹ và bền, phù hợp đi chơi hoặc di chuyển ngoài trời mỗi ngày.',
    price: 490000,
    image: null,
    categoryId: 5,
    stock: 70,
    soldCount: 142,
  },
  {
    name: 'Portable Bluetooth Speaker',
    description:
      'Loa Bluetooth di động âm bass mạnh, pin dùng liên tục 10 giờ, chống nước nhẹ, phù hợp picnic và hoạt động ngoài trời.',
    price: 1490000,
    image: null,
    categoryId: 4,
    stock: 40,
    soldCount: 98,
  },
];

const productImagesSeed: SeedProductImage[] = [
  { productName: 'Tai nghe Bluetooth', colorHex: '#111827', imageUrl: 'https://picsum.photos/seed/headphone-black/900/900', sortOrder: 1 },
  { productName: 'Tai nghe Bluetooth', colorHex: '#d1d5db', imageUrl: 'https://picsum.photos/seed/headphone-white/900/900', sortOrder: 2 },
  { productName: 'Tai nghe Bluetooth', colorHex: '#3730a3', imageUrl: 'https://picsum.photos/seed/headphone-blue/900/900', sortOrder: 3 },
  { productName: 'iPhone 15', colorHex: '#111827', imageUrl: 'https://picsum.photos/seed/iphone-black/900/900', sortOrder: 1 },
  { productName: 'iPhone 15', colorHex: '#d1d5db', imageUrl: 'https://picsum.photos/seed/iphone-white/900/900', sortOrder: 2 },
  { productName: 'iPhone 15', colorHex: '#3730a3', imageUrl: 'https://picsum.photos/seed/iphone-blue/900/900', sortOrder: 3 },
  { productName: 'Samsung S24', colorHex: '#111827', imageUrl: 'https://picsum.photos/seed/s24-black/900/900', sortOrder: 1 },
  { productName: 'Samsung S24', colorHex: '#d1d5db', imageUrl: 'https://picsum.photos/seed/s24-white/900/900', sortOrder: 2 },
  { productName: 'Samsung S24', colorHex: '#3730a3', imageUrl: 'https://picsum.photos/seed/s24-blue/900/900', sortOrder: 3 },
  { productName: 'MacBook Air M3', colorHex: '#111827', imageUrl: 'https://picsum.photos/seed/macbook-black/900/900', sortOrder: 1 },
  { productName: 'MacBook Air M3', colorHex: '#d1d5db', imageUrl: 'https://picsum.photos/seed/macbook-silver/900/900', sortOrder: 2 },
  { productName: 'MacBook Air M3', colorHex: '#3730a3', imageUrl: 'https://picsum.photos/seed/macbook-blue/900/900', sortOrder: 3 },
];

export async function initDatabase(): Promise<void> {
  if (ready) return;

  db = await SQLite.openDatabaseAsync('shopping_v2.db');

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      categoryId INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      soldCount INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Pending', 'Paid')),
      totalAmount REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      colorHex TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(productId, colorHex, sortOrder)
    );
  `);

  await migrateFromLegacyIfNeeded();
  await ensureSchemaUpgrades();
  await seedIfEmpty();
  await ensureCatalogVariety();
  await ensureProductImages();
  await ensureGalleryForAllProducts();
  await ensureProductThumbnailFromImages();
  await enrichProductDescriptions();
  ready = true;
}

export async function executeQuery<T = unknown>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.getAllAsync<T>(sql, params);
}

export async function executeRun(sql: string, params: (string | number | null)[] = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.runAsync(sql, params);
}

async function seedIfEmpty() {
  const usersCount = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if ((usersCount[0]?.count ?? 0) === 0) {
    for (const user of usersSeed) {
      await executeRun(
        'INSERT INTO users (username, password, fullName, email, createdAt) VALUES (?, ?, ?, ?, ?)',
        [user.username, user.password, user.fullName, user.email, new Date().toISOString()]
      );
    }
  }

  const categoriesCount = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  if ((categoriesCount[0]?.count ?? 0) === 0) {
    for (const category of categoriesSeed) {
      await executeRun('INSERT INTO categories (name, description, image) VALUES (?, ?, ?)', [
        category.name,
        category.description,
        category.image,
      ]);
    }
  }

  const productsCount = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM products');
  if ((productsCount[0]?.count ?? 0) === 0) {
    for (const product of productsSeed) {
      await executeRun(
        'INSERT INTO products (name, description, price, image, categoryId, stock, soldCount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.image, product.categoryId, product.stock, product.soldCount]
      );
    }
  }
}

async function migrateFromLegacyIfNeeded() {
  const currentUsers = await executeQuery<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if ((currentUsers[0]?.count ?? 0) > 0) {
    return;
  }

  const legacy = await SQLite.openDatabaseAsync('shopping.db');

  try {
    const legacyHasUsers = await tableExists(legacy, 'users');
    if (!legacyHasUsers) return;

    const userCols = await getColumnNames(legacy, 'users');
    const usernameCol = firstExisting(userCols, ['username']);
    const passwordCol = firstExisting(userCols, ['password']);
    const fullNameCol = firstExisting(userCols, ['fullName', 'full_name', 'name']);
    const createdAtCol = firstExisting(userCols, ['createdAt', 'created_at']);

    const users = await legacy.getAllAsync<Record<string, unknown>>(
      `SELECT id, ${
        usernameCol ? `${usernameCol} as username` : `NULL as username`
      }, ${
        passwordCol ? `${passwordCol} as password` : `NULL as password`
      }, ${
        fullNameCol ? `${fullNameCol} as fullName` : `NULL as fullName`
      }, email, ${
        createdAtCol ? `${createdAtCol} as createdAt` : `NULL as createdAt`
      } FROM users`
    );

    for (const u of users) {
      const id = Number(u.id);
      const email = asString(u.email);
      if (!Number.isFinite(id) || !email) continue;

      await executeRun(
        'INSERT OR IGNORE INTO users (id, username, password, fullName, email, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [
          id,
          asString(u.username) || `user${id}`,
          asString(u.password) || '123456',
          asString(u.fullName) || asString(u.username) || `User ${id}`,
          email,
          asString(u.createdAt) || new Date().toISOString(),
        ]
      );
    }

    if (await tableExists(legacy, 'categories')) {
      const rows = await legacy.getAllAsync<Record<string, unknown>>(
        'SELECT id, name, description, image FROM categories'
      );
      for (const c of rows) {
        const id = Number(c.id);
        const name = asString(c.name);
        if (!Number.isFinite(id) || !name) continue;
        await executeRun(
          'INSERT OR IGNORE INTO categories (id, name, description, image) VALUES (?, ?, ?, ?)',
          [id, name, asNullableString(c.description), asNullableString(c.image)]
        );
      }
    }

    if (await tableExists(legacy, 'products')) {
      const productCols = await getColumnNames(legacy, 'products');
      const categoryIdCol = firstExisting(productCols, ['categoryId', 'category_id']);
      const rows = await legacy.getAllAsync<Record<string, unknown>>(
        `SELECT id, name, description, price, image, ${
          categoryIdCol ? `${categoryIdCol} as categoryId` : `NULL as categoryId`
        }, stock FROM products`
      );
      for (const p of rows) {
        const id = Number(p.id);
        const name = asString(p.name);
        const categoryId = Number(p.categoryId);
        const price = Number(p.price);
        if (!Number.isFinite(id) || !name || !Number.isFinite(categoryId) || !Number.isFinite(price)) continue;
        await executeRun(
          'INSERT OR IGNORE INTO products (id, name, description, price, image, categoryId, stock, soldCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            name,
            asNullableString(p.description),
            price,
            asNullableString(p.image),
            categoryId,
            Number.isFinite(Number(p.stock)) ? Number(p.stock) : 0,
            0,
          ]
        );
      }
    }

    if (await tableExists(legacy, 'orders')) {
      const orderCols = await getColumnNames(legacy, 'orders');
      const userIdCol = firstExisting(orderCols, ['userId', 'user_id']);
      const createdAtCol = firstExisting(orderCols, ['createdAt', 'created_at']);
      const totalAmountCol = firstExisting(orderCols, ['totalAmount', 'total_amount']);
      const rows = await legacy.getAllAsync<Record<string, unknown>>(
        `SELECT id, ${
          userIdCol ? `${userIdCol} as userId` : `NULL as userId`
        }, ${
          createdAtCol ? `${createdAtCol} as createdAt` : `NULL as createdAt`
        }, status, ${
          totalAmountCol ? `${totalAmountCol} as totalAmount` : `0 as totalAmount`
        } FROM orders`
      );
      for (const o of rows) {
        const id = Number(o.id);
        const userId = Number(o.userId);
        if (!Number.isFinite(id) || !Number.isFinite(userId)) continue;
        const status = asString(o.status) === 'Paid' ? 'Paid' : 'Pending';
        await executeRun(
          'INSERT OR IGNORE INTO orders (id, userId, createdAt, status, totalAmount) VALUES (?, ?, ?, ?, ?)',
          [
            id,
            userId,
            asString(o.createdAt) || new Date().toISOString(),
            status,
            Number.isFinite(Number(o.totalAmount)) ? Number(o.totalAmount) : 0,
          ]
        );
      }
    }

    const detailTable = (await tableExists(legacy, 'order_details'))
      ? 'order_details'
      : (await tableExists(legacy, 'order_items'))
      ? 'order_items'
      : null;
    if (detailTable) {
      const detailCols = await getColumnNames(legacy, detailTable);
      const orderIdCol = firstExisting(detailCols, ['orderId', 'order_id']);
      const productIdCol = firstExisting(detailCols, ['productId', 'product_id']);
      const unitPriceCol = firstExisting(detailCols, ['unitPrice', 'unit_price']);
      const rows = await legacy.getAllAsync<Record<string, unknown>>(
        `SELECT id, ${
          orderIdCol ? `${orderIdCol} as orderId` : `NULL as orderId`
        }, ${
          productIdCol ? `${productIdCol} as productId` : `NULL as productId`
        }, quantity, ${
          unitPriceCol ? `${unitPriceCol} as unitPrice` : `NULL as unitPrice`
        }, subtotal FROM ${detailTable}`
      );

      for (const d of rows) {
        const id = Number(d.id);
        const orderId = Number(d.orderId);
        const productId = Number(d.productId);
        const quantity = Number(d.quantity);
        const unitPrice = Number(d.unitPrice);
        const subtotal = Number(d.subtotal);
        if (!Number.isFinite(id) || !Number.isFinite(orderId) || !Number.isFinite(productId)) continue;
        await executeRun(
          'INSERT OR IGNORE INTO order_details (id, orderId, productId, quantity, unitPrice, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
          [
            id,
            orderId,
            productId,
            Number.isFinite(quantity) ? quantity : 1,
            Number.isFinite(unitPrice) ? unitPrice : 0,
            Number.isFinite(subtotal) ? subtotal : 0,
          ]
        );
      }
    }
  } catch {
    // If legacy migration fails, app still works with seed data.
  }
}

async function tableExists(database: SQLite.SQLiteDatabase, tableName: string): Promise<boolean> {
  const rows = await database.getAllAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [tableName]
  );
  return (rows[0]?.count ?? 0) > 0;
}

async function getColumnNames(database: SQLite.SQLiteDatabase, tableName: string): Promise<string[]> {
  const rows = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  return rows.map((r) => r.name);
}

function firstExisting(columns: string[], candidates: string[]): string | null {
  for (const c of candidates) {
    if (columns.includes(c)) return c;
  }
  return null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNullableString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  return null;
}

async function enrichProductDescriptions() {
  for (const product of productsSeed) {
    await executeRun(
      `UPDATE products
       SET description = ?
       WHERE name = ?
         AND (description IS NULL OR LENGTH(TRIM(description)) < 40)`,
      [product.description, product.name]
    );
  }
}

async function ensureCatalogVariety() {
  for (const category of categoriesSeed) {
    const exists = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM categories WHERE LOWER(name) = LOWER(?)',
      [category.name]
    );
    if ((exists[0]?.count ?? 0) === 0) {
      await executeRun('INSERT INTO categories (name, description, image) VALUES (?, ?, ?)', [
        category.name,
        category.description,
        category.image,
      ]);
    }
  }

  for (const product of productsSeed) {
    const exists = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM products WHERE LOWER(name) = LOWER(?)',
      [product.name]
    );
    if ((exists[0]?.count ?? 0) === 0) {
      await executeRun(
        'INSERT INTO products (name, description, price, image, categoryId, stock, soldCount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.image, product.categoryId, product.stock, product.soldCount]
      );
    }
  }
}

async function ensureSchemaUpgrades() {
  const productColumns = await executeQuery<{ name: string }>('PRAGMA table_info(products)');
  const hasSoldCount = productColumns.some((col) => col.name === 'soldCount');
  if (!hasSoldCount) {
    await executeRun('ALTER TABLE products ADD COLUMN soldCount INTEGER NOT NULL DEFAULT 0');
  }
}

async function ensureProductImages() {
  for (const image of productImagesSeed) {
    const product = await executeQuery<{ id: number }>('SELECT id FROM products WHERE name = ? LIMIT 1', [image.productName]);
    const productId = product[0]?.id;
    if (!productId) continue;

    await executeRun(
      'INSERT OR IGNORE INTO product_images (productId, colorHex, imageUrl, sortOrder) VALUES (?, ?, ?, ?)',
      [productId, image.colorHex, image.imageUrl, image.sortOrder]
    );
  }
}

async function ensureProductThumbnailFromImages() {
  const rows = await executeQuery<{ id: number }>('SELECT id FROM products');
  for (const row of rows) {
    const image = await executeQuery<{ imageUrl: string }>(
      'SELECT imageUrl FROM product_images WHERE productId = ? ORDER BY sortOrder ASC LIMIT 1',
      [row.id]
    );
    if (!image[0]?.imageUrl) continue;
    await executeRun(
      'UPDATE products SET image = ? WHERE id = ? AND (image IS NULL OR TRIM(image) = "")',
      [image[0].imageUrl, row.id]
    );
  }
}

async function ensureGalleryForAllProducts() {
  const palette = ['#111827', '#d1d5db', '#3730a3'];
  const products = await executeQuery<{ id: number; name: string }>('SELECT id, name FROM products');

  for (const product of products) {
    const current = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM product_images WHERE productId = ?',
      [product.id]
    );
    const currentCount = current[0]?.count ?? 0;
    if (currentCount >= 3) continue;

    const existingColors = await executeQuery<{ colorHex: string }>(
      'SELECT colorHex FROM product_images WHERE productId = ?',
      [product.id]
    );
    const used = new Set(existingColors.map((c) => c.colorHex));

    let sortOrder = 1;
    const maxSort = await executeQuery<{ maxSort: number | null }>(
      'SELECT MAX(sortOrder) as maxSort FROM product_images WHERE productId = ?',
      [product.id]
    );
    if (maxSort[0]?.maxSort) {
      sortOrder = Number(maxSort[0].maxSort) + 1;
    }

    for (let idx = 0; idx < palette.length; idx += 1) {
      const color = palette[idx];
      if (used.has(color)) continue;
      const safeName = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const imageUrl = `https://picsum.photos/seed/${safeName}-${idx + 1}/900/900`;
      await executeRun(
        'INSERT OR IGNORE INTO product_images (productId, colorHex, imageUrl, sortOrder) VALUES (?, ?, ?, ?)',
        [product.id, color, imageUrl, sortOrder++]
      );
    }
  }
}
