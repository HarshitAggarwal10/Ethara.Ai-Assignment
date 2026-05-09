# API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Authentication Endpoints

### Signup
Create a new user account
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  }
}
```

### Login
Authenticate user and get token
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  }
}
```

---

## Projects Endpoints

### Get All Projects
Retrieve all projects the user is involved in
```
GET /api/projects
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": 1,
    "name": "Web App Project",
    "description": "Building a new web application",
    "owner_id": 1,
    "team_members": 3,
    "created_at": "2024-01-15T10:30:00"
  }
]
```

### Create Project
Create a new project
```
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mobile App",
  "description": "iOS and Android application"
}
```

Response:
```json
{
  "id": 2,
  "name": "Mobile App",
  "description": "iOS and Android application",
  "owner_id": 1,
  "team_members": 0,
  "created_at": "2024-01-20T14:45:00"
}
```

### Update Project
Update project details
```
PUT /api/projects/<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### Delete Project
Delete a project (owner only)
```
DELETE /api/projects/<id>
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Project deleted"
}
```

---

## Tasks Endpoints

### Get All Tasks
Retrieve all tasks assigned to or created by the user
```
GET /api/tasks
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": 1,
    "title": "Fix login bug",
    "description": "Users cannot login with special characters",
    "project_id": 1,
    "assigned_to": "John Doe",
    "status": "in-progress",
    "priority": "high",
    "due_date": "2024-02-01",
    "created_at": "2024-01-15T10:30:00"
  }
]
```

### Create Task
Create a new task
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Users cannot login with special characters",
  "project_id": 1,
  "assigned_user_id": 2,
  "priority": "high",
  "due_date": "2024-02-01",
  "status": "pending"
}
```

Response:
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Users cannot login with special characters",
  "project_id": 1,
  "assigned_to": "Jane Smith",
  "status": "pending",
  "priority": "high",
  "due_date": "2024-02-01T00:00:00",
  "created_at": "2024-01-15T10:30:00"
}
```

### Update Task Status
Update task status
```
PATCH /api/tasks/<id>/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"
}
```

Valid status values:
- `pending`
- `in-progress`
- `completed`
- `overdue`

### Delete Task
Delete a task
```
DELETE /api/tasks/<id>
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Task deleted"
}
```

---

## Users Endpoints

### Get All Users
Retrieve all users in the system
```
GET /api/users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "created_at": "2024-01-10T08:00:00"
  }
]
```

### Get User Details
Get specific user information
```
GET /api/users/<id>
Authorization: Bearer <token>
```

### Update User Profile
Update user information
```
PUT /api/users/<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith"
}
```

Response:
```json
{
  "id": 1,
  "name": "John Smith",
  "email": "john@example.com",
  "role": "member",
  "created_at": "2024-01-10T08:00:00"
}
```

---

## Team Management Endpoints

### Get Project Members
Get all members of a project
```
GET /api/team/projects/<project_id>/members
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  }
]
```

### Add Project Member
Add a user to a project (project owner only)
```
POST /api/team/projects/<project_id>/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 2
}
```

Response:
```json
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "member"
}
```

### Remove Project Member
Remove a user from a project (project owner only)
```
DELETE /api/team/projects/<project_id>/members/<member_id>
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Member removed"
}
```

---

## Error Responses

### Validation Error
```json
{
  "message": "Missing required fields"
}
```

### Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### Not Found
```json
{
  "message": "Project not found"
}
```

### Conflict
```json
{
  "message": "Email already exists"
}
```

---

## Data Models

### User
```
{
  "id": integer,
  "name": string,
  "email": string (unique),
  "password": string (hashed),
  "role": string (admin|member),
  "created_at": datetime
}
```

### Project
```
{
  "id": integer,
  "name": string,
  "description": string,
  "owner_id": integer (foreign key),
  "created_at": datetime,
  "updated_at": datetime
}
```

### Task
```
{
  "id": integer,
  "title": string,
  "description": string,
  "project_id": integer (foreign key),
  "assigned_user_id": integer (foreign key, nullable),
  "status": string (pending|in-progress|completed|overdue),
  "priority": string (low|medium|high),
  "due_date": datetime (nullable),
  "created_at": datetime,
  "updated_at": datetime
}
```

---

## Rate Limiting
Currently no rate limiting is implemented. For production, implement appropriate rate limiting.

## Pagination
Pagination is not currently implemented. For large datasets, consider adding pagination support.

## Filtering
Current API supports basic filtering through status and priority in the frontend. Server-side filtering can be added for production.