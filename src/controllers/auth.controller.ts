import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.utils';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response.utils';
import { LoginRequest, SignupRequest, RefreshTokenRequest, UserRole } from '../types/auth.types';
import { RequestWithUser } from '../types/api.types';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return sendUnauthorized(res, 'Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendUnauthorized(res, 'Invalid email or password');
      }

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Return user profile and tokens
      const userProfile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return sendSuccess(res, {
        user: userProfile,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async signup(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role = UserRole.STUDENT }: SignupRequest = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return sendError(res, 409, 'User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await UserModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        bio: '',
        skills: [],
        preferences: UserModel.getDefaultPreferences(),
        progress: [],
      });

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Return user profile and tokens
      const userProfile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return sendSuccess(res, {
        user: userProfile,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }, 'Account created successfully');
    } catch (error) {
      console.error('Signup error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Find user to ensure they still exist
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return sendUnauthorized(res, 'User not found');
      }

      // Generate new tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return sendSuccess(res, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }, 'Tokens refreshed successfully');
    } catch (error) {
      console.error('Refresh token error:', error);
      return sendUnauthorized(res, 'Invalid or expired refresh token');
    }
  }

  static async getProfile(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res, 'Authentication required');
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      const userProfile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return sendSuccess(res, userProfile, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async logout(req: RequestWithUser, res: Response) {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return a success response
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  static async changePassword(req: RequestWithUser, res: Response) {
    try {
      if (!req.user) {
        return sendUnauthorized(res, 'Authentication required');
      }

      const { currentPassword, newPassword } = req.body;

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return sendUnauthorized(res, 'Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await UserModel.update(user.id, { password: hashedNewPassword });

      return sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }
}