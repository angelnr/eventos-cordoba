import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mail, MapPin } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Funciones', href: '#features' },
  { label: 'Opiniones', href: '#testimonios' },
  { label: 'Contacto', href: '#contacto' },
];

const LEGAL_LINKS = [
  { label: 'Privacidad', href: '#' },
  { label: 'Cookies', href: '#' },
  { label: 'Términos', href: '#' },
];

export default function Footer() {
  const { pathname } = useRouter();
  const isLanding = pathname === '/';

  return (
    <footer id="contacto" className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-white mb-3">Eventos Córdoba</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              La plataforma todo-en-uno para gestionar eventos en Córdoba.
            </p>
          </div>

          {isLanding && (
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Navegación
              </h4>
              <ul className="space-y-2">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.querySelector(href);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:info@eventoscordoba.xyz" className="hover:text-white transition-colors">
                  info@eventoscordoba.xyz
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Córdoba, España</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            Hecho desde la Universidad de Córdoba — Eventos Córdoba &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
