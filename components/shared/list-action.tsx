'use client';

import { IFolderAndFile } from '@/types';
import {
  Download,
  MoreVertical,
  Pencil,
  Star,
  Trash,
  UserPlus,
} from 'lucide-react';
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';

interface ListActionProps {
  item: IFolderAndFile;
  onStartEditing?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const ListAction = ({ item, onStartEditing }: ListActionProps) => {
  const { refresh } = useRouter();
  const { documentId } = useParams();
  const itemType = item.size ? 'files' : 'folders';

  const onDelete = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();

    try {
      await axios.delete(`/api/${itemType}/${item.id}`);
      toast.success('Item moved to trash');
      refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to move item to trash');
    }
  };

  const onToggleStar = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();

    try {
      await axios.patch(`/api/${itemType}/${item.id}`, {
        isStar: !item.isStar,
      });
      
      toast.success(item.isStar ? 'Item unstarred' : 'Item starred');
      refresh();
    } catch (error) {
      console.error('Star toggle error:', error);
      toast.error('Failed to update item');
    }
  };

  const onDownload = async () => {
    if (!item.size) {
      toast.error('This is a folder, not a file.');
      return;
    }

    try {
      const response = await axios.get(`/api/files/${item.id}/download`);
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const onShare = async () => {
    if (!item.size) {
      toast.error("You can't share a folder");
      return;
    }

    try {
      const response = await axios.get(`/api/files/${item.id}/download`);
      navigator.clipboard.writeText(response.data.url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to generate sharing link');
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div
        role="button"
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition opacity-0 group-hover:opacity-100"
        onClick={onDelete}
      >
        <Trash className="w-4 h-4 opacity-50" />
      </div>
      <div
        role="button"
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition opacity-0 group-hover:opacity-100"
        onClick={onToggleStar}
      >
        <Star className={`w-4 h-4 ${item.isStar ? 'fill-yellow-400 text-yellow-400' : 'opacity-50'}`} />
      </div>
      <Popover>
        <PopoverTrigger className="flex justify-start" asChild>
          <div
            role="button"
            className="p-2 hover:bg-secondary rounded-full transition"
            onClick={e => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="px-0 py-2">
          <div
            className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
            role="button"
            onClick={onDownload}
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </div>

          <div
            className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
            role="button"
            onClick={onStartEditing}
          >
            <Pencil className="w-4 h-4" />
            <span>Rename</span>
          </div>

          <Separator />

          <div
            className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
            role="button"
            onClick={onShare}
          >
            <UserPlus className="w-4 h-4" />
            <span>Share</span>
          </div>

          <div
            className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
            role="button"
            onClick={onDelete}
          >
            <Trash className="w-4 h-4" />
            <span>Move to trash</span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ListAction;