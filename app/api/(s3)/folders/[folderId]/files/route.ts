// app/api/folders/[folderId]/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { OPTIONS } from '@/auth.config';

// Get files in a folder
export async function GET(
  req: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    // Get the user session
    const session = await getServerSession(OPTIONS);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const folderId = params.folderId;
    const url = new URL(req.url);
    const isArchive = url.searchParams.get('isArchive') === 'true';
    const isStar = url.searchParams.get('isStar') === 'true';
    
    // Verify the folder belongs to the user
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
    });
    
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    
    // Build the query
    const where: any = {
      folderId,
      isArchive,
    };
    
    if (isStar) {
      where.isStar = true;
    }
    
    // Get the files
    const files = await prisma.file.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    // For each file, generate a temporary URL
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        // We'll create a separate endpoint to generate URLs on demand
        // For now, return the file data
        return file;
      })
    );
    
    return NextResponse.json(filesWithUrls);
  } catch (error) {
    console.error('Get folder files error:', error);
    return NextResponse.json(
      { error: 'Failed to get folder files' },
      { status: 500 }
    );
  }
}