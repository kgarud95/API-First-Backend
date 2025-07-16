export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  courseId: string;
  userId: string;
  stripePaymentIntentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

export interface CreatePaymentIntentRequest {
  courseId: string;
  currency?: string;
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // partial refund amount
  reason?: string;
}

export interface PaymentHistory {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  createdAt: Date;
}

export interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
  averageOrderValue: number;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}