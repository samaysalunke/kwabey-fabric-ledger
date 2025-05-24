import React, { useState } from 'react';
import { approveEntry, holdEntry } from '../../../services/approval.service';
import Button from '../../common/Button';

export type ApprovalFormProps = {
  entry: any;
  onClose: () => void;
};

const ApprovalForm: React.FC<ApprovalFormProps> = ({ entry, onClose }) => {
  const [decision, setDecision] = useState<'APPROVED' | 'ON_HOLD'>('APPROVED');
  const [holdReason, setHoldReason] = useState<'QUANTITY_INSUFFICIENT' | 'MATERIAL_DEFECTIVE' | ''>('');
  const [notApprovedQty, setNotApprovedQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (decision === 'APPROVED') {
        const { error } = await approveEntry(entry.id);
        if (error) throw error;
      } else {
        if (!holdReason) throw new Error('Select a hold reason');
        const details: any = {};
        if (holdReason === 'MATERIAL_DEFECTIVE') {
          if (!notApprovedQty) throw new Error('Enter not approved quantity');
          details.not_approved_quantity = Number(notApprovedQty);
        }
        const { error } = await holdEntry(entry.id, holdReason, details);
        if (error) throw error;
      }
      setSuccess(true);
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setError(err.message || 'Error updating approval');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #eee', padding: 16, borderRadius: 8, marginBottom: 24 }}>
      <h4>Approve or Hold for {entry.seller_name} (PO: {entry.po_number})</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          <input
            type="radio"
            name="decision"
            value="APPROVED"
            checked={decision === 'APPROVED'}
            onChange={() => setDecision('APPROVED')}
          />{' '}
          Approve
        </label>
        <label>
          <input
            type="radio"
            name="decision"
            value="ON_HOLD"
            checked={decision === 'ON_HOLD'}
            onChange={() => setDecision('ON_HOLD')}
          />{' '}
          Hold
        </label>
        {decision === 'ON_HOLD' && (
          <div style={{ marginLeft: 16 }}>
            <label>
              <input
                type="radio"
                name="holdReason"
                value="QUANTITY_INSUFFICIENT"
                checked={holdReason === 'QUANTITY_INSUFFICIENT'}
                onChange={() => setHoldReason('QUANTITY_INSUFFICIENT')}
              />{' '}
              Quantity Insufficient
            </label>
            <label>
              <input
                type="radio"
                name="holdReason"
                value="MATERIAL_DEFECTIVE"
                checked={holdReason === 'MATERIAL_DEFECTIVE'}
                onChange={() => setHoldReason('MATERIAL_DEFECTIVE')}
              />{' '}
              Material Defective
            </label>
            {holdReason === 'MATERIAL_DEFECTIVE' && (
              <div style={{ marginLeft: 16 }}>
                <input
                  type="number"
                  placeholder="Not Approved Quantity"
                  value={notApprovedQty}
                  onChange={e => setNotApprovedQty(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          <Button type="button" onClick={onClose}>Cancel</Button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>Saved!</div>}
      </form>
    </div>
  );
};

export default ApprovalForm; 