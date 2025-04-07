// lib/s3.ts

import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { customAlphabet } from 'nanoid';

// Create a custom nanoid with a custom alphabet for URLs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

// Create an S3 client
const s3Client = new S3Client({
  region: 'us-east-1', // Doesn't matter for MinIO
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
});

// Bucket name
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'user-files';

// Generate an upload URL for a new file
export async function generateUploadUrl(contentType: string): Promise<{ url: string; key: string; slug: string }> {
  const slug = nanoid();
  const key = `uploads/${slug}`;
  
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
    slug,
  };
}

// Generate a download URL for an existing file
export async function generateDownloadUrl(key: string): Promise<string> {
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