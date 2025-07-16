export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  skills: string[];
  preferences: UserPreferences;
  progress: CourseProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    courseUpdates: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showProgress: boolean;
  };
  learning: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    pace: 'slow' | 'normal' | 'fast';
    reminderTime?: string;
  };
}

export interface CourseProgress {
  courseId: string;
  enrolledAt: Date;
  completedModules: string[];
  currentModule?: string;
  progressPercentage: number;
  lastAccessedAt: Date;
  certificateEarned?: boolean;
  certificateUrl?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills?: string[];
  preferences?: Partial<UserPreferences>;
}

export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalHoursLearned: number;
  certificatesEarned: number;
  currentStreak: number;
  longestStreak: number;
}