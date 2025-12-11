const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const eventsRoutes = require('./routes/events');
const categoriesRoutes = require('./routes/categories');

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

console.log('🔗 Rutas configuradas:');
console.log('  - /api/auth/*');
console.log('  - /api/users/*');
console.log('  - /api/events/*');
console.log('  - /api/categories/*');

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
