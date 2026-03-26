import { create } from 'zustand';
import { productService } from '../services/api';
import type { Product } from '../types';

type ProductState = {
  products: Product[];
  productDetail: Product | null;
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: { categoryId?: number; search?: string }) => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
};

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  productDetail: null,
  loading: false,
  error: null,

  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await productService.getAll(params);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Không tải được sản phẩm');
      }
      set({ products: res.data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await productService.getById(id);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Không tải được chi tiết sản phẩm');
      }
      set({ productDetail: res.data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
}));
