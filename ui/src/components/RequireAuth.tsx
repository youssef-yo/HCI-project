import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';

export type RequireAuthProps = {
    allowedRoles: string[];
};

export const RequireAuth: React.FC<RequireAuthProps> = ({ allowedRoles }) => {
    const { auth, token } = useAuth();
    const location = useLocation();

    return auth && allowedRoles.includes(auth?.role) ? (
        <Outlet />
    ) : token ? (
        <Navigate to="/" state={{ from: location }} replace />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};
