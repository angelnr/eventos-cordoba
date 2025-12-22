# Fullstack App with Next.js, Prisma, Tailwind, TypeScript, JWT, PostgreSQL, Cloudflare, and Nginx

This is a fullstack application built with Next.js for the frontend, Express.js with Prisma for the backend, using PostgreSQL as the database, JWT for authentication, Tailwind CSS for styling, and containerized with Docker. Nginx acts as a reverse proxy, and Cloudflare Tunnel provides secure tunneling.

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Prisma ORM, PostgreSQL, JWT Authentication
- **Infrastructure**: Docker, Nginx, Cloudflare Tunnel

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

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
├── backend/           # Express.js API server
│   ├── prisma/        # Database schema and migrations
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── ...
├── frontend/          # Next.js application
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── lib/
│   └── ...
├── nginx/             # Reverse proxy configuration
├── cloudflared/       # Cloudflare Tunnel configuration
├── docker-compose.yml
└── README.md
```

## Development

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`
- Database: `cd backend && npx prisma studio`

## Deployment

### Local Development
```bash
# Start all services
docker-compose up

# Or start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

#### 1. Configure Environment Variables
Create a `.env` file in production with:
```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# JWT
JWT_SECRET="your-production-jwt-secret-here"
JWT_EXPIRES_IN="15m"

# API URL for Frontend (IMPORTANT!)
NEXT_PUBLIC_API_URL="https://your-backend-domain.com"
```

#### 2. Deploy Backend
```bash
# Build and run backend
cd backend
docker build -t eventos-backend .
docker run -d -p 3001:3001 --env-file .env eventos-backend
```

#### 3. Deploy Frontend
```bash
# Build for production
cd frontend
npm run build

# Serve with Next.js production server
npm start

# Or use Docker
docker build -t eventos-frontend .
docker run -d -p 3000:3000 eventos-frontend
```

#### 4. Nginx Configuration (Optional)
```nginx
# /etc/nginx/sites-available/eventos-cordoba
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment-Specific API URLs

The application automatically detects the environment:

- **Development** (`localhost`): Uses `http://localhost:3001` or `NEXT_PUBLIC_API_URL`
- **Production** (`eventoscordoba.xyz`): Uses `https://api.eventoscordoba.xyz`
- **Fallback**: Empty string (same domain API routes)

### Configuration for eventoscordoba.xyz

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
