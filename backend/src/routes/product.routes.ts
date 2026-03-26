import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { createProductSchema, updateProductSchema, validate } from '../middleware/validation.js';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', requireAuth, validate(createProductSchema), ProductController.create);
router.put('/:id', requireAuth, validate(updateProductSchema), ProductController.update);
router.delete('/:id', requireAuth, ProductController.delete);

export default router;
