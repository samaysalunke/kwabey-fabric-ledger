import React, { useState, useEffect } from 'react';
import ReportsDashboard from '../components/modules/reports/ReportsDashboard';
import FabricEntriesReport from '../components/modules/reports/FabricEntriesReport';
import { useApp } from '../contexts/AppContext';

type ReportView = 'dashboard' | 'entries' | 'analytics';

const ReportsModule: React.FC = () => {
  const [activeView, setActiveView] = useState<ReportView>('dashboard');
  const { addNotification } = useApp();

  const reportTabs = [
    {
      id: 'dashboard' as ReportView,
      name: 'Dashboard',
      description: 'Overview and key metrics',
    },
    {
      id: 'entries' as ReportView,
      name: 'Fabric Entries',
      description: 'Detailed entries report',
    },
    {
      id: 'analytics' as ReportView,
      name: 'Analytics',
      description: 'Charts and insights',
    },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <ReportsDashboard />;
      case 'entries':
        return <FabricEntriesReport />;
      case 'analytics':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Analytics Coming Soon</h3>
              <p className="mt-1 text-sm text-gray-500">
                Advanced charts and analytics will be available in the next update.
              </p>
            </div>
          </div>
        );
      default:
        return <ReportsDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">
          Comprehensive insights into your fabric inventory and workflow performance.
        </p>
      </div>

      {/* Report Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Active View Content */}
        <div className="p-6">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

export default ReportsModule; 