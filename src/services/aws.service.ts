import AWS from 'aws-sdk';
import { config } from '../config/env';
import { FileUploadResponse } from '../types/api.types';

class AWSService {
  private s3: AWS.S3;

  constructor() {
    if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
      console.warn('AWS credentials not configured. File upload features will not work.');
      this.s3 = null as any;
    } else {
      AWS.config.update({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region,
      });

      this.s3 = new AWS.S3();
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'uploads'
  ): Promise<FileUploadResponse> {
    if (!this.s3) {
      throw new Error('AWS S3 service not configured');
    }

    const key = `${folder}/${Date.now()}-${fileName}`;

    try {
      const uploadResult = await this.s3.upload({
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ACL: 'public-read',
      }).promise();

      return {
        url: uploadResult.Location,
        key: uploadResult.Key,
        size: file.length,
        mimetype: mimeType,
        originalName: fileName,
      };
    } catch (error) {
      console.error('AWS S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    if (!this.s3) {
      throw new Error('AWS S3 service not configured');
    }

    try {
      await this.s3.deleteObject({
        Bucket: config.aws.s3Bucket,
        Key: key,
      }).promise();

      return true;
    } catch (error) {
      console.error('AWS S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3) {
      throw new Error('AWS S3 service not configured');
    }

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: config.aws.s3Bucket,
        Key: key,
        Expires: expiresIn,
      });

      return url;
    } catch (error) {
      console.error('AWS S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async uploadCourseVideo(
    file: Buffer,
    fileName: string,
    courseId: string
  ): Promise<FileUploadResponse> {
    return this.uploadFile(file, fileName, 'video/mp4', `courses/${courseId}/videos`);
  }

  async uploadCourseThumbnail(
    file: Buffer,
    fileName: string,
    courseId: string
  ): Promise<FileUploadResponse> {
    return this.uploadFile(file, fileName, 'image/jpeg', `courses/${courseId}/thumbnails`);
  }

  async uploadUserAvatar(
    file: Buffer,
    fileName: string,
    userId: string
  ): Promise<FileUploadResponse> {
    return this.uploadFile(file, fileName, 'image/jpeg', `users/${userId}/avatars`);
  }

  async uploadCourseResource(
    file: Buffer,
    fileName: string,
    mimeType: string,
    courseId: string
  ): Promise<FileUploadResponse> {
    return this.uploadFile(file, fileName, mimeType, `courses/${courseId}/resources`);
  }

  generatePresignedUploadUrl(key: string, contentType: string): string {
    if (!this.s3) {
      throw new Error('AWS S3 service not configured');
    }

    return this.s3.getSignedUrl('putObject', {
      Bucket: config.aws.s3Bucket,
      Key: key,
      ContentType: contentType,
      Expires: 3600, // 1 hour
    });
  }
}

export const awsService = new AWSService();