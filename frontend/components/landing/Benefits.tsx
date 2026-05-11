import React from 'react';
import { Clock, Zap, Target, TrendingUp, Smile } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const BENEFITS = [
  {
    icon: Clock,
    title: 'Ahorra tiempo',
    desc: 'Olvídate de hojas de cálculo y correos infinitos. Todo centralizado en un dashboard.',
  },
  {
    icon: Zap,
    title: 'Reduce colas con check-in QR',
    desc: 'Tus asistentes entran en segundos. Validación instantánea sin papel ni listas impresas.',
  },
  {
    icon: Target,
    title: 'Menos errores',
    desc: 'Sincronización en tiempo real. No más duplicados, overbooking o datos perdidos.',
  },
  {
    icon: TrendingUp,
    title: 'Más ventas',
    desc: 'Llega a más gente con eventos visibles en el mapa y filtros de búsqueda avanzados.',
  },
  {
    icon: Smile,
    title: 'Mejor experiencia',
    desc: 'Tus asistentes reciben notificaciones, entradas digitales y pueden dejar reseñas.',
  },
];

export default function Benefits() {
  return (
    <AnimatedSection className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Más que funciones, resultados
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Cada funcionalidad está pensada para resolver un problema real
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
