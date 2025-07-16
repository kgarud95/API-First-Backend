import { Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.utils';
import { sendUnauthorized, sendForbidden } from '../utils/response.utils';
import { UserRole } from '../types/auth.types';
import { RequestWithUser } from '../types/api.types';

export const authenticate = (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return sendUnauthorized(res, 'Access token required');
    }

    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    return sendUnauthorized(res, 'Invalid or expired token');
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return sendForbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

export const optionalAuth = (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

export const requireOwnership = (resourceIdParam: string = 'id') => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.userId;

    // Admin can access any resource
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // For user resources, check if the user owns the resource
    if (resourceIdParam === 'userId' || resourceIdParam === 'id') {
      if (resourceId !== userId) {
        return sendForbidden(res, 'Access denied: You can only access your own resources');
      }
    }

    next();
  };
};

export const requireInstructorOrAdmin = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendUnauthorized(res, 'Authentication required');
  }

  if (req.user.role !== UserRole.INSTRUCTOR && req.user.role !== UserRole.ADMIN) {
    return sendForbidden(res, 'Instructor or admin access required');
  }

  next();
};