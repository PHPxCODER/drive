// app/api/folders/[folderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { OPTIONS } from '@/auth.config';

// Get a folder by ID
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
    
    // Get the folder
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        files: {
          where: {
            isArchive: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        subfolders: {
          where: {
            isArchive: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Get folder error:', error);
    return NextResponse.json(
      { error: 'Failed to get folder' },
      { status: 500 }
    );
  }
}

// Update a folder
export async function PATCH(
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
    const body = await req.json();
    
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
    
    // Update the folder
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: body,
    });
    
    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error('Update folder error:', error);
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

// Archive a folder
export async function DELETE(
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
    
    // Soft delete (archive) the folder
    const archivedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        isArchive: true,
        archivedAt: new Date(),
      },
    });
    
    return NextResponse.json(archivedFolder);
  } catch (error) {
    console.error('Archive folder error:', error);
    return NextResponse.json(
      { error: 'Failed to archive folder' },
      { status: 500 }
    );
  }
}