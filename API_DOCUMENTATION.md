# API Documentation - Team Task Manager

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
| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## 🔐 Authentication Endpoints

### Signup - Create New Account
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  }
}
```

**Error Responses:**
- 400: Missing required fields (name, email, password)
- 409: Email already exists

---

### Login - User Authentication
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  }
}
```

**Error Responses:**
- 400: Missing email or password
- 401: Invalid email or password

---

## 👥 Users Endpoints

### Get All Users
```
GET /api/users
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member",
    "created_at": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin",
    "created_at": "2024-01-15T11:45:00"
  }
]
```

---

### Get User by ID
```
GET /api/users/{user_id}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "member",
  "created_at": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- 404: User not found

---

### Update User
```
PUT /api/users/{user_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated Doe"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Updated Doe",
  "email": "john@example.com",
  "role": "member",
  "created_at": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- 403: Unauthorized - Can only update own profile
- 404: User not found

---

## 📁 Projects Endpoints

### Get All Projects
Get all projects owned by or user is a member of:
```
GET /api/projects
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign company website",
    "owner_id": 1,
    "team_members": 3,
    "created_at": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Mobile App",
    "description": "Build iOS/Android app",
    "owner_id": 1,
    "team_members": 5,
    "created_at": "2024-01-16T14:20:00"
  }
]
```

---

### Create Project
```
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "E-commerce Platform",
  "description": "Build new e-commerce website"
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "E-commerce Platform",
  "description": "Build new e-commerce website",
  "owner_id": 1,
  "team_members": 0,
  "created_at": "2024-01-17T09:15:00"
}
```

**Error Responses:**
- 400: Project name is required

---

### Update Project
```
PUT /api/projects/{project_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "E-commerce Platform v2",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": 3,
  "name": "E-commerce Platform v2",
  "description": "Updated description",
  "owner_id": 1,
  "team_members": 0,
  "created_at": "2024-01-17T09:15:00"
}
```

**Error Responses:**
- 403: Unauthorized - Only project owner can update
- 404: Project not found

---

### Delete Project
```
DELETE /api/projects/{project_id}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- 403: Unauthorized - Only project owner can delete
- 404: Project not found

---

## 📋 Tasks Endpoints

### Get All Tasks
Get tasks assigned to user or in projects they own:
```
GET /api/tasks
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Setup database",
    "description": "Configure PostgreSQL for production",
    "project_id": 1,
    "assigned_to": "Jane Smith",
    "status": "in-progress",
    "priority": "high",
    "due_date": "2024-02-15T00:00:00",
    "created_at": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "title": "Create landing page",
    "description": "Design responsive homepage",
    "project_id": 1,
    "assigned_to": "John Doe",
    "status": "pending",
    "priority": "medium",
    "due_date": "2024-02-20T00:00:00",
    "created_at": "2024-01-15T11:45:00"
  }
]
```

---

### Create Task
```
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "API Development",
  "description": "Build REST API endpoints",
  "project_id": 1,
  "assigned_user_id": 2,
  "status": "pending",
  "priority": "high",
  "due_date": "2024-02-25T00:00:00"
}
```

**Response (201):**
```json
{
  "id": 3,
  "title": "API Development",
  "description": "Build REST API endpoints",
  "project_id": 1,
  "assigned_to": "Jane Smith",
  "status": "pending",
  "priority": "high",
  "due_date": "2024-02-25T00:00:00",
  "created_at": "2024-01-17T14:30:00"
}
```

**Error Responses:**
- 400: Missing title or project_id
- 404: Project not found

---

### Update Task Status
```
PATCH /api/tasks/{task_id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed"
}
```

Valid status values:
- `pending` - Task not started
- `in-progress` - Task is being worked on
- `completed` - Task finished
- `overdue` - Task past due date

**Response (200):**
```json
{
  "id": 3,
  "title": "API Development",
  "status": "completed",
  "updated_at": "2024-01-18T10:15:00"
}
```

**Error Responses:**
- 404: Task not found

---

### Delete Task
```
DELETE /api/tasks/{task_id}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- 404: Task not found

---

## 👨‍💼 Team Management Endpoints

### Get Project Members
```
GET /api/team/projects/{project_id}/members
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "member"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin"
  }
]
```

**Error Responses:**
- 404: Project not found

---

### Add Team Member
```
POST /api/team/projects/{project_id}/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 3
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "Bob Wilson",
  "email": "bob@example.com",
  "role": "member"
}
```

**Error Responses:**
- 400: user_id is required
- 403: Unauthorized - Only project owner can add members
- 404: Project or User not found
- 409: User is already a member

---

### Remove Team Member
```
DELETE /api/team/projects/{project_id}/members/{member_id}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

**Error Responses:**
- 403: Unauthorized - Only project owner can remove members
- 404: Project, user, or membership not found

---

## 💡 Usage Examples

### Complete Workflow Example

#### 1. Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### 2. Login (if needed to get fresh token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### 3. Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Modernize company website"
  }'
```

#### 4. Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design mockups",
    "description": "Create UI mockups for redesign",
    "project_id": 1,
    "priority": "high",
    "due_date": "2024-02-20T00:00:00"
  }'
```

#### 5. Get All Tasks
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer {TOKEN}"
```

#### 6. Update Task Status
```bash
curl -X PATCH http://localhost:5000/api/tasks/1/status \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

---

## 🚀 Rate Limiting

Currently, there are no rate limits on the API. In production, implement rate limiting to prevent abuse.

---

## 📝 Request/Response Examples

### Error Response Format
All error responses follow this format:
```json
{
  "message": "Description of the error"
}
```

### Common Error Messages
| Error | Cause |
|-------|-------|
| "Missing required fields" | Invalid request body |
| "Invalid token format" | Authorization header format incorrect |
| "Token is missing" | No Authorization header provided |
| "Invalid or expired token" | Token is invalid or expired |
| "Unauthorized" | Permission denied |
| "Not found" | Resource doesn't exist |

---

## 🔄 Data Types

### DateTime Format
All dates are in ISO 8601 format:
```
"2024-01-15T10:30:00"
```

### Task Status
- `pending` - Not started
- `in-progress` - In development
- `completed` - Finished
- `overdue` - Past due date

### Task Priority
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority

### User Role
- `member` - Regular member (default)
- `admin` - Administrator

---

## 📚 Testing with Postman/curl

Save this as `environment.json` in Postman:
```json
{
  "values": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:5000"
    },
    {
      "key": "TOKEN",
      "value": ""
    }
  ]
}
```

Then use `{{BASE_URL}}` and `{{TOKEN}}` in requests.

---

**Last Updated:** January 2024  
**API Version:** 1.0  
**Backend:** Flask  
**Database:** SQLite/PostgreSQL
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