import { query } from '../config/database.js';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/index.js';

function mapRow(row: Record<string, unknown>): Category {
  return {
    id: row.id as number,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    image: (row.image as string | null) ?? null,
  };
}

export const CategoryModel = {
  async findAll(): Promise<Category[]> {
    const result = await query('SELECT * FROM categories ORDER BY id ASC');
    return result.rows.map(mapRow);
  },

  async findById(id: number): Promise<Category | null> {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const result = await query(
      'INSERT INTO categories (name, description, image) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.description ?? null, data.image ?? null]
    );
    return mapRow(result.rows[0]);
  },

  async update(id: number, data: UpdateCategoryDto): Promise<Category | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.image !== undefined) {
      fields.push(`image = $${idx++}`);
      values.push(data.image);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM categories WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
