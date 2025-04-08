'use client';

import { IFolderAndFile } from '@/types';
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { File, Folder, Minus, MoreVertical, Trash, Undo } from 'lucide-react';
import { format } from 'date-fns';
import { byteConverter } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmModal from '@/components/modals/confirm-modal';
import axios from 'axios';

interface TrashItemProps {
  item: IFolderAndFile;
}

const TrashItem = ({ item }: TrashItemProps) => {
  const { refresh } = useRouter();
  const itemType = item.size ? 'files' : 'folders';

  // Format the timestamp for archived date
  const formattedDate = item.archivedTime ? 
    (typeof item.archivedTime === 'string' ? 
      format(new Date(item.archivedTime), 'MMM dd, hh:mm a') : 
      format(new Date(item.archivedTime.seconds * 1000), 'MMM dd, hh:mm a'))
    : 'Unknown date';

  const onRestore = async () => {
    try {
      await axios.post(`/api/${itemType}/${item.id}/restore`);
      toast.success('Item restored successfully');
      refresh();
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore item');
    }
  };

  const onPermanentDelete = async () => {
    try {
      await axios.delete(`/api/${itemType}/${item.id}?permanent=true`);
      toast.success('Item permanently deleted');
      refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-1" role="button">
          {item.size ? (
            <File className="w-4 h-4 text-blue-500" />
          ) : (
            <Folder className="w-4 h-4 text-gray-500 fill-gray-500" />
          )}
          <span>{item.name}</span>
        </div>
      </TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{item.size ? byteConverter(item.size) : <Minus />}</TableCell>
      <TableCell className="flex justify-end group items-center space-x-2">
        <Popover>
          <PopoverTrigger className="flex justify-start" asChild>
            <div
              role="button"
              className="p-2 hover:bg-secondary rounded-full transition"
            >
              <MoreVertical className="h-4 w-4" />
            </div>
          </PopoverTrigger>

          <PopoverContent className="p-0 py-2" forceMount side="left">
            <div
              className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
              role="button"
              onClick={onRestore}
            >
              <Undo className="w-4 h-4" />
              <span>Restore</span>
            </div>
            <ConfirmModal onConfirm={onPermanentDelete}>
              <div
                className="w-full flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm"
                role="button"
              >
                <Trash className="w-4 h-4" />
                <span>Delete permanently</span>
              </div>
            </ConfirmModal>
          </PopoverContent>
        </Popover>
      </TableCell>
    </TableRow>
  );
};

export default TrashItem;