import React, { useState, useCallback, useEffect } from 'react';
import MapLocationPicker from './MapLocationPicker';
import type { LocationData } from './MapLocationPicker';
import ManualLocationInput from './ManualLocationInput';
import LocationPreview from './LocationPreview';

interface LocationPickerProps {
  initialLocation?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialPlaceId?: string | null;
  initialFormattedAddress?: string | null;
  initialCity?: string | null;
  initialCountry?: string | null;
  initialPostalCode?: string | null;
  onLocationChange: (data: LocationData) => void;
  onError?: (error: string) => void;
}

export default function LocationPicker({
  initialLocation,
  initialLatitude,
  initialLongitude,
  initialPlaceId: _initialPlaceId,
  initialFormattedAddress: _initialFormattedAddress,
  initialCity: _initialCity,
  initialCountry: _initialCountry,
  initialPostalCode: _initialPostalCode,
  onLocationChange,
  onError,
}: LocationPickerProps) {
  const [mode, setMode] = useState<'map' | 'manual'>('map');
  const [mapError, setMapError] = useState<string | null>(null);
  const [isGoogleMapsAvailable, setIsGoogleMapsAvailable] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const hasInitialCoords = !!(initialLatitude && initialLongitude);
  const hasInitialLocation = !!(initialLocation);

  useEffect(() => {
    if (hasInitialCoords && hasInitialLocation && !selectedLocation) {
      setSelectedLocation({
        location: initialLocation || '',
        latitude: initialLatitude || null,
        longitude: initialLongitude || null,
        placeId: null,
        formattedAddress: null,
        city: null,
        country: null,
        postalCode: null,
        locationMetadata: null,
      });
    }
  }, [hasInitialCoords, hasInitialLocation, initialLocation, initialLatitude, initialLongitude, selectedLocation]);

  const handleMapError = useCallback((error: string) => {
    setMapError(error);
    setIsGoogleMapsAvailable(false);
    if (onError) onError(error);
  }, [onError]);

  const handleLocationSelect = useCallback((data: LocationData) => {
    setSelectedLocation(data);
    onLocationChange(data);
  }, [onLocationChange]);

  const handleManualLocationChange = useCallback((data: {
    location: string;
    latitude: number | null;
    longitude: number | null;
    placeId: null;
    formattedAddress: null;
    city: null;
    country: null;
    postalCode: null;
    locationMetadata: null;
  }) => {
    setSelectedLocation(data);
    onLocationChange(data);
  }, [onLocationChange]);

  const hasLocationData = !!(selectedLocation?.location || selectedLocation?.latitude);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Ubicación *
      </label>

      {isGoogleMapsAvailable && !mapError && (
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setMode('map')}
            className={`px-3 py-1.5 text-sm rounded-md ${
              mode === 'map'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            📍 Seleccionar en mapa
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-3 py-1.5 text-sm rounded-md ${
              mode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            ✏️ Ingreso manual
          </button>
        </div>
      )}

      {mode === 'map' && isGoogleMapsAvailable && !mapError ? (
        <MapLocationPicker
          initialLocation={initialLocation}
          initialLatitude={initialLatitude}
          initialLongitude={initialLongitude}
          onLocationSelect={handleLocationSelect}
          onError={handleMapError}
        />
      ) : (
        <ManualLocationInput
          initialLocation={initialLocation}
          initialLatitude={initialLatitude}
          initialLongitude={initialLongitude}
          onLocationChange={handleManualLocationChange}
        />
      )}

      {mapError && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-700 dark:text-amber-300">{mapError}</p>
        </div>
      )}

      {hasLocationData && (
        <LocationPreview locationData={selectedLocation} />
      )}
    </div>
  );
}
