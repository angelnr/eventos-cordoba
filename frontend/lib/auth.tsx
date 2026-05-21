import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showSuccess, showWarning } from './notifications';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  resendVerification: (email: string) => Promise<void>;
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

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

  // Rastrear actividad del usuario para renovación de sesión
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!token) return;

    const markActive = () => setLastActivity(Date.now());

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, markActive, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, markActive));
    };
  }, [token]);

  // Renovar token cada 5 minutos si hay actividad
  useEffect(() => {
    if (!token) return;

    const INTERVAL_MS = 5 * 60 * 1000;

    const interval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity < INTERVAL_MS) {
        refreshUser();
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [token, lastActivity]);

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
        const newToken = data.data.token || tokenToVerify;
        setToken(newToken);
        setUser(data.data.user);
        localStorage.setItem('auth_token', newToken);
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
        if (data.emailSent === false) {
          showWarning('Cuenta creada pero no pudimos enviar el email de verificación. Puedes reenviarlo desde tu perfil.');
        } else {
          showSuccess('¡Cuenta creada correctamente! Revisa tu email para verificar tu cuenta.');
        }
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
        const newToken = data.data.token;
        if (newToken) {
          setToken(newToken);
          localStorage.setItem('auth_token', newToken);
        }
        setUser(data.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const resendVerification = async (email: string) => {
    const apiUrl = getApiUrl();
    await fetch(`${apiUrl}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
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
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
