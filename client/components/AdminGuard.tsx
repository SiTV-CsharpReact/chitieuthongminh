import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminGuardProps {
    children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const { isAuthenticated, openLoginModal } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            // Optional: Log analytics or traces here
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        // Redirect to specialized admin login
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AdminGuard;
