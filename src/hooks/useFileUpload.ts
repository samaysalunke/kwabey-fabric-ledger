import { useState } from 'react';
import { uploadFile } from '../services/file.service';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File, bucket: string, path: string) => {
    setUploading(true);
    setUploadError(null);

    try {
      const { data, error } = await uploadFile(file, bucket, path);
      
      if (error) {
        throw new Error(error.message);
      }

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return {
    upload,
    uploading,
    uploadError,
  };
} 