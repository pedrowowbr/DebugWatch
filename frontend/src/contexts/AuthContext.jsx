import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar se há token salvo ao inicializar
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            apiService.setToken(token);
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    // Carregar dados do usuário
    const loadUser = async () => {
        try {
            const userData = await apiService.getMe();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (username, password) => {
        try {
            const data = await apiService.login(username, password);
            await loadUser();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Registro
    const register = async (nome, senha) => {
        try {
            await apiService.register(nome, senha);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Logout
    const logout = () => {
        apiService.clearToken();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};