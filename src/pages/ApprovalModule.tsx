import React, { useState } from 'react';
import ApprovalForm from '../components/modules/approval/ApprovalForm';
import ApprovalList from '../components/modules/approval/ApprovalList';

const ApprovalModule: React.FC = () => {
  const [selectedFabricEntry, setSelectedFabricEntry] = useState<string | null>(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleApprovalAdded = () => {
    setSelectedFabricEntry(null);
    setRefreshList(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quantity Approval</h1>
        <p className="text-gray-600">
          Approve or hold fabric quantities that have passed quality check.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fabric Entries List */}
        <div className="lg:col-span-1">
          <ApprovalList 
            selectedEntryId={selectedFabricEntry}
            onSelectEntry={setSelectedFabricEntry}
            refreshTrigger={refreshList}
          />
        </div>

        {/* Approval Form */}
        <div className="lg:col-span-1">
          {selectedFabricEntry ? (
            <ApprovalForm 
              fabricEntryId={selectedFabricEntry}
              onApprovalAdded={handleApprovalAdded}
            />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No fabric entry selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a fabric entry from the list to approve or hold quantities.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalModule; 