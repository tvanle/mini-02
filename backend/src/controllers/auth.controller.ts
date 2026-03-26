import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';
import { UserModel } from '../models/user.model.js';
import type { ApiResponse, AuthResponse, AuthUser, CreateUserDto, LoginDto } from '../types/index.js';

function buildAuthUser(user: { id: number; username: string; fullName: string; email: string }): AuthUser {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
  };
}

function signToken(user: AuthUser): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError(500, 'JWT secret is not configured');
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
    },
    jwtSecret,
    { expiresIn }
  );
}

export const AuthController = {
  async register(req: Request<unknown, unknown, CreateUserDto>, res: Response<ApiResponse<AuthResponse>>, next: NextFunction) {
    try {
      const existingByUsername = await UserModel.findByUsername(req.body.username);
      if (existingByUsername) {
        throw new AppError(409, 'Username already exists');
      }

      const existingByEmail = await UserModel.findByEmail(req.body.email);
      if (existingByEmail) {
        throw new AppError(409, 'Email already exists');
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await UserModel.create({ ...req.body, password: hashedPassword });
      const authUser = buildAuthUser(user);
      const token = signToken(authUser);

      res.status(201).json({
        success: true,
        data: {
          user: authUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request<unknown, unknown, LoginDto>, res: Response<ApiResponse<AuthResponse>>, next: NextFunction) {
    try {
      const userWithPassword = await UserModel.findCredentialByUsername(req.body.username);
      if (!userWithPassword) {
        throw new AppError(401, 'Invalid username or password');
      }

      const validPassword = await bcrypt.compare(req.body.password, userWithPassword.password);
      if (!validPassword) {
        throw new AppError(401, 'Invalid username or password');
      }

      const authUser = buildAuthUser(userWithPassword);
      const token = signToken(authUser);

      res.json({
        success: true,
        data: {
          user: authUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
