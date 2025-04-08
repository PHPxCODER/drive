// lib/s3.ts

import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { customAlphabet } from 'nanoid';

// Create a custom nanoid with a custom alphabet for URLs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

// Create an S3 client
const s3Client = new S3Client({
  region: process.env.MINIO_REGION || 'ap-southeast-1', // Doesn't matter for MinIO
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
  // tls: process.env.MINIO_USE_SSL === 'true',
});

// Bucket name
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'user-files';

// Generate an upload URL for a new file
export async function generateUploadUrl(
  contentType: string, 
  userId: string, 
  folderId?: string
): Promise<{ url: string; key: string; }> {
  const id = nanoid();
  const folderPath = folderId ? `users/${userId}/folders/${folderId}` : `users/${userId}`;
  const key = `${folderPath}/${id}`;
  
  // Creating presigned URL for PUT
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return {
    url,
    key,
  };
}

// Generate a download URL for an existing file
export async function getFileUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return url;
}

// Delete a file from S3
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  await s3Client.send(command);
}

// Calculate the file size in bytes from a base64 string
export function calculateFileSize(base64String: string): number {
  // Remove the data URL prefix (if present)
  const base64Data = base64String.split(',')[1] || base64String;
  // Calculate size: Base64 encodes 3 bytes into 4 characters
  return Math.ceil((base64Data.length * 3) / 4);
}

// Upload a base64-encoded file directly to S3
export async function uploadBase64File(
  base64Data: string, 
  contentType: string, 
  userId: string, 
  folderId?: string
): Promise<{ key: string; size: number }> {
  const id = nanoid();
  const folderPath = folderId ? `users/${userId}/folders/${folderId}` : `users/${userId}`;
  const key = `${folderPath}/${id}`;
  
  // Remove potential data URL prefix
  const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  
  // Convert base64 to Buffer
  const buffer = Buffer.from(base64Content, 'base64');
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  
  await s3Client.send(command);
  
  return {
    key,
    size: buffer.length,
  };
}