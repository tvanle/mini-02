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
  createdAt: string;
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
  soldCount?: number;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  productId: number;
  colorHex: string;
  imageUrl: string;
  sortOrder: number;
}

export interface OrderDetail {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;
  productImage?: string | null;
}

export type OrderStatus = 'Pending' | 'Paid';

export interface Order {
  id: number;
  userId: number;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderDetail[];
}

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  Categories: undefined;
  ProductList: { categoryId?: number; categoryName?: string } | undefined;
  ProductDetail: { productId: number };
  Cart: undefined;
  Checkout: undefined;
  OrderHistory: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};
