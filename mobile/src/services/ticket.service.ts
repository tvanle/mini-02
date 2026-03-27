import type { ApiResponse, Ticket } from '../types';
import { executeQuery, executeRun, initDatabase } from '../db/database';
import { getCurrentUserId } from '../utils/session';

export const ticketService = {
  async bookTicket(showtimeId: number, seatNumber: string): Promise<ApiResponse<Ticket>> {
    try {
      await initDatabase();
      const userId = await getCurrentUserId();
      if (!userId) return { success: false, error: 'Bạn cần đăng nhập để đặt vé' };

      // Check seat availability
      const existing = await executeQuery<{ id: number }>(
        'SELECT id FROM tickets WHERE showtimeId = ? AND seatNumber = ? LIMIT 1',
        [showtimeId, seatNumber]
      );
      if (existing[0]) return { success: false, error: 'Ghế này đã được đặt' };

      const result = await executeRun(
        'INSERT INTO tickets (userId, showtimeId, seatNumber, bookingTime) VALUES (?, ?, ?, ?)',
        [userId, showtimeId, seatNumber, new Date().toISOString()]
      );

      return this.getById(result.lastInsertRowId);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Đặt vé thất bại' };
    }
  },

  async getById(ticketId: number): Promise<ApiResponse<Ticket>> {
    try {
      await initDatabase();
      const rows = await executeQuery<Ticket>(
        `SELECT t.*, m.title as movieTitle, m.poster as moviePoster,
                th.name as theaterName, s.showDate, s.showTime, s.price
         FROM tickets t
         JOIN showtimes s ON s.id = t.showtimeId
         JOIN movies m ON m.id = s.movieId
         JOIN theaters th ON th.id = s.theaterId
         WHERE t.id = ? LIMIT 1`,
        [ticketId]
      );
      if (!rows[0]) return { success: false, error: 'Không tìm thấy vé' };
      return { success: true, data: rows[0] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch ticket failed' };
    }
  },

  async getMyTickets(): Promise<ApiResponse<Ticket[]>> {
    try {
      await initDatabase();
      const userId = await getCurrentUserId();
      if (!userId) return { success: false, error: 'Bạn cần đăng nhập' };

      const rows = await executeQuery<Ticket>(
        `SELECT t.*, m.title as movieTitle, m.poster as moviePoster,
                th.name as theaterName, s.showDate, s.showTime, s.price
         FROM tickets t
         JOIN showtimes s ON s.id = t.showtimeId
         JOIN movies m ON m.id = s.movieId
         JOIN theaters th ON th.id = s.theaterId
         WHERE t.userId = ?
         ORDER BY t.bookingTime DESC`,
        [userId]
      );
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch tickets failed' };
    }
  },

  async getMyTicketsCount(): Promise<number> {
    await initDatabase();
    const userId = await getCurrentUserId();
    if (!userId) return 0;
    const rows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM tickets WHERE userId = ?',
      [userId]
    );
    return rows[0]?.count ?? 0;
  },
};
