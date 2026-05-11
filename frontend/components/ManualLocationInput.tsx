import React, { useState, useEffect } from 'react';

interface ManualLocationInputProps {
  initialLocation?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onLocationChange: (locationData: {
    location: string;
    latitude: number | null;
    longitude: number | null;
    placeId: null;
    formattedAddress: null;
    city: null;
    country: null;
    postalCode: null;
    locationMetadata: null;
  }) => void;
}

export default function ManualLocationInput({
  initialLocation,
  initialLatitude,
  initialLongitude,
  onLocationChange,
}: ManualLocationInputProps) {
  const [address, setAddress] = useState(initialLocation || '');
  const [latitude, setLatitude] = useState(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState(initialLongitude?.toString() || '');

  useEffect(() => {
    onLocationChange({
      location: address,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      placeId: null,
      formattedAddress: null,
      city: null,
      country: null,
      postalCode: null,
      locationMetadata: null,
    });
  }, [address, latitude, longitude, onLocationChange]);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="manual-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Dirección *
        </label>
        <input
          id="manual-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Ej: Plaza de la Constitución, Córdoba"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="manual-lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Latitud (opcional)
          </label>
          <input
            id="manual-lat"
            type="number"
            step="0.00000001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ej: 37.8881756"
          />
        </div>
        <div>
          <label htmlFor="manual-lng" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Longitud (opcional)
          </label>
          <input
            id="manual-lng"
            type="number"
            step="0.00000001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ej: -4.7793837"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Si no tienes Google Maps disponible, ingresa la dirección manualmente. Las coordenadas son opcionales.
      </p>
    </div>
  );
}
