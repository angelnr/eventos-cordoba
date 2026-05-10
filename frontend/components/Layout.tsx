import React from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ui/ThemeToggle';
import { NotificationBell } from './notifications/NotificationBell';
import { useAuth } from '../lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Eventos Córdoba
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/events">
                <Button variant="secondary" size="sm">
                  Eventos
                </Button>
              </Link>
              {user && (
                <Link href="/favorites">
                  <Button variant="secondary" size="sm">
                    Favoritos
                  </Button>
                </Link>
              )}
              {user && (
                <Link href="/my-tickets">
                  <Button variant="secondary" size="sm">
                    Mis Entradas
                  </Button>
                </Link>
              )}
              <ThemeToggle />
              <NotificationBell />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};