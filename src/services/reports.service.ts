import { supabase } from './supabase';

export async function getReportsData() {
  try {
    // Get all fabric entries with related data
    const { data: entries, error: entriesError } = await supabase
      .from('fabric_entries')
      .select(`
        *,
        quality_parameters (*),
        quantity_approvals (*)
      `)
      .order('date_inwarded', { ascending: false });

    if (entriesError) throw entriesError;

    // Calculate statistics
    const totalEntries = entries?.length || 0;
    const pendingQuality = entries?.filter(e => e.status === 'PENDING_QUALITY').length || 0;
    const qualityChecked = entries?.filter(e => e.status === 'QUALITY_CHECKED').length || 0;
    const readyToIssue = entries?.filter(e => e.status === 'READY_TO_ISSUE').length || 0;
    const onHold = entries?.filter(e => e.status === 'ON_HOLD').length || 0;

    // Calculate total quantity (sum of all quantity_value)
    const totalQuantity = entries?.reduce((sum, entry) => sum + (entry.quantity_value || 0), 0) || 0;

    // Calculate average GSM from quality parameters
    const entriesWithQuality = entries?.filter(e => e.quality_parameters && e.quality_parameters.length > 0) || [];
    const averageGSM = entriesWithQuality.length > 0
      ? entriesWithQuality.reduce((sum, entry) => sum + (entry.quality_parameters[0]?.gsm_value || 0), 0) / entriesWithQuality.length
      : 0;

    // Get recent entries (last 10)
    const recentEntries = entries?.slice(0, 10) || [];

    return {
      data: {
        totalEntries,
        pendingQuality,
        qualityChecked,
        readyToIssue,
        onHold,
        totalQuantity,
        averageGSM,
        recentEntries,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

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

export async function getStatusDistribution() {
  const { data, error } = await supabase
    .from('fabric_entries')
    .select('status');

  if (error) return { data: null, error };

  const distribution = data?.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return { data: distribution, error: null };
}

export async function getQualityAnalytics() {
  const { data, error } = await supabase
    .from('quality_parameters')
    .select('*');

  if (error) return { data: null, error };

  const analytics = {
    totalChecked: data?.length || 0,
    averageGSM: data?.reduce((sum, q) => sum + q.gsm_value, 0) / (data?.length || 1) || 0,
    averageWidth: data?.reduce((sum, q) => sum + q.width_dia_inches, 0) / (data?.length || 1) || 0,
    averageShrinkage: data?.reduce((sum, q) => sum + q.shrinkage_percent, 0) / (data?.length || 1) || 0,
    colorFastnessOK: data?.filter(q => q.color_fastness === 'OKAY').length || 0,
    colorFastnessNotOK: data?.filter(q => q.color_fastness === 'NOT_OKAY').length || 0,
  };

  return { data: analytics, error: null };
}

export async function getApprovalAnalytics() {
  const { data, error } = await supabase
    .from('quantity_approvals')
    .select('*');

  if (error) return { data: null, error };

  const analytics = {
    totalApprovals: data?.length || 0,
    approved: data?.filter(a => a.approval_status === 'APPROVED').length || 0,
    onHold: data?.filter(a => a.approval_status === 'ON_HOLD').length || 0,
    holdReasons: data?.reduce((acc, approval) => {
      if (approval.hold_reason) {
        acc[approval.hold_reason] = (acc[approval.hold_reason] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {},
  };

  return { data: analytics, error: null };
} 