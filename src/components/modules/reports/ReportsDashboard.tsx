import React, { useState, useEffect } from 'react';
import { getReportsData } from '../../../services/reports.service';
import { useApp } from '../../../contexts/AppContext';

interface DashboardStats {
  totalEntries: number;
  pendingQuality: number;
  qualityChecked: number;
  readyToIssue: number;
  onHold: number;
  totalQuantity: number;
  averageGSM: number;
  recentEntries: any[];
}

const ReportsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useApp();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await getReportsData();
      
      if (error) {
        throw new Error(error.message);
      }

      setStats(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const statusCards = [
    {
      title: 'Total Entries',
      value: stats.totalEntries,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Quality',
      value: stats.pendingQuality,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Ready to Issue',
      value: stats.readyToIssue,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'On Hold',
      value: stats.onHold,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const summaryCards = [
    {
      title: 'Total Quantity',
      value: `${stats.totalQuantity.toFixed(2)} KG`,
      description: 'Across all entries',
    },
    {
      title: 'Average GSM',
      value: stats.averageGSM ? `${stats.averageGSM.toFixed(1)}` : 'N/A',
      description: 'Quality checked entries',
    },
    {
      title: 'Quality Checked',
      value: stats.qualityChecked,
      description: 'Entries processed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusCards.map((card) => (
            <div key={card.title} className={`${card.bgColor} rounded-lg p-6`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${card.color} rounded-md flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{card.value}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryCards.map((card) => (
            <div key={card.title} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">{card.title}</p>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Entries</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {stats.recentEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent entries found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PO Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
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
                  {stats.recentEntries.slice(0, 5).map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.seller_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.po_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.quantity_value} {entry.quantity_unit}
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.date_inwarded).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard; 