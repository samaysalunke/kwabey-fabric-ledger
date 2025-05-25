import React, { useState, useEffect } from 'react';
import { getFabricEntries } from '../../../services/fabric.service';
import { FabricEntry } from '../../../utils/types';
import { useApp } from '../../../contexts/AppContext';

interface ApprovalListProps {
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  refreshTrigger: number;
}

const ApprovalList: React.FC<ApprovalListProps> = ({
  selectedEntryId,
  onSelectEntry,
  refreshTrigger,
}) => {
  const [fabricEntries, setFabricEntries] = useState<FabricEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useApp();

  useEffect(() => {
    fetchPendingEntries();
  }, [refreshTrigger]);

  const fetchPendingEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await getFabricEntries({ status: 'QUALITY_CHECKED' });
      
      if (error) {
        throw new Error(error.message);
      }

      setFabricEntries(data || []);
    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch fabric entries',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Approval</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Pending Approval ({fabricEntries.length})
      </h2>

      {fabricEntries.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No entries pending approval</h3>
          <p className="mt-1 text-sm text-gray-500">
            All fabric entries have been processed or none have passed quality check yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {fabricEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedEntryId === entry.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {entry.seller_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    PO: {entry.po_number}
                  </p>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{entry.quantity_value} {entry.quantity_unit}</span>
                    <span>{entry.fabric_type}</span>
                    <span>{entry.color}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(entry.date_inwarded).toLocaleDateString()}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Quality Checked
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalList; 