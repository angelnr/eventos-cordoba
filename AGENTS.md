# AGENTS.md — Convenciones y decisiones arquitectónicas

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js (Pages Router) | ^16.0.8 |
| Frontend | React | ^18.2.0 |
| Frontend | Tailwind CSS | ^3.3.3 |
| Frontend | TanStack React Query | ^5.100.9 |
| Backend | Express.js | ^4.18.2 |
| Backend | Prisma ORM | ^5.1.0 |
| Backend | PostgreSQL 15 | Docker |
| Auth | JWT (jsonwebtoken) | ^9.0.0 |
| Auth | bcryptjs | ^2.4.3 |
| Infra | Docker Compose | 5 servicios |
| Proxy | Nginx | build custom |
| Tunnel | Cloudflare Tunnel | latest |

## Comandos de build y desarrollo

```bash
# Desarrollo local
cd frontend && npm run dev          # Frontend en localhost:3000
cd backend && npm run dev           # Backend en localhost:3001

# Docker (producción local)
docker compose build                # Construir todas las imágenes
docker compose up -d                # Iniciar todos los servicios
docker compose up -d --no-deps frontend  # Reconstruir solo frontend
docker compose down                 # Parar servicios
docker compose logs -f              # Ver logs

# Backend
cd backend && npm run build         # Compilar TypeScript
cd backend && npx tsc --noEmit      # Type-check sin emitir
cd backend && npm test              # Tests unitarios (Jest)

# Frontend
cd frontend && npm run build        # Build de producción Next.js
```

## Convenciones de naming

- **Rutas API**: `kebab-case`, plural: `events`, `bookings`, `my-events-today`
- **Servicios backend**: `camelCase` con sufijo `Service`: `ticketService.ts`
- **Middleware backend**: `camelCase`: `requireAuth`, `optionalAuth`
- **Páginas frontend**: `pages/` sigue el routing de Next.js: `events/[id].tsx`
- **Componentes frontend**: `PascalCase`: `EventCard.tsx`, `UserMenu.tsx`
- **Hooks frontend**: `camelCase` con prefijo `use`: `useEvents.ts`, `useDebounce.ts`
- **Archivos de UI**: En `components/ui/`: `Button.tsx`, `Input.tsx`

## Decisiones arquitectónicas

### ¿Por qué JWT en localStorage y no cookies httpOnly?
El proyecto almacena el JWT en `localStorage` y lo envía manualmente en el header `Authorization`. Esto es vulnerable a XSS (un script malicioso puede leer el token). Se optó por esta vía por simplicidad inicial. **Migración futura recomendada**: cookies `httpOnly` con `SameSite=Strict` + CSRF tokens, o usar NextAuth.js/Auth.js.

### ¿Por qué Prisma y no TypeORM?
Prisma ofrece tipado fuerte generado automáticamente desde el schema, mejor DX con autocompletado, y migraciones más simples. La desventaja es menor control sobre queries raw y la capa adicional de indirección.

### ¿Por qué Pages Router y no App Router?
El proyecto se inició con Next.js 13 (Pages Router). Migrar a App Router requeriría refactor completo de layouts, data fetching, y componentes. Se mantiene Pages Router por estabilidad.

## Decisiones de seguridad (Fases 1-5)

### Fase 1 — Seguridad crítica backend
- **JWT_SECRET validado en startup**: si falta o tiene <32 chars, el servidor no arranca (`process.exit(1)`). Eliminado el fallback a string vacío que permitía tokens sin firmar.
- **Rate limiting**: global 100 req/15min en `/api`. Específico en login (5/15min) y register (3/hora) para prevenir fuerza bruta.
- **Eliminado `POST /api/auth/db-test`**: endpoint peligroso que exponía estado de BD y hacía `$disconnect()` rompiendo el pool.
- **Eliminado `POST /api/users/` sin auth**: cualquiera podía crear cuentas. El registro público ya existe en `/api/auth/register`.
- **bcrypt salt rounds**: aumentado de 10 a 12.
- **Validación de email**: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` en login, register, y actualización de perfil.
- **Password fuerte**: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número.

### Fase 2 — Validaciones y reglas de negocio
- **Isolation level Serializable**: en transacciones de bookings (`POST/` y `DELETE/:id`) para prevenir overbooking por race condition en alta concurrencia.
- **Sanitización de texto**: función `sanitizeText()` escapa `& < > " '` en campos title, description, location de eventos.
- **Validación externalImageUrl**: solo se aceptan URLs que comiencen con `http://` o `https://`.
- **DELETE evento en transacción**: favoritos + evento se eliminan atómicamente en `$transaction`.
- **Fecha en PUT evento**: validación que impide mover eventos a fechas pasadas.

### Fase 5 — Hardening infraestructura
- **Helmet**: middleware de seguridad HTTP (CSP, HSTS, X-Frame-Options, etc.) instalado y configurado como primer middleware.
- **Nginx headers**: `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restringido, `server_tokens off`.
- **Nginx rate limiting**: 20 requests/segundo con burst 40 en `/api`.
- **CORS eliminado de Nginx**: se delega exclusivamente al backend para evitar configuraciones contradictorias.
- **Docker**: eliminado puerto `5432:5432` de PostgreSQL (solo accesible desde la red interna). Añadido `USER node` en Dockerfile del backend (mínimo privilegio).

## Tests

```bash
cd backend && npm test              # Tests unitarios backend (Jest)
cd frontend && npx playwright test  # Tests E2E frontend (Playwright)
```

Archivos de test en:
- `backend/src/__tests__/`
- `frontend/e2e/`
