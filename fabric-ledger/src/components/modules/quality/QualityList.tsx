import React, { useEffect, useState } from 'react';
import { getEntriesPendingQuality } from '../../../services/quality.service';
import QualityForm from './QualityForm';
import Button from '../../common/Button';

const QualityList: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getEntriesPendingQuality()
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
      <h3>Entries Pending Quality</h3>
      {entries.length === 0 && <div>No entries pending quality.</div>}
      <table style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>Seller</th>
            <th>PO Number</th>
            <th>Color</th>
            <th>Fabric Type</th>
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
              <td>
                <Button type="button" onClick={() => setSelected(entry)}>
                  Add Quality Parameters
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <QualityForm entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default QualityList; 