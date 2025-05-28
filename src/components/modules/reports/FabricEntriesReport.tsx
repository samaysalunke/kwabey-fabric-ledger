import React, { useState, useEffect } from 'react';
import { getFabricEntriesWithDetails } from '../../../services/reports.service';
import { getRollApprovals } from '../../../services/approval.service';
import { FabricEntry, RollApproval } from '../../../utils/types';
import { useApp } from '../../../contexts/AppContext';
import { downloadDebitNote, getDebitNotePublicUrl, checkStorageConfiguration } from '../../../services/file.service';

interface FabricEntryWithDetails extends FabricEntry {
  quality_parameters?: any[];
  quantity_approvals?: any[];
  fabric_rolls?: any[];
}

const FabricEntriesReport: React.FC = () => {
  const [entries, setEntries] = useState<FabricEntryWithDetails[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<FabricEntryWithDetails[]>([]);
  const [rollApprovals, setRollApprovals] = useState<Record<string, RollApproval[]>>({});
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showRollDetails, setShowRollDetails] = useState(false);
  const [storageConfigured, setStorageConfigured] = useState<boolean | null>(null);
  const { addNotification } = useApp();

  useEffect(() => {
    fetchEntries();
    checkStorage();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, statusFilter, dateFilter]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await getFabricEntriesWithDetails();
      
      if (error) {
        throw new Error(error.message);
      }

      setEntries(data || []);
      
      // Fetch roll approvals for all entries
      if (data && data.length > 0) {
        await fetchAllRollApprovals(data);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch fabric entries',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRollApprovals = async (entries: FabricEntryWithDetails[]) => {
    const approvals: Record<string, RollApproval[]> = {};
    
    for (const entry of entries) {
      try {
        const { data, error } = await getRollApprovals(entry.id);
        if (!error && data) {
          approvals[entry.id] = data;
        }
      } catch (error) {
        console.error(`Failed to fetch roll approvals for entry ${entry.id}:`, error);
      }
    }
    
    setRollApprovals(approvals);
  };

  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const filterEntries = () => {
    let filtered = entries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.fabric_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date_inwarded);
        return entryDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredEntries(filtered);
  };

  const exportToCSV = () => {
    if (showRollDetails) {
      // Export with roll-wise details
      const headers = [
        'Seller Name',
        'PO Number',
        'Entry Quantity',
        'Entry Unit',
        'Color',
        'Fabric Type',
        'Entry Status',
        'Date Inwarded',
        'Roll Number',
        'Roll Weight',
        'Roll Unit',
        'Batch Number',
        'Roll Approval Status',
        'Hold Reason',
        'Not Approved Quantity',
        'Approved By',
        'Remarks',
        'Debit Note',
        'GSM',
        'Width/DIA',
        'Shrinkage %',
        'Color Fastness'
      ];

      const csvData: any[] = [];
      
      filteredEntries.forEach(entry => {
        const qualityParams = entry.quality_parameters?.[0];
        const entryApprovals = rollApprovals[entry.id] || [];
        
        if (entry.fabric_rolls && entry.fabric_rolls.length > 0) {
          entry.fabric_rolls.forEach(roll => {
            const rollApproval = entryApprovals.find(approval => approval.fabric_roll_id === roll.id);
            
            csvData.push([
              entry.seller_name,
              entry.po_number,
              entry.quantity_value,
              entry.quantity_unit,
              entry.color,
              entry.fabric_type,
              entry.status,
              new Date(entry.date_inwarded).toLocaleDateString(),
              roll.roll_number,
              roll.weight_value,
              roll.weight_unit,
              roll.batch_number,
              rollApproval?.approval_status || 'Not Processed',
              rollApproval?.hold_reason || '',
              rollApproval?.not_approved_quantity || '',
              rollApproval?.approved_by || '',
              rollApproval?.remarks || '',
              rollApproval?.debit_note_url || 'No',
              qualityParams?.gsm_value || '',
              qualityParams?.width_dia_inches || '',
              qualityParams?.shrinkage_percent || '',
              qualityParams?.color_fastness || ''
            ]);
          });
        } else {
          // Entry without rolls
          csvData.push([
            entry.seller_name,
            entry.po_number,
            entry.quantity_value,
            entry.quantity_unit,
            entry.color,
            entry.fabric_type,
            entry.status,
            new Date(entry.date_inwarded).toLocaleDateString(),
            'No Rolls',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            qualityParams?.gsm_value || '',
            qualityParams?.width_dia_inches || '',
            qualityParams?.shrinkage_percent || '',
            qualityParams?.color_fastness || ''
          ]);
        }
      });

      const csvContent = [headers, ...csvData]
        .map(row => row.map((field: any) => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fabric-entries-rollwise-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Export entry-level summary
      const headers = [
        'Seller Name',
        'PO Number',
        'Quantity',
        'Unit',
        'Color',
        'Fabric Type',
        'Status',
        'Date Inwarded',
        'Total Rolls',
        'Approved Rolls',
        'Held Rolls',
        'Pending Rolls',
        'GSM',
        'Width/DIA',
        'Shrinkage %',
        'Color Fastness',
        'Approval Status'
      ];

      const csvData = filteredEntries.map(entry => {
        const qualityParams = entry.quality_parameters?.[0];
        const entryApprovals = rollApprovals[entry.id] || [];
        const totalRolls = entry.fabric_rolls?.length || 0;
        const approvedRolls = entryApprovals.filter(a => a.approval_status === 'APPROVED').length;
        const heldRolls = entryApprovals.filter(a => a.approval_status === 'ON_HOLD').length;
        const pendingRolls = totalRolls - entryApprovals.length;
        
        return [
          entry.seller_name,
          entry.po_number,
          entry.quantity_value,
          entry.quantity_unit,
          entry.color,
          entry.fabric_type,
          entry.status,
          new Date(entry.date_inwarded).toLocaleDateString(),
          totalRolls,
          approvedRolls,
          heldRolls,
          pendingRolls,
          qualityParams?.gsm_value || '',
          qualityParams?.width_dia_inches || '',
          qualityParams?.shrinkage_percent || '',
          qualityParams?.color_fastness || '',
          entry.quantity_approvals?.[0]?.approval_status || ''
        ];
      });

      const csvContent = [headers, ...csvData]
        .map(row => row.map((field: any) => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fabric-entries-summary-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }

    addNotification({
      type: 'success',
      message: 'Report exported successfully!',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
  };

  const getRollApprovalForRoll = (entryId: string, rollId: string): RollApproval | undefined => {
    const entryApprovals = rollApprovals[entryId] || [];
    return entryApprovals.find(approval => approval.fabric_roll_id === rollId);
  };

  const getRollStats = (entryId: string) => {
    const entryApprovals = rollApprovals[entryId] || [];
    const entry = entries.find(e => e.id === entryId);
    const totalRolls = entry?.fabric_rolls?.length || 0;
    const approvedRolls = entryApprovals.filter(a => a.approval_status === 'APPROVED').length;
    const heldRolls = entryApprovals.filter(a => a.approval_status === 'ON_HOLD').length;
    const pendingRolls = totalRolls - entryApprovals.length;
    
    return { totalRolls, approvedRolls, heldRolls, pendingRolls };
  };

  const checkStorage = async () => {
    try {
      const { configured, error } = await checkStorageConfiguration();
      setStorageConfigured(configured);
      
      if (!configured && error) {
        console.warn('Storage configuration issue:', error);
      }
    } catch (error) {
      console.error('Failed to check storage configuration:', error);
      setStorageConfigured(false);
    }
  };

  const handleDebitNoteView = async (debitNoteUrl: string, rollNumber?: string, sellerName?: string) => {
    try {
      // Check storage configuration first
      if (storageConfigured === false) {
        addNotification({
          type: 'error',
          message: 'File storage is not properly configured. Please contact your administrator.',
        });
        return;
      }

      // Directly download the file instead of opening in new tab
      addNotification({
        type: 'info',
        message: 'Downloading debit note...',
      });

      const { data, error } = await downloadDebitNote(debitNoteUrl);
      
      if (error || !data) {
        throw new Error(error || 'Failed to download file');
      }

      // Create blob and download
      const blob = new Blob([data], { type: data.type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = debitNoteUrl.split('/').pop() || 'debit-note';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        message: `Debit note downloaded successfully!`,
      });
    } catch (error) {
      console.error('Download error:', error);
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to download debit note',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Fabric Entries Report</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showRollDetails}
              onChange={(e) => setShowRollDetails(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show Roll Details</span>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by seller, PO, type, color..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_QUALITY">Pending Quality</option>
              <option value="QUALITY_CHECKED">Quality Checked</option>
              <option value="APPROVED">Approved</option>
              <option value="READY_TO_ISSUE">Ready to Issue</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredEntries.length} of {entries.length} entries
        </p>
      </div>

      {/* Entries Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No entries found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {showRollDetails && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller & PO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fabric Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  {showRollDetails && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Summary
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => {
                  const qualityParams = entry.quality_parameters?.[0];
                  const approval = entry.quantity_approvals?.[0];
                  const isExpanded = expandedEntries.has(entry.id);
                  const rollStats = getRollStats(entry.id);
                  
                  return (
                    <React.Fragment key={entry.id}>
                      <tr className="hover:bg-gray-50">
                        {showRollDetails && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.fabric_rolls && entry.fabric_rolls.length > 0 && (
                              <button
                                onClick={() => toggleEntryExpansion(entry.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg
                                  className={`w-5 h-5 transform transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.seller_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              PO: {entry.po_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.fabric_type}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.color}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.quantity_value} {entry.quantity_unit}
                        </td>
                        {showRollDetails && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="text-gray-900">Total: {rollStats.totalRolls}</div>
                              <div className="text-xs text-gray-500">
                                ✅ {rollStats.approvedRolls} | 
                                ❌ {rollStats.heldRolls} | 
                                ⏳ {rollStats.pendingRolls}
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {qualityParams ? (
                            <div className="text-sm">
                              <div>GSM: {qualityParams.gsm_value}</div>
                              <div className="text-gray-500">
                                {qualityParams.width_dia_inches}" | {qualityParams.shrinkage_percent}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not checked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            entry.status === 'APPROVED' || entry.status === 'READY_TO_ISSUE'
                              ? 'bg-green-100 text-green-800'
                              : entry.status === 'ON_HOLD'
                              ? 'bg-red-100 text-red-800'
                              : entry.status === 'QUALITY_CHECKED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.status.replace('_', ' ')}
                          </span>
                          {approval && (
                            <div className="text-xs text-gray-500 mt-1">
                              {approval.approval_status}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.date_inwarded).toLocaleDateString()}
                        </td>
                      </tr>
                      
                      {/* Expanded Roll Details */}
                      {showRollDetails && isExpanded && entry.fabric_rolls && entry.fabric_rolls.length > 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Roll Details</h4>
                              <div className="grid gap-3">
                                {entry.fabric_rolls.map((roll) => {
                                  const rollApproval = getRollApprovalForRoll(entry.id, roll.id);
                                  
                                  return (
                                    <div key={roll.id} className="bg-white border rounded-lg p-4">
                                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">
                                            Roll #{roll.roll_number}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Batch: {roll.batch_number}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sm text-gray-900">
                                            {roll.weight_value} {roll.weight_unit}
                                          </div>
                                          <div className="text-xs text-gray-500">Weight</div>
                                        </div>
                                        <div>
                                          {rollApproval ? (
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              rollApproval.approval_status === 'APPROVED'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                              {rollApproval.approval_status}
                                            </span>
                                          ) : (
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                              Pending
                                            </span>
                                          )}
                                        </div>
                                        {rollApproval?.hold_reason && (
                                          <div>
                                            <div className="text-xs text-gray-500">Hold Reason:</div>
                                            <div className="text-sm text-red-600">
                                              {rollApproval.hold_reason.replace('_', ' ')}
                                            </div>
                                          </div>
                                        )}
                                        {rollApproval?.not_approved_quantity && (
                                          <div>
                                            <div className="text-xs text-gray-500">Not Approved:</div>
                                            <div className="text-sm text-red-600">
                                              {rollApproval.not_approved_quantity} {roll.weight_unit}
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                          {rollApproval?.debit_note_url && (
                                            <button
                                              onClick={() => handleDebitNoteView(rollApproval.debit_note_url!, roll.roll_number, entry.seller_name)}
                                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                                                storageConfigured === false 
                                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                              }`}
                                              title={storageConfigured === false 
                                                ? 'File storage not configured' 
                                                : 'Click to download debit note'
                                              }
                                              disabled={storageConfigured === false}
                                            >
                                              📄 {storageConfigured === false ? 'Storage Error' : 'Download Debit Note'}
                                            </button>
                                          )}
                                          {rollApproval?.approved_by && (
                                            <div className="text-xs text-gray-500">
                                              By: {rollApproval.approved_by}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {rollApproval?.remarks && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                          <div className="text-xs text-gray-500">Remarks:</div>
                                          <div className="text-sm text-gray-700">{rollApproval.remarks}</div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FabricEntriesReport; 