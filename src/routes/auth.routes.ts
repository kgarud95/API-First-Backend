import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  loginSchema,
  signupSchema,
  refreshTokenSchema,
} from '../utils/validation.utils';

const router = Router();

// Public routes
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/signup', validateBody(signupSchema), AuthController.signup);
router.post('/refresh', validateBody(refreshTokenSchema), AuthController.refreshToken);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;