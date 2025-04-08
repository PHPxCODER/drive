// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { generateUploadUrl, uploadBase64File } from '@/lib/s3';
import { OPTIONS } from '@/auth.config';

export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(OPTIONS);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { name, contentType, folderId, base64Data } = body;
    
    // Check user's storage limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, subscription: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Calculate storage limits
    const storageLimit = user.subscription === 'Basic' ? 1.5 * 1024 * 1024 * 1024 : 15 * 1024 * 1024 * 1024; // 1.5GB or 15GB
    
    // If base64Data is provided, upload directly
    if (base64Data) {
      const { key, size } = await uploadBase64File(base64Data, contentType, userId, folderId);
      
      // Check if uploading this file would exceed the user's storage limit
      if (user.storageUsed + size > storageLimit) {
        return NextResponse.json({ error: 'Storage limit exceeded' }, { status: 403 });
      }
      
      // Create file record in database
      const file = await prisma.file.create({
        data: {
          name,
          type: contentType,
          size,
          key,
          userId,
          folderId: folderId || null,
        },
      });
      
      // Update user's storage usage
      await prisma.user.update({
        where: { id: userId },
        data: { storageUsed: { increment: size } },
      });
      
      return NextResponse.json({ fileId: file.id, key });
    }
    
    // Otherwise, generate a presigned URL for client-side upload
    const { url, key } = await generateUploadUrl(contentType, userId, folderId);
    
    // Create a placeholder file record (size will be updated after upload completes)
    const file = await prisma.file.create({
      data: {
        name,
        type: contentType,
        size: 0, // Placeholder size
        key,
        userId,
        folderId: folderId || null,
      },
    });
    
    return NextResponse.json({ url, fileId: file.id, key });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}