import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth';

export const RequireAdminAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, ready } = useAdminAuth();
  const location = useLocation();
  if (!ready) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export const AdminProviders: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
};
