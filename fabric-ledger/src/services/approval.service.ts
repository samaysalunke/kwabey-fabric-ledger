import { supabase } from './supabase';

export async function getEntriesReadyForApproval() {
  // Entries with quality parameters completed and status READY_TO_ISSUE
  return supabase.from('fabric_entries').select('*').eq('status', 'READY_TO_ISSUE');
}

export async function approveEntry(fabricId: string) {
  // Insert approval record and update status
  const approvalRes = await supabase.from('quantity_approvals').insert([{ fabric_entry_id: fabricId, approval_status: 'APPROVED' }]);
  if (approvalRes.error) return approvalRes;
  const statusRes = await updateApprovalStatus(fabricId, 'APPROVED');
  return { ...approvalRes, ...statusRes };
}

export async function holdEntry(fabricId: string, reason: string, details?: any) {
  // Insert hold record and update status
  const holdRes = await supabase.from('quantity_approvals').insert([{ fabric_entry_id: fabricId, approval_status: 'ON_HOLD', hold_reason: reason, ...details }]);
  if (holdRes.error) return holdRes;
  const statusRes = await updateApprovalStatus(fabricId, 'ON_HOLD');
  return { ...holdRes, ...statusRes };
}

export async function updateApprovalStatus(fabricId: string, status: 'APPROVED' | 'ON_HOLD') {
  return supabase.from('fabric_entries').update({ status }).eq('id', fabricId);
} 