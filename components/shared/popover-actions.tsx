'use client';

import { Folder, FolderUp, Star, Trash } from 'lucide-react';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useFolder } from '@/hooks/use-folder';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from './file-upload';

const PopoverActions = () => {
  const { onOpen } = useFolder();
  const { data: session } = useSession();
  const router = useRouter();
  const { documentId } = useParams();

  return (
    <>
      {!documentId && (
        <>
          <div
            className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
            role="button"
            onClick={onOpen}
          >
            <Folder className="w-4 h-4" />
            <span>New folder</span>
          </div>
          <Separator />
        </>
      )}
      
      <FileUpload folderId={documentId as string} />

      <div
        className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
        role="button"
      >
        <FolderUp className="w-4 h-4" />
        <span>Folder upload</span>
      </div>

      {documentId && (
        <>
          <Separator />
          <Link href={`/document/${documentId}/trash`}>
            <div
              className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
              role="button"
            >
              <Trash className="w-4 h-4" />
              <span>Trash</span>
            </div>
          </Link>
          <Link href={`/document/${documentId}/starred`}>
            <div
              className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
              role="button"
            >
              <Star className="w-4 h-4" />
              <span>Starred</span>
            </div>
          </Link>
        </>
      )}
    </>
  );
};

export default PopoverActions;