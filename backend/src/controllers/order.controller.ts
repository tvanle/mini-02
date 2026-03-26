import type { NextFunction, Response } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import type { AuthRequest } from '../middleware/auth.js';
import { OrderModel } from '../models/order.model.js';
import { ProductModel } from '../models/product.model.js';
import { OrderDetailModel } from '../models/order-detail.model.js';
import type { ApiResponse, CreateOrderItemDto, OrderWithItems } from '../types/index.js';

async function buildOrderWithItems(orderId: number, userId: number): Promise<OrderWithItems> {
  const order = await OrderModel.findByIdAndUserId(orderId, userId);
  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  const items = await OrderDetailModel.findByOrderId(order.id);
  return { ...order, items };
}

export const OrderController = {
  async create(req: AuthRequest, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const order = await OrderModel.create(req.user.id);
      const full = await buildOrderWithItems(order.id, req.user.id);
      res.status(201).json({ success: true, data: full });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: AuthRequest, res: Response<ApiResponse<OrderWithItems[]>>, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const orders = await OrderModel.findAllByUserId(req.user.id);
      const fullOrders = await Promise.all(
        orders.map(async (order) => {
          const items = await OrderDetailModel.findByOrderId(order.id);
          return { ...order, items };
        })
      );

      res.json({ success: true, data: fullOrders });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid order ID');
      }

      const order = await buildOrderWithItems(id, req.user.id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },

  async addItem(req: AuthRequest, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid order ID');
      }

      const order = await OrderModel.findByIdAndUserId(id, req.user.id);
      if (!order) {
        throw new AppError(404, 'Order not found');
      }
      if (order.status === 'Paid') {
        throw new AppError(400, 'Cannot modify a paid order');
      }

      const payload = req.body as CreateOrderItemDto;

      const product = await ProductModel.findById(payload.productId);
      if (!product) {
        throw new AppError(404, 'Product not found');
      }
      if (product.stock < payload.quantity) {
        throw new AppError(400, 'Not enough stock');
      }

      const existingItem = await OrderDetailModel.findByOrderAndProduct(order.id, payload.productId);
      if (existingItem) {
        const newQty = existingItem.quantity + payload.quantity;
        if (product.stock < newQty) {
          throw new AppError(400, 'Not enough stock');
        }
        await OrderDetailModel.updateQuantity(existingItem.id, newQty, product.price);
      } else {
        await OrderDetailModel.create(order.id, payload.productId, payload.quantity, product.price);
      }

      const total = await OrderDetailModel.sumTotal(order.id);
      await OrderModel.setTotal(order.id, total);

      const full = await buildOrderWithItems(order.id, req.user.id);
      res.json({ success: true, data: full });
    } catch (error) {
      next(error);
    }
  },

  async removeItem(req: AuthRequest, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const orderId = parseInt(req.params.id, 10);
      const itemId = parseInt(req.params.itemId, 10);
      if (isNaN(orderId) || isNaN(itemId)) {
        throw new AppError(400, 'Invalid order ID or item ID');
      }

      const order = await OrderModel.findByIdAndUserId(orderId, req.user.id);
      if (!order) {
        throw new AppError(404, 'Order not found');
      }
      if (order.status === 'Paid') {
        throw new AppError(400, 'Cannot modify a paid order');
      }

      const deleted = await OrderDetailModel.delete(orderId, itemId);
      if (!deleted) {
        throw new AppError(404, 'Order item not found');
      }

      const total = await OrderDetailModel.sumTotal(orderId);
      await OrderModel.setTotal(orderId, total);

      const full = await buildOrderWithItems(orderId, req.user.id);
      res.json({ success: true, data: full });
    } catch (error) {
      next(error);
    }
  },

  async checkout(req: AuthRequest, res: Response<ApiResponse<OrderWithItems>>, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError(400, 'Invalid order ID');
      }

      const order = await OrderModel.findByIdAndUserId(id, req.user.id);
      if (!order) {
        throw new AppError(404, 'Order not found');
      }
      if (order.status === 'Paid') {
        throw new AppError(400, 'Order already paid');
      }

      const items = await OrderDetailModel.findByOrderId(order.id);
      if (items.length === 0) {
        throw new AppError(400, 'Order is empty');
      }

      const paidOrder = await OrderModel.checkout(order.id, req.user.id);
      if (!paidOrder) {
        throw new AppError(400, 'Unable to checkout order');
      }

      const full = await buildOrderWithItems(order.id, req.user.id);
      res.json({ success: true, data: full });
    } catch (error) {
      next(error);
    }
  },
};
