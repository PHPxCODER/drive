// app/api/upload/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/s3';
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
    const { fileId, size, key, name, type, folderId } = body;
    
    // Verify the file key/details if needed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, subscription: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Calculate storage limits
    const storageLimit = user.subscription === 'Basic' ? 1.5 * 1024 * 1024 * 1024 : 15 * 1024 * 1024 * 1024; // 1.5GB or 15GB
    
    // Check if this file would exceed the user's storage limit
    if (user.storageUsed + size > storageLimit) {
      // Delete the file from S3 if storage limit would be exceeded
      try {
        await deleteFile(key);
      } catch (deleteError) {
        console.error('Error deleting oversized file:', deleteError);
      }
      
      return NextResponse.json({ error: 'Storage limit exceeded' }, { status: 403 });
    }
    
    // Create the file record
    try {
      const file = await prisma.file.create({
        data: {
          name,
          type,
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
      
      return NextResponse.json({ success: true, fileId: file.id });
    } catch (createError) {
      // If file record creation fails, delete the file from S3
      try {
        await deleteFile(key);
      } catch (deleteError) {
        console.error('Error deleting file after database error:', deleteError);
      }
      
      console.error('Failed to create file record:', createError);
      return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 });
    }
  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}