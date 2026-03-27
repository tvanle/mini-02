import type { ApiResponse, Product, ProductImage } from '../types';
import { executeQuery, initDatabase } from '../db/database';

export type ProductSortBy = 'newest' | 'price_asc' | 'price_desc' | 'sold_desc';

export const productService = {
  async getAll(categoryId?: number, sortBy: ProductSortBy = 'newest'): Promise<ApiResponse<Product[]>> {
    try {
      await initDatabase();
      const orderBy =
        sortBy === 'price_asc'
          ? 'price ASC'
          : sortBy === 'price_desc'
          ? 'price DESC'
          : sortBy === 'sold_desc'
          ? 'soldCount DESC, id DESC'
          : 'id DESC';

      if (!categoryId) {
        const rows = await executeQuery<Product>(
          `SELECT id, name, description, price, image, categoryId, stock, soldCount
           FROM products
           ORDER BY ${orderBy}`
        );
        return { success: true, data: rows };
      }

      const rows = await executeQuery<Product>(
        `SELECT id, name, description, price, image, categoryId, stock, soldCount
         FROM products
         WHERE categoryId = ?
         ORDER BY ${orderBy}`,
        [categoryId]
      );
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch products failed' };
    }
  },

  async getById(productId: number): Promise<ApiResponse<Product>> {
    try {
      await initDatabase();
      const rows = await executeQuery<Product>(
        'SELECT id, name, description, price, image, categoryId, stock, soldCount FROM products WHERE id = ? LIMIT 1',
        [productId]
      );
      if (!rows[0]) return { success: false, error: 'Không tìm thấy sản phẩm' };
      const images = await executeQuery<ProductImage>(
        'SELECT id, productId, colorHex, imageUrl, sortOrder FROM product_images WHERE productId = ? ORDER BY sortOrder ASC',
        [productId]
      );
      return {
        success: true,
        data: {
          ...rows[0],
          images,
          image: rows[0].image || images[0]?.imageUrl || null,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch product detail failed' };
    }
  },
};
