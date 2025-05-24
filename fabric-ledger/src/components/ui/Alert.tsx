import React from 'react';

type AlertProps = {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
};

const Alert: React.FC<AlertProps> = ({ message, type = 'info' }) => (
  <div style={{ padding: 12, background: '#f5f5f5', borderLeft: `4px solid ${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'blue'}` }}>
    {message}
  </div>
);

export default Alert; 