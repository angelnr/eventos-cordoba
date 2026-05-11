import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const FAQ_ITEMS = [
  {
    q: '¿Puedo crear eventos gratuitos y de pago?',
    a: 'Sí, puedes crear tanto eventos gratuitos como de pago. El sistema de reservas permite gestionar ambos tipos con control de aforo en tiempo real.',
  },
  {
    q: '¿Cómo funciona el check-in QR?',
    a: 'Cada entrada genera un código QR único. En la entrada, escanea el código con cualquier dispositivo y el sistema valida al instante si la entrada es válida.',
  },
  {
    q: '¿Hay app móvil disponible?',
    a: 'Actualmente la plataforma es web responsive. Funciona perfectamente en dispositivos móviles a través del navegador.',
  },
  {
    q: '¿Funciona para eventos pequeños?',
    a: 'Absolutamente. La plataforma está diseñada para eventos de cualquier escala, desde reuniones de 10 personas hasta congresos con miles de asistentes.',
  },
  {
    q: '¿Se integra con pasarelas de pago?',
    a: 'El sistema de reservas gestiona la disponibilidad y confirmación de plazas. La integración con pasarelas de pago está en desarrollo.',
  },
  {
    q: '¿Puedo exportar la lista de asistentes?',
    a: 'Sí, desde el dashboard puedes ver y gestionar la lista completa de asistentes con su información y estado de confirmación.',
  },
  {
    q: '¿Puedo gestionar mi equipo?',
    a: 'Sí, el sistema soporta roles de equipo para que puedas delegar tareas entre organizadores, staff de entrada y coordinadores.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <AnimatedSection className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Preguntas frecuentes
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Resolvemos tus dudas antes de que surjan
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 pr-4">
                  {q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === i ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700">
                  {a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
