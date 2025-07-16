# Skill Forge API - Online Learning Platform Backend

A comprehensive, API-first backend for an online learning platform built with TypeScript, Express.js, and modern development practices.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control (Student, Instructor, Admin)
- **User Management**: Profile management, progress tracking, preferences, and statistics
- **Course Management**: Full CRUD operations, enrollment system, module/lesson structure
- **Payment Processing**: Stripe integration for secure payments, refunds, and transaction history
- **AI-Powered Features**: OpenAI integration for tutoring, resume analysis, content summarization, and quiz generation
- **File Management**: AWS S3 integration for secure file uploads and storage

### Technical Features
- **TypeScript**: Full type safety and modern JavaScript features
- **Modular Architecture**: Clean separation of concerns with organized folder structure
- **Comprehensive Validation**: Request validation with Joi schemas
- **Error Handling**: Centralized error handling with consistent API responses
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Documentation**: Self-documenting API with clear endpoint structure

## 📁 Project Structure

```
src/
├── config/           # Environment configuration
├── controllers/      # Request handlers
├── middleware/       # Custom middleware functions
├── models/          # Data models (in-memory for demo)
├── routes/          # API route definitions
├── services/        # External service integrations
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app configuration
└── server.ts        # Server startup
```

## 🛠️ Installation & Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # Server
   PORT=3000
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-refresh-token-secret-here
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key-here
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your-aws-access-key-id
   AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
   AWS_S3_BUCKET=skill-forge-uploads
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - User logout

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /users/avatar` - Upload user avatar
- `GET /users/progress` - Get learning progress
- `GET /users/stats` - Get user statistics
- `GET /users/courses` - Get enrolled courses

### Course Management
- `GET /courses` - List all courses (with filters)
- `GET /courses/:id` - Get course details
- `POST /courses` - Create new course (Instructor/Admin)
- `PUT /courses/:id` - Update course (Instructor/Admin)
- `DELETE /courses/:id` - Delete course (Instructor/Admin)
- `POST /courses/:id/enroll` - Enroll in course
- `POST /courses/:id/publish` - Publish course

### Payment Processing
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `POST /payments/refund` - Process refund
- `GET /payments/history` - Get payment history
- `POST /payments/webhook` - Stripe webhook handler

### AI Features
- `POST /ai/tutor` - Ask AI tutor
- `POST /ai/resume-analysis` - Analyze resume
- `POST /ai/summary` - Generate content summary
- `POST /ai/quiz` - Generate quiz from content
- `GET /ai/recommendations` - Get personalized recommendations

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Demo Accounts
- **Admin**: `admin@skillforge.com` / `password`
- **Instructor**: `instructor@skillforge.com` / `password`
- **Student**: `student@skillforge.com` / `password`

## 🎯 Role-Based Access Control

- **Student**: Can enroll in courses, track progress, make payments
- **Instructor**: Can create and manage courses, view payment stats
- **Admin**: Full access to all features and user management

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Joi Validation**: Request validation
- **Error Handling**: Comprehensive error management

## 🚀 Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the production server**:
   ```bash
   npm start
   ```

## 🔌 External Integrations

### OpenAI
- AI tutoring system
- Resume analysis
- Content summarization
- Quiz generation

### Stripe
- Payment processing
- Subscription management
- Webhook handling
- Refund processing

### AWS S3
- File uploads
- Course materials storage
- User avatar storage
- Secure file access

## 📊 Monitoring & Logging

- Request logging with Morgan
- Error tracking and reporting
- Performance monitoring
- Health check endpoint: `/health`

## 🛡️ Security Features

- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api`
- Review the health check at `/health`
- Examine the comprehensive error messages
- Refer to the TypeScript types for request/response structures

---

**Skill Forge API** - Empowering online education with modern technology! 🎓✨