import { useState, useCallback } from 'react';
import * as fabricService from '../services/fabric.service';
import { FabricEntry } from '../utils/types';

export function useCreateFabricEntry() {
  return fabricService.createFabricEntry;
}

export function useFabricEntries(filters?: Record<string, any>) {
  const [entries, setEntries] = useState<FabricEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await fabricService.getFabricEntries(filters);
    setEntries(data || []);
    setLoading(false);
  }, [filters]);

  return { entries, fetchEntries, loading };
}

export function useUpdateFabricEntry() {
  return fabricService.updateFabricEntry;
}

export function useDeleteFabricEntry() {
  return fabricService.deleteFabricEntry;
} 