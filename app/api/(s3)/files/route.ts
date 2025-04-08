// app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { OPTIONS } from '@/auth.config';

export const dynamic = 'force-dynamic';

// Get user's files (with optional filters)
export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(OPTIONS);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const isArchive = url.searchParams.get('isArchive') === 'true';
    const isStar = url.searchParams.get('isStar') === 'true';
    const isDocument = url.searchParams.get('isDocument') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '0');
    
    // Build the query
    const where: any = {
      userId,
      isArchive,
    };
    
    if (isStar) {
      where.isStar = true;
    }
    
    if (isDocument !== null) {
      where.isDocument = isDocument;
    }
    
    // Get the files
    const files = await prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(limit > 0 ? { take: limit } : {}),
    });
    
    return NextResponse.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Failed to get files' },
      { status: 500 }
    );
  }
}