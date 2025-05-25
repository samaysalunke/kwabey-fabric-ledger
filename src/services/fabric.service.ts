import { supabase } from './supabase';
import { FabricEntry, FabricRoll, RibDetails } from '../utils/types';

export async function createFabricEntry(data: Partial<FabricEntry>) {
  return supabase.from('fabric_entries').insert([data]).select();
}

export async function createFabricRolls(fabricEntryId: string, rolls: Array<{ roll_value: number; roll_unit: string }>) {
  const rollsData = rolls.map((roll, index) => ({
    fabric_entry_id: fabricEntryId,
    batch_number: index + 1,
    roll_value: roll.roll_value,
    roll_unit: roll.roll_unit,
  }));
  
  return supabase.from('fabric_rolls').insert(rollsData);
}

export async function createRibDetails(fabricEntryId: string, ribDetails: { total_weight?: number; total_rolls?: number }) {
  const ribData = {
    fabric_entry_id: fabricEntryId,
    total_weight: ribDetails.total_weight,
    total_rolls: ribDetails.total_rolls,
  };
  
  return supabase.from('rib_details').insert([ribData]);
}

export async function createCompleteFabricEntry(formData: {
  fabricEntry: Partial<FabricEntry>;
  rolls: Array<{ roll_value: number; roll_unit: string }>;
  ribDetails?: { total_weight?: number; total_rolls?: number };
  file?: File;
}) {
  try {
    // 1. Create fabric entry
    const { data: fabricEntryData, error: fabricError } = await createFabricEntry(formData.fabricEntry);
    if (fabricError) throw fabricError;
    
    const fabricEntryId = fabricEntryData[0].id;

    // 2. Create rolls
    const { error: rollsError } = await createFabricRolls(fabricEntryId, formData.rolls);
    if (rollsError) throw rollsError;

    // 3. Create rib details if provided
    if (formData.ribDetails && (formData.ribDetails.total_weight || formData.ribDetails.total_rolls)) {
      const { error: ribError } = await createRibDetails(fabricEntryId, formData.ribDetails);
      if (ribError) throw ribError;
    }

    // 4. Upload file if provided
    if (formData.file) {
      const fileName = `${fabricEntryId}_${Date.now()}_${formData.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('ftp-documents')
        .upload(fileName, formData.file);
      
      if (uploadError) throw uploadError;

      // Update fabric entry with file URL
      const { error: updateError } = await supabase
        .from('fabric_entries')
        .update({ ftp_document_url: fileName })
        .eq('id', fabricEntryId);
      
      if (updateError) throw updateError;
    }

    return { data: fabricEntryData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getFabricEntries(filters?: Record<string, any>) {
  let query = supabase.from('fabric_entries').select('*');
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  return query.order('date_inwarded', { ascending: false });
}

export async function updateFabricEntry(id: string, data: Partial<FabricEntry>) {
  return supabase.from('fabric_entries').update(data).eq('id', id);
}

export async function deleteFabricEntry(id: string) {
  return supabase.from('fabric_entries').delete().eq('id', id);
} 