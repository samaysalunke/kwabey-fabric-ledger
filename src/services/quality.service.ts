import { supabase } from './supabase';
import { QualityParameters, FabricEntry } from '../utils/types';

export async function createQualityParameters(data: Partial<QualityParameters>) {
  return supabase.from('quality_parameters').insert([data]);
}

export async function getQualityParameters(fabricEntryId: string) {
  return supabase
    .from('quality_parameters')
    .select('*')
    .eq('fabric_entry_id', fabricEntryId)
    .single();
}

export async function updateQualityParameters(id: string, data: Partial<QualityParameters>) {
  return supabase.from('quality_parameters').update(data).eq('id', id);
}

export async function deleteQualityParameters(id: string) {
  return supabase.from('quality_parameters').delete().eq('id', id);
}

export async function getFabricEntryById(id: string) {
  return supabase
    .from('fabric_entries')
    .select('*')
    .eq('id', id)
    .single();
}

export async function getFabricEntriesWithQuality() {
  return supabase
    .from('fabric_entries')
    .select(`
      *,
      quality_parameters (*)
    `)
    .order('date_inwarded', { ascending: false });
} 