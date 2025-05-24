import React from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)' }}>
      <div style={{ background: '#fff', margin: '10% auto', padding: 20, maxWidth: 400 }}>
        <button onClick={onClose} style={{ float: 'right' }}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 