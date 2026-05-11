/// <reference types="jest" />

const mockAxiosGet = jest.fn();

jest.mock('axios', () => ({
  get: mockAxiosGet,
}));

const MOCK_API_KEY = 'test-api-key';

beforeAll(() => {
  process.env.GOOGLE_MAPS_SERVER_API_KEY = MOCK_API_KEY;
});

beforeEach(() => {
  mockAxiosGet.mockReset();
});

describe('googleMapsService', () => {
  describe('reverseGeocode', () => {
    it('should throw INVALID_LATITUDE when latitude > 90', async () => {
      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.reverseGeocode(91, 0)).rejects.toThrow('INVALID_LATITUDE');
    });

    it('should throw INVALID_LATITUDE when latitude < -90', async () => {
      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.reverseGeocode(-91, 0)).rejects.toThrow('INVALID_LATITUDE');
    });

    it('should throw INVALID_LONGITUDE when longitude > 180', async () => {
      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.reverseGeocode(0, 181)).rejects.toThrow('INVALID_LONGITUDE');
    });

    it('should throw INVALID_LONGITUDE when longitude < -180', async () => {
      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.reverseGeocode(0, -181)).rejects.toThrow('INVALID_LONGITUDE');
    });

    it('should return GeocodeResult for valid coordinates', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [{
            formatted_address: 'Pl. de la Constitución, 14002 Córdoba, España',
            place_id: 'ChIJgTwKgNI0F0gRQn4QRAIQ8p7K',
            geometry: { location: { lat: 37.8847176, lng: -4.7793459 } },
            address_components: [
              { long_name: 'Pl. de la Constitución', short_name: 'Pl. de la Constitución', types: ['route'] },
              { long_name: 'Córdoba', short_name: 'Córdoba', types: ['locality', 'political'] },
              { long_name: 'Córdoba', short_name: 'CO', types: ['administrative_area_level_2', 'political'] },
              { long_name: 'España', short_name: 'ES', types: ['country', 'political'] },
              { long_name: '14002', short_name: '14002', types: ['postal_code'] },
            ],
          }],
        },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      const result = await googleMapsService.reverseGeocode(37.8847, -4.7793);

      expect(result.formattedAddress).toBe('Pl. de la Constitución, 14002 Córdoba, España');
      expect(result.city).toBe('Córdoba');
      expect(result.country).toBe('España');
      expect(result.postalCode).toBe('14002');
      expect(result.placeId).toBe('ChIJgTwKgNI0F0gRQn4QRAIQ8p7K');
      expect(result.latitude).toBe(37.8847176);
      expect(result.longitude).toBe(-4.7793459);
      expect(result.addressComponents).toHaveLength(5);
    });

    it('should throw NO_RESULTS when Google returns ZERO_RESULTS', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: { status: 'ZERO_RESULTS', results: [] },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.reverseGeocode(0, 0)).rejects.toThrow('NO_RESULTS');
    });

    it('should throw QUOTA_EXCEEDED when Google returns OVER_QUERY_LIMIT', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: { status: 'OVER_QUERY_LIMIT' },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.reverseGeocode(0, 0)).rejects.toThrow('QUOTA_EXCEEDED');
    });

    it('should throw GEOCODING_ERROR for unknown status', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: { status: 'ERROR' },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.reverseGeocode(0, 0)).rejects.toThrow('GEOCODING_ERROR');
    });

    it('should return cached result on second call with same coordinates', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [{
            formatted_address: 'Córdoba, España',
            place_id: 'ChIJ_placeholder',
            geometry: { location: { lat: 37.8882, lng: -4.7794 } },
            address_components: [
              { long_name: 'Córdoba', short_name: 'Córdoba', types: ['locality', 'political'] },
              { long_name: 'España', short_name: 'ES', types: ['country', 'political'] },
            ],
          }],
        },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await googleMapsService.reverseGeocode(37.8882, -4.7794);
      await googleMapsService.reverseGeocode(37.8882, -4.7794);

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error', async () => {
      const testLat = 38.0011;
      const testLng = -3.0011;

      mockAxiosGet
        .mockRejectedValueOnce({ code: 'ECONNABORTED', response: undefined })
        .mockResolvedValueOnce({
          data: {
            status: 'OK',
            results: [{
              formatted_address: 'Jaén, España',
              place_id: 'ChIJ_retry',
              geometry: { location: { lat: testLat, lng: testLng } },
              address_components: [
                { long_name: 'Jaén', short_name: 'Jaén', types: ['locality', 'political'] },
                { long_name: 'España', short_name: 'ES', types: ['country', 'political'] },
              ],
            }],
          },
        });

      const { googleMapsService } = await import('../services/googleMapsService');
      const result = await googleMapsService.reverseGeocode(testLat, testLng);

      expect(result.formattedAddress).toBe('Jaén, España');
      expect(mockAxiosGet).toHaveBeenCalledTimes(2);
    });

    it('should use correct Google Maps API URL', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          status: 'OK',
          results: [{
            formatted_address: 'Test',
            place_id: 'test',
            geometry: { location: { lat: 10, lng: 20 } },
            address_components: [],
          }],
        },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await googleMapsService.reverseGeocode(10, 20);

      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining('maps.googleapis.com/maps/api/geocode/json'),
        expect.any(Object)
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining('latlng=10,20'),
        expect.any(Object)
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining(`key=${MOCK_API_KEY}`),
        expect.any(Object)
      );
    });
  });

  describe('getPlaceDetails', () => {
    it('should throw INVALID_PLACE_ID for empty string', async () => {
      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.getPlaceDetails('')).rejects.toThrow('INVALID_PLACE_ID');
    });

    it('should throw INVALID_PLACE_ID for whitespace-only string', async () => {
      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.getPlaceDetails('   ')).rejects.toThrow('INVALID_PLACE_ID');
    });

    it('should return PlaceResult for valid placeId', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          status: 'OK',
          result: {
            place_id: 'ChIJ_test',
            name: 'Plaza de la Constitución',
            formatted_address: 'Pl. de la Constitución, 14002 Córdoba, España',
            geometry: {
              location: { lat: 37.8847, lng: -4.7793 },
              viewport: {
                south: 37.883,
                west: -4.780,
                north: 37.886,
                east: -4.778,
              },
            },
            address_components: [
              { long_name: 'Plaza de la Constitución', short_name: 'Plaza de la Constitución', types: ['route'] },
              { long_name: 'Córdoba', short_name: 'Córdoba', types: ['locality', 'political'] },
              { long_name: 'España', short_name: 'ES', types: ['country', 'political'] },
            ],
            types: ['street_address'],
          },
        },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      const result = await googleMapsService.getPlaceDetails('ChIJ_test');

      expect(result.placeId).toBe('ChIJ_test');
      expect(result.name).toBe('Plaza de la Constitución');
      expect(result.formattedAddress).toBe('Pl. de la Constitución, 14002 Córdoba, España');
      expect(result.city).toBe('Córdoba');
      expect(result.country).toBe('España');
      expect(result.postalCode).toBeNull();
      expect(result.viewport).toEqual({
        south: 37.883,
        west: -4.780,
        north: 37.886,
        east: -4.778,
      });
      expect(result.types).toContain('street_address');
    });

    it('should throw PLACE_NOT_FOUND for invalid placeId', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: { status: 'NOT_FOUND' },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.getPlaceDetails('INVALID')).rejects.toThrow('PLACE_NOT_FOUND');
    });

    it('should throw QUOTA_EXCEEDED when rate limited', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: { status: 'OVER_QUERY_LIMIT' },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await expect(googleMapsService.getPlaceDetails('ChIJ_quota_test')).rejects.toThrow('QUOTA_EXCEEDED');
    });

    it('should cache responses', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          status: 'OK',
          result: {
            place_id: 'ChIJ_cache',
            name: 'Test',
            formatted_address: 'Test Address',
            geometry: { location: { lat: 10, lng: 20 } },
            address_components: [],
            types: ['street_address'],
          },
        },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await googleMapsService.getPlaceDetails('ChIJ_cache');
      await googleMapsService.getPlaceDetails('ChIJ_cache');

      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
    });

    it('should use correct Places API URL', async () => {
      mockAxiosGet.mockResolvedValueOnce({
        data: {
          status: 'OK',
          result: {
            place_id: 'ChIJ_url',
            name: 'Test',
            formatted_address: 'Test',
            geometry: { location: { lat: 10, lng: 20 } },
            address_components: [],
            types: [],
          },
        },
      });

      const { googleMapsService } = await import('../services/googleMapsService');
      await googleMapsService.getPlaceDetails('ChIJ_url');

      const callUrl = mockAxiosGet.mock.calls[0][0];
      expect(callUrl).toContain('maps.googleapis.com/maps/api/place/details/json');
      expect(callUrl).toContain('place_id=ChIJ_url');
      expect(callUrl).toContain(`key=${MOCK_API_KEY}`);
      expect(callUrl).toContain('language=es');
    });
  });
});
