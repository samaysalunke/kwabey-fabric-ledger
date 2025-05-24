import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { logout } from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, setUser } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontWeight: 'bold' }}>Fabric Ledger Management System</span>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>{user.email} ({user.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </header>
  );
};

export default Header; 