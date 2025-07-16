import app from './app';
import { config } from './config/env';

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Skill Forge API Server is running!

📍 Server Details:
   • Port: ${PORT}
   • Environment: ${config.server.nodeEnv}
   • URL: http://localhost:${PORT}

📚 API Endpoints:
   • Health Check: http://localhost:${PORT}/health
   • API Documentation: http://localhost:${PORT}/api
   • Authentication: http://localhost:${PORT}/api/auth
   • Users: http://localhost:${PORT}/api/users
   • Courses: http://localhost:${PORT}/api/courses
   • Payments: http://localhost:${PORT}/api/payments
   • AI Features: http://localhost:${PORT}/api/ai

🔧 Configuration Status:
   • JWT: ${config.jwt.secret ? '✅ Configured' : '❌ Missing'}
   • OpenAI: ${config.openai.apiKey ? '✅ Configured' : '❌ Missing'}
   • Stripe: ${config.stripe.secretKey ? '✅ Configured' : '❌ Missing'}
   • AWS S3: ${config.aws.accessKeyId ? '✅ Configured' : '❌ Missing'}

📖 Demo Accounts:
   • Admin: admin@skillforge.com / password
   • Instructor: instructor@skillforge.com / password
   • Student: student@skillforge.com / password

Ready to accept requests! 🎯
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default server;