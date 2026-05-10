import React from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';

export default function Custom404() {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Página no encontrada
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
