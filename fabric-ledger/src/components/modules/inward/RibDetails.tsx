import React from 'react';
import Input from '../../common/Input';

type RibType = { total_weight?: string; total_rolls?: string };

export type RibDetailsProps = {
  rib: RibType;
  onChange: (field: string, value: any) => void;
};

const RibDetails: React.FC<RibDetailsProps> = ({ rib, onChange }) => (
  <div style={{ border: '1px solid #eee', padding: 12, margin: '12px 0', borderRadius: 6 }}>
    <h4>Rib Details</h4>
    <Input
      type="number"
      placeholder="Total Weight"
      value={rib.total_weight || ''}
      onChange={e => onChange('total_weight', e.target.value)}
      style={{ marginBottom: 8 }}
    />
    <Input
      type="number"
      placeholder="Total Rolls"
      value={rib.total_rolls || ''}
      onChange={e => onChange('total_rolls', e.target.value)}
    />
  </div>
);

export default RibDetails; 