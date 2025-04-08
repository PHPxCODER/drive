'use client';

import React, { ElementRef, useRef, useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { IFolderAndFile } from '@/types';
import { File, Folder, Minus, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { byteConverter } from '@/lib/utils';
import ListAction from './list-action';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

interface ListItemProps {
  item: IFolderAndFile;
}

const ListItem = ({ item }: ListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item.name);
  const itemType = item.size ? 'files' : 'folders';

  const inputRef = useRef<ElementRef<'input'>>(null);
  const { refresh, push } = useRouter();
  const { data: session } = useSession();

  const onStartEditing = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, value.length);
    }, 0);
  };

  const onSave = async () => {
    if (!value.trim()) {
      setValue(item.name);
      setIsEditing(false);
      return;
    }

    try {
      await axios.patch(`/api/${itemType}/${item.id}`, {
        name: value,
      });
      
      setIsEditing(false);
      toast.success('Name updated successfully');
      refresh();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update name');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(item.name);
    }
  };

  // Safely format the date
  const formattedDate = (() => {
    const dateToFormat = item.createdAt || item.timestamp;
    
    if (!dateToFormat) return 'Unknown date';
    
    // Handle different date input types
    const dateObj = dateToFormat instanceof Date 
      ? dateToFormat 
      : typeof dateToFormat === 'string' 
        ? new Date(dateToFormat) 
        : new Date(dateToFormat.seconds * 1000);
    
    // Check if date is valid
    return isNaN(dateObj.getTime()) 
      ? 'Unknown date' 
      : format(dateObj, 'MMM dd, yyyy');
  })();

  return (
    <TableRow
      className="group cursor-pointer"
      onClick={item.size ? () => {} : () => push(`/document/${item.id}`)}
    >
      <TableCell className="font-medium">
        {!isEditing ? (
          <div
            className="flex items-center space-x-1"
            role="button"
            onDoubleClick={onStartEditing}
          >
            {item.size ? (
              <File className="w-4 h-4 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 text-gray-500 fill-gray-500" />
            )}
            <span>{item.name}</span>
          </div>
        ) : (
          <div className="relative">
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              ref={inputRef}
              onKeyDown={onKeyDown}
            />

            <div className="absolute right-0 top-0 h-full flex items-center space-x-1">
              <Button
                size={'sm'}
                variant={'outline'}
                className="h-full"
                onClick={onSave}
              >
                <Save className="w-4 h-4" />
              </Button>

              <Button
                size={'sm'}
                variant={'outline'}
                className="h-full"
                onClick={() => {
                  setIsEditing(false);
                  setValue(item.name);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </TableCell>
      <TableCell className="flex items-center space-x-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={session?.user?.image ?? undefined} />
        </Avatar>
        <span className="opacity-75">me</span>
      </TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{item.size ? byteConverter(item.size) : <Minus />}</TableCell>
      <TableCell className="flex justify-end group items-center space-x-2">
        <ListAction item={item} onStartEditing={onStartEditing} />
      </TableCell>
    </TableRow>
  )
}

export default ListItem