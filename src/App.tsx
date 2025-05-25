import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InwardModule from './pages/InwardModule';
import QualityModule from './pages/QualityModule';
import ApprovalModule from './pages/ApprovalModule';
import ReportsModule from './pages/ReportsModule';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => (
  <AuthProvider>
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/inward"
              element={
                <ProtectedRoute roles={['INWARD_CLERK', 'SUPERADMIN']}>
                  <InwardModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quality"
              element={
                <ProtectedRoute roles={['QUALITY_CHECKER', 'SUPERADMIN']}>
                  <QualityModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approval"
              element={
                <ProtectedRoute roles={['APPROVER', 'SUPERADMIN']}>
                  <ApprovalModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={['INWARD_CLERK', 'QUALITY_CHECKER', 'APPROVER', 'SUPERADMIN']}>
                  <ReportsModule />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AppProvider>
  </AuthProvider>
);

export default App; 