import { Response } from 'express';
import { CourseModel } from '../models/Course';
import { UserModel } from '../models/User';
import { PaymentModel } from '../models/Payment';
import { sendSuccess, sendError, sendNotFound, sendForbidden, createPagination } from '../utils/response.utils';
import { CreateCourseRequest, UpdateCourseRequest, CourseFilters, CourseSortOptions } from '../types/course.types';
import { RequestWithUser, PaginationQuery } from '../types/api.types';
import { UserRole } from '../types/auth.types';
import { PaymentStatus } from '../types/payment.types';
import { awsService } from '../services/aws.service';

export class CourseController {
  static async getAllCourses(req: RequestWithUser, res: Response) {
    try {
      const { page = 1, limit = 12 }: PaginationQuery = req.query;
      const filters: CourseFilters = req.query;
      const sortOptions: CourseSortOptions = {
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'desc',
      };

      let courses = await CourseModel.findAll({
        ...filters,
        includeUnpublished: req.user?.role === UserRole.ADMIN,
      });

      // Apply sorting
      courses.sort((a, b) => {
        const aValue = a[sortOptions.sortBy as keyof typeof a];
        const bValue = b[sortOptions.sortBy as keyof typeof b];
        
        if (sortOptions.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCourses = courses.slice(startIndex, endIndex);

      const pagination = createPagination(page, limit, courses.length);

      return sendSuccess(res, paginatedCourses, 'Courses retrieved successfully', pagination);
    } catch (error) {
      console.error('Get all courses error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async getCourseById(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;

      const course = await CourseModel.findById(id);
      if (!course) {
        return sendNotFound(res, 'Course');
      }

      // Check if user has access to unpublished course
      if (!course.isPublished && req.user?.role !== UserRole.ADMIN && req.user?.userId !== course.instructorId) {
        return sendForbidden(res, 'Course not available');
      }

      // Check if user is enrolled (for students)
      let isEnrolled = false;
      let progress = null;

      if (req.user) {
        const user = await UserModel.findById(req.user.userId);
        if (user) {
          const userProgress = user.progress.find(p => p.courseId === id);
          if (userProgress) {
            isEnrolled = true;
            progress = userProgress;
          }
        }
      }

      return sendSuccess(res, {
        ...course,
        isEnrolled,
        progress,
      }, 'Course retrieved successfully');
    } catch (error) {
      console.error('Get course by ID error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async createCourse(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const courseData: CreateCourseRequest = req.body;

      // Get instructor information
      const instructor = await UserModel.findById(req.user.userId);
      if (!instructor) {
        return sendNotFound(res, 'Instructor');
      }

      const course = await CourseModel.create({
        ...courseData,
        instructorId: req.user.userId,
        instructorName: `${instructor.firstName} ${instructor.lastName}`,
        currency: 'USD',
        thumbnail: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg', // Default thumbnail
        duration: 0,
        modules: [],
        rating: 0,
        reviewCount: 0,
        enrollmentCount: 0,
        isPublished: false,
      });

      return sendSuccess(res, course, 'Course created successfully');
    } catch (error) {
      console.error('Create course error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async updateCourse(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { id } = req.params;
      const updates: UpdateCourseRequest = req.body;

      const course = await CourseModel.findById(id);
      if (!course) {
        return sendNotFound(res, 'Course');
      }

      // Check if user owns the course or is admin
      if (course.instructorId !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        return sendForbidden(res, 'You can only update your own courses');
      }

      const updatedCourse = await CourseModel.update(id, updates);
      if (!updatedCourse) {
        return sendNotFound(res, 'Course');
      }

      return sendSuccess(res, updatedCourse, 'Course updated successfully');
    } catch (error) {
      console.error('Update course error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async deleteCourse(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { id } = req.params;

      const course = await CourseModel.findById(id);
      if (!course) {
        return sendNotFound(res, 'Course');
      }

      // Check if user owns the course or is admin
      if (course.instructorId !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        return sendForbidden(res, 'You can only delete your own courses');
      }

      const success = await CourseModel.delete(id);
      if (!success) {
        return sendError(res, 500, 'Failed to delete course');
      }

      return sendSuccess(res, null, 'Course deleted successfully');
    } catch (error) {
      console.error('Delete course error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async publishCourse(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { id } = req.params;

      const course = await CourseModel.findById(id);
      if (!course) {
        return sendNotFound(res, 'Course');
      }

      // Check if user owns the course or is admin
      if (course.instructorId !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        return sendForbidden(res, 'You can only publish your own courses');
      }

      const updatedCourse = await CourseModel.update(id, { isPublished: true });
      if (!updatedCourse) {
        return sendError(res, 500, 'Failed to publish course');
      }

      return sendSuccess(res, updatedCourse, 'Course published successfully');
    } catch (error) {
      console.error('Publish course error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async enrollInCourse(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { id } = req.params;
      const { paymentIntentId } = req.body;

      const course = await CourseModel.findById(id);
      if (!course) {
        return sendNotFound(res, 'Course');
      }

      if (!course.isPublished) {
        return sendForbidden(res, 'Course is not available for enrollment');
      }

      // Check if user is already enrolled
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return sendNotFound(res, 'User');
      }

      const existingProgress = user.progress.find(p => p.courseId === id);
      if (existingProgress) {
        return sendError(res, 409, 'Already enrolled in this course');
      }

      // For free courses, enroll directly
      if (course.price === 0) {
        await UserModel.updateProgress(req.user.userId, id, {
          courseId: id,
          enrolledAt: new Date(),
          completedModules: [],
          progressPercentage: 0,
          lastAccessedAt: new Date(),
        });

        await CourseModel.incrementEnrollment(id);

        return sendSuccess(res, null, 'Enrolled in course successfully');
      }

      // For paid courses, verify payment
      if (!paymentIntentId) {
        return sendError(res, 400, 'Payment required for paid courses');
      }

      const payment = await PaymentModel.findByStripeId(paymentIntentId);
      if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
        return sendError(res, 400, 'Payment not completed');
      }

      // Enroll user
      await UserModel.updateProgress(req.user.userId, id, {
        courseId: id,
        enrolledAt: new Date(),
        completedModules: [],
        progressPercentage: 0,
        lastAccessedAt: new Date(),
      });

      await CourseModel.incrementEnrollment(id);

      return sendSuccess(res, null, 'Enrolled in course successfully');
    } catch (error) {
      console.error('Enroll in course error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async getInstructorCourses(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { page = 1, limit = 10 }: PaginationQuery = req.query;

      const courses = await CourseModel.findByInstructor(req.user.userId);

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCourses = courses.slice(startIndex, endIndex);

      const pagination = createPagination(page, limit, courses.length);

      return sendSuccess(res, paginatedCourses, 'Instructor courses retrieved successfully', pagination);
    } catch (error) {
      console.error('Get instructor courses error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async uploadCourseThumbnail(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const { id } = req.params;

      if (!req.file) {
        return sendError(res, 400, 'Thumbnail file is required');
      }

      const course = await CourseModel.findById(id);
      if (!course) {
        return sendNotFound(res, 'Course');
      }

      // Check if user owns the course
      if (course.instructorId !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        return sendForbidden(res, 'You can only update your own courses');
      }

      // Upload to AWS S3
      const uploadResult = await awsService.uploadCourseThumbnail(
        req.file.buffer,
        req.file.originalname,
        id
      );

      // Update course thumbnail URL
      const updatedCourse = await CourseModel.update(id, {
        thumbnail: uploadResult.url,
      });

      if (!updatedCourse) {
        return sendError(res, 500, 'Failed to update course thumbnail');
      }

      return sendSuccess(res, {
        thumbnail: uploadResult.url,
      }, 'Course thumbnail uploaded successfully');
    } catch (error) {
      console.error('Upload course thumbnail error:', error);
      return sendError(res, 500, 'Failed to upload thumbnail');
    }
  }

  static async searchCourses(req: RequestWithUser, res: Response) {
    try {
      const { q: search, page = 1, limit = 12 }: any = req.query;

      if (!search) {
        return sendError(res, 400, 'Search query is required');
      }

      const courses = await CourseModel.findAll({
        search,
        includeUnpublished: req.user?.role === UserRole.ADMIN,
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCourses = courses.slice(startIndex, endIndex);

      const pagination = createPagination(page, limit, courses.length);

      return sendSuccess(res, paginatedCourses, 'Search results retrieved successfully', pagination);
    } catch (error) {
      console.error('Search courses error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }
}