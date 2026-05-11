import React from 'react';
import { CalendarPlus, UserPlus, QrCode, BarChart3 } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const STEPS = [
  {
    icon: CalendarPlus,
    title: 'Crea el evento',
    desc: 'Define fecha, lugar, categoría y sube las fotos. En minutos tienes tu evento listo.',
  },
  {
    icon: UserPlus,
    title: 'Invita asistentes',
    desc: 'Comparte el enlace, gestiona invitaciones y controla quién confirma asistencia.',
  },
  {
    icon: QrCode,
    title: 'Gestiona entradas',
    desc: 'Check-in QR en tiempo real. Sin listas impresas ni colas.',
  },
  {
    icon: BarChart3,
    title: 'Analiza resultados',
    desc: 'Dashboard con métricas de asistencia, ventas y satisfacción.',
  },
];

export default function HowItWorks() {
  return (
    <AnimatedSection id="funcionalidades" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Cómo funciona
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Cuatro pasos para organizar tu evento sin complicaciones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800" />
              )}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 mb-5 relative z-10">
                <Icon className="w-8 h-8" />
              </div>
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-bold mb-3">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
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
