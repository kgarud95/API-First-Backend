import Stripe from 'stripe';
import { config } from '../config/env';
import {
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  PaymentStatus,
} from '../types/payment.types';

class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!config.stripe.secretKey) {
      console.warn('Stripe secret key not configured. Payment features will not work.');
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createPaymentIntent(
    request: CreatePaymentIntentRequest,
    amount: number,
    userId: string
  ): Promise<PaymentIntentResponse> {
    if (!this.stripe) {
      throw new Error('Stripe service not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: request.currency || 'usd',
        metadata: {
          courseId: request.courseId,
          userId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentStatus> {
    if (!this.stripe) {
      throw new Error('Stripe service not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      switch (paymentIntent.status) {
        case 'succeeded':
          return PaymentStatus.SUCCEEDED;
        case 'processing':
          return PaymentStatus.PENDING;
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          return PaymentStatus.PENDING;
        case 'canceled':
          return PaymentStatus.CANCELED;
        default:
          return PaymentStatus.FAILED;
      }
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number, reason?: string): Promise<boolean> {
    if (!this.stripe) {
      throw new Error('Stripe service not configured');
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason as any,
      });

      return refund.status === 'succeeded';
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new Error('Failed to process refund');
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<any> {
    if (!this.stripe || !config.stripe.webhookSecret) {
      throw new Error('Stripe webhook not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );

      return event;
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  async getPaymentDetails(paymentIntentId: string): Promise<any> {
    if (!this.stripe) {
      throw new Error('Stripe service not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error('Stripe payment details error:', error);
      throw new Error('Failed to retrieve payment details');
    }
  }

  async createCustomer(email: string, name: string): Promise<string> {
    if (!this.stripe) {
      throw new Error('Stripe service not configured');
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });

      return customer.id;
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw new Error('Failed to create customer');
    }
  }
}

export const stripeService = new StripeService();