import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import { getFabricEntryWithQuality, createRollApproval, getRollApprovals, checkAndUpdateFabricEntryStatus } from '../../../services/approval.service';
import { FabricEntry, QualityParameters, FabricRoll, RollApproval } from '../../../utils/types';
import RollApprovalRow from './RollApprovalRow';
import { Button } from '../../ui/button';

interface ApprovalFormProps {
  fabricEntryId: string;
  onApprovalAdded: () => void;
}

interface FabricEntryWithQuality extends FabricEntry {
  quality_parameters?: QualityParameters[];
  fabric_rolls?: FabricRoll[];
}

const ApprovalForm: React.FC<ApprovalFormProps> = ({ fabricEntryId, onApprovalAdded }) => {
  const [fabricEntry, setFabricEntry] = useState<FabricEntryWithQuality | null>(null);
  const [rollApprovals, setRollApprovals] = useState<RollApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const { addNotification } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    fetchFabricEntry();
    fetchRollApprovals();
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

  const fetchRollApprovals = async () => {
    try {
      const { data, error } = await getRollApprovals(fabricEntryId);
      if (error) {
        console.error('Error fetching roll approvals:', error);
        setRollApprovals([]);
      } else {
        setRollApprovals(data || []);
      }
    } catch (error) {
      console.error('Error fetching roll approvals:', error);
      setRollApprovals([]);
    }
  };

  const handleRollApproval = async (rollId: string, status: string, reason?: string, remarks?: string, notApprovedQuantity?: number, debitNoteFile?: File) => {
    try {
      const rollApprovalData: any = {
        approval_status: status as any,
        hold_reason: status === 'ON_HOLD' ? reason as any : undefined,
        approved_by: user?.email || '',
        remarks: remarks,
      };

      // Only add not_approved_quantity if it has a value (to avoid column errors)
      if (notApprovedQuantity !== undefined && notApprovedQuantity !== null) {
        rollApprovalData.not_approved_quantity = notApprovedQuantity;
      }

      // Handle debit note upload for holds
      if (status === 'ON_HOLD' && debitNoteFile) {
        // Generate a unique filename for the debit note
        const fileName = `debit_notes/rolls/${rollId}_${Date.now()}_${debitNoteFile.name}`;
        rollApprovalData.debit_note_url = fileName;
        
        // In a real implementation, you would upload to Supabase storage here:
        // const { data: uploadData, error: uploadError } = await supabase.storage
        //   .from('documents')
        //   .upload(fileName, debitNoteFile);
        // 
        // if (uploadError) {
        //   throw new Error('Failed to upload debit note');
        // }
        
        console.log('Debit note file uploaded:', fileName);
      }

      const { error } = await createRollApproval(rollId, rollApprovalData);
      if (error) {
        throw new Error(error.message);
      }

      addNotification({
        type: 'success',
        message: status === 'ON_HOLD' 
          ? `Roll put on hold with debit note successfully!`
          : `Roll ${status.toLowerCase()} successfully!`,
      });

      // Refresh both fabric entry and roll approvals
      await Promise.all([fetchFabricEntry(), fetchRollApprovals()]);

      // Check if all rolls are processed and update fabric entry status
      console.log('Checking completion status for fabric entry:', fabricEntryId);
      const statusResult = await checkAndUpdateFabricEntryStatus(fabricEntryId);
      console.log('Status check result:', statusResult);
      
      if (statusResult.success && statusResult.allProcessed) {
        setIsCompleted(true);
        addNotification({
          type: 'success',
          message: `All rolls processed! Fabric entry status updated to ${statusResult.finalStatus}`,
        });
        
        // Notify parent to refresh the approval list (this will remove completed entries)
        setTimeout(() => {
          onApprovalAdded();
        }, 2000); // Give user time to see the completion message
      } else if (statusResult.success) {
        console.log('Not all rolls processed yet:', statusResult.message);
      } else {
        console.error('Failed to check status:', statusResult.message);
      }

    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to process roll approval',
      });
    }
  };

  // Manual completion check function for debugging
  const handleManualCompletionCheck = async () => {
    try {
      console.log('Manual completion check for fabric entry:', fabricEntryId);
      const statusResult = await checkAndUpdateFabricEntryStatus(fabricEntryId);
      console.log('Manual status check result:', statusResult);
      
      addNotification({
        type: 'info',
        message: `Status check: ${statusResult.message}`,
      });

      if (statusResult.success && statusResult.allProcessed) {
        setIsCompleted(true);
        addNotification({
          type: 'success',
          message: `Fabric entry completed! Status: ${statusResult.finalStatus}`,
        });
        
        setTimeout(() => {
          onApprovalAdded();
        }, 2000);
      }
    } catch (error) {
      console.error('Manual completion check error:', error);
      addNotification({
        type: 'error',
        message: 'Failed to check completion status',
      });
    }
  };

  const getRollApprovalForRoll = (rollId: string): RollApproval | undefined => {
    return rollApprovals.find(approval => approval.fabric_roll_id === rollId);
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

  // Show completion message when all rolls are processed
  if (isCompleted) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Rolls Processed!</h3>
          <p className="text-sm text-gray-500 mb-4">
            This fabric entry has been completed and will be removed from the approval queue.
          </p>
          <div className="text-xs text-gray-400">
            Redirecting in a moment...
          </div>
        </div>
      </div>
    );
  }

  const qualityParams = fabricEntry.quality_parameters?.[0];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Roll-Level Quantity Approval</h2>

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

      {/* Individual Rolls - Roll-Level Approval Only */}
      {fabricEntry.fabric_rolls && fabricEntry.fabric_rolls.length > 0 ? (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Roll-Level Approval</h3>
            <Button 
              onClick={handleManualCompletionCheck}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🔄 Check Completion
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Approve or hold each roll individually. All rolls must be processed to complete the fabric entry approval.
          </p>
          <div className="space-y-3">
            {fabricEntry.fabric_rolls.map((roll, index) => {
              const rollApproval = getRollApprovalForRoll(roll.id);
              return (
                <RollApprovalRow
                  key={`${roll.id}-${rollApproval?.approval_status || 'pending'}`}
                  roll={roll}
                  batchNumber={roll.batch_number}
                  rollApproval={rollApproval}
                  onApprovalChange={(rollId: string, status: string, reason?: string, remarks?: string, notApprovedQuantity?: number, debitNoteFile?: File) => {
                    handleRollApproval(rollId, status, reason, remarks, notApprovedQuantity, debitNoteFile);
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 text-center">
          <p className="text-gray-500">No rolls found for this fabric entry.</p>
        </div>
      )}
    </div>
  );
};

export default ApprovalForm; 