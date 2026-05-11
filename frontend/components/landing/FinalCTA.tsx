import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import AnimatedSection from './AnimatedSection';

export default function FinalCTA() {
  return (
    <AnimatedSection className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Empieza a organizar eventos sin hojas de cálculo
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          Regístrate gratis y descubre lo fácil que es gestionar eventos con Eventos Córdoba.
        </p>
        <Link href="/events">
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-gray-100 shadow-xl gap-2 text-base px-8"
          >
            Ver eventos
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </AnimatedSection>
  );
}
