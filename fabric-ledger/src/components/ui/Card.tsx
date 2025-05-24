import React from 'react';

type CardProps = {
  children: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ children }) => (
  <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, margin: 8 }}>{children}</div>
);

export default Card; 