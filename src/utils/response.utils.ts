import { Response } from 'express';
import { ApiResponse, PaginationInfo } from '../types/api.types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  pagination?: PaginationInfo,
  meta?: any
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    pagination,
    meta,
  };
  return res.json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  error: string,
  errors?: any[]
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    errors,
  };
  return res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  errors: any[]
): Response => {
  return sendError(res, 400, 'Validation failed', errors);
};

export const sendNotFound = (res: Response, resource = 'Resource'): Response => {
  return sendError(res, 404, `${resource} not found`);
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized'): Response => {
  return sendError(res, 401, message);
};

export const sendForbidden = (res: Response, message = 'Forbidden'): Response => {
  return sendError(res, 403, message);
};

export const sendInternalError = (res: Response, message = 'Internal server error'): Response => {
  return sendError(res, 500, message);
};

export const sendConflict = (res: Response, message = 'Resource already exists'): Response => {
  return sendError(res, 409, message);
};

export const sendBadRequest = (res: Response, message = 'Bad request'): Response => {
  return sendError(res, 400, message);
};

export const createPagination = (
  page: number,
  limit: number,
  total: number
): PaginationInfo => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};