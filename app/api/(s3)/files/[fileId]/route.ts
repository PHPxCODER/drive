// app/api/files/[fileId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/s3';
import { OPTIONS } from '@/auth.config';

// Delete or archive a file
export async function DELETE(
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
    const url = new URL(req.url);
    const permanent = url.searchParams.get('permanent') === 'true';
    
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
    
    if (permanent) {
      // Permanently delete the file
      await deleteFile(file.key);
      
      // Delete the database record
      await prisma.file.delete({
        where: { id: fileId },
      });
      
      // Update user's storage usage
      await prisma.user.update({
        where: { id: userId },
        data: { storageUsed: { decrement: file.size } },
      });
      
      return NextResponse.json({ success: true, message: 'File permanently deleted' });
    } else {
      // Soft delete (archive) the file
      await prisma.file.update({
        where: { id: fileId },
        data: {
          isArchive: true,
          archivedAt: new Date(),
        },
      });
      
      return NextResponse.json({ success: true, message: 'File archived' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

// Update a file
export async function PATCH(
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
    const body = await req.json();
    
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
    
    // Update the file
    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: body,
    });
    
    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Update file error:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}