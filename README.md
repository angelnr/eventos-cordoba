# Fullstack App with Next.js, Prisma, Tailwind, TypeScript, JWT, SQLite, Cloudflare, and Nginx

This is a fullstack application built with Next.js for the frontend, Express.js with Prisma for the backend, using SQLite as the database, JWT for authentication, Tailwind CSS for styling, and containerized with Docker. Nginx acts as a reverse proxy, and Cloudflare Tunnel provides secure tunneling.

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Prisma ORM, SQLite, JWT Authentication
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
- Backend API: http://localhost:4000
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

Build and run with Docker Compose for production deployment.
