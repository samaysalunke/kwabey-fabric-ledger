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
      quality_parameters (*)
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
      quantity_approvals (*)
    `)
    .order('date_inwarded', { ascending: false });
} 