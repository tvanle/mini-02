import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { loginSchema, registerSchema, validate } from '../middleware/validation.js';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

export default router;
