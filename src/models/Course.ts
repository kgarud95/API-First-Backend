import { Course, CourseLevel, CourseModule, Lesson, LessonType } from '../types/course.types';

// In-memory storage for demo purposes
const courses: Map<string, Course> = new Map();

export class CourseModel {
  static async create(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    const id = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const course: Course = {
      id,
      ...courseData,
      createdAt: now,
      updatedAt: now,
    };
    
    courses.set(id, course);
    return course;
  }

  static async findById(id: string): Promise<Course | null> {
    return courses.get(id) || null;
  }

  static async update(id: string, updates: Partial<Course>): Promise<Course | null> {
    const course = courses.get(id);
    if (!course) return null;

    const updatedCourse = {
      ...course,
      ...updates,
      updatedAt: new Date(),
    };

    courses.set(id, updatedCourse);
    return updatedCourse;
  }

  static async delete(id: string): Promise<boolean> {
    return courses.delete(id);
  }

  static async findAll(filters?: any): Promise<Course[]> {
    let courseList = Array.from(courses.values());

    if (filters?.category) {
      courseList = courseList.filter(course => course.category === filters.category);
    }

    if (filters?.level) {
      courseList = courseList.filter(course => course.level === filters.level);
    }

    if (filters?.instructorId) {
      courseList = courseList.filter(course => course.instructorId === filters.instructorId);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      courseList = courseList.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters?.priceMin !== undefined) {
      courseList = courseList.filter(course => course.price >= filters.priceMin);
    }

    if (filters?.priceMax !== undefined) {
      courseList = courseList.filter(course => course.price <= filters.priceMax);
    }

    if (filters?.rating) {
      courseList = courseList.filter(course => course.rating >= filters.rating);
    }

    // Only show published courses for non-instructors
    if (!filters?.includeUnpublished) {
      courseList = courseList.filter(course => course.isPublished);
    }

    return courseList;
  }

  static async findByInstructor(instructorId: string): Promise<Course[]> {
    return Array.from(courses.values()).filter(course => course.instructorId === instructorId);
  }

  static async incrementEnrollment(courseId: string): Promise<boolean> {
    const course = courses.get(courseId);
    if (!course) return false;

    course.enrollmentCount += 1;
    course.updatedAt = new Date();
    courses.set(courseId, course);
    return true;
  }

  static async updateRating(courseId: string, newRating: number, reviewCount: number): Promise<boolean> {
    const course = courses.get(courseId);
    if (!course) return false;

    course.rating = newRating;
    course.reviewCount = reviewCount;
    course.updatedAt = new Date();
    courses.set(courseId, course);
    return true;
  }
}

// Initialize with demo courses
const initializeCourses = async () => {
  const sampleModules: CourseModule[] = [
    {
      id: 'module_1',
      title: 'Introduction to Web Development',
      description: 'Learn the basics of web development',
      order: 1,
      duration: 120,
      isPreview: true,
      lessons: [
        {
          id: 'lesson_1',
          title: 'What is Web Development?',
          description: 'Overview of web development concepts',
          order: 1,
          type: LessonType.VIDEO,
          content: {
            videoUrl: 'https://example.com/video1.mp4',
            resources: [
              {
                id: 'resource_1',
                title: 'Web Development Guide',
                type: 'pdf',
                url: 'https://example.com/guide.pdf',
                size: 1024000,
              },
            ],
          },
          duration: 30,
          isPreview: true,
        },
        {
          id: 'lesson_2',
          title: 'Setting Up Your Environment',
          description: 'Install and configure development tools',
          order: 2,
          type: LessonType.TEXT,
          content: {
            textContent: 'Step-by-step guide to setting up your development environment...',
          },
          duration: 45,
          isPreview: false,
        },
      ],
    },
    {
      id: 'module_2',
      title: 'HTML Fundamentals',
      description: 'Master HTML structure and semantics',
      order: 2,
      duration: 180,
      isPreview: false,
      lessons: [
        {
          id: 'lesson_3',
          title: 'HTML Structure',
          description: 'Learn about HTML document structure',
          order: 1,
          type: LessonType.VIDEO,
          content: {
            videoUrl: 'https://example.com/video2.mp4',
          },
          duration: 60,
          isPreview: false,
        },
      ],
    },
  ];

  await CourseModel.create({
    title: 'Complete Web Development Bootcamp',
    description: 'Learn web development from scratch with HTML, CSS, JavaScript, and modern frameworks. This comprehensive course covers everything you need to become a full-stack developer.',
    shortDescription: 'Master web development with HTML, CSS, JavaScript, and modern frameworks',
    instructorId: 'instructor_1',
    instructorName: 'John Instructor',
    category: 'Programming',
    subcategory: 'Web Development',
    level: CourseLevel.BEGINNER,
    price: 99.99,
    currency: 'USD',
    thumbnail: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
    previewVideo: 'https://example.com/preview.mp4',
    duration: 1200,
    modules: sampleModules,
    requirements: ['Basic computer skills', 'No programming experience required'],
    learningOutcomes: [
      'Build responsive websites with HTML and CSS',
      'Create interactive web applications with JavaScript',
      'Understand modern web development frameworks',
      'Deploy applications to the web',
    ],
    tags: ['HTML', 'CSS', 'JavaScript', 'Web Development', 'Frontend'],
    rating: 4.8,
    reviewCount: 1250,
    enrollmentCount: 5000,
    isPublished: true,
  });

  await CourseModel.create({
    title: 'Advanced React Development',
    description: 'Take your React skills to the next level with advanced patterns, performance optimization, and modern React features.',
    shortDescription: 'Advanced React patterns and performance optimization',
    instructorId: 'instructor_1',
    instructorName: 'John Instructor',
    category: 'Programming',
    subcategory: 'Frontend Development',
    level: CourseLevel.ADVANCED,
    price: 149.99,
    currency: 'USD',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg',
    duration: 800,
    modules: [],
    requirements: ['Solid understanding of React basics', 'JavaScript ES6+ knowledge'],
    learningOutcomes: [
      'Master advanced React patterns',
      'Optimize React application performance',
      'Implement complex state management',
      'Build scalable React applications',
    ],
    tags: ['React', 'JavaScript', 'Frontend', 'Advanced', 'Performance'],
    rating: 4.9,
    reviewCount: 890,
    enrollmentCount: 2500,
    isPublished: true,
  });
};

initializeCourses();