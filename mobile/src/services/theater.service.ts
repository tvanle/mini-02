import type { ApiResponse, Theater } from '../types';
import { executeQuery, initDatabase } from '../db/database';

export const theaterService = {
  async getAll(): Promise<ApiResponse<Theater[]>> {
    try {
      await initDatabase();
      const rows = await executeQuery<Theater>('SELECT * FROM theaters ORDER BY name ASC');
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch theaters failed' };
    }
  },

  async getById(theaterId: number): Promise<ApiResponse<Theater>> {
    try {
      await initDatabase();
      const rows = await executeQuery<Theater>('SELECT * FROM theaters WHERE id = ? LIMIT 1', [theaterId]);
      if (!rows[0]) return { success: false, error: 'Không tìm thấy rạp' };
      return { success: true, data: rows[0] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch theater failed' };
    }
  },
};
