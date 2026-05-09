import React from 'react';
import Link from 'next/link';
import { FavoriteButton } from './FavoriteButton';
import { getImageUrl } from '../lib/imageUtils';
import type { EventResponse } from '../lib/queries/useEvents';

interface EventCardProps {
  event: EventResponse;
  onFavoriteToggle?: (eventId: number, nowFavorited: boolean) => void;
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price?: number | string | null): string {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return 'Precio no disponible';
  if (numericPrice === 0) return 'Gratis';
  return `${numericPrice.toFixed(2)}€`;
}

export default function EventCard({ event, onFavoriteToggle }: EventCardProps) {
  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/events/${event.id}`}>
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {event.imageUrl ? (
            <img
              src={getImageUrl(event.imageUrl) || ''}
              alt={event.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={e => { e.currentTarget.src = '/placeholder-event.jpg'; }}
            />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2" aria-hidden="true">📅</div>
              <div className="text-sm">Sin imagen</div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            {event.category ? (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: event.category.color }}
              >
                {event.category.name}
              </span>
            ) : (
              <span className="text-xs text-gray-400">Sin categoría</span>
            )}
            <span className="text-sm text-gray-500">
              {Math.max(0, event.availableSpots || 0)} plazas libres
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {event.title}
          </h3>

          <div className="text-sm text-gray-600 mb-2">
            <div className="flex items-center mb-1">
              <span className="mr-2" aria-hidden="true">📅</span>
              {formatDate(event.date)}
            </div>
            <div className="flex items-center">
              <span className="mr-2" aria-hidden="true">📍</span>
              {event.location}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Por {event.organizer?.name || 'Organizador desconocido'}
            </span>
            <span className="font-semibold text-green-600">
              {formatPrice(event.price)}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute top-2 right-2 z-10">
        <div className="flex items-center gap-1 bg-white/80 rounded-full px-1">
          {event.favoriteCount !== undefined && event.favoriteCount > 0 && (
            <span className="text-xs text-red-400 font-medium" title="Favoritos">
              {event.favoriteCount}
            </span>
          )}
          <FavoriteButton
            eventId={event.id}
            initialFavorited={event.isFavorited || false}
            size="sm"
            onToggle={onFavoriteToggle}
          />
        </div>
      </div>
    </div>
  );
}
