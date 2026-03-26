import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { CategoryModel } from '../models/category.model.js';
import type { ApiResponse, Category, CreateCategoryDto, UpdateCategoryDto } from '../types/index.js';

export const CategoryController = {
  async getAll(_req: Request, res: Response<ApiResponse<Category[]>>, next: NextFunction) {
    try {
      const categories = await CategoryModel.findAll();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response<ApiResponse<Category>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid category ID');
      }

      const category = await CategoryModel.findById(id);
      if (!category) {
        throw new AppError(404, 'Category not found');
      }

      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request<unknown, unknown, CreateCategoryDto>, res: Response<ApiResponse<Category>>, next: NextFunction) {
    try {
      const category = await CategoryModel.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }, unknown, UpdateCategoryDto>, res: Response<ApiResponse<Category>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid category ID');
      }

      const category = await CategoryModel.update(id, req.body);
      if (!category) {
        throw new AppError(404, 'Category not found');
      }

      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response<ApiResponse<null>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid category ID');
      }

      const deleted = await CategoryModel.delete(id);
      if (!deleted) {
        throw new AppError(404, 'Category not found');
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
