import React, { useEffect, useState } from 'react';
import { getFabricEntries } from '../../../services/fabric.service';
import DebitNoteUpload from './DebitNoteUpload';
import StatusBadge from './StatusBadge';

const ReportsTable: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    getFabricEntries()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEntries(data || []);
      })
      .finally(() => setLoading(false));
  }, [selected]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>All Fabric Entries</h3>
      <table style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Seller</th>
            <th>PO Number</th>
            <th>Color</th>
            <th>Fabric Type</th>
            <th>Received Qty</th>
            <th>Status</th>
            <th>Not Approved Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>{entry.seller_name}</td>
              <td>{entry.po_number}</td>
              <td>{entry.color}</td>
              <td>{entry.fabric_type}</td>
              <td>{entry.quantity_value}</td>
              <td><StatusBadge status={entry.status} /></td>
              <td>{entry.not_approved_quantity || '-'}</td>
              <td>
                {entry.not_approved_quantity > 0 && (
                  <DebitNoteUpload entry={entry} onUploaded={() => setSelected(entry.id)} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsTable; 