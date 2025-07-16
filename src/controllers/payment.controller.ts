import { Response } from 'express';
import { PaymentModel } from '../models/Payment';
import { CourseModel } from '../models/Course';
import { stripeService } from '../services/stripe.service';
import { sendSuccess, sendError, sendNotFound, sendBadRequest } from '../utils/response.utils';
import { CreatePaymentIntentRequest, ConfirmPaymentRequest, RefundRequest, PaymentStatus } from '../types/payment.types';
import { RequestWithUser } from '../types/api.types';

export class PaymentController {
  static async createPaymentIntent(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { courseId, currency = 'usd' }: CreatePaymentIntentRequest = req.body;

      // Get course details
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return sendNotFound(res, 'Course');
      }

      if (!course.isPublished) {
        return sendBadRequest(res, 'Course is not available for purchase');
      }

      if (course.price === 0) {
        return sendBadRequest(res, 'This course is free');
      }

      // Check if user already purchased the course
      const existingPayment = await PaymentModel.findSuccessfulPayment(req.user.userId, courseId);
      if (existingPayment) {
        return sendError(res, 409, 'Course already purchased');
      }

      // Create Stripe payment intent
      const paymentIntentResponse = await stripeService.createPaymentIntent(
        { courseId, currency },
        course.price,
        req.user.userId
      );

      // Save payment intent to database
      await PaymentModel.create({
        amount: paymentIntentResponse.amount,
        currency: paymentIntentResponse.currency,
        status: PaymentStatus.PENDING,
        courseId,
        userId: req.user.userId,
        stripePaymentIntentId: paymentIntentResponse.paymentIntentId,
      });

      return sendSuccess(res, paymentIntentResponse, 'Payment intent created successfully');
    } catch (error) {
      console.error('Create payment intent error:', error);
      return sendError(res, 500, 'Failed to create payment intent');
    }
  }

  static async confirmPayment(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { paymentIntentId }: ConfirmPaymentRequest = req.body;

      // Get payment from database
      const payment = await PaymentModel.findByStripeId(paymentIntentId);
      if (!payment) {
        return sendNotFound(res, 'Payment');
      }

      if (payment.userId !== req.user.userId) {
        return sendError(res, 403, 'Access denied');
      }

      // Confirm payment with Stripe
      const paymentStatus = await stripeService.confirmPayment(paymentIntentId);

      // Update payment status
      await PaymentModel.update(payment.id, { status: paymentStatus });

      if (paymentStatus === PaymentStatus.SUCCEEDED) {
        return sendSuccess(res, {
          status: paymentStatus,
          courseId: payment.courseId,
        }, 'Payment confirmed successfully');
      } else {
        return sendError(res, 400, `Payment ${paymentStatus}`);
      }
    } catch (error) {
      console.error('Confirm payment error:', error);
      return sendError(res, 500, 'Failed to confirm payment');
    }
  }

  static async refundPayment(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { paymentIntentId, amount, reason }: RefundRequest = req.body;

      // Get payment from database
      const payment = await PaymentModel.findByStripeId(paymentIntentId);
      if (!payment) {
        return sendNotFound(res, 'Payment');
      }

      // Check if user owns the payment or is admin
      if (payment.userId !== req.user.userId && req.user.role !== 'admin') {
        return sendError(res, 403, 'Access denied');
      }

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        return sendBadRequest(res, 'Only successful payments can be refunded');
      }

      // Process refund with Stripe
      const refundSuccess = await stripeService.refundPayment(paymentIntentId, amount, reason);

      if (refundSuccess) {
        // Update payment status
        await PaymentModel.update(payment.id, { status: PaymentStatus.REFUNDED });

        return sendSuccess(res, null, 'Refund processed successfully');
      } else {
        return sendError(res, 500, 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund payment error:', error);
      return sendError(res, 500, 'Failed to process refund');
    }
  }

  static async getPaymentHistory(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const payments = await PaymentModel.findByUser(req.user.userId);

      // Enrich payment data with course information
      const enrichedPayments = await Promise.all(
        payments.map(async (payment) => {
          const course = await CourseModel.findById(payment.courseId);
          return {
            id: payment.id,
            courseId: payment.courseId,
            courseTitle: course?.title || 'Unknown Course',
            amount: payment.amount / 100, // Convert from cents
            currency: payment.currency,
            status: payment.status,
            paymentMethod: 'Card', // Mock data
            transactionId: payment.stripePaymentIntentId,
            createdAt: payment.createdAt,
          };
        })
      );

      return sendSuccess(res, enrichedPayments, 'Payment history retrieved successfully');
    } catch (error) {
      console.error('Get payment history error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async getPaymentDetails(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { id } = req.params;

      const payment = await PaymentModel.findById(id);
      if (!payment) {
        return sendNotFound(res, 'Payment');
      }

      // Check if user owns the payment or is admin
      if (payment.userId !== req.user.userId && req.user.role !== 'admin') {
        return sendError(res, 403, 'Access denied');
      }

      // Get additional details from Stripe
      const stripeDetails = await stripeService.getPaymentDetails(payment.stripePaymentIntentId);

      // Get course information
      const course = await CourseModel.findById(payment.courseId);

      const paymentDetails = {
        id: payment.id,
        courseId: payment.courseId,
        courseTitle: course?.title || 'Unknown Course',
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        stripeDetails,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };

      return sendSuccess(res, paymentDetails, 'Payment details retrieved successfully');
    } catch (error) {
      console.error('Get payment details error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async handleWebhook(req: any, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      // Verify webhook signature
      const event = await stripeService.handleWebhook(payload, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const payment = await PaymentModel.findByStripeId(paymentIntent.id);
          
          if (payment) {
            await PaymentModel.update(payment.id, { status: PaymentStatus.SUCCEEDED });
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          const failedPayment = await PaymentModel.findByStripeId(failedPaymentIntent.id);
          
          if (failedPayment) {
            await PaymentModel.update(failedPayment.id, { status: PaymentStatus.FAILED });
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  }

  static async getPaymentStats(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      // Only instructors and admins can view payment stats
      if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return sendError(res, 403, 'Access denied');
      }

      const instructorId = req.user.role === 'admin' ? undefined : req.user.userId;
      const stats = await PaymentModel.getPaymentStats(instructorId);

      return sendSuccess(res, stats, 'Payment stats retrieved successfully');
    } catch (error) {
      console.error('Get payment stats error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }
}