import { supabase } from './supabase';

const roleEmails = {
  INWARD_CLERK: process.env.REACT_APP_INWARD_CLERK_EMAILS,
  QUALITY_CHECKER: process.env.REACT_APP_QUALITY_CHECKER_EMAILS,
  APPROVER: process.env.REACT_APP_APPROVER_EMAILS,
  SUPERADMIN: process.env.REACT_APP_SUPERADMIN_EMAILS,
};

export async function login(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function logout() {
  return supabase.auth.signOut();
}

export function getCurrentUser() {
  return supabase.auth.getUser();
}

export function getUserRole(email: string): string | null {
  for (const [role, roleEmail] of Object.entries(roleEmails)) {
    if (roleEmail && email.toLowerCase() === roleEmail.toLowerCase()) {
      return role;
    }
  }
  return null;
} 