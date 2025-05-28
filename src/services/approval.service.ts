import { supabase } from './supabase';
import { QuantityApproval, HoldReason, ApprovalStatus } from '../utils/types';

export async function getEntriesReadyForApproval() {
  // Entries with quality parameters completed and not yet approved
  return supabase
    .from('fabric_entries')
    .select('*')
    .eq('status', 'READY_TO_ISSUE');
}

export async function approveEntry(fabric_entry_id: string) {
  return supabase.from('quantity_approvals').insert([
    { fabric_entry_id, approval_status: 'APPROVED' },
  ]);
}

export async function holdEntry(fabric_entry_id: string, reason: HoldReason, details?: Partial<QuantityApproval>) {
  return supabase.from('quantity_approvals').insert([
    { fabric_entry_id, approval_status: 'ON_HOLD', hold_reason: reason, ...details },
  ]);
}

export async function updateApprovalStatus(id: string, status: ApprovalStatus) {
  return supabase.from('quantity_approvals').update({ approval_status: status }).eq('id', id);
}

export async function createQuantityApproval(data: Partial<QuantityApproval>) {
  return supabase.from('quantity_approvals').insert([data]);
}

export async function getQuantityApproval(fabricEntryId: string) {
  return supabase
    .from('quantity_approvals')
    .select('*')
    .eq('fabric_entry_id', fabricEntryId)
    .single();
}

export async function updateQuantityApproval(id: string, data: Partial<QuantityApproval>) {
  return supabase.from('quantity_approvals').update(data).eq('id', id);
}

export async function deleteQuantityApproval(id: string) {
  return supabase.from('quantity_approvals').delete().eq('id', id);
}

export async function getFabricEntryWithQuality(id: string) {
  return supabase
    .from('fabric_entries')
    .select(`
      *,
      quality_parameters (*),
      fabric_rolls (*)
    `)
    .eq('id', id)
    .single();
}

export async function getFabricEntriesWithApprovals() {
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

// Roll-level approval functions
export async function createRollApproval(rollId: string, data: any) {
  return supabase.from('roll_approvals').insert([{
    fabric_roll_id: rollId,
    ...data
  }]);
}

export async function updateRollApproval(rollId: string, data: Partial<{
  approval_status: ApprovalStatus;
  hold_reason?: HoldReason;
  not_approved_quantity?: number;
  approved_by: string;
  remarks?: string;
  debit_note_url?: string;
}>) {
  return supabase
    .from('roll_approvals')
    .update(data)
    .eq('fabric_roll_id', rollId);
}

export async function updateRollApprovalDebitNote(rollApprovalId: string, debitNoteUrl: string) {
  return supabase
    .from('roll_approvals')
    .update({ debit_note_url: debitNoteUrl })
    .eq('id', rollApprovalId);
}

export async function getRollApprovals(fabricEntryId: string) {
  return supabase
    .from('roll_approvals')
    .select(`
      *,
      fabric_rolls!inner (
        *,
        fabric_entries!inner (id)
      )
    `)
    .eq('fabric_rolls.fabric_entries.id', fabricEntryId);
}

export async function getRollApprovalByRollId(rollId: string) {
  return supabase
    .from('roll_approvals')
    .select('*')
    .eq('fabric_roll_id', rollId)
    .single();
}

// Check if all rolls in a fabric entry are processed and update fabric entry status
export async function checkAndUpdateFabricEntryStatus(fabricEntryId: string) {
  try {
    // Get all rolls for this fabric entry
    const { data: rolls, error: rollsError } = await supabase
      .from('fabric_rolls')
      .select('id')
      .eq('fabric_entry_id', fabricEntryId);

    if (rollsError) throw rollsError;

    if (!rolls || rolls.length === 0) {
      return { success: false, message: 'No rolls found for this fabric entry' };
    }

    // Get all roll approvals for this fabric entry
    const { data: rollApprovals, error: approvalsError } = await supabase
      .from('roll_approvals')
      .select('approval_status, fabric_roll_id')
      .in('fabric_roll_id', rolls.map(roll => roll.id));

    if (approvalsError) throw approvalsError;

    // Check if all rolls have been processed
    const totalRolls = rolls.length;
    const processedRolls = rollApprovals?.length || 0;

    if (processedRolls < totalRolls) {
      // Not all rolls are processed yet
      return { success: true, message: 'Not all rolls processed yet', allProcessed: false };
    }

    // All rolls are processed, determine the overall status
    const hasHoldRolls = rollApprovals?.some(approval => approval.approval_status === 'ON_HOLD');
    const newStatus = hasHoldRolls ? 'ON_HOLD' : 'READY_TO_ISSUE';

    // Update fabric entry status
    const { error: updateError } = await supabase
      .from('fabric_entries')
      .update({ status: newStatus })
      .eq('id', fabricEntryId);

    if (updateError) throw updateError;

    return { 
      success: true, 
      message: `Fabric entry status updated to ${newStatus}`, 
      allProcessed: true,
      finalStatus: newStatus 
    };

  } catch (error) {
    console.error('Error checking and updating fabric entry status:', error);
    return { success: false, message: 'Failed to update fabric entry status' };
  }
} 