import axios from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  Category,
  Order,
  Product,
  User,
} from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export function setApiToken(token: string | null) {
  authToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const authService = {
  register: async (data: {
    username: string;
    password: string;
    fullName: string;
    email: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { username: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
};

export const categoryService = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },
};

export const productService = {
  getAll: async (params?: { categoryId?: number; search?: string }): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
};

export const orderService = {
  create: async (): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post('/orders');
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  addItem: async (orderId: number, productId: number, quantity: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post(`/orders/${orderId}/items`, { productId, quantity });
    return response.data;
  },

  removeItem: async (orderId: number, itemId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.delete(`/orders/${orderId}/items/${itemId}`);
    return response.data;
  },

  checkout: async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await apiClient.put(`/orders/${orderId}/checkout`);
    return response.data;
  },
};

export const userService = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};

export default apiClient;
