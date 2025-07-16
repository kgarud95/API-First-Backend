import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  tutorRequestSchema,
  resumeAnalysisSchema,
  summaryRequestSchema,
  quizGenerationSchema,
} from '../utils/validation.utils';
import { UserRole } from '../types/auth.types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// AI-powered features
router.post('/tutor', validateBody(tutorRequestSchema), AIController.askTutor);
router.post('/resume-analysis', validateBody(resumeAnalysisSchema), AIController.analyzeResume);
router.post('/summary', validateBody(summaryRequestSchema), AIController.generateSummary);
router.post('/quiz', validateBody(quizGenerationSchema), AIController.generateQuiz);

// User-specific AI features
router.get('/chat-history', AIController.getChatHistory);
router.delete('/chat-history', AIController.clearChatHistory);
router.get('/recommendations', AIController.getRecommendations);

// Admin-only routes
router.get('/usage-stats', authorize(UserRole.ADMIN), AIController.getUsageStats);

export default router;