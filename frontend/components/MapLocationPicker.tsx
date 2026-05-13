import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [37.8882, -4.7794];
const DEFAULT_ZOOM = 13;

const MAP_CONTAINER_STYLE: React.CSSProperties = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const defaultIcon = typeof window !== 'undefined'
  ? L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  : undefined;

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

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    postcode?: string;
    state?: string;
    road?: string;
    house_number?: string;
  };
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapLocationPicker({
  initialLocation,
  initialLatitude,
  initialLongitude,
  onLocationSelect,
  onError,
}: MapLocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : null
  );
  const [inputValue, setInputValue] = useState(initialLocation || '');
  const [center, setCenter] = useState<[number, number]>(
    initialLatitude && initialLongitude ? [initialLatitude, initialLongitude] : DEFAULT_CENTER
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const doReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`,
        {
          headers: { 'User-Agent': 'EventosCordoba/1.0' }
        }
      );

      if (!response.ok) {
        throw new Error('Nominatim request failed');
      }

      const result = await response.json();

      if (result.error) {
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

      const address = result.address || {};
      const city = address.city || address.town || address.village || address.hamlet || null;

      onLocationSelect({
        location: result.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
        placeId: result.place_id ? String(result.place_id) : null,
        formattedAddress: result.display_name || null,
        city,
        country: address.country || null,
        postalCode: address.postcode || null,
        locationMetadata: JSON.stringify(address),
      });
      setInputValue(result.display_name || '');
    } catch {
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

  const searchNominatim = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=es&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (response.ok) {
        const results: NominatimResult[] = await response.json();
        setSuggestions(results);
        setShowSuggestions(true);
      }
    } catch {
      // Silently fail for search suggestions
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchNominatim(value);
    }, 300);
  }, [searchNominatim]);

  const handleSuggestionSelect = useCallback((result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const city = result.address?.city || result.address?.town || result.address?.village || null;
    const country = result.address?.country || null;
    const postcode = result.address?.postcode || null;

    setMarkerPosition([lat, lng]);
    setCenter([lat, lng]);
    setInputValue(result.display_name);
    setShowSuggestions(false);

    onLocationSelect({
      location: result.display_name,
      latitude: lat,
      longitude: lng,
      placeId: String(result.place_id),
      formattedAddress: result.display_name,
      city,
      country,
      postalCode: postcode,
      locationMetadata: JSON.stringify(result.address || {}),
    });
  }, [onLocationSelect]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    doReverseGeocode(lat, lng);
  }, [doReverseGeocode]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Buscar dirección en España..."
          className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((result) => (
              <button
                key={result.place_id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                onMouseDown={() => handleSuggestionSelect(result)}
              >
                <span className="text-gray-800 dark:text-gray-200 line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          style={MAP_CONTAINER_STYLE}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          <MapCenterUpdater center={center} />
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={defaultIcon!}
              draggable={true}
              eventHandlers={{
                dragend: (e: any) => {
                  const { lat, lng } = e.target.getLatLng();
                  setMarkerPosition([lat, lng]);
                  doReverseGeocode(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
        {isGeocoding && (
          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-md shadow-md px-3 py-1.5 text-sm z-10">
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