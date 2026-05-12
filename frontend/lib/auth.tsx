import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showSuccess } from './notifications';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;  // 🆕 Nuevo estado para indicar inicialización
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);  // 🆕 Estado de inicialización
  const [error, setError] = useState<string | null>(null);

  // Determinar la URL del API según el entorno
  const getApiUrl = () => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      return 'http://localhost:3001'; // Fallback para SSR
    }

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isProduction = hostname === 'eventoscordoba.xyz';

    // En desarrollo (localhost)
    if (isLocalhost) {
      // Priorizar localhost:3001 para desarrollo
      return 'http://localhost:3001';
    }

    // En producción (eventoscordoba.xyz) - usar subdominio API
    if (isProduction) {
      return process.env.NEXT_PUBLIC_API_URL || 'https://api.eventoscordoba.xyz';
    }

    // En producción - usar la URL configurada
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    // Fallback: asumir que el backend está en el subdominio api
    return 'https://api.eventoscordoba.xyz';
  };

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');

    if (savedToken) {
      verifyToken(savedToken);
    } else {
      setIsInitializing(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(tokenToVerify);
        setUser(data.data.user);
      } else {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (data.success) {
        const { token: newToken, user: userData } = data.data;

        setToken(newToken);
        setUser(userData);
        localStorage.setItem('auth_token', newToken);
        showSuccess('¡Sesión iniciada correctamente!');
      } else {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      if (data.success) {
        const { token: newToken, user: userData } = data.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('auth_token', newToken);
        showSuccess('¡Cuenta creada correctamente!');
      } else {
        throw new Error(data.error || 'Error al registrarse');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    setError(null);
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) return;
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: savedToken }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    isLoading,
    isInitializing,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
