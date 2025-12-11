import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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

    console.log('🌐 Auth - Hostname detectado:', hostname);
    console.log('🏠 Auth - Es localhost:', isLocalhost);
    console.log('🏭 Auth - Es producción:', isProduction);

    // En desarrollo (localhost)
    if (isLocalhost) {
      // Priorizar localhost:3001 para desarrollo
      return 'http://localhost:3001';
    }

    // En producción (eventoscordoba.xyz) - usar URL conocida
    if (isProduction) {
      return 'https://api.eventoscordoba.xyz';
    }

    // En producción - usar la URL configurada
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    // Fallback: asumir que el backend está en el mismo dominio
    return '';
  };

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      verifyToken(savedToken);
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
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
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

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
