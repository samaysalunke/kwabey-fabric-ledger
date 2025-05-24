import React, { useState } from 'react';
import RollRow from './RollRow';
import RibDetails from './RibDetails';
import FileUpload from './FileUpload';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import { QUANTITY_UNITS, FABRIC_TYPES, UAT_UNITS } from '../../../utils/constants';
import { createFabricEntry, createFabricRolls, createRibDetails } from '../../../services/fabric.service';
import { uploadFile } from '../../../services/file.service';
import type { RollRowProps } from './RollRow';
import type { RibDetailsProps } from './RibDetails';
import type { FileUploadProps } from './FileUpload';

const initialRoll = { roll_value: '', roll_unit: 'KG', batch_number: 1 };

type RollType = { roll_value: string; roll_unit: string; batch_number: number };

type RibType = { total_weight?: string; total_rolls?: string };

const InwardForm: React.FC = () => {
  const [form, setForm] = useState({
    seller_name: '',
    quantity_value: '',
    quantity_unit: 'KG',
    color: '',
    fabric_type: 'KNITTED',
    po_number: '',
    fabric_composition: '',
    inwarded_by: '',
    uat_value: '',
    uat_unit: 'KG',
  });
  const [rolls, setRolls] = useState<RollType[]>([{ ...initialRoll }]);
  const [showRib, setShowRib] = useState(false);
  const [rib, setRib] = useState<RibType>({});
  const [ftpFile, setFtpFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real-time validation
  React.useEffect(() => {
    const valid =
      form.seller_name &&
      form.quantity_value &&
      form.color &&
      form.fabric_type &&
      form.po_number &&
      form.fabric_composition &&
      form.inwarded_by &&
      form.uat_value &&
      rolls.length > 0 &&
      rolls.every(r => r.roll_value && r.roll_unit);
    setIsValid(!!valid);
  }, [form, rolls]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddRoll = () => {
    setRolls([...rolls, { ...initialRoll, batch_number: rolls.length + 1 }]);
  };

  const handleRemoveRoll = (idx: number) => {
    if (rolls.length === 1) return;
    setRolls(rolls.filter((_, i) => i !== idx).map((r, i) => ({ ...r, batch_number: i + 1 })));
  };

  const handleRollChange = (idx: number, field: string, value: any) => {
    setRolls(
      rolls.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const handleFtpFile = (file: File | null) => setFtpFile(file);

  const handleRibChange = (field: string, value: any) => {
    setRib({ ...rib, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // 1. Upload FTP file if present
      let ftp_document_url = undefined;
      if (ftpFile) {
        const path = `${Date.now()}_${ftpFile.name}`;
        const { data, error } = await uploadFile(ftpFile, 'ftp-documents', path);
        if (error) throw error;
        ftp_document_url = data?.path ? `https://caateurctsgkeatqalch.supabase.co/storage/v1/object/public/ftp-documents/${data.path}` : undefined;
      }
      // 2. Create fabric entry
      const entryData = {
        ...form,
        quantity_value: Number(form.quantity_value),
        quantity_unit: form.quantity_unit as 'KG' | 'METER',
        fabric_type: form.fabric_type as 'KNITTED' | 'WOVEN',
        uat_value: Number(form.uat_value),
        uat_unit: form.uat_unit as 'KG' | 'METER',
        ftp_document_url,
      };
      const { data: entryRes, error: entryErr } = await createFabricEntry(entryData);
      if (entryErr || !entryRes || !entryRes[0]) throw entryErr || new Error('No entry created');
      const entryId = entryRes[0].id;
      // 3. Create rolls
      const rollsData = rolls.map(r => ({ ...r, roll_value: Number(r.roll_value) }));
      const { error: rollsErr } = await createFabricRolls(entryId, rollsData);
      if (rollsErr) throw rollsErr;
      // 4. Create rib details if present
      const { error: ribErr } = await createRibDetails(entryId, rib);
      if (ribErr) throw ribErr;
      setSuccess(entryId);
      setForm({
        seller_name: '', quantity_value: '', quantity_unit: 'KG', color: '', fabric_type: 'KNITTED', po_number: '', fabric_composition: '', inwarded_by: '', uat_value: '', uat_unit: 'KG',
      });
      setRolls([{ ...initialRoll }]);
      setFtpFile(null);
      setRib({});
    } catch (err: any) {
      setError(err.message || 'Error saving entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {success && <div style={{ color: 'green' }}>Saved! Entry ID: {success}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <Input name="seller_name" placeholder="Seller Name" value={form.seller_name} onChange={handleChange} required />
      <div style={{ display: 'flex', gap: 8 }}>
        <Input name="quantity_value" type="number" placeholder="Quantity" value={form.quantity_value} onChange={handleChange} required />
        <Select name="quantity_unit" value={form.quantity_unit} onChange={handleChange}>
          {QUANTITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </Select>
      </div>
      <Input name="color" placeholder="Color" value={form.color} onChange={handleChange} required />
      <Select name="fabric_type" value={form.fabric_type} onChange={handleChange}>
        {FABRIC_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
      </Select>
      <Input name="po_number" placeholder="PO Number" value={form.po_number} onChange={handleChange} required />
      <Input name="fabric_composition" placeholder="Fabric Composition" value={form.fabric_composition} onChange={handleChange} required />
      <Input name="inwarded_by" placeholder="Inwarded By" value={form.inwarded_by} onChange={handleChange} required />
      <div style={{ display: 'flex', gap: 8 }}>
        <Input name="uat_value" type="number" placeholder="UAT" value={form.uat_value} onChange={handleChange} required />
        <Select name="uat_unit" value={form.uat_unit} onChange={handleChange}>
          {UAT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </Select>
      </div>
      <div>
        <strong>Rolls</strong>
        {rolls.map((roll, idx) => (
          <RollRow
            key={idx}
            index={idx}
            roll={roll}
            onChange={handleRollChange}
            onRemove={handleRemoveRoll}
            canRemove={rolls.length > 1}
          />
        ))}
        <Button type="button" onClick={handleAddRoll}>Add Roll</Button>
      </div>
      <Button type="button" onClick={() => setShowRib(v => !v)}>
        {showRib ? 'Hide Rib Details' : 'Add Rib Details'}
      </Button>
      {showRib && <RibDetails rib={rib} onChange={handleRibChange} />}
      <FileUpload file={ftpFile} onFileChange={handleFtpFile} />
      <Button type="submit" disabled={!isValid || loading}>{loading ? 'Saving...' : 'Save'}</Button>
    </form>
  );
};

export default InwardForm; 