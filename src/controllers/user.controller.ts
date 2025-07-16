import { Response } from 'express';
import { UserModel } from '../models/User';
import { CourseModel } from '../models/Course';
import { PaymentModel } from '../models/Payment';
import { sendSuccess, sendError, sendNotFound, createPagination } from '../utils/response.utils';
import { UpdateUserRequest, UserStats } from '../types/user.types';
import { RequestWithUser, PaginationQuery } from '../types/api.types';
import { awsService } from '../services/aws.service';

export class UserController {
  static async getProfile(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return sendNotFound(res, 'User');
      }

      const userProfile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return sendSuccess(res, userProfile, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async updateProfile(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const updates: UpdateUserRequest = req.body;
      
      const updatedUser = await UserModel.update(req.user.userId, updates);
      if (!updatedUser) {
        return sendNotFound(res, 'User');
      }

      const userProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      return sendSuccess(res, userProfile, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async uploadAvatar(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      if (!req.file) {
        return sendError(res, 400, 'Avatar file is required');
      }

      // Upload to AWS S3
      const uploadResult = await awsService.uploadUserAvatar(
        req.file.buffer,
        req.file.originalname,
        req.user.userId
      );

      // Update user avatar URL
      const updatedUser = await UserModel.update(req.user.userId, {
        avatar: uploadResult.url,
      });

      if (!updatedUser) {
        return sendNotFound(res, 'User');
      }

      return sendSuccess(res, {
        avatar: uploadResult.url,
      }, 'Avatar uploaded successfully');
    } catch (error) {
      console.error('Upload avatar error:', error);
      return sendError(res, 500, 'Failed to upload avatar');
    }
  }

  static async getProgress(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return sendNotFound(res, 'User');
      }

      // Enrich progress data with course information
      const enrichedProgress = await Promise.all(
        user.progress.map(async (progress) => {
          const course = await CourseModel.findById(progress.courseId);
          return {
            ...progress,
            courseTitle: course?.title || 'Unknown Course',
            courseThumbnail: course?.thumbnail,
            totalModules: course?.modules.length || 0,
          };
        })
      );

      return sendSuccess(res, enrichedProgress, 'Progress retrieved successfully');
    } catch (error) {
      console.error('Get progress error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async updateProgress(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { courseId } = req.params;
      const { completedModules, currentModule, progressPercentage } = req.body;

      const success = await UserModel.updateProgress(req.user.userId, courseId, {
        completedModules,
        currentModule,
        progressPercentage,
        lastAccessedAt: new Date(),
      });

      if (!success) {
        return sendNotFound(res, 'User');
      }

      return sendSuccess(res, null, 'Progress updated successfully');
    } catch (error) {
      console.error('Update progress error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async getStats(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return sendNotFound(res, 'User');
      }

      const totalCourses = user.progress.length;
      const completedCourses = user.progress.filter(p => p.progressPercentage === 100).length;
      const inProgressCourses = user.progress.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100).length;
      const certificatesEarned = user.progress.filter(p => p.certificateEarned).length;

      // Calculate total hours learned (mock calculation)
      const totalHoursLearned = user.progress.reduce((total, progress) => {
        return total + (progress.progressPercentage / 100) * 10; // Assume 10 hours per course
      }, 0);

      // Calculate streaks (mock calculation)
      const currentStreak = 7; // Mock data
      const longestStreak = 21; // Mock data

      const stats: UserStats = {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalHoursLearned: Math.round(totalHoursLearned),
        certificatesEarned,
        currentStreak,
        longestStreak,
      };

      return sendSuccess(res, stats, 'Stats retrieved successfully');
    } catch (error) {
      console.error('Get stats error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async getEnrolledCourses(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { page = 1, limit = 10 }: PaginationQuery = req.query;

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return sendNotFound(res, 'User');
      }

      // Get enrolled course IDs
      const enrolledCourseIds = user.progress.map(p => p.courseId);

      // Fetch course details
      const enrolledCourses = await Promise.all(
        enrolledCourseIds.map(async (courseId) => {
          const course = await CourseModel.findById(courseId);
          const progress = user.progress.find(p => p.courseId === courseId);
          
          return {
            ...course,
            progress: progress?.progressPercentage || 0,
            lastAccessedAt: progress?.lastAccessedAt,
            enrolledAt: progress?.enrolledAt,
          };
        })
      );

      // Filter out null courses and apply pagination
      const validCourses = enrolledCourses.filter(course => course.id);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCourses = validCourses.slice(startIndex, endIndex);

      const pagination = createPagination(page, limit, validCourses.length);

      return sendSuccess(res, paginatedCourses, 'Enrolled courses retrieved successfully', pagination);
    } catch (error) {
      console.error('Get enrolled courses error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async getPaymentHistory(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { page = 1, limit = 10 }: PaginationQuery = req.query;

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

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPayments = enrichedPayments.slice(startIndex, endIndex);

      const pagination = createPagination(page, limit, enrichedPayments.length);

      return sendSuccess(res, paginatedPayments, 'Payment history retrieved successfully', pagination);
    } catch (error) {
      console.error('Get payment history error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async deleteAccount(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const success = await UserModel.delete(req.user.userId);
      if (!success) {
        return sendNotFound(res, 'User');
      }

      return sendSuccess(res, null, 'Account deleted successfully');
    } catch (error) {
      console.error('Delete account error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }
}