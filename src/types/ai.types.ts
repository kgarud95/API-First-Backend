export interface TutorRequest {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  question: string;
  context?: string;
}

export interface TutorResponse {
  answer: string;
  suggestions: string[];
  relatedTopics: string[];
  confidence: number;
}

export interface ResumeAnalysisRequest {
  resumeText: string;
  targetRole?: string;
  targetSkills?: string[];
}

export interface ResumeAnalysisResponse {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  skillsAnalysis: SkillAnalysis[];
  recommendedCourses: string[];
}

export interface SkillAnalysis {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  relevance: number;
  suggestions: string[];
}

export interface SummaryRequest {
  content: string;
  type: 'lesson' | 'module' | 'course';
  length: 'short' | 'medium' | 'long';
}

export interface SummaryResponse {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  estimatedReadTime: number;
}

export interface QuizGenerationRequest {
  content: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes: ('multiple_choice' | 'true_false' | 'short_answer')[];
}

export interface GeneratedQuiz {
  questions: GeneratedQuestion[];
  estimatedTime: number;
  difficulty: string;
}

export interface GeneratedQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: string;
  points: number;
}

export interface AIUsageStats {
  tutorQuestions: number;
  resumeAnalyses: number;
  summariesGenerated: number;
  quizzesGenerated: number;
  totalTokensUsed: number;
  costEstimate: number;
}