import Joi from 'joi';
import { UserRole } from '../types/user.types';
import { CourseLevel } from '../types/course.types';

// Auth validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// User validation schemas
export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  bio: Joi.string().max(500).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      courseUpdates: Joi.boolean().optional(),
      marketing: Joi.boolean().optional(),
    }).optional(),
    privacy: Joi.object({
      profileVisibility: Joi.string().valid('public', 'private').optional(),
      showProgress: Joi.boolean().optional(),
    }).optional(),
    learning: Joi.object({
      difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
      pace: Joi.string().valid('slow', 'normal', 'fast').optional(),
      reminderTime: Joi.string().optional(),
    }).optional(),
  }).optional(),
});

// Course validation schemas
export const createCourseSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(50).max(2000).required(),
  shortDescription: Joi.string().min(20).max(300).required(),
  category: Joi.string().required(),
  subcategory: Joi.string().required(),
  level: Joi.string().valid(...Object.values(CourseLevel)).required(),
  price: Joi.number().min(0).required(),
  requirements: Joi.array().items(Joi.string()).required(),
  learningOutcomes: Joi.array().items(Joi.string()).required(),
  tags: Joi.array().items(Joi.string()).required(),
});

export const updateCourseSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(50).max(2000).optional(),
  shortDescription: Joi.string().min(20).max(300).optional(),
  category: Joi.string().optional(),
  subcategory: Joi.string().optional(),
  level: Joi.string().valid(...Object.values(CourseLevel)).optional(),
  price: Joi.number().min(0).optional(),
  requirements: Joi.array().items(Joi.string()).optional(),
  learningOutcomes: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

// Payment validation schemas
export const createPaymentIntentSchema = Joi.object({
  courseId: Joi.string().required(),
  currency: Joi.string().length(3).optional(),
});

export const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
});

export const refundSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
  amount: Joi.number().min(0).optional(),
  reason: Joi.string().max(500).optional(),
});

// AI validation schemas
export const tutorRequestSchema = Joi.object({
  courseId: Joi.string().required(),
  moduleId: Joi.string().optional(),
  lessonId: Joi.string().optional(),
  question: Joi.string().min(10).max(1000).required(),
  context: Joi.string().max(2000).optional(),
});

export const resumeAnalysisSchema = Joi.object({
  resumeText: Joi.string().min(100).max(10000).required(),
  targetRole: Joi.string().max(100).optional(),
  targetSkills: Joi.array().items(Joi.string()).optional(),
});

export const summaryRequestSchema = Joi.object({
  content: Joi.string().min(100).max(10000).required(),
  type: Joi.string().valid('lesson', 'module', 'course').required(),
  length: Joi.string().valid('short', 'medium', 'long').required(),
});

export const quizGenerationSchema = Joi.object({
  content: Joi.string().min(100).max(10000).required(),
  questionCount: Joi.number().min(1).max(20).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
  questionTypes: Joi.array()
    .items(Joi.string().valid('multiple_choice', 'true_false', 'short_answer'))
    .min(1)
    .required(),
});

// Common validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
});

export const idParamSchema = Joi.object({
  id: Joi.string().required(),
});

export const validateSchema = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
      code: detail.type,
    }));
    return { errors, value: null };
  }
  
  return { errors: null, value };
};