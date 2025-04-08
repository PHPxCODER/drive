// app/api/storage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { OPTIONS } from '@/auth.config';

export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(OPTIONS);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get user storage information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: true,
        storageUsed: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Calculate storage limits based on subscription
    const storageLimit = user.subscription === 'Basic' ? 1.5 * 1024 * 1024 * 1024 : 15 * 1024 * 1024 * 1024; // 1.5GB or 15GB
    
    // Count files and folders
    const fileCount = await prisma.file.count({
      where: {
        userId,
        isArchive: false,
      },
    });
    
    const folderCount = await prisma.folder.count({
      where: {
        userId,
        isArchive: false,
      },
    });
    
    return NextResponse.json({
      subscription: user.subscription,
      storageUsed: user.storageUsed,
      storageLimit,
      percentUsed: (user.storageUsed / storageLimit) * 100,
      fileCount,
      folderCount,
    });
  } catch (error) {
    console.error('Get storage info error:', error);
    return NextResponse.json(
      { error: 'Failed to get storage information' },
      { status: 500 }
    );
  }
}