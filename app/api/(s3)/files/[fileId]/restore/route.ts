// app/api/files/[fileId]/restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { OPTIONS } from '@/auth.config';

export async function POST(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    // Get the user session
    const session = await getServerSession(OPTIONS);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const fileId = params.fileId;
    
    // Get the file
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
        isArchive: true,
      },
    });
    
    if (!file) {
      return NextResponse.json({ error: 'File not found or not archived' }, { status: 404 });
    }
    
    // Restore the file
    const restoredFile = await prisma.file.update({
      where: { id: fileId },
      data: {
        isArchive: false,
        archivedAt: null,
      },
    });
    
    return NextResponse.json({ success: true, file: restoredFile });
  } catch (error) {
    console.error('Restore file error:', error);
    return NextResponse.json(
      { error: 'Failed to restore file' },
      { status: 500 }
    );
  }
}