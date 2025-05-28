import { supabase } from './supabase';

export async function getFabricEntriesWithDetails() {
  return supabase
    .from('fabric_entries')
    .select(`
      *,
      quality_parameters (*),
      quantity_approvals (*),
      fabric_rolls (*)
    `)
    .order('date_inwarded', { ascending: false });
} 