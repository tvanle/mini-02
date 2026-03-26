export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;
  productImage: string | null;
}

export interface Order {
  id: number;
  userId: number;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
}

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  ProductList: { categoryId?: number; title?: string } | undefined;
  ProductDetail: { productId: number };
  Checkout: undefined;
  Invoice: { order: Order };
  OrderHistory: undefined;
  UserList: undefined;
  UserDetail: { userId: number };
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Profile: undefined;
};
