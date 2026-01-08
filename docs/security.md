# Security Documentation

## Security Overview

This document outlines the security measures implemented in the Hr-Pro application to protect user data, prevent unauthorized access, and ensure secure communication.

## Authentication Security

### JWT (JSON Web Tokens)

**Implementation:**
- Tokens are generated using HS256 algorithm
- Token expiration: 7 days
- Secret key stored in environment variables
- Tokens include user email and ID in payload

**Security Features:**
- Stateless authentication (no server-side session storage)
- Token validation on every protected request
- Automatic token expiration
- Secure token transmission via HTTPS headers

**Token Structure:**
```json
{
  "email": "user@example.com",
  "sub": "user-id",
  "iat": 1234567890,
  "exp": 1235173890
}
```

### Password Security

**Hashing Algorithm:**
- **bcrypt** with 10 salt rounds
- One-way hashing (passwords cannot be decrypted)
- Salt automatically generated per password
- Slow by design (prevents brute force attacks)

**Password Requirements:**
- Minimum 6 characters (configurable)
- Stored as hashed values only
- Never transmitted or logged in plain text

**Example:**
```typescript
// Password: "password123"
// Stored: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

## Authorization

### Protected Routes

All project endpoints require authentication:
- `GET /projects` - Requires token
- `GET /projects/:id` - Requires token
- `POST /projects` - Requires token
- `PATCH /projects/:id` - Requires token
- `DELETE /projects/:id` - Requires token

**Implementation:**
- JWT Guard validates tokens on protected routes
- Invalid or missing tokens result in 401 Unauthorized
- Token validation happens before route handler execution

### Route Protection Example

```typescript
@Controller('projects')
@UseGuards(JwtAuthGuard) // All routes protected
export class ProjectsController {
  // ...
}
```

## Data Validation

### Input Validation

**Backend Validation:**
- DTOs (Data Transfer Objects) with class-validator
- Automatic validation via ValidationPipe
- Whitelist mode (strips unknown properties)
- Forbid non-whitelisted properties

**Validation Rules:**
```typescript
class CreateProjectDto {
  @IsString()
  name: string;

  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @IsDateString()
  deadline: string;

  @IsString()
  assignedTeamMember: string;

  @IsNumber()
  @Min(0)
  budget: number;
}
```

**Frontend Validation:**
- Client-side validation before API calls
- TypeScript type checking
- Form validation with error messages

### SQL Injection Prevention

**Prisma ORM Protection:**
- Parameterized queries (automatic)
- Type-safe query builder
- No raw SQL string concatenation
- Input sanitization built-in

**Example:**
```typescript
// Safe - Prisma handles parameterization
await prisma.project.findUnique({
  where: { id: userInput } // Automatically sanitized
});

// Never do this:
// const query = `SELECT * FROM projects WHERE id = '${userInput}'`;
```

## CORS (Cross-Origin Resource Sharing)

### Configuration

**Backend CORS Settings:**
```typescript
app.enableCors({
  origin: ['http://localhost:3001', 'http://frontend:3000'],
  credentials: true,
});
```

**Security Features:**
- Restricted to specific origins
- Credentials allowed for authenticated requests
- Prevents unauthorized cross-origin requests

## Data Protection

### Sensitive Data Handling

**Environment Variables:**
- Database credentials in `.env` files
- JWT secret in environment variables
- SMTP credentials in environment variables
- `.env` files excluded from version control

**Data at Rest:**
- Passwords hashed with bcrypt
- Database connections encrypted (SSL recommended for production)
- No sensitive data in logs

**Data in Transit:**
- HTTPS recommended for production
- JWT tokens in Authorization header
- No sensitive data in URL parameters

### Error Handling

**Security-Conscious Error Messages:**
- Generic error messages for authentication failures
- No sensitive information in error responses
- Detailed errors only in development mode

**Example:**
```typescript
// Good - Generic error
throw new UnauthorizedException('Invalid credentials');

// Bad - Reveals too much
throw new UnauthorizedException('User not found or password incorrect');
```

## Email Security

### SMTP Configuration

**Secure Email Sending:**
- SMTP over TLS/SSL (port 587)
- Credentials stored in environment variables
- Email validation before sending
- Error handling (email failures don't break app)

**Email Content:**
- No sensitive data in emails
- HTML email templates
- Professional formatting

## Frontend Security

### XSS (Cross-Site Scripting) Prevention

**React Built-in Protection:**
- Automatic escaping of user input
- JSX prevents script injection
- No `dangerouslySetInnerHTML` usage

### Token Storage

**localStorage Usage:**
- JWT tokens stored in localStorage
- Automatic cleanup on logout
- Token removed on 401 errors

**Considerations:**
- localStorage is accessible to JavaScript
- Consider httpOnly cookies for production
- Tokens automatically removed on logout

### API Communication

**Axios Interceptors:**
- Automatic token injection
- Error handling for 401 responses
- Automatic redirect to signin on unauthorized

## Database Security

### Connection Security

**Prisma Configuration:**
- Connection string in environment variables
- Connection pooling
- Prepared statements (automatic)

**Production Recommendations:**
- Use SSL/TLS for database connections
- Restrict database access to application servers
- Regular database backups
- Database user with minimal required permissions

### Data Access Control

**Current Implementation:**
- All authenticated users can access all projects
- No user-specific project filtering

**Future Enhancements:**
- User-project relationships
- Role-based access control (RBAC)
- Project ownership and permissions

## Security Best Practices Implemented

✅ **Password Hashing** - bcrypt with salt
✅ **JWT Authentication** - Stateless, secure tokens
✅ **Input Validation** - DTO validation on all endpoints
✅ **SQL Injection Prevention** - Prisma ORM
✅ **CORS Configuration** - Restricted origins
✅ **Error Handling** - No sensitive data in errors
✅ **Environment Variables** - Sensitive data in .env
✅ **Type Safety** - TypeScript throughout
✅ **HTTPS Ready** - Works with SSL/TLS

## Security Recommendations for Production

### Immediate Actions

1. **Use HTTPS**
   - SSL/TLS certificates
   - Redirect HTTP to HTTPS
   - HSTS headers

2. **Rate Limiting**
   - Implement rate limiting on auth endpoints
   - Prevent brute force attacks
   - Use libraries like `@nestjs/throttler`

3. **Token Storage**
   - Consider httpOnly cookies instead of localStorage
   - Implement refresh tokens
   - Shorter access token expiration

4. **Database Security**
   - Enable SSL for database connections
   - Use connection string with SSL parameters
   - Regular security updates

5. **Environment Variables**
   - Use secret management services
   - Rotate secrets regularly
   - Never commit .env files

### Advanced Security

1. **Content Security Policy (CSP)**
   - Implement CSP headers
   - Prevent XSS attacks
   - Restrict resource loading

2. **Security Headers**
   - X-Frame-Options
   - X-Content-Type-Options
   - Referrer-Policy

3. **Audit Logging**
   - Log authentication attempts
   - Log sensitive operations
   - Monitor for suspicious activity

4. **Dependency Scanning**
   - Regular npm audit
   - Update dependencies
   - Use Dependabot or similar

5. **Penetration Testing**
   - Regular security audits
   - Vulnerability scanning
   - Code reviews

## Security Checklist

- [x] Password hashing implemented
- [x] JWT authentication
- [x] Input validation
- [x] SQL injection prevention
- [x] CORS configuration
- [x] Error handling
- [x] Environment variables
- [ ] Rate limiting (recommended)
- [ ] HTTPS (required for production)
- [ ] Security headers (recommended)
- [ ] Audit logging (recommended)
- [ ] Dependency scanning (recommended)

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not create a public GitHub issue
2. Contact the project maintainer directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

