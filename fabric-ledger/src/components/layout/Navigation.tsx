import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const tabConfig = [
  { path: '/inward', label: 'Fabric Inward', roles: ['INWARD_CLERK', 'SUPERADMIN'] },
  { path: '/quality', label: 'Quality Approval', roles: ['QUALITY_CHECKER', 'SUPERADMIN'] },
  { path: '/approval', label: 'Quantity Approval', roles: ['APPROVER', 'SUPERADMIN'] },
  { path: '/reports', label: 'Reports', roles: ['INWARD_CLERK', 'QUALITY_CHECKER', 'APPROVER', 'SUPERADMIN'] },
];

const Navigation: React.FC = () => {
  const { user } = useAuthContext();
  if (!user) return null;
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', gap: 24 }}>
      {tabConfig
        .filter(tab => tab.roles.includes(user.role))
        .map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={({ isActive }) => ({
              fontWeight: isActive ? 'bold' : 'normal',
              textDecoration: isActive ? 'underline' : 'none',
              color: isActive ? '#0070f3' : '#222',
            })}
          >
            {tab.label}
          </NavLink>
        ))}
    </nav>
  );
};

export default Navigation; 