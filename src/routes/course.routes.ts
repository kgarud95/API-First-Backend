import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate, authorize, requireInstructorOrAdmin, optionalAuth } from '../middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware';
import { uploadThumbnail, handleUploadError } from '../middleware/upload.middleware';
import {
  createCourseSchema,
  updateCourseSchema,
  paginationSchema,
  idParamSchema,
} from '../utils/validation.utils';
import { UserRole } from '../types/auth.types';

const router = Router();

// Public routes (with optional authentication)
router.get('/', optionalAuth, validateQuery(paginationSchema), CourseController.getAllCourses);
router.get('/search', optionalAuth, validateQuery(paginationSchema), CourseController.searchCourses);
router.get('/:id', optionalAuth, validateParams(idParamSchema), CourseController.getCourseById);

// Protected routes - require authentication
router.use(authenticate);

// Student routes
router.post('/:id/enroll', validateParams(idParamSchema), CourseController.enrollInCourse);

// Instructor/Admin routes
router.post('/', requireInstructorOrAdmin, validateBody(createCourseSchema), CourseController.createCourse);
router.put('/:id', requireInstructorOrAdmin, validateParams(idParamSchema), validateBody(updateCourseSchema), CourseController.updateCourse);
router.delete('/:id', requireInstructorOrAdmin, validateParams(idParamSchema), CourseController.deleteCourse);
router.post('/:id/publish', requireInstructorOrAdmin, validateParams(idParamSchema), CourseController.publishCourse);
router.post('/:id/thumbnail', requireInstructorOrAdmin, validateParams(idParamSchema), uploadThumbnail, handleUploadError, CourseController.uploadCourseThumbnail);

// Instructor dashboard
router.get('/instructor/courses', authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), validateQuery(paginationSchema), CourseController.getInstructorCourses);

export default router;