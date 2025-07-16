export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
  meta?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery {
  search?: string;
}

export interface FilterQuery {
  [key: string]: any;
}

export interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export interface FileUploadResponse {
  url: string;
  key: string;
  size: number;
  mimetype: string;
  originalName: string;
}