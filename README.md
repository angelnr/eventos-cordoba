# Fullstack App with Next.js, Prisma, Tailwind, TypeScript, JWT, PostgreSQL, Cloudflare, and Nginx

This is a fullstack application built with Next.js for the frontend, Express.js with Prisma for the backend, using PostgreSQL as the database, JWT for authentication, Tailwind CSS for styling, and containerized with Docker. Nginx acts as a reverse proxy, and Cloudflare Tunnel provides secure tunneling.

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Prisma ORM, PostgreSQL 15, JWT Authentication
- **Infrastructure**: Docker Compose (5 servicios), Nginx, Cloudflare Tunnel

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (para producción local)

### Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://user:pass@postgres:5432/mi_app_db` |
| `JWT_SECRET` | Secreto para firmar tokens (mín. 32 chars) | `a20bdca1369bcdcef4cda99ab285f2b77...` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `15m` |
| `NEXT_PUBLIC_API_URL` | URL del backend (para frontend) | `http://localhost:3001` |
| `NEXT_PUBLIC_FRONTEND_URL` | URL del frontend | `http://localhost:3000` |
| `GOOGLE_MAPS_SERVER_API_KEY` | API key de Google Maps (back-end) | `AIzaSyD...` |
| `CLOUDFLARED_TOKEN` | Token del túnel Cloudflare | `eyJhIjoi...` |

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Set up the database:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values

5. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Nginx Proxy: http://localhost:80

## Project Structure

```
.
├── backend/                # Express.js API server (TypeScript)
│   ├── prisma/             # Schema + migrations + seed
│   ├── src/
│   │   ├── middleware/     # auth.ts, upload.ts
│   │   ├── routes/         # 12 routers (events, users, tickets...)
│   │   ├── services/       # Lógica de negocio (ticketService, etc.)
│   │   └── jobs/           # Cron jobs (reminders, cleanup)
│   └── uploads/            # Imágenes locales
├── frontend/               # Next.js Pages Router
│   ├── components/         # UI + features (landing, dashboard, filters...)
│   ├── pages/              # 19 rutas (SSR/SSG)
│   ├── lib/                # Auth, API, queries, hooks
│   └── styles/             # Tailwind globals
├── nginx/                  # Reverse proxy + security headers
├── cloudflared/            # Cloudflare Tunnel
├── docker-compose.yml      # 5 servicios
├── AGENTS.md               # Convenciones para IA
└── README.md
```

## Development

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`
- Database: `cd backend && npx prisma studio`

## Deployment

### Build and run all services (Docker Compose)
```bash
# Build all images
docker compose build

# Start all services in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Rebuild a single service
```bash
docker compose build frontend
docker compose up -d --no-deps frontend

docker compose build backend
docker compose up -d --no-deps backend

docker compose restart nginx

## Configuration for eventoscordoba.xyz

If you're using the `eventoscordoba.xyz` domain with Cloudflare Tunnel:

If you're using the `eventoscordoba.xyz` domain with Cloudflare Tunnel:

```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://api.eventoscordoba.xyz
NEXT_PUBLIC_FRONTEND_URL=https://eventoscordoba.xyz
DATABASE_URL=postgresql://your_user:your_pass@your_host:5432/your_db
JWT_SECRET=your-secure-jwt-secret-here
```

Your DNS configuration should look like:
- `eventoscordoba.xyz` → Frontend (Proxied)
- `api.eventoscordoba.xyz` → Backend API (Proxied)

### Troubleshooting Production Issues

#### "Failed to fetch" Error
1. Check `NEXT_PUBLIC_API_URL` is set correctly in production
2. Verify backend is accessible from frontend domain
3. Check CORS configuration in backend
4. Ensure HTTPS is configured if using custom domains

#### Database Connection
1. Verify `DATABASE_URL` is correct for production database
2. Run `npm run prisma:push` to sync schema
3. Check database credentials and network access

#### JWT Authentication
1. Set strong `JWT_SECRET` in production
2. Configure appropriate `JWT_EXPIRES_IN` (15m recommended)
3. Ensure tokens are stored securely in localStorage
