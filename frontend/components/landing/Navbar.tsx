import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NotificationBell } from '../notifications/NotificationBell';
import { UserMenu } from '../UserMenu';

const NAV_ITEMS = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Opiniones', href: '#testimonios' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Eventos Córdoba
            </span>
          </Link>

          {/* Full desktop nav - lg and above */}
          <nav className="hidden lg:flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </button>
            ))}

            <div className="flex items-center gap-2 ml-2">
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
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              {user ? (
                <>
                  <NotificationBell />
                  <UserMenu />
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link href="/login">
                    <Button variant="secondary" size="sm">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Crear Cuenta</Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-2 py-1"
              >
                <Globe className="w-4 h-4" />
                <span>ES</span>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-20">
                    <button
                      onClick={() => setLangOpen(false)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      🇪🇸 ES
                    </button>
                    <button
                      onClick={() => setLangOpen(false)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      🇬🇧 EN
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Compact tablet + mobile nav - below lg */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Link href="/events">
                <Button variant="secondary" size="sm">
                  Eventos
                </Button>
              </Link>
            </div>
            <ThemeToggle />
            {user && <NotificationBell />}
            {user ? (
              <div className="hidden md:block">
                <UserMenu />
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Acceder
                  </Button>
                </Link>
              </div>
            )}
            <button
              className="p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Abrir menú"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                {item.label}
              </button>
            ))}
            <hr className="border-gray-200 dark:border-gray-700" />
            <Link href="/events" className="block">
              <Button variant="secondary" fullWidth size="sm">Eventos</Button>
            </Link>
            {user && (
              <Link href="/favorites" className="block">
                <Button variant="secondary" fullWidth size="sm">Favoritos</Button>
              </Link>
            )}
            {user && (
              <Link href="/my-tickets" className="block">
                <Button variant="secondary" fullWidth size="sm">Mis Entradas</Button>
              </Link>
            )}
            {user ? (
              <div className="pt-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
                <UserMenu />
              </div>
            ) : (
              <div className="pt-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
                <Link href="/login" className="block">
                  <Button variant="secondary" fullWidth size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button fullWidth size="sm">Crear Cuenta</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
