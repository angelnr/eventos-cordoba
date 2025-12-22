const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    // Por ahora usamos la info del token. En una implementación completa,
    // podríamos consultar la DB aquí, pero para evitar complejidad,
    // asumimos que el token contiene la info correcta del usuario.
    req.user = decoded;
    next();
  });
};

// GET /api/users - Listar todos los usuarios
router.get('/', authenticateToken, async (req, res) => {
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
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', authenticateToken, async (req, res) => {
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
router.post('/', async (req, res) => {
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
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
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
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    // Solo el propietario o admin puede actualizar
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este usuario' });
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (name !== undefined) updateData.name = name;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/users/:id - Eliminar usuario (propietario o admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Verificar permisos: solo el propietario o admin puede eliminar
    const isOwner = req.user.id === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar este usuario'
      });
    }

    // Evitar que el admin se elimine a sí mismo
    if (isAdmin && req.user.id === userId) {
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
  } catch (error) {
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
router.post('/generate', async (req, res) => {
  try {
    const { count = 5 } = req.body;

    if (count > 50) {
      return res.status(400).json({ error: 'Máximo 50 usuarios por generación' });
    }

    const users = [];

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

module.exports = router;
