import type { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ApiResponse, User, CreateUserDto, UpdateUserDto } from '../types/index.js';

export const UserController = {
  async getAll(_req: Request, res: Response<ApiResponse<User[]>>, next: NextFunction) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response<ApiResponse<User>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid user ID');
      }

      const user = await UserModel.findById(id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request<unknown, unknown, CreateUserDto>, res: Response<ApiResponse<User>>, next: NextFunction) {
    try {
      const existingUser = await UserModel.findByEmail(req.body.email);
      if (existingUser) {
        throw new AppError(409, 'Email already exists');
      }

      const user = await UserModel.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<{ id: string }, unknown, UpdateUserDto>, res: Response<ApiResponse<User>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid user ID');
      }

      if (req.body.email) {
        const existingUser = await UserModel.findByEmail(req.body.email);
        if (existingUser && existingUser.id !== id) {
          throw new AppError(409, 'Email already exists');
        }
      }

      const user = await UserModel.update(id, req.body);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response<ApiResponse<null>>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid user ID');
      }

      const deleted = await UserModel.delete(id);
      if (!deleted) {
        throw new AppError(404, 'User not found');
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
