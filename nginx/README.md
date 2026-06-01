# nginx

Este directorio contiene la configuración del **proxy inverso y balanceador de carga** basado en **Nginx**, que actúa como punto de entrada único para la arquitectura Dockerizada del sistema.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `nginx.conf` | Configuración principal de Nginx: upstreams, proxying, rate limiting, headers de seguridad y servicio de archivos estáticos |
| `Dockerfile` | Imagen custom de Nginx para despliegue en contenedor |

## Funcionalidades principales

### Proxy inverso
- Redirige el tráfico HTTP al **frontend** (Next.js en `:3000`) para rutas raíz (`/`)
- Redirige el tráfico de `/api` al **backend** (Express en `:3001`)

### Rate limiting
- Zona `api` limitada a **20 requests/segundo** con `burst=40` para todas las rutas bajo `/api`

### Headers de seguridad HTTP
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restringido (sin geolocalización ni micrófono por defecto)
- `server_tokens off`

### Archivos estáticos
- Cacheo agresivo de assets de Next.js (`/_next/static`) con `immutable` y 1 año de expiración
- Servicio de archivos subidos (`/uploads/`) con cache de 30 días y protección contra ejecución de scripts (denegación de `.php`, `.py`, `.sh`, etc.)

## Notas

- El CORS se delega **exclusivamente al backend** para evitar configuraciones contradictorias entre capas.
- `client_max_body_size 5m` limita el tamaño de subidas de imágenes (avatares e imágenes de eventos).
