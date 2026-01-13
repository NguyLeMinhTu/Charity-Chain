import { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api/authApi';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await authApi.me();
                    setUser(res.data.user || res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const login = async (credentials) => {
        const res = await authApi.login(credentials);
        const data = res.data;
        if (data?.token) {
            localStorage.setItem('token', data.token);
        }
        setUser(data.user || data);
        return data;
    };

    const refreshUser = async () => {
        try {
            const res = await authApi.me();
            const u = res.data.user || res.data;
            setUser(u);
            return u;
        } catch (err) {
            return null;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};