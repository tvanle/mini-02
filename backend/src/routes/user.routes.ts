import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { validate, createUserSchema, updateUserSchema } from '../middleware/validation.js';

const router = Router();

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', validate(createUserSchema), UserController.create);
router.put('/:id', validate(updateUserSchema), UserController.update);
router.delete('/:id', UserController.delete);

export default router;
