import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireOwnership } from '../middleware/auth.middleware';
import { validateBody, validateQuery, validateFile } from '../middleware/validation.middleware';
import { uploadAvatar, handleUploadError } from '../middleware/upload.middleware';
import { updateUserSchema, paginationSchema } from '../utils/validation.utils';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', UserController.getProfile);
router.put('/profile', validateBody(updateUserSchema), UserController.updateProfile);
router.post('/avatar', 
  uploadAvatar, 
  validateFile({
    required: true,
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fieldName: 'avatar'
  }),
  handleUploadError, 
  UserController.uploadAvatar
);

// User progress and stats
router.get('/progress', UserController.getProgress);
router.put('/progress/:courseId', UserController.updateProgress);
router.get('/stats', UserController.getStats);

// User courses and payments
router.get('/courses', validateQuery(paginationSchema), UserController.getEnrolledCourses);
router.get('/payments', validateQuery(paginationSchema), UserController.getPaymentHistory);

// Account management
router.delete('/account', UserController.deleteAccount);

export default router;