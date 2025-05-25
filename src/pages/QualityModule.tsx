import React, { useState } from 'react';
import QualityForm from '../components/modules/quality/QualityForm';
import QualityList from '../components/modules/quality/QualityList';

const QualityModule: React.FC = () => {
  const [selectedFabricEntry, setSelectedFabricEntry] = useState<string | null>(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleQualityAdded = () => {
    setSelectedFabricEntry(null);
    setRefreshList(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quality Parameters</h1>
        <p className="text-gray-600">
          Add quality parameters to fabric entries that are pending quality check.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fabric Entries List */}
        <div className="lg:col-span-1">
          <QualityList 
            selectedEntryId={selectedFabricEntry}
            onSelectEntry={setSelectedFabricEntry}
            refreshTrigger={refreshList}
          />
        </div>

        {/* Quality Form */}
        <div className="lg:col-span-1">
          {selectedFabricEntry ? (
            <QualityForm 
              fabricEntryId={selectedFabricEntry}
              onQualityAdded={handleQualityAdded}
            />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No fabric entry selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a fabric entry from the list to add quality parameters.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityModule;
