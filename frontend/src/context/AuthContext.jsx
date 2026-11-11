import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión inicial almacenada en localStorage
  useEffect(() => {
    const initAuth = async () => {
      const stored = authService.getStoredSession();
      if (stored) {
        setToken(stored.token);
        setUser(stored.user);

        // Validar con el backend que el token siga vigente
        try {
          const res = await authService.getMe();
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('hit_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[AUTH] Sesión guardada no es válida o expiró:', err.message);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listener para expiración de token en peticiones API
    const handleExpired = () => {
      authService.logout();
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin',
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

