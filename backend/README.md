# backend

Este directorio contiene la **API REST** del sistema Eventos Córdoba, desarrollada con **Node.js + Express + TypeScript** y gestión de datos mediante **Prisma ORM** sobre **PostgreSQL**.

## Estructura

| Ruta | Descripción |
|------|-------------|
| `src/index.ts` | Punto de entrada del servidor Express |
| `src/routes/` | Endpoints organizados por dominio (auth, events, bookings, tickets, users, notifications, comments, reviews, favorites, dashboard) |
| `src/middleware/` | Middlewares reutilizables: autenticación JWT (`requireAuth`, `optionalAuth`), rate limiting, sanitización de inputs |
| `src/services/` | Lógica de negocio desacoplada (camelCase + sufijo `Service`) |
| `src/jobs/` | Tareas programadas en background (recordatorios de eventos, limpieza de notificaciones, transición de estados) |
| `src/types/` | Tipos y enums compartidos de TypeScript |
| `src/__tests__/` | Tests unitarios con Jest |
| `prisma/` | Schema de Prisma, migraciones y seed de datos |
| `uploads/` | Archivos subidos por usuarios: avatares e imágenes de eventos |
| `Dockerfile` / `entrypoint.sh` | Imagen Docker para producción/desarrollo con espera a PostgreSQL y migraciones automáticas |

## Stack y dependencias principales

- **Express.js** ^4.18.2 — Framework web
- **Prisma** ^5.1.0 — ORM y migraciones
- **PostgreSQL** 15 — Base de datos (servicio Docker)
- **JWT** (jsonwebtoken) — Autenticación basada en tokens
- **bcryptjs** — Hash de contraseñas (12 rounds)
- **Helmet** — Hardening de headers HTTP (CSP, HSTS, etc.)
- **express-rate-limit** — Rate limiting global y por endpoint
- **multer** — Subida de archivos (imágenes)
- **qrcode** — Generación de códigos QR para tickets
- **resend** — Envío de emails (verificación de correo)

## Convenciones de código

- Rutas API: `kebab-case` en plural (`/api/events`, `/api/my-events-today`)
- Servicios: `camelCase` con sufijo `Service` (`ticketService.ts`)
- Middleware: `camelCase` (`requireAuth`, `optionalAuth`)
- Sanitización de texto en campos críticos (title, description, location) con `sanitizeText()`
- Transacciones con isolation level `Serializable` en operaciones de reserva para evitar overbooking

## Scripts útiles

```bash
npm run dev              # Desarrollo con ts-node-dev (hot reload)
npm run build            # Compilar TypeScript a dist/
npm run type-check       # Verificación de tipos sin emitir
npm run test             # Tests unitarios con Jest
npm run prisma:migrate   # Crear y aplicar migraciones
npm run prisma:seed      # Poblar base de datos de desarrollo
```

## Seguridad

- El servidor **no arranca** si `JWT_SECRET` falta o tiene menos de 32 caracteres
- Eliminados endpoints peligrosos de diagnóstico (`db-test`)
- Rate limiting específico en login (5/15 min) y registro (3/hora)
- Validación de email con regex y contraseñas fuertes (8 chars, mayúscula, minúscula, número)

## Notas

- El directorio `dist/` se genera automáticamente al compilar; no debe versionarse.
- El `entrypoint.sh` espera a que PostgreSQL esté disponible antes de ejecutar migraciones y seed.
