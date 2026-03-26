import { query } from '../config/database.js';
import type { OrderDetailWithProduct } from '../types/index.js';

function mapRow(row: Record<string, unknown>): OrderDetailWithProduct {
  return {
    id: row.id as number,
    orderId: row.order_id as number,
    productId: row.product_id as number,
    quantity: row.quantity as number,
    unitPrice: Number(row.unit_price),
    subtotal: Number(row.subtotal),
    productName: row.product_name as string,
    productImage: (row.product_image as string | null) ?? null,
  };
}

export const OrderDetailModel = {
  async findByOrderId(orderId: number): Promise<OrderDetailWithProduct[]> {
    const result = await query(
      `SELECT od.*, p.name AS product_name, p.image AS product_image
       FROM order_details od
       JOIN products p ON p.id = od.product_id
       WHERE od.order_id = $1
       ORDER BY od.id ASC`,
      [orderId]
    );

    return result.rows.map(mapRow);
  },

  async findByOrderAndProduct(orderId: number, productId: number): Promise<OrderDetailWithProduct | null> {
    const result = await query(
      `SELECT od.*, p.name AS product_name, p.image AS product_image
       FROM order_details od
       JOIN products p ON p.id = od.product_id
       WHERE od.order_id = $1 AND od.product_id = $2`,
      [orderId, productId]
    );

    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async create(orderId: number, productId: number, quantity: number, unitPrice: number): Promise<void> {
    const subtotal = quantity * unitPrice;
    await query(
      'INSERT INTO order_details (order_id, product_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
      [orderId, productId, quantity, unitPrice, subtotal]
    );
  },

  async updateQuantity(id: number, quantity: number, unitPrice: number): Promise<void> {
    const subtotal = quantity * unitPrice;
    await query('UPDATE order_details SET quantity = $1, unit_price = $2, subtotal = $3 WHERE id = $4', [quantity, unitPrice, subtotal, id]);
  },

  async delete(orderId: number, itemId: number): Promise<boolean> {
    const result = await query('DELETE FROM order_details WHERE id = $1 AND order_id = $2', [itemId, orderId]);
    return (result.rowCount ?? 0) > 0;
  },

  async sumTotal(orderId: number): Promise<number> {
    const result = await query('SELECT COALESCE(SUM(subtotal), 0) AS total FROM order_details WHERE order_id = $1', [orderId]);
    return Number(result.rows[0].total);
  },
};
