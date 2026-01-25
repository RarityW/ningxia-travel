import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAdminProfile } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, role: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const checkAuth = async () => {
        try {
            await getAdminProfile();
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
            localStorage.removeItem('admin_token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (token: string, role: string) => {
        // Token is stored in HttpOnly cookie by backend
        // We just update state
        setIsAuthenticated(true);
    };

    const logout = () => {
        // TODO: Call backend logout API to clear cookie
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
