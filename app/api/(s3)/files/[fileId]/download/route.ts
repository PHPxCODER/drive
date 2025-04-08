// app/api/files/[fileId]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';
import { OPTIONS } from '@/auth.config';

export async function GET(
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
      },
    });
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Generate download URL
    const downloadUrl = await getFileUrl(file.key);
    
    return NextResponse.json({ url: downloadUrl });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}