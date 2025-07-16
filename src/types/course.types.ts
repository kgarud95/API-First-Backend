export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  instructorId: string;
  instructorName: string;
  category: string;
  subcategory: string;
  level: CourseLevel;
  price: number;
  currency: string;
  thumbnail: string;
  previewVideo?: string;
  duration: number; // in minutes
  modules: CourseModule[];
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels',
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  lessons: Lesson[];
  quiz?: Quiz;
  isPreview: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  type: LessonType;
  content: LessonContent;
  duration: number; // in minutes
  isPreview: boolean;
}

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  INTERACTIVE = 'interactive',
  ASSIGNMENT = 'assignment',
}

export interface LessonContent {
  videoUrl?: string;
  textContent?: string;
  interactiveContent?: any;
  assignmentInstructions?: string;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'download';
  url: string;
  size?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  level: CourseLevel;
  price: number;
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  subcategory?: string;
  level?: CourseLevel;
  price?: number;
  requirements?: string[];
  learningOutcomes?: string[];
  tags?: string[];
}

export interface EnrollmentRequest {
  courseId: string;
  paymentIntentId?: string;
}

export interface CourseFilters {
  category?: string;
  subcategory?: string;
  level?: CourseLevel;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  duration?: number;
  tags?: string[];
  search?: string;
}

export interface CourseSortOptions {
  sortBy: 'title' | 'price' | 'rating' | 'enrollmentCount' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}