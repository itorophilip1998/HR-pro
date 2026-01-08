# Development Guide

## Development Setup

### Prerequisites

- Node.js 20+ installed
- Docker Desktop installed
- Git installed
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hr-pro
   ```

2. **Start Docker services:**
   ```bash
   ./start.sh
   ```

3. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

4. **Sign in with default account:**
   - The application automatically creates a default admin account on first startup
   - **Email**: admin@hr-pro.com
   - **Password**: admin123
   - Navigate to http://localhost:3001 and sign in with these credentials

## Local Development (Without Docker)

### Backend Development

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed database
   npx prisma db seed
   ```

5. **Start development server:**
   ```bash
   npm run start:dev
   ```

   Server runs on http://localhost:8001

### Frontend Development

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   # Create .env.local
   echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Application runs on http://localhost:3001

## Development Workflow

### Making Changes

1. **Backend changes:**
   - Edit files in `backend/src/`
   - Server auto-reloads (watch mode)
   - Prisma schema changes require regeneration:
     ```bash
     npx prisma generate
     ```

2. **Frontend changes:**
   - Edit files in `frontend/app/` or `frontend/components/`
   - Next.js hot-reloads automatically
   - TypeScript errors shown in terminal

3. **Database changes:**
   - Edit `backend/prisma/schema.prisma`
   - Push changes:
     ```bash
     npx prisma db push
     ```
   - Or create migration:
     ```bash
     npx prisma migrate dev --name your_migration_name
     ```

### Code Style

**Backend:**
- Follow NestJS conventions
- Use TypeScript strict mode
- ESLint and Prettier configured

**Frontend:**
- Follow React/Next.js conventions
- Use functional components with hooks
- Tailwind CSS for styling

### Testing

**Backend tests:**
```bash
cd backend
npm test
npm run test:watch
npm run test:e2e
```

**Frontend tests:**
```bash
cd frontend
npm test
```

## Project Structure

### Backend Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── auth/              # Authentication module
│   │   ├── dto/           # Data transfer objects
│   │   ├── guards/        # Auth guards
│   │   ├── strategies/    # JWT strategy
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/             # User management
│   ├── projects/          # Project CRUD
│   │   ├── dto/
│   │   ├── enums/
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   └── projects.module.ts
│   ├── email/             # Email service
│   ├── prisma/            # Prisma service
│   ├── app.module.ts      # Root module
│   └── main.ts            # Entry point
└── package.json
```

### Frontend Structure

```
frontend/
├── app/                   # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── signup/           # Signup page
│   ├── signin/           # Signin page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects)
├── components/           # React components
│   ├── ProjectsTable.tsx
│   ├── ProjectModal.tsx
│   └── DeleteConfirmModal.tsx
├── lib/                  # Utilities
│   └── api.ts            # API client
├── types/                # TypeScript types
│   └── project.ts
└── package.json
```

## Common Tasks

### Adding a New Feature

1. **Backend:**
   - Create module: `nest g module feature-name`
   - Create controller: `nest g controller feature-name`
   - Create service: `nest g service feature-name`
   - Add to `app.module.ts`

2. **Frontend:**
   - Create component in `components/`
   - Add API functions in `lib/api.ts`
   - Add types in `types/`
   - Use in pages

### Database Changes

1. **Update schema:**
   ```prisma
   model NewModel {
     id   String @id @default(uuid())
     name String
   }
   ```

2. **Generate migration:**
   ```bash
   npx prisma migrate dev --name add_new_model
   ```

3. **Update Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Adding Environment Variables

**Backend:**
1. Add to `backend/.env.example`
2. Add to `backend/.env`
3. Use in code: `process.env.VARIABLE_NAME`

**Frontend:**
1. Add to `.env.local` (for local) or `.env` (for build)
2. Prefix with `NEXT_PUBLIC_` for client-side access
3. Use in code: `process.env.NEXT_PUBLIC_VARIABLE_NAME`

## Debugging

### Backend Debugging

**VS Code launch.json:**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug NestJS",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "start:debug"],
  "port": 9229
}
```

**View logs:**
```bash
docker-compose logs -f backend
```

### Frontend Debugging

**Browser DevTools:**
- React DevTools extension
- Network tab for API calls
- Console for errors

**Next.js Debug Mode:**
```bash
NODE_OPTIONS='--inspect' npm run dev
```

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches

### Commit Messages

Follow conventional commits:
```
feat: add user authentication
fix: resolve signup validation issue
docs: update API documentation
refactor: improve project service
```

## Performance Optimization

### Backend

- Database query optimization
- Caching (Redis for production)
- Connection pooling (Prisma handles this)
- Lazy loading modules

### Frontend

- Code splitting (Next.js automatic)
- Image optimization (Next.js Image component)
- Lazy loading components
- Memoization with useMemo/useCallback

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check database connection
- Verify environment variables
- Check port availability
- Review logs: `docker-compose logs backend`

**Frontend build errors:**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors

**Database connection errors:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Test connection: `npx prisma db push`

**Prisma errors:**
- Regenerate client: `npx prisma generate`
- Reset database: `npx prisma migrate reset`
- Check schema syntax

## Useful Scripts

### Backend Scripts

```bash
npm run start:dev      # Development with watch
npm run start:debug    # Debug mode
npm run build          # Production build
npm run start:prod     # Production start
npm run lint           # Lint code
npm run format         # Format code
npm test               # Run tests
```

### Frontend Scripts

```bash
npm run dev            # Development server
npm run build          # Production build
npm run start          # Production server
npm run lint           # Lint code
```

## Code Quality

### Linting

**Backend:**
```bash
npm run lint
npm run lint -- --fix
```

**Frontend:**
```bash
npm run lint
```

### Formatting

**Backend:**
```bash
npm run format
```

**Frontend:**
- Prettier configured
- Format on save recommended

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

