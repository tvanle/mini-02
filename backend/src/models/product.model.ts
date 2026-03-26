import { query } from '../config/database.js';
import type { CreateProductDto, Product, UpdateProductDto } from '../types/index.js';

function mapRow(row: Record<string, unknown>): Product {
  return {
    id: row.id as number,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    price: Number(row.price),
    image: (row.image as string | null) ?? null,
    categoryId: row.category_id as number,
    stock: row.stock as number,
  };
}

export const ProductModel = {
  async findAll(categoryId?: number, search?: string): Promise<Product[]> {
    const filters: string[] = [];
    const values: unknown[] = [];

    if (categoryId !== undefined) {
      values.push(categoryId);
      filters.push(`category_id = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      filters.push(`name ILIKE $${values.length}`);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await query(`SELECT * FROM products ${where} ORDER BY id ASC`, values);
    return result.rows.map(mapRow);
  },

  async findById(id: number): Promise<Product | null> {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async create(data: CreateProductDto): Promise<Product> {
    const result = await query(
      'INSERT INTO products (name, description, price, image, category_id, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [data.name, data.description ?? null, data.price, data.image ?? null, data.categoryId, data.stock]
    );
    return mapRow(result.rows[0]);
  },

  async update(id: number, data: UpdateProductDto): Promise<Product | null> {
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
    if (data.price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(data.price);
    }
    if (data.image !== undefined) {
      fields.push(`image = $${idx++}`);
      values.push(data.image);
    }
    if (data.categoryId !== undefined) {
      fields.push(`category_id = $${idx++}`);
      values.push(data.categoryId);
    }
    if (data.stock !== undefined) {
      fields.push(`stock = $${idx++}`);
      values.push(data.stock);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
