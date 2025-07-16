import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendValidationError } from '../utils/response.utils';
import { validateSchema } from '../utils/validation.utils';

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { errors, value } = validateSchema(schema, req.body);
    
    if (errors) {
      return sendValidationError(res, errors);
    }
    
    req.body = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { errors, value } = validateSchema(schema, req.params);
    
    if (errors) {
      return sendValidationError(res, errors);
    }
    
    req.params = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { errors, value } = validateSchema(schema, req.query);
    
    if (errors) {
      return sendValidationError(res, errors);
    }
    
    req.query = value;
    next();
  };
};

export const validateFile = (options: {
  required?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  fieldName?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { 
      required = false, 
      maxSize = 10 * 1024 * 1024, 
      allowedTypes = [], 
      fieldName = 'file' 
    } = options;
    
    const file = req.file;
    
    if (required && !file) {
      return sendValidationError(res, [
        { field: fieldName, message: 'File is required' }
      ]);
    }
    
    if (file) {
      // Validate file type more strictly
      if (allowedTypes.length > 0) {
        const isValidType = allowedTypes.some(type => {
          if (type.includes('/')) {
            return file.mimetype === type;
          } else {
            return file.mimetype.startsWith(type + '/');
          }
        });
        
        if (!isValidType) {
          return sendValidationError(res, [
            { field: fieldName, message: `File type must be one of: ${allowedTypes.join(', ')}` }
          ]);
        }
      }
      
      if (file.size > maxSize) {
        return sendValidationError(res, [
          { field: fieldName, message: `File size must be less than ${maxSize / (1024 * 1024)}MB` }
        ]);
      }
    }
    
    next();
  };
};

export const validateMultipleFiles = (options: {
  required?: boolean;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  fieldName?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { 
      required = false, 
      maxFiles = 5, 
      maxSize = 10 * 1024 * 1024, 
      allowedTypes = [], 
      fieldName = 'files' 
    } = options;
    
    const files = req.files as Express.Multer.File[] || [];
    
    if (required && files.length === 0) {
      return sendValidationError(res, [
        { field: fieldName, message: 'At least one file is required' }
      ]);
    }
    
    if (files.length > maxFiles) {
      return sendValidationError(res, [
        { field: fieldName, message: `Maximum ${maxFiles} files allowed` }
      ]);
    }
    
    for (const file of files) {
      if (file.size > maxSize) {
        return sendValidationError(res, [
          { field: fieldName, message: `File ${file.originalname} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB` }
        ]);
      }
      
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return sendValidationError(res, [
          { field: fieldName, message: `File ${file.originalname} has invalid type. Allowed types: ${allowedTypes.join(', ')}` }
        ]);
      }
    }
    
    next();
  };
};