// app/api/folders/[folderId]/restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { OPTIONS } from '@/auth.config';

export async function POST(
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
    
    // Get the folder
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
        isArchive: true,
      },
    });
    
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found or not archived' }, { status: 404 });
    }
    
    // Restore the folder
    const restoredFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        isArchive: false,
        archivedAt: null,
      },
    });
    
    return NextResponse.json({ success: true, folder: restoredFolder });
  } catch (error) {
    console.error('Restore folder error:', error);
    return NextResponse.json(
      { error: 'Failed to restore folder' },
      { status: 500 }
    );
  }
}