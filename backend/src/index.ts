import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';

// Importar rutas
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import eventsRoutes from './routes/events';
import categoriesRoutes from './routes/categories';
import bookingsRoutes from './routes/bookings';
import favoritesRoutes from './routes/favorites';
import commentsRoutes from './routes/comments';
import reviewsRoutes from './routes/reviews';
import notificationsRoutes from './routes/notifications';
import ticketsRoutes from './routes/tickets';
import { startReminderJob } from './jobs/reminderJob';
import { startCleanupJob } from './jobs/cleanupJob';

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
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.use('/api/tickets', ticketsRoutes);

console.log('🔗 Rutas configuradas:');
console.log('  - /api/auth/*');
console.log('  - /api/users/*');
console.log('  - /api/events/*');
console.log('  - /api/categories/*');
console.log('  - /api/favorites/*');
console.log('  - /api/comments/*');
console.log('  - /api/reviews/*');
console.log('  - /api/notifications/*');
console.log('  - /api/tickets/*');

// Rutas existentes
app.get('/api/test', (req: Request, res: Response) => {
  console.log('✅ Petición recibida en /api/test desde:', req.get('origin'));
  res.json({
    message: '¡Backend funcionando perfectamente!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Health check específico para Cloudflare
app.get('/health', (req: Request, res: Response) => {
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
  setHeaders: (res: Response, filePath: string) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Manejo de errores global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(PORT as number, '0.0.0.0', () => {
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
