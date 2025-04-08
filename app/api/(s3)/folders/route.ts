// app/api/folders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { OPTIONS } from '@/auth.config';

// Create a folder
export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(OPTIONS);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await req.json();
    const { name, parentId } = body;
    
    // Create the folder
    const folder = await prisma.folder.create({
      data: {
        name,
        userId,
        parentId: parentId || null,
      },
    });
    
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

// Get user's folders (optionally filtered by parentId)
export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(OPTIONS);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    const parentId = url.searchParams.get('parentId') || null;
    const isArchive = url.searchParams.get('isArchive') === 'true';
    const isStar = url.searchParams.get('isStar') === 'true';
    const isDocument = url.searchParams.get('isDocument') === 'true';
    
    // Build the query
    const where: any = {
      userId,
      isArchive,
    };
    
    if (isStar) {
      where.isStar = true;
    }
    
    if (isDocument) {
      where.isDocument = true;
    }
    
    if (parentId === 'null') {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }
    
    // Get the folders
    const folders = await prisma.folder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    return NextResponse.json(
      { error: 'Failed to get folders' },
      { status: 500 }
    );
  }
}