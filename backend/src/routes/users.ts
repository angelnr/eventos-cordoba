import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';
import * as myEventsService from '../services/myEventsService';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users - Listar todos los usuarios
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/me - Obtener perfil del usuario autenticado
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/users/me/preferences - Obtener preferencias del usuario autenticado
router.get('/me/preferences', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { themePreference: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      data: {
        themePreference: user.themePreference || 'system'
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener preferencias' });
  }
});

// PUT /api/users/me/preferences - Actualizar themePreference
router.put('/me/preferences', requireAuth, async (req: Request, res: Response) => {
  const VALID_THEMES = ['light', 'dark', 'system'];
  const { themePreference } = req.body;

  if (!themePreference || !VALID_THEMES.includes(themePreference)) {
    return res.status(400).json({
      success: false,
      error: 'themePreference debe ser: light, dark o system'
    });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { themePreference: true }
    });

    if (currentUser && currentUser.themePreference === themePreference) {
      return res.json({
        success: true,
        data: { themePreference }
      });
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { themePreference }
    });

    res.json({
      success: true,
      data: { themePreference }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar preferencias' });
  }
});

// GET /api/users/my-events-summary - Resumen de todas las secciones de Mis Eventos
router.get('/my-events-summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await myEventsService.getMyEventsSummary(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get my events summary error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener resumen de eventos' });
  }
});

// GET /api/users/my-upcoming-events - Próximos eventos del usuario
router.get('/my-upcoming-events', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await myEventsService.getUpcomingEvents(req.user!.id, {
      paginate: true,
      query: req.query as any,
    });
    res.json({ success: true, data: result.events, pagination: result.pagination });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener próximos eventos' });
  }
});

// GET /api/users/my-past-events - Eventos pasados del usuario
router.get('/my-past-events', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await myEventsService.getPastEvents(req.user!.id, {
      paginate: true,
      query: req.query as any,
    });
    res.json({ success: true, data: result.events, pagination: result.pagination });
  } catch (error) {
    console.error('Get past events error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener eventos pasados' });
  }
});

// GET /api/users/my-favorite-events - Eventos favoritos del usuario
router.get('/my-favorite-events', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await myEventsService.getFavoriteEvents(req.user!.id, {
      paginate: true,
      query: req.query as any,
      categoryId: req.query.category ? parseInt(req.query.category as string) : undefined,
    });
    res.json({ success: true, data: result.events, pagination: result.pagination });
  } catch (error) {
    console.error('Get favorite events error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener eventos favoritos' });
  }
});

// GET /api/users/my-organized-events - Eventos organizados por el usuario
router.get('/my-organized-events', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await myEventsService.getOrganizedEvents(req.user!.id, {
      paginate: true,
      query: req.query as any,
      status: req.query.status as string,
    });
    res.json({ success: true, data: result.events, pagination: result.pagination });
  } catch (error) {
    console.error('Get organized events error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener eventos organizados' });
  }
});

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar que el ID no sea 'me' para evitar conflicto de rutas
    if (id === 'me') {
      return res.status(400).json({ error: 'Use /api/users/me para obtener su perfil' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        interests: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/users - Crear nuevo usuario
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y password son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || '',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any
    );

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name, bio, location, interests, avatar } = req.body;

    // Solo el propietario o admin puede actualizar
    if (req.user!.id !== parseInt(id)) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este usuario' });
    }

    const updateData: Record<string, any> = {};
    if (email) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests !== undefined) updateData.interests = interests;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        interests: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user
    });
  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/users/:id - Eliminar usuario (propietario o admin)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Verificar permisos: solo el propietario o admin puede eliminar
    const isOwner = req.user!.id === userId;
    const isAdmin = req.user!.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar este usuario'
      });
    }

    // Evitar que el admin se elimine a sí mismo
    if (isAdmin && req.user!.id === userId) {
      return res.status(400).json({
        success: false,
        error: 'No puedes eliminar tu propia cuenta de admin'
      });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/users/generate - Generar usuarios de prueba
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { count = 5 } = req.body;

    if (count > 50) {
      return res.status(400).json({ error: 'Máximo 50 usuarios por generación' });
    }

    const users: Array<{ id: number; email: string; name: string }> = [];

    for (let i = 0; i < count; i++) {
      const email = `user${Date.now()}${i}@example.com`;
      const password = await bcrypt.hash(`password${i}`, 10);
      const name = `Usuario de Prueba ${i + 1}`;

      const user = await prisma.user.create({
        data: {
          email,
          password,
          name
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      users.push(user);
    }

    res.status(201).json({
      success: true,
      message: `${count} usuarios generados exitosamente`,
      data: users
    });
  } catch (error) {
    console.error('Error generating users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
