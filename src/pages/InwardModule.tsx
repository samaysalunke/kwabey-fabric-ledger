import React from 'react';
import InwardForm from '../components/modules/inward/InwardForm';

const InwardModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fabric Inward</h1>
        <p className="text-gray-600">
          Add new fabric entries to the system with roll details and optional attachments.
        </p>
      </div>
      
      <InwardForm />
    </div>
  );
};

export default InwardModule; 