import { query } from '../config/database.js';
import type { CreateUserDto, UpdateUserDto, User } from '../types/index.js';

function mapRowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as number,
    username: row.username as string,
    fullName: row.full_name as string,
    email: row.email as string,
    createdAt: row.created_at as Date,
  };
}

export const UserModel = {
  async findAll(): Promise<User[]> {
    const result = await query('SELECT id, username, full_name, email, created_at FROM users ORDER BY created_at DESC');
    return result.rows.map(mapRowToUser);
  },

  async findById(id: number): Promise<User | null> {
    const result = await query('SELECT id, username, full_name, email, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT id, username, full_name, email, created_at FROM users WHERE email = $1', [email]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const result = await query('SELECT id, username, full_name, email, created_at FROM users WHERE username = $1', [username]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  },

  async findCredentialByUsername(username: string): Promise<(User & { password: string }) | null> {
    const result = await query(
      'SELECT id, username, full_name, email, created_at, password FROM users WHERE username = $1',
      [username]
    );

    if (!result.rows[0]) {
      return null;
    }

    const mapped = mapRowToUser(result.rows[0]);
    return { ...mapped, password: result.rows[0].password as string };
  },

  async create(data: CreateUserDto): Promise<User> {
    const result = await query(
      'INSERT INTO users (username, password, full_name, email) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, email, created_at',
      [data.username, data.password, data.fullName, data.email]
    );
    return mapRowToUser(result.rows[0]);
  },

  async update(id: number, data: UpdateUserDto): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.username !== undefined) {
      fields.push(`username = $${paramIndex++}`);
      values.push(data.username);
    }
    if (data.fullName !== undefined) {
      fields.push(`full_name = $${paramIndex++}`);
      values.push(data.fullName);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, full_name, email, created_at`,
      values
    );
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
