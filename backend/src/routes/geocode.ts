import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { googleMapsService } from '../services/googleMapsService';

const router = Router();

const geocodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Demasiadas solicitudes de geocoding. Intenta de nuevo en unos momentos' },
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
});

// POST /api/geocode/reverse - Reverse geocoding: coordenadas a dirección
router.post('/reverse', geocodeLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || latitude === null) {
      return res.status(400).json({
        success: false,
        error: 'Latitud es requerida'
      });
    }
    if (longitude === undefined || longitude === null) {
      return res.status(400).json({
        success: false,
        error: 'Longitud es requerida'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        error: 'Latitud inválida. Debe ser un número entre -90 y 90'
      });
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        error: 'Longitud inválida. Debe ser un número entre -180 y 180'
      });
    }

    const result = await googleMapsService.reverseGeocode(lat, lng);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error.message === 'NO_RESULTS') {
      return res.status(400).json({
        success: false,
        error: 'No se encontró una dirección para esas coordenadas'
      });
    }
    if (error.message === 'QUOTA_EXCEEDED') {
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intenta de nuevo en unos momentos'
      });
    }
    if (error.message === 'GEOCODING_ERROR' || error.message === 'INVALID_LATITUDE' || error.message === 'INVALID_LONGITUDE') {
      return res.status(400).json({
        success: false,
        error: 'Error al procesar las coordenadas'
      });
    }
    console.error('Reverse geocode error:', error);
    res.status(503).json({
      success: false,
      error: 'Servicio de geocoding no disponible temporalmente'
    });
  }
});

// GET /api/geocode/place - Place Details: obtener datos de un lugar por Place ID
router.get('/place', geocodeLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const { placeId } = req.query;

    if (!placeId || typeof placeId !== 'string' || placeId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Place ID es requerido'
      });
    }

    const result = await googleMapsService.getPlaceDetails(placeId.trim());

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error.message === 'INVALID_PLACE_ID') {
      return res.status(400).json({
        success: false,
        error: 'Place ID inválido'
      });
    }
    if (error.message === 'PLACE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: 'No se encontró el lugar especificado'
      });
    }
    if (error.message === 'QUOTA_EXCEEDED') {
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intenta de nuevo en unos momentos'
      });
    }
    if (error.message === 'PLACES_ERROR') {
      return res.status(503).json({
        success: false,
        error: 'Servicio de Places no disponible temporalmente'
      });
    }
    console.error('Place details error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;
