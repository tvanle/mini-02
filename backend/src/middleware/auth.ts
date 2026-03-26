import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { ApiResponse, AuthUser } from '../types/index.js';
import { AppError } from './errorHandler.js';

type JwtPayload = {
  userId: number;
  username: string;
  fullName: string;
  email: string;
};

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(req: AuthRequest, _res: Response<ApiResponse<null>>, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized'));
  }

  const token = authHeader.slice(7);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return next(new AppError(500, 'JWT secret is not configured'));
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: payload.userId,
      username: payload.username,
      fullName: payload.fullName,
      email: payload.email,
    };
    next();
  } catch {
    return next(new AppError(401, 'Invalid token'));
  }
}
