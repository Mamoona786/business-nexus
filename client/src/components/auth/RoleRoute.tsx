import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RoleRouteProps {
  allowedRole: UserRole;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor'}
        replace
      />
    );
  }

  return <Outlet />;
};
