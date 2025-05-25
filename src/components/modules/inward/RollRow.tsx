import React from 'react';
import { UseFormRegister, FieldErrors, FieldError } from 'react-hook-form';
import { ROLL_UNITS } from '../../../utils/constants';

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

interface RollRowProps {
  index: number;
  register: UseFormRegister<InwardFormData>;
  errors: FieldErrors<InwardFormData>;
  onRemove: () => void;
  canRemove: boolean;
  batchNumber: number;
}

const RollRow: React.FC<RollRowProps> = ({
  index,
  register,
  errors,
  onRemove,
  canRemove,
  batchNumber,
}) => {
  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-md bg-gray-50">
      {/* Batch Number */}
      <div className="flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Batch #
        </label>
        <div className="w-16 px-3 py-2 bg-white border border-gray-300 rounded-md text-center text-gray-600">
          {batchNumber}
        </div>
      </div>

      {/* Roll Value */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Roll Value *
        </label>
        <input
          type="number"
          step="0.01"
          {...register(`rolls.${index}.roll_value`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.00"
        />
        {errors.rolls?.[index]?.roll_value && (
          <p className="mt-1 text-sm text-red-600">
            {errors.rolls?.[index]?.roll_value?.message}
          </p>
        )}
      </div>

      {/* Roll Unit */}
      <div className="flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit *
        </label>
        <select
          {...register(`rolls.${index}.roll_unit`)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {ROLL_UNITS.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
        {errors.rolls?.[index]?.roll_unit && (
          <p className="mt-1 text-sm text-red-600">
            {errors.rolls?.[index]?.roll_unit?.message}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <div className="flex-shrink-0">
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-6 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title="Remove roll"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default RollRow; 