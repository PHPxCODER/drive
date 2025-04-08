import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { customAlphabet } from 'nanoid';

// Create a custom nanoid with a custom alphabet for URLs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

// Create an S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

// Bucket name
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

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
  try {
    // Remove the data URL prefix (if present)
    const base64Data = base64String.includes(',') 
      ? base64String.split(',')[1] 
      : base64String;
    
    // Remove any whitespace
    const cleanBase64 = base64Data.replace(/\s/g, '');
    
    // Calculate size: Base64 encodes 3 bytes into 4 characters
    // Also account for potential padding
    const paddingCount = cleanBase64.endsWith('==') ? 2 : 
                         cleanBase64.endsWith('=') ? 1 : 0;
    
    return Math.floor((cleanBase64.length * 3) / 4 - paddingCount);
  } catch (error) {
    console.error('File size calculation error:', error);
    throw new Error('Failed to calculate file size');
  }
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
  
  try {
    // Remove potential data URL prefix
    const base64Content = base64Data.includes(',') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
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
  } catch (error) {
    console.error('Base64 file upload error:', error);
    throw new Error('Failed to upload base64 file');
  }
}