import { supabase } from './supabase';

export async function getEntriesPendingQuality() {
  return supabase.from('fabric_entries').select('*').eq('status', 'PENDING_QUALITY');
}

export async function addQualityParameters(fabricId: string, params: any) {
  // Insert quality parameters
  const qualityRes = await supabase.from('quality_parameters').insert([{ fabric_entry_id: fabricId, ...params }]);
  if (qualityRes.error) return qualityRes;
  // Update fabric entry status
  const statusRes = await updateFabricEntryStatus(fabricId, 'READY_TO_ISSUE');
  return { ...qualityRes, ...statusRes };
}

export async function updateQualityParameters(id: string, params: Partial<any>) {
  return supabase.from('quality_parameters').update(params).eq('id', id);
}

export async function updateFabricEntryStatus(id: string, status: 'PENDING_QUALITY' | 'READY_TO_ISSUE' | 'ON_HOLD') {
  return supabase.from('fabric_entries').update({ status }).eq('id', id);
} 