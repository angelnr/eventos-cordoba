import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import AnimatedSection from './AnimatedSection';
import EventMap from '../EventMap';

const CORDOBA_COORDS = { lat: -31.4201, lng: -64.1888 };

export default function EventMapSection() {
  return (
    <AnimatedSection className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Explora eventos en Córdoba
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Descubre lo que está pasando cerca de ti
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4">
              <EventMap
                latitude={CORDOBA_COORDS.lat}
                longitude={CORDOBA_COORDS.lng}
                title="Córdoba, Argentina"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Eventos cerca de ti
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Todos los eventos ubicados en el mapa de Córdoba
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Cada evento se publica con su ubicación exacta. Encuentra
              congresos, festivales, bodas y más en la ciudad.
            </p>
            <Link href="/events">
              <Button size="md" className="gap-2">
                Explorar eventos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
