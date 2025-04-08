// app/api/test-minio/route.ts
import { NextResponse } from 'next/server';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

// Set this to true for detailed debugging info
const DEBUG = true;

// Mark as dynamic to ensure it's not statically optimized
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Log env variables (be careful with secrets in production)
    if (DEBUG) {
      console.log('MinIO Configuration:');
      console.log('Endpoint:', process.env.MINIO_ENDPOINT);
      console.log('Region:', process.env.MINIO_REGION);
      console.log('Bucket:', process.env.MINIO_BUCKET_NAME);
      console.log('Access Key exists:', !!process.env.MINIO_ACCESS_KEY);
      console.log('Secret Key exists:', !!process.env.MINIO_SECRET_KEY);
    }

    // Create S3 client
    const s3Client = new S3Client({
      region: process.env.MINIO_REGION || 'us-east-1',
      endpoint: process.env.MINIO_ENDPOINT,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || '',
        secretAccessKey: process.env.MINIO_SECRET_KEY || '',
      },
      forcePathStyle: true,
    });
    
    console.log('S3 client created, attempting to list buckets...');
    
    // Try to list buckets
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
    
    console.log('Successfully connected to MinIO');
    console.log('Available buckets:', Buckets);
    
    // Check if our target bucket exists
    const targetBucket = process.env.MINIO_BUCKET_NAME || 'user-files';
    const bucketExists = Buckets?.some(bucket => bucket.Name === targetBucket);
    
    if (!bucketExists) {
      console.warn(`Warning: Target bucket "${targetBucket}" not found!`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'MinIO connection successful', 
      buckets: Buckets?.map(b => b.Name),
      targetBucketExists: bucketExists
    });
  } catch (error: unknown) {
    console.error('MinIO connection error:', error);
    
    // Handle the error properly based on its type
    let errorMessage = 'Unknown error occurred';
    let errorStack = undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = DEBUG ? error.stack : undefined;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = String(error);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        stack: errorStack
      }, 
      { status: 500 }
    );
  }
}