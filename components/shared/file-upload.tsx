'use client';

import React, { useRef, useState } from 'react';
import { FileUp, Loader } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import { useSubscription } from '@/hooks/use-subscribtion';

interface FileUploadProps {
  folderId?: string;
  onUploadComplete?: () => void;
}

const FileUpload = ({ folderId, onUploadComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const { setTotalStorage, totalStorage } = useSubscription();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    try {
      // Request upload URL from our API
      const { data } = await axios.post('/api/upload', {
        name: file.name,
        contentType: file.type,
        folderId: folderId || null,
      });
      
      // Upload the file directly to MinIO/S3
      await axios.put(data.url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });
      
      // Notify the backend that the upload is complete
      await axios.post('/api/upload/complete', {
        fileId: data.fileId,
        size: file.size,
      });
      
      // Update UI and storage stats
      setTotalStorage(totalStorage + file.size);
      toast.success('File uploaded successfully');
      
      // Clear the file input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      // Refresh the view or call callback
      if (onUploadComplete) {
        onUploadComplete();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        className="flex items-center hover:bg-secondary transition py-2 px-4 space-x-2 text-sm cursor-pointer"
        role="button"
        onClick={handleButtonClick}
      >
        {isUploading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <FileUp className="w-4 h-4" />
            <span>File upload</span>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;