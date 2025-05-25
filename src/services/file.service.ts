import { supabase } from './supabase';

export async function uploadFile(file: File, bucket: string, path: string) {
  return supabase.storage.from(bucket).upload(path, file, { upsert: true });
}

export async function downloadFile(url: string) {
  return supabase.storage.from('').download(url);
}

export async function deleteFile(url: string) {
  return supabase.storage.from('').remove([url]);
} 