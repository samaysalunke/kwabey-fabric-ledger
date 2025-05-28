import { supabase } from './supabase';

export async function uploadFile(file: File, bucket: string, path: string) {
  return supabase.storage.from(bucket).upload(path, file, { upsert: true });
}

export async function downloadFile(bucket: string, path: string) {
  return supabase.storage.from(bucket).download(path);
}

export async function deleteFile(bucket: string, path: string) {
  return supabase.storage.from(bucket).remove([path]);
}

export async function getPublicUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path);
}

export async function uploadDebitNote(file: File, rollId: string) {
  const fileName = `debit_notes/rolls/${rollId}_${Date.now()}_${file.name}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('ftp-documents')
      .upload(fileName, file, { upsert: true });
    
    if (error) {
      // Check if it's a bucket not found error
      if (error.message.includes('Bucket not found') || error.message.includes('bucket does not exist')) {
        throw new Error('Storage bucket not configured. Please contact your administrator to set up the "ftp-documents" bucket in Supabase Storage.');
      }
      throw new Error(`Failed to upload debit note: ${error.message}`);
    }
    
    return { fileName, data };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload debit note');
  }
}

export async function downloadDebitNote(filePath: string) {
  try {
    // Try to download from ftp-documents bucket
    const { data, error } = await supabase.storage
      .from('ftp-documents')
      .download(filePath);
    
    if (error) {
      // Check if it's a bucket not found error
      if (error.message.includes('Bucket not found') || error.message.includes('bucket does not exist')) {
        throw new Error('Storage bucket not configured. Please contact your administrator to set up the "ftp-documents" bucket in Supabase Storage.');
      }
      // Check if file doesn't exist
      if (error.message.includes('Object not found') || error.message.includes('does not exist')) {
        throw new Error('Debit note file not found. It may have been deleted or moved.');
      }
      throw new Error(`Failed to download debit note: ${error.message}`);
    }
    
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to download file' 
    };
  }
}

export async function getDebitNotePublicUrl(filePath: string) {
  try {
    const { data } = supabase.storage
      .from('ftp-documents')
      .getPublicUrl(filePath);
    
    // Check if the bucket exists by trying to list it
    const { error: bucketError } = await supabase.storage
      .from('ftp-documents')
      .list('', { limit: 1 });
    
    if (bucketError) {
      if (bucketError.message.includes('Bucket not found') || bucketError.message.includes('bucket does not exist')) {
        throw new Error('Storage bucket not configured. Please contact your administrator to set up the "ftp-documents" bucket in Supabase Storage.');
      }
    }
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    return { 
      url: null, 
      error: error instanceof Error ? error.message : 'Failed to get file URL' 
    };
  }
}

// Helper function to check if storage is properly configured
export async function checkStorageConfiguration() {
  try {
    const { error } = await supabase.storage
      .from('ftp-documents')
      .list('', { limit: 1 });
    
    if (error) {
      if (error.message.includes('Bucket not found') || error.message.includes('bucket does not exist')) {
        return { 
          configured: false, 
          error: 'Storage bucket "ftp-documents" not found. Please create it in Supabase Storage.' 
        };
      }
      return { 
        configured: false, 
        error: `Storage configuration error: ${error.message}` 
      };
    }
    
    return { configured: true, error: null };
  } catch (error) {
    return { 
      configured: false, 
      error: error instanceof Error ? error.message : 'Failed to check storage configuration' 
    };
  }
} 