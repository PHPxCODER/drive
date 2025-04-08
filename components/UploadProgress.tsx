"use client"
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { CheckCircle2, FileUp, X } from 'lucide-react';

// Define the upload file type
interface UploadFile {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  size?: number;
}

// Context type
interface UploadContextType {
  uploads: UploadFile[];
  addUpload: (file: Omit<UploadFile, 'id'>) => string;
  updateUploadProgress: (id: string, progress: number) => void;
  completeUpload: (id: string) => void;
  failUpload: (id: string) => void;
  removeUpload: (id: string) => void;
}

// Create context
const UploadContext = createContext<UploadContextType | undefined>(undefined);

// Provider component
export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uploads, setUploads] = useState<UploadFile[]>([]);

  const addUpload = (file: Omit<UploadFile, 'id'>): string => {
    const id = Date.now().toString();
    setUploads(prev => [...prev, { ...file, id }]);
    return id;
  };

  const updateUploadProgress = (id: string, progress: number) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === id ? { ...upload, progress } : upload
      )
    );
  };

  const completeUpload = (id: string) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === id ? { ...upload, status: 'completed', progress: 100 } : upload
      )
    );
  };

  const failUpload = (id: string) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === id ? { ...upload, status: 'error' } : upload
      )
    );
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  return (
    <UploadContext.Provider 
      value={{ 
        uploads, 
        addUpload, 
        updateUploadProgress, 
        completeUpload, 
        failUpload, 
        removeUpload 
      }}
    >
      {children}
      <UploadProgressOverlay />
    </UploadContext.Provider>
  );
};

// Hook to use upload context
export const useUpload = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};

// Progress bar component
const UploadProgressOverlay: React.FC = () => {
  const { uploads, removeUpload } = useUpload();

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {uploads.map((upload) => (
        <div 
          key={upload.id} 
          className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-4 w-72 border dark:border-neutral-700 animate-slide-in-right"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FileUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium truncate max-w-[200px] text-neutral-800 dark:text-neutral-200">
                {upload.name}
              </span>
            </div>
            <button 
              onClick={() => removeUpload(upload.id)}
              className="hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full p-1"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-neutral-400" />
            </button>
          </div>
          <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-1.5 mb-2">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                upload.status === 'completed' 
                  ? 'bg-green-500' 
                  : upload.status === 'error' 
                  ? 'bg-red-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-neutral-400">
            <span>
              {upload.status === 'completed' 
                ? 'Upload complete' 
                : upload.status === 'error' 
                ? 'Upload failed' 
                : 'Uploading'}
            </span>
            {upload.status === 'completed' && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadProgressOverlay;