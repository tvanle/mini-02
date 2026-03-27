import type { ApiResponse, Movie } from '../types';
import { executeQuery, initDatabase } from '../db/database';

export const movieService = {
  async getAll(genre?: string): Promise<ApiResponse<Movie[]>> {
    try {
      await initDatabase();
      if (genre) {
        const rows = await executeQuery<Movie>(
          'SELECT * FROM movies WHERE genre = ? ORDER BY rating DESC',
          [genre]
        );
        return { success: true, data: rows };
      }
      const rows = await executeQuery<Movie>('SELECT * FROM movies ORDER BY rating DESC');
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch movies failed' };
    }
  },

  async getById(movieId: number): Promise<ApiResponse<Movie>> {
    try {
      await initDatabase();
      const rows = await executeQuery<Movie>('SELECT * FROM movies WHERE id = ? LIMIT 1', [movieId]);
      if (!rows[0]) return { success: false, error: 'Không tìm thấy phim' };
      return { success: true, data: rows[0] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch movie failed' };
    }
  },

  async getGenres(): Promise<ApiResponse<string[]>> {
    try {
      await initDatabase();
      const rows = await executeQuery<{ genre: string }>('SELECT DISTINCT genre FROM movies ORDER BY genre ASC');
      return { success: true, data: rows.map((r) => r.genre) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch genres failed' };
    }
  },
};
