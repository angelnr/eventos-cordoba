import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-950"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative max-w-4xl mx-auto px-4 text-center py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-white/90 text-sm font-medium mb-8">
          <Calendar className="w-4 h-4" />
          Plataforma todo-en-uno para eventos
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Gestiona eventos en Córdoba
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-300">
            sin caos
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
          Crea, organiza y promociona tus eventos en una sola plataforma.
          Desde bodas hasta congresos — todo lo que necesitas en un solo lugar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/events">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100 shadow-xl shadow-blue-900/20 gap-2 text-base px-8"
            >
              Ver eventos
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <button
            onClick={() => {
              const el = document.querySelector('#funcionalidades');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-white/80 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
          >
            Ver funcionalidades
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
    </section>
  );
}
