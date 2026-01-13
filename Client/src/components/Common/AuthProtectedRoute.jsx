import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AuthProtectedRoute = ({ children }) => {
    const auth = useContext(AuthContext) || {};
    const { user, loading } = auth;

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/" replace />;

    return children;
};

export default AuthProtectedRoute;
