import { Router } from 'express';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/users', userRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
