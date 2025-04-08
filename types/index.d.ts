import { Timestamp } from "firebase/firestore";
import { ReactNode } from "react";

export interface ChildProps {
  children: ReactNode;
}

export interface DocIdProps {
  params: {
    documentId: string;
  };
}

export interface IFolderAndFile {
  id: string;
  name: string;
  uid: string;
  timestamp: Timestamp;
  image?: string; // Keep this for backward compatibility
  type: string;
  size: number;
  isStar: boolean;
  archivedTime: Timestamp;
  key?: string; // Add this for MinIO/S3 object key
  url?: string; // Optional URL property
  folderId?: string; // Optional folder ID property
  isArchive: boolean;
  isDocument: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  archivedAt?: string | Date;
  userId?: string; // Used instead of uid in the Prisma model
}