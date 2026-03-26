import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { CategoryModel } from '../models/category.model.js';
import { ProductModel } from '../models/product.model.js';
import type { ApiResponse, CreateProductDto, Product, UpdateProductDto } from '../types/index.js';

export const ProductController = {
  async getAll(req: Request, res: Response<ApiResponse<Product[]>>, next: NextFunction) {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      if (req.query.categoryId && (categoryId === undefined || Number.isNaN(categoryId))) {
        throw new AppError(400, 'Invalid categoryId query parameter');
      }

      const products = await ProductModel.findAll(categoryId, search);
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response<ApiResponse<Product>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid product ID');
      }

      const product = await ProductModel.findById(id);
      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request<unknown, unknown, CreateProductDto>, res: Response<ApiResponse<Product>>, next: NextFunction) {
    try {
      const category = await CategoryModel.findById(req.body.categoryId);
      if (!category) {
        throw new AppError(400, 'Category does not exist');
      }

      const product = await ProductModel.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }, unknown, UpdateProductDto>, res: Response<ApiResponse<Product>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid product ID');
      }

      if (req.body.categoryId !== undefined) {
        const category = await CategoryModel.findById(req.body.categoryId);
        if (!category) {
          throw new AppError(400, 'Category does not exist');
        }
      }

      const product = await ProductModel.update(id, req.body);
      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response<ApiResponse<null>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid product ID');
      }

      const deleted = await ProductModel.delete(id);
      if (!deleted) {
        throw new AppError(404, 'Product not found');
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
