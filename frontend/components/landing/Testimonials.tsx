import React from 'react';
import { Star } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const TESTIMONIALS = [
  {
    name: 'María García',
    role: 'Organizadora de bodas',
    quote:
      'Gestionar invitados era un caos hasta que encontramos Eventos Córdoba. El check-in QR nos ahorró horas en la entrada.',
    result: 'Ahorramos 3h en la gestión de 200 invitados',
    rating: 5,
  },
  {
    name: 'Carlos López',
    role: 'Coordinador de congresos',
    quote:
      'Poder ver las estadísticas en tiempo real durante el congreso nos ayudó a tomar decisiones sobre la marcha.',
    result: '30% más de asistentes confirmados vs año anterior',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    role: 'Eventos universitarios',
    quote:
      'La plataforma es muy intuitiva. En 10 minutos tenía mi evento creado y compartido con los alumnos.',
    result: 'Organizamos 15 eventos en un mes sin errores',
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <AnimatedSection id="testimonios" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Lo que dicen nuestros organizadores
          </h2>
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500 italic">
            * Resultados basados en datos de prueba durante la fase beta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map(({ name, role, quote, result, rating }) => (
            <div
              key={name}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <blockquote className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-1">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{role}</div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                  {result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
