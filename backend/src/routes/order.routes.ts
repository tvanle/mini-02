import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { createOrderItemSchema, validate } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth);

router.post('/', OrderController.create);
router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.put('/:id/checkout', OrderController.checkout);
router.post('/:id/items', validate(createOrderItemSchema), OrderController.addItem);
router.delete('/:id/items/:itemId', OrderController.removeItem);

export default router;
