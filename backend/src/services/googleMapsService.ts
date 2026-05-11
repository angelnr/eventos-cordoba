import axios from 'axios';

const GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

export interface GeocodeAddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

export interface GeocodeResult {
  formattedAddress: string;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  placeId: string | null;
  latitude: number;
  longitude: number;
  addressComponents: GeocodeAddressComponent[];
}

export interface PlaceViewport {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface PlaceResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  addressComponents: GeocodeAddressComponent[];
  viewport: PlaceViewport | null;
  types: string[];
}

class GoogleMapsService {
  private apiKey: string;
  private cache: Map<string, { data: any; expiresAt: number }>;
  private maxCacheSize: number = 10000;
  private cacheTTL: number = 7 * 24 * 60 * 60 * 1000;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || '';
    this.cache = new Map();
  }

  private async callWithRetry(url: string, maxRetries: number = 2): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(url, { timeout: 5000 });
        return response;
      } catch (error: any) {
        lastError = error;
        if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET') {
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
        }
        throw error;
      }
    }
    throw lastError;
  }

  private extractComponent(
    components: Array<{ long_name: string; short_name: string; types: string[] }>,
    type: string
  ): string | null {
    const component = components.find(c => c.types.includes(type));
    return component?.long_name || null;
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  private saveToCache(key: string, data: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
      for (let i = 0; i < 1000 && i < entries.length; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
    this.cache.set(key, { data, expiresAt: Date.now() + this.cacheTTL });
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
    if (latitude < -90 || latitude > 90) {
      throw new Error('INVALID_LATITUDE');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('INVALID_LONGITUDE');
    }

    const cacheKey = `rg:${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as GeocodeResult;

    const url = `${GEOCODING_BASE_URL}?latlng=${latitude},${longitude}&key=${this.apiKey}&language=es&region=es`;
    const response = await this.callWithRetry(url);

    if (response.data.status === 'ZERO_RESULTS') {
      throw new Error('NO_RESULTS');
    }
    if (response.data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('QUOTA_EXCEEDED');
    }
    if (response.data.status !== 'OK') {
      throw new Error('GEOCODING_ERROR');
    }

    const result = response.data.results[0];

    const geocodeResult: GeocodeResult = {
      formattedAddress: result.formatted_address,
      city: this.extractComponent(result.address_components, 'locality'),
      country: this.extractComponent(result.address_components, 'country'),
      postalCode: this.extractComponent(result.address_components, 'postal_code'),
      placeId: result.place_id,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      addressComponents: result.address_components.map((c: any) => ({
        longName: c.long_name,
        shortName: c.short_name,
        types: c.types,
      })),
    };

    this.saveToCache(cacheKey, geocodeResult);
    return geocodeResult;
  }

  async getPlaceDetails(placeId: string): Promise<PlaceResult> {
    if (!placeId || placeId.trim() === '') {
      throw new Error('INVALID_PLACE_ID');
    }

    const cacheKey = `pd:${placeId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as PlaceResult;

    const fields = 'formatted_address,geometry,address_component,name,type,place_id';
    const url = `${PLACES_BASE_URL}?place_id=${placeId}&fields=${fields}&key=${this.apiKey}&language=es`;
    const response = await this.callWithRetry(url);

    if (response.data.status === 'INVALID_REQUEST') {
      throw new Error('INVALID_PLACE_ID');
    }
    if (response.data.status === 'NOT_FOUND') {
      throw new Error('PLACE_NOT_FOUND');
    }
    if (response.data.status === 'OVER_QUERY_LIMIT') {
      throw new Error('QUOTA_EXCEEDED');
    }
    if (response.data.status !== 'OK') {
      throw new Error('PLACES_ERROR');
    }

    const result = response.data.result;

    const placeResult: PlaceResult = {
      placeId: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      city: this.extractComponent(result.address_components, 'locality'),
      country: this.extractComponent(result.address_components, 'country'),
      postalCode: this.extractComponent(result.address_components, 'postal_code'),
      addressComponents: result.address_components.map((c: any) => ({
        longName: c.long_name,
        shortName: c.short_name,
        types: c.types,
      })),
      viewport: result.geometry.viewport ? {
        south: result.geometry.viewport.south,
        west: result.geometry.viewport.west,
        north: result.geometry.viewport.north,
        east: result.geometry.viewport.east,
      } : null,
      types: result.types,
    };

    this.saveToCache(cacheKey, placeResult);
    return placeResult;
  }
}

export const googleMapsService = new GoogleMapsService();
