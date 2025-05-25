import React, { useState, useEffect } from 'react';
import { getFabricEntriesWithDetails } from '../../../services/reports.service';
import { FabricEntry } from '../../../utils/types';
import { useApp } from '../../../contexts/AppContext';

interface FabricEntryWithDetails extends FabricEntry {
  quality_parameters?: any[];
  quantity_approvals?: any[];
  fabric_rolls?: any[];
}

const FabricEntriesReport: React.FC = () => {
  const [entries, setEntries] = useState<FabricEntryWithDetails[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<FabricEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { addNotification } = useApp();

  useEffect(() => {
    fetchEntries();
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
    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch fabric entries',
      });
    } finally {
      setLoading(false);
    }
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
    const headers = [
      'Seller Name',
      'PO Number',
      'Quantity',
      'Unit',
      'Color',
      'Fabric Type',
      'Status',
      'Date Inwarded',
      'GSM',
      'Width/DIA',
      'Shrinkage %',
      'Color Fastness',
      'Approval Status'
    ];

    const csvData = filteredEntries.map(entry => [
      entry.seller_name,
      entry.po_number,
      entry.quantity_value,
      entry.quantity_unit,
      entry.color,
      entry.fabric_type,
      entry.status,
      new Date(entry.date_inwarded).toLocaleDateString(),
      entry.quality_parameters?.[0]?.gsm_value || '',
      entry.quality_parameters?.[0]?.width_dia_inches || '',
      entry.quality_parameters?.[0]?.shrinkage_percent || '',
      entry.quality_parameters?.[0]?.color_fastness || '',
      entry.quantity_approvals?.[0]?.approval_status || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fabric-entries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller & PO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fabric Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
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
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
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
                          entry.status === 'READY_TO_ISSUE' 
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