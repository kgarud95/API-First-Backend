import { PaymentIntent, PaymentStatus } from '../types/payment.types';

// In-memory storage for demo purposes
const payments: Map<string, PaymentIntent> = new Map();

export class PaymentModel {
  static async create(paymentData: Omit<PaymentIntent, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentIntent> {
    const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const payment: PaymentIntent = {
      id,
      ...paymentData,
      createdAt: now,
      updatedAt: now,
    };
    
    payments.set(id, payment);
    return payment;
  }

  static async findById(id: string): Promise<PaymentIntent | null> {
    return payments.get(id) || null;
  }

  static async findByStripeId(stripePaymentIntentId: string): Promise<PaymentIntent | null> {
    for (const payment of payments.values()) {
      if (payment.stripePaymentIntentId === stripePaymentIntentId) {
        return payment;
      }
    }
    return null;
  }

  static async update(id: string, updates: Partial<PaymentIntent>): Promise<PaymentIntent | null> {
    const payment = payments.get(id);
    if (!payment) return null;

    const updatedPayment = {
      ...payment,
      ...updates,
      updatedAt: new Date(),
    };

    payments.set(id, updatedPayment);
    return updatedPayment;
  }

  static async findByUser(userId: string): Promise<PaymentIntent[]> {
    return Array.from(payments.values()).filter(payment => payment.userId === userId);
  }

  static async findByCourse(courseId: string): Promise<PaymentIntent[]> {
    return Array.from(payments.values()).filter(payment => payment.courseId === courseId);
  }

  static async findSuccessfulPayment(userId: string, courseId: string): Promise<PaymentIntent | null> {
    for (const payment of payments.values()) {
      if (
        payment.userId === userId &&
        payment.courseId === courseId &&
        payment.status === PaymentStatus.SUCCEEDED
      ) {
        return payment;
      }
    }
    return null;
  }

  static async getPaymentStats(instructorId?: string): Promise<any> {
    let paymentList = Array.from(payments.values());

    // If instructorId is provided, filter by instructor's courses
    // This would require joining with course data in a real implementation
    
    const totalRevenue = paymentList
      .filter(p => p.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTransactions = paymentList.length;
    const successfulPayments = paymentList.filter(p => p.status === PaymentStatus.SUCCEEDED).length;
    const failedPayments = paymentList.filter(p => p.status === PaymentStatus.FAILED).length;
    const refundedAmount = paymentList
      .filter(p => p.status === PaymentStatus.REFUNDED)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue: totalRevenue / 100, // Convert from cents
      totalTransactions,
      successfulPayments,
      failedPayments,
      refundedAmount: refundedAmount / 100,
      averageOrderValue: successfulPayments > 0 ? (totalRevenue / successfulPayments) / 100 : 0,
    };
  }
}