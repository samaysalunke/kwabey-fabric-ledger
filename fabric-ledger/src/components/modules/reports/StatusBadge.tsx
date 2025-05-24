import React from 'react';

export type StatusBadgeProps = {
  status: 'PENDING_QUALITY' | 'READY_TO_ISSUE' | 'ON_HOLD' | string;
};

const statusColors: Record<string, string> = {
  PENDING_QUALITY: '#fbbf24', // yellow
  READY_TO_ISSUE: '#22c55e', // green
  ON_HOLD: '#ef4444', // red
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span style={{
    background: statusColors[status] || '#e5e7eb',
    color: '#222',
    borderRadius: 8,
    padding: '2px 10px',
    fontWeight: 500,
    fontSize: 13,
  }}>
    {status.replace(/_/g, ' ')}
  </span>
);

export default StatusBadge; 