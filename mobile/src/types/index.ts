export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type RootStackParamList = {
  Home: undefined;
  UserList: undefined;
  UserDetail: { userId: number };
};
