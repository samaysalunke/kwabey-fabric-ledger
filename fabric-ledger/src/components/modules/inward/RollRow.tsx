import React from 'react';
import Select from '../../common/Select';
import Input from '../../common/Input';
import { QUANTITY_UNITS } from '../../../utils/constants';

export type RollRowProps = {
  index: number;
  roll: { roll_value: string; roll_unit: string; batch_number: number };
  onChange: (idx: number, field: string, value: any) => void;
  onRemove: (idx: number) => void;
  canRemove: boolean;
};

const RollRow: React.FC<RollRowProps> = ({ index, roll, onChange, onRemove, canRemove }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
    <Input
      type="number"
      placeholder="Roll Quantity"
      value={roll.roll_value}
      onChange={e => onChange(index, 'roll_value', e.target.value)}
      required
      style={{ width: 120 }}
    />
    <Select
      value={roll.roll_unit}
      onChange={e => onChange(index, 'roll_unit', e.target.value)}
      style={{ width: 80 }}
    >
      {QUANTITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
    </Select>
    <span>Batch #{roll.batch_number}</span>
    {canRemove && (
      <button type="button" onClick={() => onRemove(index)} style={{ color: 'red' }}>X</button>
    )}
  </div>
);

export default RollRow; 