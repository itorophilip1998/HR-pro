# API Reference

## Base URL

- **Development**: `http://localhost:8001`
- **Production**: Configure via `NEXT_PUBLIC_API_URL`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Endpoints

### Authentication

#### Sign Up

Create a new user account.

```http
POST /auth/signup
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `name`: Required, string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

#### Sign In

Authenticate and receive a JWT token.

```http
POST /auth/signin
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials

### Projects

#### Get All Projects

Retrieve all projects, optionally filtered by status.

```http
GET /projects?status=ACTIVE
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`ACTIVE`, `ON_HOLD`, `COMPLETED`)

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Website Redesign",
    "status": "ACTIVE",
    "deadline": "2024-12-31T00:00:00.000Z",
    "assignedTeamMember": "team@example.com",
    "budget": 50000,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Single Project

Retrieve a specific project by ID.

```http
GET /projects/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign",
  "status": "ACTIVE",
  "deadline": "2024-12-31T00:00:00.000Z",
  "assignedTeamMember": "team@example.com",
  "budget": 50000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Project not found

#### Create Project

Create a new project.

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Website Redesign",
  "status": "ACTIVE",
  "deadline": "2024-12-31",
  "assignedTeamMember": "team@example.com",
  "budget": 50000
}
```

**Validation Rules:**
- `name`: Required, string
- `status`: Required, enum (`ACTIVE`, `ON_HOLD`, `COMPLETED`)
- `deadline`: Required, valid date string (ISO format)
- `assignedTeamMember`: Required, string
- `budget`: Required, number, minimum 0

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign",
  "status": "ACTIVE",
  "deadline": "2024-12-31T00:00:00.000Z",
  "assignedTeamMember": "team@example.com",
  "budget": 50000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Note**: If `assignedTeamMember` is a valid email address, an email notification will be sent automatically.

**Error Responses:**
- `400 Bad Request`: Validation errors

#### Update Project

Update an existing project.

```http
PATCH /projects/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Project Name",
  "status": "COMPLETED",
  "deadline": "2024-12-31",
  "assignedTeamMember": "newteam@example.com",
  "budget": 55000
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Project Name",
  "status": "COMPLETED",
  "deadline": "2024-12-31T00:00:00.000Z",
  "assignedTeamMember": "newteam@example.com",
  "budget": 55000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Note**: If `assignedTeamMember` is changed to a valid email address, an email notification will be sent.

**Error Responses:**
- `400 Bad Request`: Validation errors
- `404 Not Found`: Project not found

#### Delete Project

Delete a project.

```http
DELETE /projects/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Website Redesign",
  "status": "ACTIVE",
  "deadline": "2024-12-31T00:00:00.000Z",
  "assignedTeamMember": "team@example.com",
  "budget": 50000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Project not found

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": ["name must be a string", "email must be an email"],
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or bad request
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

## Pagination

Currently, all endpoints return all results. Consider adding pagination for large datasets:

```
GET /projects?page=1&limit=10
```

## Filtering and Sorting

- **Filtering**: Available via query parameters (e.g., `?status=ACTIVE`)
- **Sorting**: Currently sorted by `createdAt` descending
- **Search**: Implemented on frontend (client-side)

Future enhancements could include server-side search and sorting.

