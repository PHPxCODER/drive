// lib/minio.ts

import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { customAlphabet } from 'nanoid';

// Create a custom nanoid with a custom alphabet for URLs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

// Create an S3 client for MinIO
const minioClient = new S3Client({
  region: process.env.MINIO_REGION || 'us-east-1', // Doesn't matter for MinIO
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
});

// Bucket name
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'user-files';

// Helper function to ensure bucket exists
export async function ensureBucketExists() {
  // This would typically check if bucket exists and create it if not
  // However, for simplicity, we'll assume the bucket is created through MinIO admin console
}

// Generate a presigned URL for file upload
export async function getUploadUrl(userId: string, fileName: string, contentType: string, folderId?: string) {
  const fileId = nanoid();
  const folderPath = folderId ? `users/${userId}/folders/${folderId}` : `users/${userId}`;
  const key = `${folderPath}/${fileId}-${fileName.replace(/\s+/g, '_')}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  
  const url = await getSignedUrl(minioClient, command, { expiresIn: 3600 });
  
  return {
    url,
    key,
    fileId
  };
}

// Get a presigned URL for file download
export async function getDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  return await getSignedUrl(minioClient, command, { expiresIn: 3600 });
}

// Delete a file from storage
export async function deleteFileFromStorage(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  await minioClient.send(command);
}

// Upload a file directly (for server-side operations)
export async function uploadFile(buffer: Buffer, key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  
  return await minioClient.send(command);
}

// Helper to convert base64 to buffer
export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
  
  return Buffer.from(base64Data, 'base64');
}

// Directly upload a base64 encoded file
export async function uploadBase64File(
  base64Data: string, 
  fileName: string, 
  contentType: string, 
  userId: string, 
  folderId?: string
) {
  const fileId = nanoid();
  const folderPath = folderId ? `users/${userId}/folders/${folderId}` : `users/${userId}`;
  const key = `${folderPath}/${fileId}-${fileName.replace(/\s+/g, '_')}`;
  
  // Convert base64 to Buffer
  const buffer = base64ToBuffer(base64Data);
  
  // Upload to S3/MinIO
  await uploadFile(buffer, key, contentType);
  
  return {
    key,
    size: buffer.length,
    fileId
  };
}