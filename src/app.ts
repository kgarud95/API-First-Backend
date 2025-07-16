import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config/env';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import paymentRoutes from './routes/payment.routes';
import aiRoutes from './routes/ai.routes';

// Import middleware
import { sendError } from './utils/response.utils';

// Validate environment configuration
validateConfig();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.server.nodeEnv === 'production' ? config.cors.origin : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.server.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Skill Forge API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Skill Forge API',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth - Authentication endpoints',
      users: '/api/users - User management endpoints',
      courses: '/api/courses - Course management endpoints',
      payments: '/api/payments - Payment processing endpoints',
      ai: '/api/ai - AI-powered features endpoints',
    },
    endpoints: {
      health: '/health - Health check',
      docs: '/api - This documentation',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return sendError(res, 400, 'Validation error', error.details);
  }

  if (error.name === 'UnauthorizedError') {
    return sendError(res, 401, 'Unauthorized');
  }

  if (error.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format');
  }

  if (error.code === 11000) {
    return sendError(res, 409, 'Duplicate field value');
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = config.server.nodeEnv === 'production' 
    ? 'Internal server error' 
    : error.message || 'Internal server error';

  sendError(res, statusCode, message);
});

export default app;