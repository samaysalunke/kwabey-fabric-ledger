import React, { useState, useEffect } from 'react';
import { FabricRoll, ApprovalStatus, HoldReason, RollApproval } from '../../../utils/types';
import { APPROVAL_STATUS, HOLD_REASONS } from '../../../utils/constants';
import { updateRollApprovalDebitNote } from '../../../services/approval.service';
import { useApp } from '../../../contexts/AppContext';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { CheckCircle, XCircle, Clock, Upload, Download, FileText, AlertCircle } from 'lucide-react';

interface RollApprovalRowProps {
  roll: FabricRoll;
  batchNumber: number;
  rollApproval?: RollApproval;
  onApprovalChange: (rollId: string, status: string, reason?: string, remarks?: string, notApprovedQuantity?: number, debitNoteFile?: File) => void;
}

const RollApprovalRow: React.FC<RollApprovalRowProps> = ({
  roll,
  batchNumber,
  rollApproval: propRollApproval,
  onApprovalChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [holdReason, setHoldReason] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [notApprovedQuantity, setNotApprovedQuantity] = useState<number | undefined>();
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [processedStatus, setProcessedStatus] = useState<string>('');
  const [rollApproval, setRollApproval] = useState<RollApproval | null>(null);
  const [uploadingDebitNote, setUploadingDebitNote] = useState(false);
  const [debitNoteFile, setDebitNoteFile] = useState<File | null>(null);
  const { addNotification } = useApp();

  useEffect(() => {
    if (propRollApproval) {
      setRollApproval(propRollApproval);
      setIsProcessed(true);
      setProcessedStatus(propRollApproval.approval_status);
    } else {
      setRollApproval(null);
      setIsProcessed(false);
      setProcessedStatus('');
    }
  }, [propRollApproval]);

  const handleApproval = () => {
    if (!selectedStatus) return;
    
    // For hold status, debit note is mandatory
    if (selectedStatus === 'ON_HOLD' && !debitNoteFile) {
      addNotification({
        type: 'error',
        message: 'Debit note is required when putting a roll on hold',
      });
      return;
    }
    
    onApprovalChange(
      roll.id,
      selectedStatus,
      selectedStatus === 'ON_HOLD' ? holdReason : undefined,
      remarks || undefined,
      notApprovedQuantity,
      selectedStatus === 'ON_HOLD' ? debitNoteFile || undefined : undefined
    );
    
    // Reset form
    setSelectedStatus('');
    setHoldReason('');
    setRemarks('');
    setNotApprovedQuantity(undefined);
    setDebitNoteFile(null);
    setShowDetails(false);
  };

  const handleDebitNoteUpload = async (file: File) => {
    if (!rollApproval) return;

    try {
      setUploadingDebitNote(true);
      
      // Upload file to Supabase storage
      const fileName = `debit_notes/rolls/${rollApproval.id}_${Date.now()}_${file.name}`;
      
      // For now, we'll simulate the upload and store the filename
      // In a real implementation, you would upload to Supabase storage:
      // const { data: uploadData, error: uploadError } = await supabase.storage
      //   .from('documents')
      //   .upload(fileName, file);
      
      // Update the roll approval with the debit note URL
      const { error } = await updateRollApprovalDebitNote(rollApproval.id, fileName);
      
      if (error) {
        throw new Error('Failed to update debit note');
      }
      
      addNotification({
        type: 'success',
        message: 'Debit note uploaded successfully',
      });
      
      // The parent component will refresh the data automatically
    } catch (error) {
      addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload debit note',
      });
    } finally {
      setUploadingDebitNote(false);
    }
  };

  const handleDebitNoteFileSelect = (file: File) => {
    setDebitNoteFile(file);
    addNotification({
      type: 'success',
      message: `Debit note "${file.name}" selected`,
    });
  };

  const isHoldFormValid = () => {
    if (selectedStatus !== 'ON_HOLD') return true;
    return holdReason && debitNoteFile;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-medium text-sm">
            {batchNumber}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Roll #{batchNumber}
            </p>
            <p className="text-xs text-gray-500">
              {roll.roll_value} {roll.roll_unit}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isProcessed ? (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              processedStatus === 'APPROVED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {processedStatus === 'APPROVED' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {processedStatus === 'APPROVED' ? 'Approved' : 'On Hold'}
            </div>
          ) : !showDetails ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedStatus('APPROVED');
                  setShowDetails(true);
                }}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedStatus('ON_HOLD');
                  setShowDetails(true);
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Hold
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleApproval}
                disabled={!selectedStatus || !isHoldFormValid()}
                className={selectedStatus === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                Confirm {selectedStatus === 'APPROVED' ? 'Approval' : 'Hold'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowDetails(false);
                  setSelectedStatus('');
                  setHoldReason('');
                  setRemarks('');
                  setNotApprovedQuantity(undefined);
                  setDebitNoteFile(null);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Debit Note Section for Processed Rolls on Hold */}
      {isProcessed && processedStatus === 'ON_HOLD' && rollApproval && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Debit Note</span>
            </div>
            <div className="flex items-center space-x-2">
              {rollApproval.debit_note_url ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Download/view debit note
                    window.open(rollApproval.debit_note_url, '_blank');
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  View
                </Button>
              ) : (
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleDebitNoteUpload(file);
                      }
                    }}
                    className="hidden"
                    id={`debit-note-roll-${roll.id}`}
                  />
                  <label htmlFor={`debit-note-roll-${roll.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={uploadingDebitNote}
                      asChild
                    >
                      <span className="cursor-pointer">
                        {uploadingDebitNote ? (
                          <>
                            <Clock className="h-4 w-4 mr-1 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>
          {rollApproval.hold_reason && (
            <p className="mt-2 text-xs text-gray-500">
              Hold Reason: {rollApproval.hold_reason.replace('_', ' ')}
            </p>
          )}
        </div>
      )}

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {selectedStatus === 'ON_HOLD' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hold Reason *
                </label>
                <Select value={holdReason} onValueChange={setHoldReason}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select hold reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOLD_REASONS.map(reason => (
                      <SelectItem key={reason} value={reason}>
                        {reason === 'QUANTITY_INSUFFICIENT' ? 'Quantity Insufficient' : 'Material Defective'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mandatory Debit Note Upload for Hold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center space-x-1">
                    <span>Debit Note *</span>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleDebitNoteFileSelect(file);
                      }
                    }}
                    className="hidden"
                    id={`hold-debit-note-${roll.id}`}
                  />
                  <label htmlFor={`hold-debit-note-${roll.id}`} className="flex-1">
                    <div className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                      debitNoteFile 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-red-300 bg-red-50 hover:border-red-400'
                    }`}>
                      {debitNoteFile ? (
                        <div className="flex items-center justify-center space-x-2 text-green-700">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">{debitNoteFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2 text-red-600">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Click to upload debit note (Required)</span>
                        </div>
                      )}
                    </div>
                  </label>
                  {debitNoteFile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDebitNoteFile(null)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-xs text-red-600">
                  A debit note is mandatory when putting a roll on hold
                </p>
              </div>
            </>
          )}

          {(selectedStatus === 'ON_HOLD' && (holdReason === 'QUANTITY_INSUFFICIENT' || holdReason === 'MATERIAL_DEFECTIVE')) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Not Approved Quantity (Optional)
              </label>
              <div className="flex">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={roll.roll_value}
                  value={notApprovedQuantity || ''}
                  onChange={(e) => setNotApprovedQuantity(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g., 0.5"
                  className="flex-1 rounded-r-none"
                />
                <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md">
                  {roll.roll_unit}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to hold the full quantity ({roll.roll_value} {roll.roll_unit})
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (Optional)
            </label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="Add any additional notes..."
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RollApprovalRow; 