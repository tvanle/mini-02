import type { ApiResponse, Showtime } from '../types';
import { executeQuery, initDatabase } from '../db/database';

export const showtimeService = {
  async getAll(movieId?: number, theaterId?: number): Promise<ApiResponse<Showtime[]>> {
    try {
      await initDatabase();
      let sql = `
        SELECT s.*, m.title as movieTitle, m.poster as moviePoster, m.duration as movieDuration, m.genre as movieGenre,
               t.name as theaterName, t.address as theaterAddress
        FROM showtimes s
        JOIN movies m ON m.id = s.movieId
        JOIN theaters t ON t.id = s.theaterId
      `;
      const params: (string | number | null)[] = [];
      const conditions: string[] = [];

      if (movieId) {
        conditions.push('s.movieId = ?');
        params.push(movieId);
      }
      if (theaterId) {
        conditions.push('s.theaterId = ?');
        params.push(theaterId);
      }
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY s.showDate ASC, s.showTime ASC';

      const rows = await executeQuery<Showtime>(sql, params);
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch showtimes failed' };
    }
  },

  async getById(showtimeId: number): Promise<ApiResponse<Showtime>> {
    try {
      await initDatabase();
      const rows = await executeQuery<Showtime>(
        `SELECT s.*, m.title as movieTitle, m.poster as moviePoster, m.duration as movieDuration, m.genre as movieGenre,
                t.name as theaterName, t.address as theaterAddress
         FROM showtimes s
         JOIN movies m ON m.id = s.movieId
         JOIN theaters t ON t.id = s.theaterId
         WHERE s.id = ? LIMIT 1`,
        [showtimeId]
      );
      if (!rows[0]) return { success: false, error: 'Không tìm thấy lịch chiếu' };
      return { success: true, data: rows[0] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch showtime failed' };
    }
  },

  async getBookedSeats(showtimeId: number): Promise<ApiResponse<string[]>> {
    try {
      await initDatabase();
      const rows = await executeQuery<{ seatNumber: string }>(
        'SELECT seatNumber FROM tickets WHERE showtimeId = ?',
        [showtimeId]
      );
      return { success: true, data: rows.map((r) => r.seatNumber) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch booked seats failed' };
    }
  },
};
