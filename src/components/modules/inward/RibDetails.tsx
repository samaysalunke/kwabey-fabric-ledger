import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface InwardFormData {
  seller_name: string;
  quantity_value: number;
  quantity_unit: string;
  color: string;
  fabric_type: string;
  po_number: string;
  fabric_composition: string;
  inwarded_by: string;
  uat_value: number;
  uat_unit: string;
  rolls: Array<{
    roll_value: number;
    roll_unit: string;
  }>;
  rib_details?: {
    total_weight?: number;
    total_rolls?: number;
  };
  ftp_document?: File;
}

interface RibDetailsProps {
  register: UseFormRegister<InwardFormData>;
  errors: FieldErrors<InwardFormData>;
  onClose: () => void;
}

const RibDetails: React.FC<RibDetailsProps> = ({ register, errors, onClose }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Rib Details</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md"
          title="Close rib details"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Weight
          </label>
          <input
            type="number"
            step="0.01"
            {...register('rib_details.total_weight')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
          {errors.rib_details?.total_weight && (
            <p className="mt-1 text-sm text-red-600">
              {errors.rib_details?.total_weight?.message}
            </p>
          )}
        </div>

        {/* Total Rolls */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Rolls
          </label>
          <input
            type="number"
            {...register('rib_details.total_rolls')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
          {errors.rib_details?.total_rolls && (
            <p className="mt-1 text-sm text-red-600">
              {errors.rib_details?.total_rolls?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RibDetails; 