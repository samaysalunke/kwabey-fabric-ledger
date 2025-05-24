import { supabase } from './supabase';

export async function login(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function logout() {
  return supabase.auth.signOut();
}

export function getCurrentUser() {
  return supabase.auth.getUser();
}

export function getUserRole(email: string) {
  // Match email to env variables for role
  if (email === process.env.REACT_APP_INWARD_CLERK_EMAIL) return 'INWARD_CLERK';
  if (email === process.env.REACT_APP_QUALITY_CHECKER_EMAIL) return 'QUALITY_CHECKER';
  if (email === process.env.REACT_APP_APPROVER_EMAIL) return 'APPROVER';
  if (email === process.env.REACT_APP_SUPERADMIN_EMAIL) return 'SUPERADMIN';
  return null;
} 