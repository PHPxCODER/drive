'use client';

import { defineImageAndFile } from '@/lib/utils';
import { IFolderAndFile } from '@/types';
import { File, Paperclip, Save, X } from 'lucide-react';
import Image from 'next/image';
import React, { ElementRef, useRef, useState, useEffect } from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import ListAction from '@/components/shared/list-action';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { format } from 'date-fns';

interface SuggestCardProps {
  item: IFolderAndFile;
}

const SuggestCard = ({ item }: SuggestCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item.name);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const inputRef = useRef<ElementRef<'input'>>(null);
  const { refresh } = useRouter();
  const { data: session } = useSession();
  const { documentId } = useParams();
  const itemType = item.size ? 'files' : 'folders';

  useEffect(() => {
    // If this is a file, fetch the download URL
    if (item.size && item.key) {
      const fetchImageUrl = async () => {
        try {
          const response = await axios.get(`/api/files/${item.id}/download`);
          setImageUrl(response.data.url);
        } catch (error) {
          console.error('Error fetching file URL:', error);
        }
      };
      
      fetchImageUrl();
    }
  }, [item.id, item.size, item.key]);

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
      console.error('Rename error:', error);
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

  return (
    <div className="max-w-[300px] max-h-[400px] h-[210px] flex flex-col rounded-md shadow-lg p-4 bg-secondary group">
      {isEditing ? (
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
      ) : (
        <div
          className="flex items-center space-x-2"
          role="button"
          onDoubleClick={onStartEditing}
        >
          <Paperclip className="w-4 h-4 text-blue-500" />
          <span className="text-sm opacity-70">{item.name}</span>
        </div>
      )}
      <div className="relative h-[70%] w-full bg-white dark:bg-black mt-2 rounded-md">
        {defineImageAndFile(item.type) === 'file' ? (
          <div className="flex h-full items-center justify-center">
            <File className="w-16 h-16" strokeWidth={1} />
          </div>
        ) : (
          imageUrl && <Image fill src={imageUrl} alt={item.name} className="object-cover" />
        )}
      </div>

      <div className="flex items-center w-full justify-between space-x-2 mt-4">
        <div className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={session?.user?.image ?? undefined} />
          </Avatar>
          <span className="opacity-75">me</span>
        </div>

        <ListAction item={item} onStartEditing={onStartEditing} />
      </div>
    </div>
  );
};

export default SuggestCard;