import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { PartyPopper, GraduationCap, Building2, Music, Handshake, Users } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const EVENT_TYPES = [
  { icon: PartyPopper, label: 'Bodas', desc: 'Coordina invitados, mesas y cronogramas' },
  { icon: Building2, label: 'Congresos', desc: 'Gestiona ponentes, horarios y aforo' },
  { icon: Users, label: 'Ferias', desc: 'Organiza expositores y visitantes' },
  { icon: Music, label: 'Festivales', desc: 'Controla entradas y accesos por fases' },
  { icon: GraduationCap, label: 'Universitarios', desc: 'Eventos académicos y culturales' },
  { icon: Handshake, label: 'Networking', desc: 'Conecta asistentes con agendas personalizadas' },
];

export default function EventCarousel() {
  return (
    <AnimatedSection className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Para todo tipo de evento
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-100">
            Una plataforma flexible que se adapta a cualquier ocasión
          </p>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {EVENT_TYPES.map(({ icon: Icon, label, desc }) => (
            <SwiperSlide key={label}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center h-full">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-5">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </AnimatedSection>
  );
}
