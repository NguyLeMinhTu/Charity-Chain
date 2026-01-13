import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
    const auth = useContext(AuthContext) || {};
    const { user, loading } = auth;

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/admin/login" replace />;

    if (user.role !== 'admin') return <Navigate to="/" replace />;

    return children;
};

export default AdminProtectedRoute;
