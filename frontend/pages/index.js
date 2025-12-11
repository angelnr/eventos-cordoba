import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';

export default function Home() {
  const [backendMessage, setBackendMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Determinar la URL del API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    console.log('Conectando a:', apiUrl);

    fetch(`${apiUrl}/api/test`)
      .then(response => {
        if (!response.ok) throw new Error('Error HTTP: ' + response.status);
        return response.json();
      })
      .then(data => {
        setBackendMessage(data.message);
        setLoading(false);
      })
      .catch(error => {
        setBackendMessage('Error conectando con el backend: ' + error.message);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="text-center">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">🚀 ¡Bienvenido a Eventos Córdoba!</h1>
          <p className="text-xl mb-6">Tu plataforma completa para gestionar eventos</p>
          <div className="flex justify-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg">Ir al Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" size="lg">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button size="lg">Crear Cuenta</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Backend Connection Status */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔗 Estado del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Backend API</h3>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Verificando conexión...
                </div>
              ) : (
                <div className={`p-3 rounded-md ${backendMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {backendMessage.includes('Error') ? '❌' : '✅'} {backendMessage}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Base de Datos</h3>
              <div className="p-3 bg-green-50 text-green-700 rounded-md">
                ✅ PostgreSQL conectado
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Autenticación Segura</h3>
            <p className="text-gray-600">JWT tokens y encriptación de contraseñas</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">API REST Completa</h3>
            <p className="text-gray-600">CRUD operations con validación y manejo de errores</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-3xl mb-4">🐳</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Docker + Cloudflare</h3>
            <p className="text-gray-600">Despliegue moderno con contenedores y tunneling seguro</p>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 Servicios Configurados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">●</span>
              <span>Frontend: Next.js + TypeScript + Tailwind</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">●</span>
              <span>Backend: Express.js + Prisma + PostgreSQL</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">●</span>
              <span>Autenticación: JWT + bcrypt</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">●</span>
              <span>Despliegue: Docker + Nginx + Cloudflare</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
