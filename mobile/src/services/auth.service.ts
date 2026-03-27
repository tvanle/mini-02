import type { ApiResponse, User } from '../types';
import { executeQuery, executeRun, initDatabase } from '../db/database';
import { clearSession, setCurrentUser } from '../utils/session';

type AuthPayload = {
  username: string;
  password: string;
};

type RegisterPayload = {
  username: string;
  password: string;
  fullName: string;
  email: string;
};

export const authService = {
  async login(payload: AuthPayload): Promise<ApiResponse<User>> {
    try {
      await initDatabase();
      const users = await executeQuery<User & { password: string }>(
        'SELECT id, username, password, fullName, email, createdAt FROM users WHERE username = ? AND password = ? LIMIT 1',
        [payload.username, payload.password]
      );

      if (!users[0]) {
        return { success: false, error: 'Sai tài khoản hoặc mật khẩu' };
      }

      const { password: _pwd, ...user } = users[0];
      await setCurrentUser(user);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<User>> {
    try {
      await initDatabase();
      const exists = await executeQuery<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE username = ? OR email = ?',
        [payload.username, payload.email]
      );
      if ((exists[0]?.count ?? 0) > 0) {
        return { success: false, error: 'Username hoặc email đã tồn tại' };
      }

      const result = await executeRun(
        'INSERT INTO users (username, password, fullName, email, createdAt) VALUES (?, ?, ?, ?, ?)',
        [payload.username, payload.password, payload.fullName, payload.email, new Date().toISOString()]
      );
      const created = await executeQuery<User>(
        'SELECT id, username, fullName, email, createdAt FROM users WHERE id = ? LIMIT 1',
        [result.lastInsertRowId]
      );
      if (!created[0]) return { success: false, error: 'Không tạo được user' };

      await setCurrentUser(created[0]);
      return { success: true, data: created[0] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Register failed' };
    }
  },

  async logout(): Promise<ApiResponse<boolean>> {
    await clearSession();
    return { success: true, data: true };
  },
};
