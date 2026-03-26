import { create } from 'zustand';
import { categoryService } from '../services/api';
import type { Category } from '../types';

type CategoryState = {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
};

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await categoryService.getAll();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Không tải được danh mục');
      }
      set({ categories: res.data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
}));
