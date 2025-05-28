import React from 'react';
import FabricEntriesReport from '../components/modules/reports/FabricEntriesReport';

const ReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">
          Comprehensive fabric entries report and inventory insights.
        </p>
      </div>

      {/* Fabric Entries Report */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <FabricEntriesReport />
        </div>
      </div>
    </div>
  );
};

export default ReportsModule; 