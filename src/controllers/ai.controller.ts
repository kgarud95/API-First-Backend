import { Response } from 'express';
import { openaiService } from '../services/openai.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import {
  TutorRequest,
  ResumeAnalysisRequest,
  SummaryRequest,
  QuizGenerationRequest,
} from '../types/ai.types';
import { RequestWithUser } from '../types/api.types';

export class AIController {
  static async askTutor(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const tutorRequest: TutorRequest = req.body;

      const response = await openaiService.askTutor(tutorRequest);

      return sendSuccess(res, response, 'Tutor response generated successfully');
    } catch (error) {
      console.error('Ask tutor error:', error);
      return sendError(res, 500, 'Failed to get tutor response');
    }
  }

  static async analyzeResume(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const analysisRequest: ResumeAnalysisRequest = req.body;

      const analysis = await openaiService.analyzeResume(analysisRequest);

      return sendSuccess(res, analysis, 'Resume analysis completed successfully');
    } catch (error) {
      console.error('Analyze resume error:', error);
      return sendError(res, 500, 'Failed to analyze resume');
    }
  }

  static async generateSummary(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const summaryRequest: SummaryRequest = req.body;

      const summary = await openaiService.generateSummary(summaryRequest);

      return sendSuccess(res, summary, 'Summary generated successfully');
    } catch (error) {
      console.error('Generate summary error:', error);
      return sendError(res, 500, 'Failed to generate summary');
    }
  }

  static async generateQuiz(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      const quizRequest: QuizGenerationRequest = req.body;

      const quiz = await openaiService.generateQuiz(quizRequest);

      return sendSuccess(res, quiz, 'Quiz generated successfully');
    } catch (error) {
      console.error('Generate quiz error:', error);
      return sendError(res, 500, 'Failed to generate quiz');
    }
  }

  static async getUsageStats(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      // Only admins can view AI usage stats
      if (req.user.role !== 'admin') {
        return sendError(res, 403, 'Admin access required');
      }

      const stats = await openaiService.getUsageStats();

      return sendSuccess(res, stats, 'AI usage stats retrieved successfully');
    } catch (error) {
      console.error('Get AI usage stats error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async getChatHistory(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      // In a real implementation, you would store and retrieve chat history
      // For now, returning mock data
      const chatHistory = [
        {
          id: 'chat_1',
          courseId: 'course_1',
          question: 'What is React?',
          answer: 'React is a JavaScript library for building user interfaces...',
          timestamp: new Date(),
        },
        {
          id: 'chat_2',
          courseId: 'course_1',
          question: 'How do I use useState?',
          answer: 'useState is a React Hook that lets you add state to functional components...',
          timestamp: new Date(),
        },
      ];

      return sendSuccess(res, chatHistory, 'Chat history retrieved successfully');
    } catch (error) {
      console.error('Get chat history error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async clearChatHistory(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      // In a real implementation, you would clear the user's chat history
      // For now, just return success

      return sendSuccess(res, null, 'Chat history cleared successfully');
    } catch (error) {
      console.error('Clear chat history error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async getRecommendations(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Authentication required');
      }

      // In a real implementation, you would use AI to generate personalized recommendations
      // based on user's learning history, preferences, and progress
      const recommendations = {
        courses: [
          {
            id: 'course_1',
            title: 'Advanced React Development',
            reason: 'Based on your progress in React fundamentals',
            confidence: 0.85,
          },
          {
            id: 'course_2',
            title: 'Node.js Backend Development',
            reason: 'Complements your frontend skills',
            confidence: 0.78,
          },
        ],
        skills: [
          {
            skill: 'TypeScript',
            reason: 'Popular in modern React development',
            courses: ['course_3', 'course_4'],
          },
          {
            skill: 'GraphQL',
            reason: 'Advanced API development skill',
            courses: ['course_5'],
          },
        ],
        learningPath: {
          title: 'Full-Stack Developer Path',
          description: 'Complete path to become a full-stack developer',
          courses: ['course_1', 'course_2', 'course_3'],
          estimatedDuration: '6 months',
        },
      };

      return sendSuccess(res, recommendations, 'AI recommendations generated successfully');
    } catch (error) {
      console.error('Get AI recommendations error:', error);
      return sendError(res, 500, 'Failed to generate recommendations');
    }
  }
}