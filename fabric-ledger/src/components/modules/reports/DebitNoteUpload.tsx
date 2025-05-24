import React, { useState } from 'react';
import { uploadFile } from '../../../services/file.service';

export type DebitNoteUploadProps = {
  entry: any;
  onUploaded: () => void;
};

const DebitNoteUpload: React.FC<DebitNoteUploadProps> = ({ entry, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const path = `${entry.id}_${file.name}`;
      const { error } = await uploadFile(file, 'debit-notes', path);
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        onUploaded();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error uploading debit note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf,image/png" onChange={handleChange} />
      <button type="button" onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload Debit Note'}
      </button>
      {success && <span style={{ color: 'green', marginLeft: 8 }}>Uploaded!</span>}
      {error && <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>}
    </div>
  );
};

export default DebitNoteUpload; 