# Docker Documentation

## Overview

The Hr-Pro application uses Docker and Docker Compose to containerize and orchestrate all services, providing a consistent development and deployment environment.

## Docker Architecture

### Services

The application consists of 4 main services:

1. **PostgreSQL Database** (`postgres`)
   - Image: `postgres:15-alpine`
   - Port: `5432:5432`
   - Volume: `postgres_data` (persistent storage)

2. **Backend API** (`backend`)
   - Custom image built from `backend/Dockerfile`
   - Port: `8001:8001`
   - Environment: Database URL, PORT, JWT_SECRET

3. **Frontend Application** (`frontend`)
   - Custom image built from `frontend/Dockerfile`
   - Port: `3001:3000` (host:container)
   - Environment: API URL

4. **pgAdmin** (`pgadmin`)
   - Image: `dpage/pgadmin4:latest`
   - Port: `5050:80`
   - Environment: Admin credentials

### Network

All services communicate via a shared Docker network (`app-network`) using bridge driver.

## Docker Compose Configuration

### File Structure

```yaml
version: '3.8'

services:
  postgres:      # Database service
  pgadmin:      # Database management UI
  backend:      # NestJS API
  frontend:     # Next.js app

volumes:
  postgres_data: # Persistent database storage

networks:
  app-network:  # Shared network
```

### Service Dependencies

```
postgres (healthy)
    ↓
pgadmin ──┐
backend ──┼──→ app-network
frontend ─┘
```

- `pgadmin` depends on `postgres` being healthy
- `backend` depends on `postgres` being healthy
- `frontend` depends on `backend` starting

## Dockerfiles

### Backend Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Prisma CLI globally
RUN npm install -g prisma

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Copy and make entrypoint executable
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 8001

ENTRYPOINT ["./docker-entrypoint.sh"]
```

**Key Features:**
- Alpine Linux base (small image size)
- Prisma CLI installed globally
- Prisma Client generated at build time
- Entrypoint script for migrations and seeding

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

**Key Features:**
- Alpine Linux base
- Development mode (hot-reload)
- Production build would use `npm run build` and `npm start`

## Entrypoint Script

### Backend Entrypoint (`docker-entrypoint.sh`)

```bash
#!/bin/sh

echo "Waiting for database to be ready..."
sleep 5

echo "Running Prisma migrations..."
npx prisma db push --accept-data-loss --skip-generate

echo "Running Prisma seed (if configured)..."
npx prisma db seed || echo "No seed script configured"

echo "Starting NestJS application..."
exec npm run start:dev
```

**What it does:**
1. Waits for database to be ready
2. Pushes Prisma schema to database (creates/updates tables)
3. Runs seed script to populate initial data
4. Starts NestJS in development mode

## Volume Mounts

### Development Volumes

**Backend:**
```yaml
volumes:
  - ./backend:/app          # Source code mount
  - /app/node_modules      # Preserve node_modules
```

**Frontend:**
```yaml
volumes:
  - ./frontend:/app        # Source code mount
  - /app/node_modules      # Preserve node_modules
  - /app/.next             # Preserve Next.js build cache
```

**Benefits:**
- Hot-reload on code changes
- No need to rebuild containers
- Persistent node_modules (faster startup)

### Database Volume

```yaml
volumes:
  postgres_data:
    # Stored in Docker's volume directory
```

**Benefits:**
- Data persists across container restarts
- Data survives `docker-compose down`
- Data removed only with `docker-compose down -v`

## Environment Variables

### Backend Environment

```yaml
environment:
  DATABASE_URL: postgresql://postgres:postgres@postgres:5432/hr_pro?schema=public
  PORT: 8001
```

**Note:** Uses service name `postgres` (not `localhost`) for internal Docker network communication.

### Frontend Environment

```yaml
environment:
  NEXT_PUBLIC_API_URL: http://localhost:8001
```

**Note:** Uses `localhost` because browser makes requests from host machine.

## Starting the Application

### Quick Start

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```batch
start.bat
```

### Manual Start

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Service Status

```bash
# Check running containers
docker-compose ps

# Check container health
docker ps
```

## Stopping the Application

### Quick Stop

**macOS/Linux:**
```bash
./stop.sh
```

**Windows:**
```batch
stop.bat
```

### Manual Stop

```bash
# Stop all services (keeps volumes)
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Database Management

### Accessing PostgreSQL

**From Host Machine:**
```bash
# Using psql (if installed)
psql -h localhost -p 5432 -U postgres -d hr_pro

# Password: postgres
```

**From pgAdmin:**
1. Open http://localhost:5050
2. Login: admin@admin.com / admin
3. Add server:
   - Host: `postgres` (service name)
   - Port: `5432`
   - Database: `hr_pro`
   - Username: `postgres`
   - Password: `postgres`

### Default Application Account

A default admin account is automatically created when the application starts for the first time:

- **Email**: admin@hr-pro.com
- **Password**: admin123
- **Name**: Admin User

You can use these credentials to sign in to the application at http://localhost:3001 immediately after starting the services.

### Running Migrations

**Automatic:**
- Migrations run automatically on backend startup via entrypoint script

**Manual:**
```bash
# Inside backend container
docker-compose exec backend npx prisma migrate dev

# Or push schema directly
docker-compose exec backend npx prisma db push
```

### Seeding Database

**Automatic:**
- Seed runs automatically on backend startup

**Manual:**
```bash
docker-compose exec backend npx prisma db seed
```

## Troubleshooting

### Port Conflicts

**Issue:** Port already in use

**Solution:**
```bash
# Find process using port
lsof -i :8001  # macOS/Linux
netstat -ano | findstr :8001  # Windows

# Stop conflicting service or change port in docker-compose.yml
```

### Container Won't Start

**Check logs:**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Common issues:**
- Database not ready (wait longer)
- Missing environment variables
- Permission issues (check docker-entrypoint.sh)

### Database Connection Issues

**Verify database is healthy:**
```bash
docker-compose ps
# Should show postgres as "healthy"
```

**Check database logs:**
```bash
docker-compose logs postgres
```

**Test connection:**
```bash
docker-compose exec backend npx prisma db push
```

### Rebuild Containers

**Full rebuild:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

**Rebuild specific service:**
```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Reset Everything

**Complete reset (removes all data):**
```bash
docker-compose down -v
docker-compose up -d --build
```

## Production Considerations

### Dockerfile Optimizations

**Multi-stage builds:**
- Separate build and runtime stages
- Smaller final images
- Better caching

**Example:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main"]
```

### Environment Variables

**Production .env:**
- Use secrets management
- Never commit .env files
- Use Docker secrets or external secret managers

### Health Checks

**Add health checks:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Resource Limits

**Add resource constraints:**
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## Best Practices

1. **Use .dockerignore** - Exclude unnecessary files
2. **Layer caching** - Order Dockerfile commands efficiently
3. **Multi-stage builds** - For production images
4. **Health checks** - Monitor service health
5. **Resource limits** - Prevent resource exhaustion
6. **Secrets management** - Never hardcode secrets
7. **Regular updates** - Keep base images updated
8. **Volume backups** - Regular database backups

## Useful Commands

```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs -f [service]

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Restart service
docker-compose restart backend

# Scale services (if needed)
docker-compose up -d --scale backend=3

# Clean up unused resources
docker system prune
```
