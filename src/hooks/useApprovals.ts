import { useState, useCallback } from 'react';
import * as approvalService from '../services/approval.service';
import { QuantityApproval } from '../utils/types';

export function useEntriesReadyForApproval() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await approvalService.getEntriesReadyForApproval();
    setEntries(data || []);
    setLoading(false);
  }, []);

  return { entries, fetchEntries, loading };
}

export function useApproveEntry() {
  return approvalService.approveEntry;
}

export function useHoldEntry() {
  return approvalService.holdEntry;
}

export function useUpdateApprovalStatus() {
  return approvalService.updateApprovalStatus;
} 