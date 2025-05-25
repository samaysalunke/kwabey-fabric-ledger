import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { qualityParamsSchema } from '../../../utils/validation';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import { createQualityParameters, getFabricEntryById } from '../../../services/quality.service';
import { updateFabricEntry } from '../../../services/fabric.service';
import { FabricEntry } from '../../../utils/types';
import { COLOR_FASTNESS } from '../../../utils/constants';

interface QualityFormData {
  gsm_value: number;
  width_dia_inches: number;
  shrinkage_percent: number;
  color_fastness: string;
  remarks?: string;
}

interface QualityFormProps {
  fabricEntryId: string;
  onQualityAdded: () => void;
}

const QualityForm: React.FC<QualityFormProps> = ({ fabricEntryId, onQualityAdded }) => {
  const [fabricEntry, setFabricEntry] = useState<FabricEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useApp();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QualityFormData>({
    resolver: yupResolver(qualityParamsSchema),
  });

  useEffect(() => {
    fetchFabricEntry();
  }, [fabricEntryId]);

  const fetchFabricEntry = async () => {
    try {
      setLoading(true);
      const { data, error } = await getFabricEntryById(fabricEntryId);
      
      if (error) {
        throw new Error(error.message);
      }

      setFabricEntry(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch fabric entry',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: QualityFormData) => {
    setIsSubmitting(true);
    try {
      // Create quality parameters
      const qualityData = {
        fabric_entry_id: fabricEntryId,
        gsm_value: data.gsm_value,
        width_dia_inches: data.width_dia_inches,
        shrinkage_percent: data.shrinkage_percent,
        color_fastness: data.color_fastness as any,
        checked_by: user?.email || '',
        remarks: data.remarks,
      };

      const { error: qualityError } = await createQualityParameters(qualityData);
      if (qualityError) {
        throw new Error(qualityError.message);
      }

      // Update fabric entry status
      const { error: updateError } = await updateFabricEntry(fabricEntryId, {
        status: 'QUALITY_CHECKED' as any,
      });
      if (updateError) {
        throw new Error(updateError.message);
      }

      addNotification({
        type: 'success',
        message: 'Quality parameters added successfully!',
      });

      reset();
      onQualityAdded();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add quality parameters',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!fabricEntry) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load fabric entry details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Add Quality Parameters</h2>

      {/* Fabric Entry Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fabric Entry Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Seller:</span>
            <span className="ml-2 font-medium">{fabricEntry.seller_name}</span>
          </div>
          <div>
            <span className="text-gray-500">PO:</span>
            <span className="ml-2 font-medium">{fabricEntry.po_number}</span>
          </div>
          <div>
            <span className="text-gray-500">Quantity:</span>
            <span className="ml-2 font-medium">{fabricEntry.quantity_value} {fabricEntry.quantity_unit}</span>
          </div>
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 font-medium">{fabricEntry.fabric_type}</span>
          </div>
          <div>
            <span className="text-gray-500">Color:</span>
            <span className="ml-2 font-medium">{fabricEntry.color}</span>
          </div>
          <div>
            <span className="text-gray-500">Date:</span>
            <span className="ml-2 font-medium">{new Date(fabricEntry.date_inwarded).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quality Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GSM Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GSM Value *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('gsm_value')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 180.50"
            />
            {errors.gsm_value && (
              <p className="mt-1 text-sm text-red-600">{errors.gsm_value.message}</p>
            )}
          </div>

          {/* Width/DIA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width/DIA (inches) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('width_dia_inches')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 58.00"
            />
            {errors.width_dia_inches && (
              <p className="mt-1 text-sm text-red-600">{errors.width_dia_inches.message}</p>
            )}
          </div>

          {/* Shrinkage Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shrinkage % *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('shrinkage_percent')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 3.50"
            />
            {errors.shrinkage_percent && (
              <p className="mt-1 text-sm text-red-600">{errors.shrinkage_percent.message}</p>
            )}
          </div>

          {/* Color Fastness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Fastness *
            </label>
            <select
              {...register('color_fastness')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select color fastness</option>
              {COLOR_FASTNESS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.color_fastness && (
              <p className="mt-1 text-sm text-red-600">{errors.color_fastness.message}</p>
            )}
          </div>
        </div>

        {/* Checked By (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Checked By
          </label>
          <input
            type="text"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks (Optional)
          </label>
          <textarea
            {...register('remarks')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any additional notes about the quality check..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Quality Parameters'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QualityForm; 