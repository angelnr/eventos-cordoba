# frontend

Este directorio contiene la **aplicación web cliente** del sistema Eventos Córdoba, construida con **Next.js (Pages Router)**, **React**, **TypeScript** y **Tailwind CSS**.

## Estructura

| Ruta | Descripción |
|------|-------------|
| `pages/` | Rutas de Next.js (Pages Router). Cada archivo `.tsx` es una página accesible por URL |
| `pages/_app.js` / `_document.js` | Configuración global de la aplicación y documento HTML |
| `components/` | Componentes React reutilizables organizados por dominio |
| `components/ui/` | Componentes de interfaz base (Button, Input, etc.) |
| `components/dashboard/` | Widgets y paneles del dashboard de administración |
| `components/landing/` | Secciones de la página de inicio |
| `components/filters/` | Controles de filtrado de eventos |
| `components/notifications/` | Indicadores y listados de notificaciones |
| `lib/` | Utilidades, hooks personalizados (`useEvents`, `useDebounce`), y helpers de API |
| `styles/` | Estilos globales y configuración de Tailwind |
| `types/` | Definiciones de tipos TypeScript compartidos |
| `e2e/` | Tests end-to-end con Playwright |
| `__tests__/` | Tests unitarios con Jest + Testing Library |

## Páginas principales

| Ruta | Funcionalidad |
|------|---------------|
| `/` | Landing page |
| `/events` | Listado de eventos con filtros avanzados |
| `/events/[id]` | Detalle del evento (reserva, mapa, comentarios, reseñas) |
| `/events/create` | Crear nuevo evento (organizador/admin) |
| `/events/edit/[id]` | Editar evento existente |
| `/my-events` | Eventos organizados por el usuario |
| `/my-tickets` | Entradas del usuario con estados |
| `/tickets/[id]` | Detalle de entrada (QR, descarga, cancelación) |
| `/tickets/verify/[token]` | Verificación pública de validez de entrada |
| `/staff/validate` | Escáner de QR y validación manual para personal de evento |
| `/favorites` | Eventos guardados como favoritos |
| `/profile/[id]` | Perfil público de usuario |
| `/profile/edit` | Edición de perfil (avatar, bio, ubicación, intereses) |
| `/dashboard` | Panel de métricas y gestión de usuarios (admin) |
| `/login` / `/register` | Autenticación de usuarios |
| `/verify-email` | Verificación de correo electrónico |

## Convenciones de código

- **Páginas**: ubicadas en `pages/`, nombradas según el routing de Next.js
- **Componentes**: `PascalCase` (`EventCard.tsx`, `UserMenu.tsx`)
- **Hooks**: `camelCase` con prefijo `use` (`useEvents.ts`, `useDebounce.ts`)
- **UI base**: en `components/ui/` (`Button.tsx`, `Input.tsx`)

## Stack y dependencias principales

- **Next.js** ^16.0.8 (Pages Router)
- **React** ^18.2.0
- **TypeScript**
- **Tailwind CSS** ^3.3.3
- **TanStack React Query** ^5.100.9 — Gestión de estado asíncrono y caché
- **Leaflet + react-leaflet** — Mapas interactivos de eventos
- **Framer Motion** — Animaciones de UI
- **Lucide React** — Iconografía
- **Swiper** — Carousels y sliders
- **jsQR** — Lectura de códigos QR en el navegador (validación de tickets)

## Scripts útiles

```bash
npm run dev              # Servidor de desarrollo en localhost:3000
npm run build            # Build de producción de Next.js
npm run type-check       # Verificación de tipos sin emitir
npm run test             # Tests unitarios con Jest
npm run test:e2e         # Tests E2E con Playwright (requiere backend en :3001)
```

## Notas

- El proyecto utiliza **Pages Router** en lugar de App Router por estabilidad y compatibilidad histórica.
- El JWT se almacena en `localStorage` y se envía manualmente en el header `Authorization`. La migración futura recomendada es a cookies `httpOnly`.
