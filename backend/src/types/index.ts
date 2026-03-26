export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  createdAt: Date;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: number;
  stock: number;
}

export type OrderStatus = 'Pending' | 'Paid';

export interface Order {
  id: number;
  userId: number;
  createdAt: Date;
  status: OrderStatus;
  totalAmount: number;
}

export interface OrderDetail {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDetailWithProduct extends OrderDetail {
  productName: string;
  productImage: string | null;
}

export interface OrderWithItems extends Order {
  items: OrderDetailWithProduct[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface UpdateUserDto {
  username?: string;
  fullName?: string;
  email?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: number;
  stock: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: number;
  stock?: number;
}

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
}
