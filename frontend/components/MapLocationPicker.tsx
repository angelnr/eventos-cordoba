import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { getApiUrl } from '../lib/api';

const DEFAULT_CENTER = { lat: 37.8882, lng: -4.7794 };
const DEFAULT_ZOOM = 13;

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const MAP_LIBRARIES: ('places')[] = ['places'];

export interface LocationData {
  location: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  formattedAddress: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  locationMetadata: string | null;
}

interface MapLocationPickerProps {
  initialLocation?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  onLocationSelect: (locationData: LocationData) => void;
  onError: (error: string) => void;
}

interface NormalizedPlace {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  addressComponents: Array<{ longName: string; shortName: string; types: string[] }>;
  types: string[];
}

function normalizeNewPlace(place: google.maps.places.Place): NormalizedPlace | null {
  const location = place.location;
  if (!location) return null;

  const lat = typeof location.lat === 'function' ? location.lat() : (location as any).lat;
  const lng = typeof location.lng === 'function' ? location.lng() : (location as any).lng;

  return {
    placeId: place.id || '',
    name: place.displayName || '',
    formattedAddress: place.formattedAddress || '',
    latitude: lat,
    longitude: lng,
    addressComponents: (place.addressComponents || []).map((c: any) => ({
      longName: c.longText || '',
      shortName: c.shortText || '',
      types: c.types || [],
    })),
    types: place.types || [],
  };
}

function normalizeOldPlace(place: google.maps.places.PlaceResult): NormalizedPlace | null {
  if (!place.geometry?.location) return null;

  const location = place.geometry.location;
  const lat = typeof location.lat === 'function' ? location.lat() : (location as any).lat;
  const lng = typeof location.lng === 'function' ? location.lng() : (location as any).lng;

  return {
    placeId: place.place_id || '',
    name: place.name || '',
    formattedAddress: place.formatted_address || '',
    latitude: lat,
    longitude: lng,
    addressComponents: (place.address_components || []).map((c) => ({
      longName: c.long_name,
      shortName: c.short_name,
      types: c.types,
    })),
    types: place.types || [],
  };
}

function normalizedToLocationData(np: NormalizedPlace): LocationData {
  const getComponent = (type: string) => np.addressComponents.find(c => c.types.includes(type));

  return {
    location: np.formattedAddress || np.name || '',
    latitude: np.latitude,
    longitude: np.longitude,
    placeId: np.placeId || null,
    formattedAddress: np.formattedAddress || null,
    city: getComponent('locality')?.longName || null,
    country: getComponent('country')?.longName || null,
    postalCode: getComponent('postal_code')?.longName || null,
    locationMetadata: JSON.stringify({
      name: np.name,
      types: np.types,
      addressComponents: np.addressComponents,
    }),
  };
}

export default function MapLocationPicker({
  initialLocation,
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  onError,
}: MapLocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: MAP_LIBRARIES,
  });

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    initialLatitude && initialLongitude
      ? { lat: initialLatitude, lng: initialLongitude }
      : null
  );
  const [inputValue, setInputValue] = useState(initialLocation || '');
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs para limpiar listeners de autocomplete
  const autocompleteCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (loadError) {
      onError('No se pudo cargar Google Maps. Usando ingreso manual.');
    }
  }, [loadError, onError]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        onError('Google Maps no pudo cargar. Usando ingreso manual.');
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [isLoaded, onError]);

  // Inicializar autocomplete imperativo cuando Google Maps se carga
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places) return;

    // Limpiar instancia anterior
    if (autocompleteCleanupRef.current) {
      autocompleteCleanupRef.current();
      autocompleteCleanupRef.current = null;
    }

    const handlePlaceData = (np: NormalizedPlace) => {
      const locationData = normalizedToLocationData(np);
      setMarkerPosition({ lat: np.latitude, lng: np.longitude });
      setCenter({ lat: np.latitude, lng: np.longitude });
      setInputValue(np.formattedAddress || '');
      onLocationSelect(locationData);
    };

    // Intentar nueva API: PlaceAutocompleteElement
    const PlaceAutocompleteElementCtor = (google.maps.places as any).PlaceAutocompleteElement;
    if (typeof PlaceAutocompleteElementCtor === 'function') {
      try {
        const autocomplete = new PlaceAutocompleteElementCtor({
          inputElement: inputRef.current,
          locationBias: 'country:ES',
        });

        const handler = () => {
          const place: google.maps.places.Place | null = (autocomplete as any).value;
          if (place) {
            const np = normalizeNewPlace(place);
            if (np) handlePlaceData(np);
          }
        };

        autocomplete.addEventListener('gmpx-placechange', handler);
        autocompleteCleanupRef.current = () => {
          autocomplete.removeEventListener('gmpx-placechange', handler);
        };
        return;
      } catch (e) {
        console.warn('PlaceAutocompleteElement failed, falling back:', e);
      }
    }

    // Fallback: vieja API Autocomplete
    if (typeof google.maps.places.Autocomplete === 'function') {
      try {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'es' },
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_component'],
        });

        const handler = () => {
          const place = autocomplete.getPlace();
          if (place && place.geometry?.location) {
            const np = normalizeOldPlace(place);
            if (np) handlePlaceData(np);
          }
        };

        autocomplete.addListener('place_changed', handler);
        autocompleteCleanupRef.current = () => {
          google.maps.event.clearInstanceListeners(autocomplete);
        };
        return;
      } catch (e) {
        console.warn('Autocomplete fallback failed:', e);
      }
    }

    // Si ningún autocomplete está disponible
    onError('Google Places Autocomplete no está disponible. Ingresa la dirección manualmente.');
  }, [isLoaded, onLocationSelect, onError]);

  const doReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const apiUrl = getApiUrl();
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${apiUrl}/api/geocode/reverse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      if (!response.ok) {
        onLocationSelect({
          location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng,
          placeId: null,
          formattedAddress: null,
          city: null,
          country: null,
          postalCode: null,
          locationMetadata: null,
        });
        setInputValue(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        return;
      }

      const data = await response.json();
      const result = data.data;

      onLocationSelect({
        location: result.formattedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
        placeId: result.placeId,
        formattedAddress: result.formattedAddress,
        city: result.city,
        country: result.country,
        postalCode: result.postalCode,
        locationMetadata: JSON.stringify(result.addressComponents || {}),
      });
      setInputValue(result.formattedAddress || '');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      onLocationSelect({
        location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
        placeId: null,
        formattedAddress: null,
        city: null,
        country: null,
        postalCode: null,
        locationMetadata: null,
      });
    } finally {
      setIsGeocoding(false);
    }
  }, [onLocationSelect]);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarkerPosition({ lat, lng });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      doReverseGeocode(lat, lng);
    }, 300);
  }, [doReverseGeocode]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarkerPosition({ lat, lng });
    doReverseGeocode(lat, lng);
  }, [doReverseGeocode]);

  if (loadError) {
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Buscar dirección..."
        className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
      />

      <div className="relative">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={DEFAULT_ZOOM}
          onClick={onMapClick}
          onLoad={(map) => { mapRef.current = map; }}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              title="Ubicación del evento"
            />
          )}
        </GoogleMap>
        {isGeocoding && (
          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-md shadow-md px-3 py-1.5 text-sm">
            <span className="animate-pulse">Obteniendo dirección...</span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Haz clic en el mapa o arrastra el marcador para ajustar la ubicación
      </p>
    </div>
  );
}
