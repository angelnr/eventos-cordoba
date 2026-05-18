import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error, user } = useAuth();
  const router = useRouter();
  const { redirect } = router.query;

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push((redirect as string) || '/');
    }
  }, [user, router, redirect]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
      router.push((redirect as string) || '/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <form data-testid="login-form" className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              data-testid="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="tu@email.com"
              required
            />

            <Input
              data-testid="login-password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          )}

          <div>
            <Button
              data-testid="login-submit"
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
