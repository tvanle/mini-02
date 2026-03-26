import { create } from 'zustand';
import { orderService } from '../services/api';
import type { Order } from '../types';

type CartState = {
  currentOrder: Order | null;
  orderHistory: Order[];
  loading: boolean;
  error: string | null;
  ensureOrder: () => Promise<Order>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  checkout: () => Promise<Order>;
  fetchHistory: () => Promise<void>;
};

export const useCartStore = create<CartState>((set, get) => ({
  currentOrder: null,
  orderHistory: [],
  loading: false,
  error: null,

  ensureOrder: async () => {
    const { currentOrder } = get();
    if (currentOrder && currentOrder.status === 'Pending') {
      return currentOrder;
    }

    const res = await orderService.create();
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Không thể tạo đơn hàng');
    }

    set({ currentOrder: res.data });
    return res.data;
  },

  addToCart: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const order = await get().ensureOrder();
      const res = await orderService.addItem(order.id, productId, quantity);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Không thể thêm vào giỏ');
      }
      set({ currentOrder: res.data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error;
    }
  },

  removeItem: async (itemId) => {
    const { currentOrder } = get();
    if (!currentOrder) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await orderService.removeItem(currentOrder.id, itemId);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Không thể xoá sản phẩm');
      }
      set({ currentOrder: res.data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  checkout: async () => {
    const { currentOrder } = get();
    if (!currentOrder) {
      throw new Error('Giỏ hàng trống');
    }

    set({ loading: true, error: null });
    try {
      const res = await orderService.checkout(currentOrder.id);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Checkout thất bại');
      }

      const paidOrder = res.data;
      set((state) => ({
        currentOrder: null,
        orderHistory: [paidOrder, ...state.orderHistory],
        loading: false,
      }));

      return paidOrder;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error;
    }
  },

  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const res = await orderService.getAll();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Không thể tải lịch sử đơn hàng');
      }

      const pending = res.data.find((o) => o.status === 'Pending') || null;
      const paid = res.data.filter((o) => o.status === 'Paid');

      set({ currentOrder: pending, orderHistory: paid, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
}));
