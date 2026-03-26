import { z } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler.js';

export const createUserSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(255),
  fullName: z.string().min(1).max(255),
  email: z.string().email('Invalid email format'),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(100).optional(),
  fullName: z.string().min(1).max(255).optional(),
  email: z.string().email('Invalid email format').optional(),
});

export const registerSchema = createUserSchema;

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  image: z.string().url().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  image: z.string().url().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  price: z.number().positive(),
  image: z.string().url().optional(),
  categoryId: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().positive().optional(),
  image: z.string().url().optional(),
  categoryId: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export const createOrderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((e) => e.message).join(', ');
        next(new AppError(400, message));
      } else {
        next(error);
      }
    }
  };
}
