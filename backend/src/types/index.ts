export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}
