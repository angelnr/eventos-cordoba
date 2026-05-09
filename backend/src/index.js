const express = require('express');
const path = require('path');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const eventsRoutes = require('./routes/events');
const categoriesRoutes = require('./routes/categories');
const bookingsRoutes = require('./routes/bookings');
const favoritesRoutes = require('./routes/favorites');
const commentsRoutes = require('./routes/comments');
const reviewsRoutes = require('./routes/reviews');
const notificationsRoutes = require('./routes/notifications');
const { startReminderJob } = require('./jobs/reminderJob');
const { startCleanupJob } = require('./jobs/cleanupJob');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración CORS más permisiva
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://eventoscordoba.xyz',
    'https://api.eventoscordoba.xyz'
  ],
  credentials: true
}));

// Middleware de logging global
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - Headers:`, req.headers.authorization ? 'Token presente' : 'Sin token');
  next();
});

app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);

console.log('🔗 Rutas configuradas:');
console.log('  - /api/auth/*');
console.log('  - /api/users/*');
console.log('  - /api/events/*');
console.log('  - /api/categories/*');
console.log('  - /api/favorites/*');
console.log('  - /api/comments/*');
console.log('  - /api/reviews/*');
console.log('  - /api/notifications/*');

// Rutas existentes
app.get('/api/test', (req, res) => {
  console.log('✅ Petición recibida en /api/test desde:', req.get('origin'));
  res.json({
    message: '¡Backend funcionando perfectamente!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Health check específico para Cloudflare
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'backend',
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos de uploads (fallback para desarrollo local)
// En producción, Nginx sirve estos archivos directamente
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '30d',
  immutable: true,
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend ejecutándose en http://0.0.0.0:${PORT}`);
  console.log('✅ CORS configurado para eventoscordoba.xyz');
  console.log('✅ Base de datos conectada con Prisma');
  console.log('✅ JWT configurado');
  console.log('✅ Rutas CRUD de usuarios implementadas');
  startReminderJob();
  startCleanupJob();
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando conexiones...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando conexiones...');
  process.exit(0);
});
