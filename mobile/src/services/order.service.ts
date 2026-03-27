import type { ApiResponse, Order, OrderDetail } from '../types';
import { executeQuery, executeRun, initDatabase } from '../db/database';
import { getCurrentUserId } from '../utils/session';

const cartUpdateListeners = new Set<() => void>();

function notifyCartUpdated() {
  cartUpdateListeners.forEach((listener) => listener());
}

type DetailRow = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;
  productImage: string | null;
};

export const orderService = {
  subscribeCartUpdates(listener: () => void): () => void {
    cartUpdateListeners.add(listener);
    return () => {
      cartUpdateListeners.delete(listener);
    };
  },

  async getPendingItemsCount(): Promise<number> {
    await initDatabase();
    const userId = await getCurrentUserId();
    if (!userId) return 0;
    const rows = await executeQuery<{ totalQty: number | null }>(
      `SELECT SUM(od.quantity) as totalQty
       FROM order_details od
       JOIN orders o ON o.id = od.orderId
       WHERE o.userId = ? AND o.status = ?`,
      [userId, 'Pending']
    );
    return Number(rows[0]?.totalQty ?? 0);
  },

  async ensurePendingOrder(): Promise<ApiResponse<Order>> {
    try {
      await initDatabase();
      const userId = await getCurrentUserId();
      if (!userId) return { success: false, error: 'Bạn cần đăng nhập' };

      const existing = await executeQuery<Order>(
        'SELECT id, userId, createdAt, status, totalAmount FROM orders WHERE userId = ? AND status = ? ORDER BY id DESC LIMIT 1',
        [userId, 'Pending']
      );

      if (existing[0]) {
        const detail = await this.getOrderById(existing[0].id);
        return detail;
      }

      const inserted = await executeRun(
        'INSERT INTO orders (userId, createdAt, status, totalAmount) VALUES (?, ?, ?, 0)',
        [userId, new Date().toISOString(), 'Pending']
      );
      return this.getOrderById(inserted.lastInsertRowId);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Create order failed' };
    }
  },

  async addToCart(productId: number, quantity = 1): Promise<ApiResponse<Order>> {
    try {
      const pending = await this.ensurePendingOrder();
      if (!pending.success || !pending.data) return pending;

      const orderId = pending.data.id;
      const product = await executeQuery<{ id: number; price: number }>(
        'SELECT id, price FROM products WHERE id = ? LIMIT 1',
        [productId]
      );
      if (!product[0]) return { success: false, error: 'Sản phẩm không tồn tại' };

      const existed = await executeQuery<{ id: number; quantity: number; unitPrice: number }>(
        'SELECT id, quantity, unitPrice FROM order_details WHERE orderId = ? AND productId = ? LIMIT 1',
        [orderId, productId]
      );

      if (existed[0]) {
        const nextQty = existed[0].quantity + quantity;
        const subtotal = nextQty * existed[0].unitPrice;
        await executeRun('UPDATE order_details SET quantity = ?, subtotal = ? WHERE id = ?', [
          nextQty,
          subtotal,
          existed[0].id,
        ]);
      } else {
        await executeRun(
          'INSERT INTO order_details (orderId, productId, quantity, unitPrice, subtotal) VALUES (?, ?, ?, ?, ?)',
          [orderId, productId, quantity, product[0].price, quantity * product[0].price]
        );
      }

      await this.recalculateTotal(orderId);
      notifyCartUpdated();
      return this.getOrderById(orderId);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Add to cart failed' };
    }
  },

  async getPendingOrder(): Promise<ApiResponse<Order>> {
    await initDatabase();
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Bạn cần đăng nhập' };

    const rows = await executeQuery<Order>(
      'SELECT id, userId, createdAt, status, totalAmount FROM orders WHERE userId = ? AND status = ? ORDER BY id DESC LIMIT 1',
      [userId, 'Pending']
    );
    if (!rows[0]) return { success: false, error: 'Giỏ hàng trống' };
    return this.getOrderById(rows[0].id);
  },

  async getOrderById(orderId: number): Promise<ApiResponse<Order>> {
    try {
      await initDatabase();
      const orderRows = await executeQuery<Order>(
        'SELECT id, userId, createdAt, status, totalAmount FROM orders WHERE id = ? LIMIT 1',
        [orderId]
      );
      if (!orderRows[0]) return { success: false, error: 'Không tìm thấy đơn hàng' };

      const details = await executeQuery<DetailRow>(
        `SELECT od.id, od.orderId, od.productId, od.quantity, od.unitPrice, od.subtotal, p.name as productName, p.image as productImage
         FROM order_details od
         JOIN products p ON p.id = od.productId
         WHERE od.orderId = ?
         ORDER BY od.id DESC`,
        [orderId]
      );

      const items: OrderDetail[] = details.map((d) => ({
        id: d.id,
        orderId: d.orderId,
        productId: d.productId,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        subtotal: d.subtotal,
        productName: d.productName,
        productImage: d.productImage,
      }));

      return { success: true, data: { ...orderRows[0], items } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Fetch order failed' };
    }
  },

  async removeItem(orderDetailId: number): Promise<ApiResponse<boolean>> {
    try {
      await initDatabase();
      const row = await executeQuery<{ orderId: number }>(
        'SELECT orderId FROM order_details WHERE id = ? LIMIT 1',
        [orderDetailId]
      );
      if (!row[0]) return { success: false, error: 'Item không tồn tại' };

      await executeRun('DELETE FROM order_details WHERE id = ?', [orderDetailId]);
      await this.recalculateTotal(row[0].orderId);
      notifyCartUpdated();
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Remove item failed' };
    }
  },

  async updateItemQuantity(orderDetailId: number, quantity: number): Promise<ApiResponse<boolean>> {
    try {
      await initDatabase();
      const row = await executeQuery<{ orderId: number; unitPrice: number }>(
        'SELECT orderId, unitPrice FROM order_details WHERE id = ? LIMIT 1',
        [orderDetailId]
      );
      if (!row[0]) return { success: false, error: 'Item không tồn tại' };

      if (quantity <= 0) {
        await executeRun('DELETE FROM order_details WHERE id = ?', [orderDetailId]);
      } else {
        await executeRun('UPDATE order_details SET quantity = ?, subtotal = ? WHERE id = ?', [
          quantity,
          quantity * row[0].unitPrice,
          orderDetailId,
        ]);
      }

      await this.recalculateTotal(row[0].orderId);
      notifyCartUpdated();
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Update quantity failed' };
    }
  },

  async checkout(): Promise<ApiResponse<Order>> {
    try {
      const pending = await this.getPendingOrder();
      if (!pending.success || !pending.data) return { success: false, error: pending.error ?? 'Checkout failed' };

      if (pending.data.items.length === 0) {
        return { success: false, error: 'Giỏ hàng trống' };
      }

      for (const item of pending.data.items) {
        await executeRun('UPDATE products SET soldCount = COALESCE(soldCount, 0) + ? WHERE id = ?', [
          item.quantity,
          item.productId,
        ]);
      }

      await executeRun('UPDATE orders SET status = ? WHERE id = ?', ['Paid', pending.data.id]);
      await this.recalculateTotal(pending.data.id);
      notifyCartUpdated();
      return this.getOrderById(pending.data.id);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Checkout failed' };
    }
  },

  async getOrderHistory(): Promise<ApiResponse<Order[]>> {
    try {
      await initDatabase();
      const userId = await getCurrentUserId();
      if (!userId) return { success: false, error: 'Bạn cần đăng nhập' };

      const rows = await executeQuery<Order>(
        'SELECT id, userId, createdAt, status, totalAmount FROM orders WHERE userId = ? AND status = ? ORDER BY id DESC',
        [userId, 'Paid']
      );
      const result: Order[] = [];
      for (const row of rows) {
        const detail = await this.getOrderById(row.id);
        if (detail.success && detail.data) result.push(detail.data);
      }
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Order history failed' };
    }
  },

  async recalculateTotal(orderId: number): Promise<void> {
    const totalRows = await executeQuery<{ total: number | null }>(
      'SELECT SUM(subtotal) as total FROM order_details WHERE orderId = ?',
      [orderId]
    );
    const total = totalRows[0]?.total ?? 0;
    await executeRun('UPDATE orders SET totalAmount = ? WHERE id = ?', [total, orderId]);
  },
};
