import { query } from '../config/database.js';
import type { Order, OrderStatus } from '../types/index.js';

function mapRow(row: Record<string, unknown>): Order {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    createdAt: row.created_at as Date,
    status: row.status as OrderStatus,
    totalAmount: Number(row.total_amount),
  };
}

export const OrderModel = {
  async create(userId: number): Promise<Order> {
    const result = await query('INSERT INTO orders (user_id) VALUES ($1) RETURNING *', [userId]);
    return mapRow(result.rows[0]);
  },

  async findAllByUserId(userId: number): Promise<Order[]> {
    const result = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows.map(mapRow);
  },

  async findByIdAndUserId(id: number, userId: number): Promise<Order | null> {
    const result = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async setTotal(id: number, totalAmount: number): Promise<void> {
    await query('UPDATE orders SET total_amount = $1 WHERE id = $2', [totalAmount, id]);
  },

  async checkout(id: number, userId: number): Promise<Order | null> {
    const result = await query(
      "UPDATE orders SET status = 'Paid' WHERE id = $1 AND user_id = $2 AND status = 'Pending' RETURNING *",
      [id, userId]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },
};
