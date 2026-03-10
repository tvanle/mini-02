import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(255),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1).max(255).optional(),
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
