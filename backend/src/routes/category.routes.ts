import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { createCategorySchema, updateCategorySchema, validate } from '../middleware/validation.js';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', requireAuth, validate(createCategorySchema), CategoryController.create);
router.put('/:id', requireAuth, validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', requireAuth, CategoryController.delete);

export default router;
