import { supabase } from './supabase';

export async function uploadFile(file: File, bucket: string, path: string) {
  return supabase.storage.from(bucket).upload(path, file);
}

export async function downloadFile(url: string) {
  // Supabase storage public URL fetch
  return fetch(url);
}

export async function deleteFile(url: string) {
  // Supabase storage remove by path
  // TODO: Parse bucket and path from URL
  return null;
} 