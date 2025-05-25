import { useState, useCallback } from 'react';
import * as qualityService from '../services/quality.service';
import * as fabricService from '../services/fabric.service';
import { QualityParameters } from '../utils/types';

export function usePendingQualityEntries() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await fabricService.getFabricEntries({ status: 'PENDING_QUALITY' });
    setEntries(data || []);
    setLoading(false);
  }, []);

  return { entries, fetchEntries, loading };
}

export function useAddQualityParams() {
  return qualityService.createQualityParameters;
}

export function useUpdateQualityParams() {
  return qualityService.updateQualityParameters;
} 