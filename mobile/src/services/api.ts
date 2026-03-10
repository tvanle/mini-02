import axios from 'axios';
import type { User, ApiResponse } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: Omit<User, 'id' | 'createdAt'>): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

export default apiClient;
