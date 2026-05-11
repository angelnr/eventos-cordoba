import React from 'react';

interface LocationPreviewProps {
  locationData: {
    formattedAddress?: string | null;
    city?: string | null;
    country?: string | null;
    postalCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
}

export default function LocationPreview({ locationData }: LocationPreviewProps) {
  if (!locationData || (!locationData.formattedAddress && !locationData.latitude)) return null;

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <span className="text-green-600 dark:text-green-400 text-lg">📍</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Ubicación seleccionada
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1 break-words">
            {locationData.formattedAddress || locationData.city || 'Ubicación sin dirección formateada'}
          </p>
          {(locationData.city || locationData.country) && (
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              {[locationData.city, locationData.postalCode, locationData.country].filter(Boolean).join(', ')}
            </p>
          )}
          {locationData.latitude && locationData.longitude && (
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              Coordenadas: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
