import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  refundSchema,
  idParamSchema,
} from '../utils/validation.utils';
import { UserRole } from '../types/auth.types';

const router = Router();

// Webhook route (no authentication required)
router.post('/webhook', PaymentController.handleWebhook);

// All other routes require authentication
router.use(authenticate);

// Payment processing routes
router.post('/create-intent', validateBody(createPaymentIntentSchema), PaymentController.createPaymentIntent);
router.post('/confirm', validateBody(confirmPaymentSchema), PaymentController.confirmPayment);
router.post('/refund', validateBody(refundSchema), PaymentController.refundPayment);

// Payment history and details
router.get('/history', PaymentController.getPaymentHistory);
router.get('/:id', validateParams(idParamSchema), PaymentController.getPaymentDetails);

// Payment stats (instructor/admin only)
router.get('/stats/overview', authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), PaymentController.getPaymentStats);

export default router;