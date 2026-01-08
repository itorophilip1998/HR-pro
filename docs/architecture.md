# Architecture Documentation

## System Architecture

### Overview

Hr-Pro is a full-stack web application following a client-server architecture with a clear separation between frontend and backend services.

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│   Next.js    │────────▶│   NestJS     │
│  (Client)   │◀────────│  (Frontend)  │◀────────│  (Backend)   │
└─────────────┘         └─────────────┘         └─────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────┐
                                                │ PostgreSQL   │
                                                │  (Database)  │
                                                └─────────────┘
```

## Technology Stack Details

### Frontend Stack

#### Next.js 16.0.3

- **Purpose**: React framework with App Router
- **Features Used**:
  - Server-side rendering capabilities
  - File-based routing
  - API route handlers (not used, backend handles APIs)
  - Client-side navigation
- **Why**: Provides excellent developer experience, performance optimizations, and built-in routing

#### React 19.2.0

- **Purpose**: UI library for building interactive user interfaces
- **Features Used**:
  - Functional components with hooks
  - State management (useState, useEffect, useCallback)
  - Event handling
- **Why**: Industry standard, excellent ecosystem, component reusability

#### TypeScript 5

- **Purpose**: Type-safe JavaScript
- **Benefits**:
  - Compile-time error detection
  - Better IDE support
  - Self-documenting code
  - Refactoring safety

#### Tailwind CSS 4

- **Purpose**: Utility-first CSS framework
- **Features Used**:
  - Responsive design utilities
  - Color system
  - Spacing and layout utilities
  - Custom components
- **Why**: Rapid UI development, consistent design system, small bundle size

#### Axios

- **Purpose**: HTTP client for API communication
- **Features Used**:
  - Request/response interceptors
  - Automatic token injection
  - Error handling
  - Promise-based API

### Backend Stack

#### NestJS 11.0.1

- **Purpose**: Progressive Node.js framework
- **Architecture Pattern**: Modular architecture
- **Key Features**:
  - Dependency injection
  - Decorators for routing and validation
  - Guards for authentication
  - Pipes for data transformation
  - Exception filters
- **Why**: Enterprise-ready, scalable, follows Angular patterns

#### Prisma 6.19.0

- **Purpose**: Next-generation ORM
- **Features Used**:
  - Type-safe database client
  - Schema migrations
  - Database seeding
  - Query builder
- **Why**: Type safety, excellent developer experience, automatic migrations

#### PostgreSQL 15

- **Purpose**: Relational database
- **Schema**:
  - Users table (authentication)
  - Projects table (project data)
- **Why**: Robust, ACID compliant, excellent performance, open-source

#### JWT (JSON Web Tokens)

- **Purpose**: Stateless authentication
- **Implementation**:
  - Access tokens with 7-day expiration
  - Bearer token authentication
  - Token validation middleware
- **Why**: Scalable, stateless, industry standard

#### bcrypt

- **Purpose**: Password hashing
- **Configuration**: 10 salt rounds
- **Why**: Industry standard, secure, slow by design (prevents brute force)

#### Nodemailer

- **Purpose**: Email sending
- **Use Case**: Team member assignment notifications
- **Configuration**: SMTP-based email delivery

## Application Layers

### Frontend Layers

1. **Presentation Layer**

   - React components (ProjectsTable, ProjectModal, etc.)
   - UI/UX with Tailwind CSS
   - Client-side routing

2. **State Management Layer**

   - React hooks (useState, useEffect)
   - Local component state
   - API state management

3. **API Communication Layer**
   - Axios client with interceptors
   - Token management
   - Error handling

### Backend Layers

1. **Controller Layer**

   - Route handlers
   - Request/response handling
   - DTO validation

2. **Service Layer**

   - Business logic
   - Data transformation
   - External service integration (email)

3. **Data Access Layer**

   - Prisma ORM
   - Database queries
   - Data models

4. **Authentication Layer**
   - JWT strategy
   - Password hashing
   - User validation

## Data Flow

### Authentication Flow

```
1. User submits credentials
   ↓
2. Frontend sends POST /auth/signin
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Frontend includes token in subsequent requests
```

### Project Creation Flow

```
1. User fills form and submits
   ↓
2. Frontend validates form data
   ↓
3. Frontend sends POST /projects with token
   ↓
4. Backend validates token
   ↓
5. Backend validates DTO
   ↓
6. Backend creates project in database
   ↓
7. Backend checks if team member is email
   ↓
8. Backend sends email notification (if email)
   ↓
9. Backend returns created project
   ↓
10. Frontend updates UI
```

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Project Model

```prisma
model Project {
  id                String        @id @default(uuid())
  name              String
  status            ProjectStatus
  deadline          DateTime
  assignedTeamMember String
  budget            Float
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

enum ProjectStatus {
  ACTIVE
  ON_HOLD
  COMPLETED
}
```

## Module Structure

### Backend Modules

1. **AuthModule**

   - Signup/Signin endpoints
   - JWT generation
   - Password validation

2. **UsersModule**

   - User CRUD operations
   - Password hashing
   - User lookup

3. **ProjectsModule**

   - Project CRUD operations
   - Status filtering
   - Email integration

4. **EmailModule**

   - Email service
   - SMTP configuration
   - Template rendering

5. **PrismaModule**
   - Database connection
   - Prisma client injection

## Security Architecture

### Authentication Flow

- JWT tokens stored in localStorage
- Tokens included in Authorization header
- Backend validates tokens on protected routes
- Automatic token refresh on expiration

### Authorization

- All project endpoints require valid JWT
- Token validation via Passport JWT strategy
- User information extracted from token payload

### Data Protection

- Passwords never stored in plain text
- SQL injection prevented by Prisma ORM
- XSS protection via React's built-in escaping
- CORS configured for specific origins

## Scalability Considerations

### Current Architecture

- Monolithic backend (can be split into microservices)
- Single database instance
- Stateless authentication (horizontally scalable)

### Future Scalability Options

- Database replication for read scaling
- Redis for session/token caching
- Message queue for email notifications
- CDN for static assets
- Load balancer for multiple backend instances
