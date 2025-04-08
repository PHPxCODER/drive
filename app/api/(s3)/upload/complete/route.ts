// app/api/upload/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
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
    const { fileId, size } = body;
    
    // Verify the file belongs to the user
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
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
    
    // Check if this file would exceed the user's storage limit
    if (user.storageUsed + size > storageLimit) {
      // Delete the file from the database (S3 cleanup would need to be handled separately)
      await prisma.file.delete({
        where: { id: fileId },
      });
      
      return NextResponse.json({ error: 'Storage limit exceeded' }, { status: 403 });
    }
    
    // Update the file size
    await prisma.file.update({
      where: { id: fileId },
      data: { size },
    });
    
    // Update user's storage usage
    await prisma.user.update({
      where: { id: userId },
      data: { storageUsed: { increment: size } },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
}