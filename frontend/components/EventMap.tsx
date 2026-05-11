import React from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
};

interface EventMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

export default function EventMap({ latitude, longitude, title }: EventMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  if (loadError) {
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No se pudo cargar el mapa
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={{ lat: latitude, lng: longitude }}
      zoom={15}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
        scrollwheel: false,
      }}
    >
      <Marker
        position={{ lat: latitude, lng: longitude }}
        title={title || 'Ubicación del evento'}
      />
    </GoogleMap>
  );
}
