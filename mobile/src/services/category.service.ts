import type { ApiResponse, Category } from '../types';
import { executeQuery, initDatabase } from '../db/database';

export const categoryService = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      await initDatabase();
      const rows = await executeQuery<Category>(
        'SELECT id, name, description, image FROM categories ORDER BY id ASC'
      );
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch categories failed' };
    }
  },
};
