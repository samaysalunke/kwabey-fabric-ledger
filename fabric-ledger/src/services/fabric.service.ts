import { supabase } from './supabase';
import { FabricEntryData } from '../utils/types';

export async function createFabricEntry(data: FabricEntryData) {
  // Returns: { data: FabricEntryData[] | null, error: any }
  return supabase.from('fabric_entries').insert([data]).select();
}

export async function createFabricRolls(fabric_entry_id: string, rolls: { roll_value: number; roll_unit: string; batch_number: number }[]) {
  // Bulk insert rolls
  const rows = rolls.map(r => ({ ...r, fabric_entry_id, roll_value: Number(r.roll_value) }));
  return supabase.from('fabric_rolls').insert(rows);
}

export async function createRibDetails(fabric_entry_id: string, rib: { total_weight?: string; total_rolls?: string }) {
  if (!rib.total_weight && !rib.total_rolls) return { data: null, error: null };
  return supabase.from('rib_details').insert([{ fabric_entry_id, ...rib }]);
}

export async function getFabricEntries(filters?: any) {
  // TODO: Define FilterOptions type
  return supabase.from('fabric_entries').select('*');
}

export async function updateFabricEntry(id: string, data: Partial<FabricEntryData>) {
  return supabase.from('fabric_entries').update(data).eq('id', id);
}

export async function deleteFabricEntry(id: string) {
  return supabase.from('fabric_entries').delete().eq('id', id);
} 