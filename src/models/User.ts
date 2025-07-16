import { User, UserPreferences, CourseProgress } from '../types/user.types';
import { UserRole } from '../types/auth.types';

// In-memory storage for demo purposes
// In production, this would be replaced with a proper database
const users: Map<string, User> = new Map();

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    
    users.set(id, user);
    return user;
  }

  static async findById(id: string): Promise<User | null> {
    return users.get(id) || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    users.set(id, updatedUser);
    return updatedUser;
  }

  static async delete(id: string): Promise<boolean> {
    return users.delete(id);
  }

  static async findAll(filters?: any): Promise<User[]> {
    let userList = Array.from(users.values());

    if (filters?.role) {
      userList = userList.filter(user => user.role === filters.role);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      userList = userList.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    return userList;
  }

  static async updateProgress(userId: string, courseId: string, progress: Partial<CourseProgress>): Promise<boolean> {
    const user = users.get(userId);
    if (!user) return false;

    const existingProgressIndex = user.progress.findIndex(p => p.courseId === courseId);
    
    if (existingProgressIndex >= 0) {
      user.progress[existingProgressIndex] = {
        ...user.progress[existingProgressIndex],
        ...progress,
      };
    } else {
      user.progress.push({
        courseId,
        enrolledAt: new Date(),
        completedModules: [],
        progressPercentage: 0,
        lastAccessedAt: new Date(),
        ...progress,
      });
    }

    user.updatedAt = new Date();
    users.set(userId, user);
    return true;
  }

  static getDefaultPreferences(): UserPreferences {
    return {
      notifications: {
        email: true,
        push: true,
        courseUpdates: true,
        marketing: false,
      },
      privacy: {
        profileVisibility: 'public',
        showProgress: true,
      },
      learning: {
        difficulty: 'intermediate',
        pace: 'normal',
      },
    };
  }
}

// Initialize with some demo users
const initializeUsers = async () => {
  await UserModel.create({
    email: 'admin@skillforge.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    bio: 'System administrator',
    skills: ['Management', 'System Administration'],
    preferences: UserModel.getDefaultPreferences(),
    progress: [],
  });

  await UserModel.create({
    email: 'instructor@skillforge.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'John',
    lastName: 'Instructor',
    role: UserRole.INSTRUCTOR,
    bio: 'Experienced software developer and instructor',
    skills: ['JavaScript', 'React', 'Node.js', 'Teaching'],
    preferences: UserModel.getDefaultPreferences(),
    progress: [],
  });

  await UserModel.create({
    email: 'student@skillforge.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'Jane',
    lastName: 'Student',
    role: UserRole.STUDENT,
    bio: 'Aspiring web developer',
    skills: ['HTML', 'CSS'],
    preferences: UserModel.getDefaultPreferences(),
    progress: [],
  });
};

initializeUsers();