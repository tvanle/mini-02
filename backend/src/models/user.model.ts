import { query } from '../config/database.js';
import type { User, CreateUserDto, UpdateUserDto } from '../types/index.js';

function mapRowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as number,
    email: row.email as string,
    name: row.name as string,
    createdAt: row.created_at as Date,
  };
}

export const UserModel = {
  async findAll(): Promise<User[]> {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows.map(mapRowToUser);
  },

  async findById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  },

  async create(data: CreateUserDto): Promise<User> {
    const result = await query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
      [data.email, data.name]
    );
    return mapRowToUser(result.rows[0]);
  },

  async update(id: number, data: UpdateUserDto): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
