import React from 'react';

export type FileUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ file, onFileChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };
  return (
    <div style={{ margin: '1rem 0' }}>
      <label>
        Attach FTP (PDF):
        <input type="file" accept="application/pdf" onChange={handleChange} />
      </label>
      {file && (
        <div style={{ marginTop: 8 }}>
          <span>{file.name}</span>
          <button type="button" onClick={() => onFileChange(null)} style={{ marginLeft: 8 }}>Remove</button>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 