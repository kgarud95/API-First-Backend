import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow all file types by default - validation will be done in validation middleware
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10, // Maximum 10 files
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => 
  upload.array(fieldName, maxCount);

// Middleware for multiple fields with files
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => 
  upload.fields(fields);

// Specific upload middlewares for different file types
export const uploadImage = uploadSingle('image');
export const uploadVideo = uploadSingle('video');
export const uploadDocument = uploadSingle('document');
export const uploadAvatar = uploadSingle('avatar');
export const uploadThumbnail = uploadSingle('thumbnail');

// Course-specific uploads
export const uploadCourseFiles = uploadFields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'previewVideo', maxCount: 1 },
  { name: 'resources', maxCount: 10 },
]);

// Lesson-specific uploads
export const uploadLessonFiles = uploadFields([
  { name: 'video', maxCount: 1 },
  { name: 'resources', maxCount: 5 },
]);

// Error handling middleware for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large',
          message: 'File size exceeds the maximum limit of 50MB',
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files',
          message: 'Maximum number of files exceeded',
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field',
          message: 'Unexpected file field in the request',
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'Upload error',
          message: error.message,
        });
    }
  }
  
  next(error);
};