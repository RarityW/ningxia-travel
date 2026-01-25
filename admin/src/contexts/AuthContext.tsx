import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

    useEffect(() => {
        // Check for token in localStorage on mount
        const token = localStorage.getItem('admin_token');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (token: string, role: string) => {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_role', role);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_role');
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
