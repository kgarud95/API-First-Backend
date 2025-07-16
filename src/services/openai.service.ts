import OpenAI from 'openai';
import { config } from '../config/env';
import {
  TutorRequest,
  TutorResponse,
  ResumeAnalysisRequest,
  ResumeAnalysisResponse,
  SummaryRequest,
  SummaryResponse,
  QuizGenerationRequest,
  GeneratedQuiz,
} from '../types/ai.types';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    if (!config.openai.apiKey) {
      console.warn('OpenAI API key not configured. AI features will not work.');
      this.client = null as any;
    } else {
      this.client = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
  }

  async askTutor(request: TutorRequest): Promise<TutorResponse> {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
    }

    const systemPrompt = `You are an AI tutor for an online learning platform called Skill Forge. 
    You help students understand course material and answer their questions in a helpful, encouraging way.
    Always provide clear explanations and suggest related topics for further learning.`;

    const userPrompt = `
    Course ID: ${request.courseId}
    ${request.moduleId ? `Module ID: ${request.moduleId}` : ''}
    ${request.lessonId ? `Lesson ID: ${request.lessonId}` : ''}
    ${request.context ? `Context: ${request.context}` : ''}
    
    Student Question: ${request.question}
    
    Please provide a helpful answer with suggestions for related topics.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Parse the response to extract structured data
      // In a real implementation, you might use function calling or structured outputs
      return {
        answer: response,
        suggestions: [
          'Try practicing with code examples',
          'Review the previous lesson',
          'Check out the additional resources',
        ],
        relatedTopics: [
          'Related concept 1',
          'Related concept 2',
          'Related concept 3',
        ],
        confidence: 0.85,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get tutor response');
    }
  }

  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse> {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
    }

    const systemPrompt = `You are an AI career advisor that analyzes resumes and provides constructive feedback.
    Analyze the resume for strengths, weaknesses, and provide actionable suggestions for improvement.
    Also recommend relevant courses from the learning platform.`;

    const userPrompt = `
    Resume Text: ${request.resumeText}
    ${request.targetRole ? `Target Role: ${request.targetRole}` : ''}
    ${request.targetSkills ? `Target Skills: ${request.targetSkills.join(', ')}` : ''}
    
    Please analyze this resume and provide structured feedback.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // In a real implementation, you would parse the structured response
      return {
        overallScore: 75,
        strengths: [
          'Strong technical skills',
          'Good project experience',
          'Clear formatting',
        ],
        weaknesses: [
          'Missing quantified achievements',
          'Could improve summary section',
          'Needs more industry keywords',
        ],
        suggestions: [
          'Add metrics to demonstrate impact',
          'Include more relevant keywords',
          'Strengthen the professional summary',
        ],
        skillsAnalysis: [
          {
            skill: 'JavaScript',
            level: 'intermediate',
            relevance: 0.9,
            suggestions: ['Consider learning TypeScript', 'Add more framework experience'],
          },
        ],
        recommendedCourses: [
          'Complete Web Development Bootcamp',
          'Advanced React Development',
        ],
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  async generateSummary(request: SummaryRequest): Promise<SummaryResponse> {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
    }

    const lengthInstructions = {
      short: 'Keep it concise, 2-3 sentences maximum',
      medium: 'Provide a moderate summary, 1-2 paragraphs',
      long: 'Create a comprehensive summary with detailed explanations',
    };

    const systemPrompt = `You are an AI that creates educational summaries for online learning content.
    Create clear, well-structured summaries that help students understand key concepts.
    ${lengthInstructions[request.length]}.`;

    const userPrompt = `
    Content Type: ${request.type}
    Content: ${request.content}
    
    Please create a summary with key points and action items.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: request.length === 'short' ? 300 : request.length === 'medium' ? 600 : 1000,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      return {
        summary: response,
        keyPoints: [
          'Key concept 1',
          'Key concept 2',
          'Key concept 3',
        ],
        actionItems: [
          'Practice the examples',
          'Review related materials',
          'Complete the exercises',
        ],
        estimatedReadTime: Math.ceil(response.length / 200), // Rough estimate
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<GeneratedQuiz> {
    if (!this.client) {
      throw new Error('OpenAI service not configured');
    }

    const systemPrompt = `You are an AI that creates educational quizzes for online learning.
    Generate ${request.questionCount} questions based on the provided content.
    Difficulty: ${request.difficulty}
    Question types: ${request.questionTypes.join(', ')}
    
    Format your response as a structured quiz with questions, options (if applicable), correct answers, and explanations.`;

    const userPrompt = `Content: ${request.content}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // In a real implementation, you would parse the structured response
      // For demo purposes, returning mock data
      const questions = Array.from({ length: request.questionCount }, (_, i) => ({
        question: `Sample question ${i + 1} about the content`,
        type: request.questionTypes[i % request.questionTypes.length] as any,
        options: request.questionTypes[i % request.questionTypes.length] === 'multiple_choice' 
          ? ['Option A', 'Option B', 'Option C', 'Option D'] 
          : undefined,
        correctAnswer: request.questionTypes[i % request.questionTypes.length] === 'multiple_choice' 
          ? 'Option A' 
          : request.questionTypes[i % request.questionTypes.length] === 'true_false' 
            ? 'true' 
            : 'Sample answer',
        explanation: `Explanation for question ${i + 1}`,
        difficulty: request.difficulty,
        points: request.difficulty === 'easy' ? 1 : request.difficulty === 'medium' ? 2 : 3,
      }));

      return {
        questions,
        estimatedTime: request.questionCount * 2, // 2 minutes per question
        difficulty: request.difficulty,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  async getUsageStats(): Promise<any> {
    // In a real implementation, you would track token usage and costs
    return {
      tutorQuestions: 150,
      resumeAnalyses: 25,
      summariesGenerated: 80,
      quizzesGenerated: 40,
      totalTokensUsed: 125000,
      costEstimate: 15.75,
    };
  }
}

export const openaiService = new OpenAIService();