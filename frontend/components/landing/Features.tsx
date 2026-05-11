import React from 'react';
import {
  Users,
  QrCode,
  BarChart3,
  MapPin,
  Ticket,
  Star,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const FEATURES = [
  {
    icon: Users,
    title: 'Gestión de asistentes',
    desc: 'Lista completa de invitados, estados de confirmación y comunicación directa.',
  },
  {
    icon: QrCode,
    title: 'Check-in QR',
    desc: 'Escanea códigos QR en la entrada. Validación instantánea desde cualquier dispositivo.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard en tiempo real',
    desc: 'Métricas de asistencia, ingresos y distribución de asistentes actualizadas al instante.',
  },
  {
    icon: MapPin,
    title: 'Mapas de ubicación',
    desc: 'Cada evento con su ubicación en Google Maps. Tus asistentes nunca se perderán.',
  },
  {
    icon: Ticket,
    title: 'Tickets y reservas',
    desc: 'Sistema de entradas con verificación. Controla el aforo y las reservas en tiempo real.',
  },
  {
    icon: Star,
    title: 'Reseñas y valoraciones',
    desc: 'Los asistentes pueden puntuar y comentar. Construye reputación para tus eventos.',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    desc: 'Recordatorios automáticos a asistentes. Nunca olvides un evento importante.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Filtros avanzados',
    desc: 'Busca eventos por fecha, precio, categoría, disponibilidad y valoración.',
  },
];

export default function Features() {
  return (
    <AnimatedSection id="features" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Todo lo que necesitas
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-200">
            Funcionalidades diseñadas para organizadores de eventos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
