import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { approvalSchema } from '../../../utils/validation';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import { createQuantityApproval, getFabricEntryWithQuality } from '../../../services/approval.service';
import { updateFabricEntry } from '../../../services/fabric.service';
import { FabricEntry, QualityParameters } from '../../../utils/types';
import { APPROVAL_STATUS, HOLD_REASONS } from '../../../utils/constants';

interface ApprovalFormData {
  approval_status: string;
  hold_reason?: string;
  not_approved_quantity?: number;
  remarks?: string;
}

interface ApprovalFormProps {
  fabricEntryId: string;
  onApprovalAdded: () => void;
}

interface FabricEntryWithQuality extends FabricEntry {
  quality_parameters?: QualityParameters[];
}

const ApprovalForm: React.FC<ApprovalFormProps> = ({ fabricEntryId, onApprovalAdded }) => {
  const [fabricEntry, setFabricEntry] = useState<FabricEntryWithQuality | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useApp();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ApprovalFormData>({
    resolver: yupResolver(approvalSchema),
  });

  const approvalStatus = useWatch({
    control,
    name: 'approval_status',
  });

  useEffect(() => {
    fetchFabricEntry();
  }, [fabricEntryId]);

  const fetchFabricEntry = async () => {
    try {
      setLoading(true);
      const { data, error } = await getFabricEntryWithQuality(fabricEntryId);
      
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

  const onSubmit = async (data: ApprovalFormData) => {
    setIsSubmitting(true);
    try {
      // Create quantity approval
      const approvalData = {
        fabric_entry_id: fabricEntryId,
        approval_status: data.approval_status as any,
        hold_reason: data.approval_status === 'ON_HOLD' ? data.hold_reason as any : undefined,
        not_approved_quantity: data.not_approved_quantity || undefined,
        approved_by: user?.email || '',
        remarks: data.remarks,
      };

      const { error: approvalError } = await createQuantityApproval(approvalData);
      if (approvalError) {
        throw new Error(approvalError.message);
      }

      // Update fabric entry status
      const newStatus = data.approval_status === 'APPROVED' ? 'READY_TO_ISSUE' : 'ON_HOLD';
      const { error: updateError } = await updateFabricEntry(fabricEntryId, {
        status: newStatus as any,
      });
      if (updateError) {
        throw new Error(updateError.message);
      }

      addNotification({
        type: 'success',
        message: `Fabric quantity ${data.approval_status.toLowerCase()} successfully!`,
      });

      reset();
      onApprovalAdded();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to process approval',
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

  const qualityParams = fabricEntry.quality_parameters?.[0];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Quantity Approval</h2>

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

      {/* Quality Parameters Summary */}
      {qualityParams && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Quality Parameters</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">GSM:</span>
              <span className="ml-2 font-medium">{qualityParams.gsm_value}</span>
            </div>
            <div>
              <span className="text-gray-500">Width/DIA:</span>
              <span className="ml-2 font-medium">{qualityParams.width_dia_inches}"</span>
            </div>
            <div>
              <span className="text-gray-500">Shrinkage:</span>
              <span className="ml-2 font-medium">{qualityParams.shrinkage_percent}%</span>
            </div>
            <div>
              <span className="text-gray-500">Color Fastness:</span>
              <span className={`ml-2 font-medium ${
                qualityParams.color_fastness === 'OKAY' ? 'text-green-600' : 'text-red-600'
              }`}>
                {qualityParams.color_fastness}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Checked by:</span>
              <span className="ml-2 font-medium">{qualityParams.checked_by}</span>
            </div>
          </div>
        </div>
      )}

      {/* Approval Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Approval Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approval Status *
          </label>
          <select
            {...register('approval_status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Select approval status</option>
            {APPROVAL_STATUS.map(status => (
              <option key={status} value={status}>
                {status === 'APPROVED' ? 'Approve' : 'Hold'}
              </option>
            ))}
          </select>
          {errors.approval_status && (
            <p className="mt-1 text-sm text-red-600">{errors.approval_status.message}</p>
          )}
        </div>

        {/* Hold Reason (conditional) */}
        {approvalStatus === 'ON_HOLD' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hold Reason *
            </label>
            <select
              {...register('hold_reason')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select hold reason</option>
              {HOLD_REASONS.map(reason => (
                <option key={reason} value={reason}>
                  {reason === 'QUANTITY_INSUFFICIENT' ? 'Quantity Insufficient' : 'Material Defective'}
                </option>
              ))}
            </select>
            {errors.hold_reason && (
              <p className="mt-1 text-sm text-red-600">{errors.hold_reason.message}</p>
            )}
          </div>
        )}

        {/* Not Approved Quantity (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Not Approved Quantity (Optional)
          </label>
          <div className="flex">
            <input
              type="number"
              step="0.01"
              min="0"
              max={fabricEntry.quantity_value}
              {...register('not_approved_quantity')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., 10.50"
            />
            <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
              {fabricEntry.quantity_unit}
            </span>
          </div>
          {errors.not_approved_quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.not_approved_quantity.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to approve/hold the full quantity ({fabricEntry.quantity_value} {fabricEntry.quantity_unit})
          </p>
        </div>

        {/* Approved By (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approved By
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Add any additional notes about the approval decision..."
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
            className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              approvalStatus === 'APPROVED'
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : approvalStatus === 'ON_HOLD'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
            }`}
          >
            {isSubmitting 
              ? 'Processing...' 
              : approvalStatus === 'APPROVED' 
                ? 'Approve Quantity' 
                : approvalStatus === 'ON_HOLD'
                ? 'Hold Quantity'
                : 'Submit Decision'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApprovalForm; 