'use client';

import React, { useRef } from 'react';
import { FileUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios, { AxiosProgressEvent } from 'axios';
import { useSubscription } from '@/hooks/use-subscribtion';
import { useUpload } from '@/components/UploadProgress';

interface FileUploadProps {
  folderId?: string;
  onUploadComplete?: () => void;
}

const FileUpload = ({ folderId, onUploadComplete }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const { setTotalStorage, totalStorage } = useSubscription();
  const { addUpload, updateUploadProgress, completeUpload, failUpload } = useUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Add upload to global progress tracker
    const uploadId = addUpload({
      name: file.name,
      progress: 0,
      status: 'uploading',
      size: file.size
    });
    
    try {
      // Request upload URL from our API
      const { data } = await axios.post('/api/upload', {
        name: file.name,
        contentType: file.type,
        folderId: folderId || null,
      });
      
      try {
        // Upload the file directly to S3 with progress tracking
        await axios.put(data.url, file, {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            updateUploadProgress(uploadId, percentCompleted);
          },
          transformRequest: [() => file],
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        });
  
        // Notify the backend that the upload is complete
        const completeResponse = await axios.post('/api/upload/complete', {
          fileId: data.fileId,
          size: file.size,
          key: data.key,
          name: file.name,
          type: file.type,
          folderId: folderId || null,
        });
        
        // Update UI and storage stats
        setTotalStorage(totalStorage + file.size);
        
        // Mark upload as complete
        completeUpload(uploadId);
        
        // Success toast
        toast.success('File uploaded successfully', {
          description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        });
        
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
      } catch (uploadError) {
        console.error('Detailed S3 Upload Error:', {
          error: uploadError,
          response: axios.isAxiosError(uploadError) ? {
            data: uploadError.response?.data,
            status: uploadError.response?.status,
            headers: uploadError.response?.headers
          } : null
        });
        
        // Mark upload as failed
        failUpload(uploadId);
        
        throw uploadError;
      }
    } catch (error) {
      console.error('Full Upload Process Error:', error);
      
      // More detailed error handling
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        
        toast.error(`Upload failed: ${error.response?.data?.error || error.message}`);
      } else {
        toast.error('Failed to upload file');
      }
      
      // Ensure upload is marked as failed
      failUpload(uploadId);
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
        <FileUp className="w-4 h-4" />
        <span>File upload</span>
      </div>
    </div>
  );
};

export default FileUpload;