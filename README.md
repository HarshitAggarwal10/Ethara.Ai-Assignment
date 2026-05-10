# Team Task Manager

A full-stack task management application built with Flask (Python) and React (Vite). Supports user authentication, role-based access control, project management, task assignment, and an admin dashboard.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Test Accounts](#test-accounts)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Projects](#projects)
  - [Tasks](#tasks)
  - [Team Management](#team-management)
  - [Admin](#admin)
- [Database Schema](#database-schema)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)

---

## Features

### Authentication & Authorization
- JWT-based authentication with 30-day token expiry
- Role-based access control (Admin / Member)
- Admin signup with approval workflow
- Password change functionality

### Project Management
- Create, update, and delete projects
- Add and remove team members from projects
- View project-level task statistics and completion rates

### Task Management
- Create tasks with title, description, priority, and due date
- Assign tasks to team members
- Update task status (Pending, In Progress, Completed, Overdue)
- Filter tasks by status and priority

### Admin Dashboard
- System-wide statistics (users, projects, tasks)
- User management: change roles, update status, delete accounts
- Project and task oversight
- Pending admin approval workflow

### User Experience
- Dark-themed, responsive UI
- Real-time dashboard with progress tracking
- Profile management

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python 3, Flask, SQLAlchemy       |
| Database  | SQLite (development)              |
| Auth      | JWT (PyJWT), Werkzeug (bcrypt)    |
| Frontend  | React 18, Vite                    |
| Styling   | CSS (custom dark theme), Tailwind |
| HTTP      | Axios                             |
| Routing   | React Router v6                   |

---

## Project Structure

```
Ethara.Ai Assignment/
├── backend/
│   ├── app.py                  # Flask app factory, CORS config
│   ├── config.py               # App configuration
│   ├── models.py               # SQLAlchemy models (User, Project, Task)
│   ├── create_test_accounts.py # Seed script for test data
│   ├── requirements.txt        # Python dependencies
│   ├── utils/
│   │   ├── auth.py             # JWT helpers, password hashing, decorators
│   │   └── decorators.py       # Role-based access decorators
│   └── routes/
│       ├── auth.py             # Signup, login, token verification
│       ├── users.py            # User CRUD, profile, password change
│       ├── projects.py         # Project CRUD, statistics
│       ├── tasks.py            # Task CRUD, status updates
│       ├── team.py             # Project member management
│       └── admin.py            # Admin-only endpoints
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # Route definitions
│       ├── index.css           # Design system (dark theme)
│       ├── utils/
│       │   ├── api.js          # Axios instance, API wrappers
│       │   └── validation.js   # Form validation helpers
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── TaskModal.jsx
│       │   ├── ProjectModal.jsx
│       │   └── admin/
│       │       ├── UserManagementAdmin.jsx
│       │       ├── TaskManagementAdmin.jsx
│       │       ├── ProjectManagementAdmin.jsx
│       │       └── PendingAdminsAdmin.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Dashboard.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminAuth.jsx
│           ├── ProjectDetails.jsx
│           └── Profile.jsx
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed test accounts
python create_test_accounts.py

# Start the server
python app.py
```

The backend runs at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend runs at `http://localhost:3000` (or `5173` depending on Vite config).

### Test Accounts

Run `python create_test_accounts.py` to create the following accounts:

| Role   | Email            | Password    |
|--------|------------------|-------------|
| Admin  | admin@test.com   | adminpass   |
| Member | john@test.com    | johnpass    |
| Member | jane@test.com    | janepass    |

---

## API Reference

All responses follow a standard envelope format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Description of result"
}
```

Error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable description"
}
```

### Authentication

#### Register

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "is_admin_signup": false       // optional, triggers admin approval flow
}

Response: 201 Created
{
  "success": true,
  "token": "jwt-token",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "member" }
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "token": "jwt-token",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "member" }
}
```

#### Verify Token

```
GET /api/auth/verify
Authorization: Bearer {token}

Response: 200 OK
```

---

### Users

All user endpoints require `Authorization: Bearer {token}`.

| Method | Endpoint                | Access       | Description              |
|--------|-------------------------|--------------|--------------------------|
| GET    | /api/users              | Authenticated | List all active users   |
| GET    | /api/users/me           | Authenticated | Get own profile         |
| PUT    | /api/users/me/profile   | Authenticated | Update own profile      |
| PUT    | /api/users/me/password  | Authenticated | Change password         |
| GET    | /api/users/:id          | Admin / Self  | Get user by ID          |
| PUT    | /api/users/:id          | Admin         | Update user profile     |
| PUT    | /api/users/:id/role     | Admin         | Change user role        |
| DELETE | /api/users/:id          | Admin         | Delete user             |
| GET    | /api/users/search?q=    | Authenticated | Search users            |
| GET    | /api/users/statistics   | Admin         | User statistics         |

---

### Projects

All project endpoints require `Authorization: Bearer {token}`.

| Method | Endpoint                  | Access          | Description             |
|--------|---------------------------|-----------------|-------------------------|
| GET    | /api/projects             | Authenticated   | List accessible projects|
| POST   | /api/projects             | Authenticated   | Create project          |
| GET    | /api/projects/:id         | Owner/Member/Admin | Get project details  |
| PUT    | /api/projects/:id         | Owner/Admin     | Update project          |
| DELETE | /api/projects/:id         | Owner/Admin     | Delete project          |
| GET    | /api/projects/:id/stats   | Owner/Member/Admin | Project statistics   |

#### Create Project

```
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Project",
  "description": "Optional description"
}

Response: 201 Created
```

---

### Tasks

All task endpoints require `Authorization: Bearer {token}`.

| Method | Endpoint                  | Access                    | Description         |
|--------|---------------------------|---------------------------|---------------------|
| GET    | /api/tasks                | Authenticated             | List tasks          |
| POST   | /api/tasks                | Project Owner / Admin     | Create task         |
| GET    | /api/tasks/:id            | Assignee/Owner/Admin      | Get task details    |
| PUT    | /api/tasks/:id            | Project Owner / Admin     | Update task         |
| PATCH  | /api/tasks/:id/status     | Assignee/Owner/Admin      | Update task status  |
| DELETE | /api/tasks/:id            | Project Owner / Admin     | Delete task         |

#### Create Task

```
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Implement login page",
  "description": "Build the login UI",
  "project_id": 1,
  "assigned_user_id": 2,
  "priority": "high",
  "due_date": "2026-06-01T00:00:00"
}

Response: 201 Created
```

#### Update Task Status

```
PATCH /api/tasks/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed"    // pending | in-progress | completed | overdue
}

Response: 200 OK
```

---

### Team Management

| Method | Endpoint                                          | Access          | Description         |
|--------|---------------------------------------------------|-----------------|---------------------|
| GET    | /api/team/projects/:id/members                    | Owner/Member/Admin | List members     |
| POST   | /api/team/projects/:id/members                    | Owner/Admin     | Add member          |
| DELETE | /api/team/projects/:id/members/:member_id         | Owner/Admin     | Remove member       |
| GET    | /api/team/projects/:id/members/:member_id         | Owner/Member/Admin | Get member info  |

#### Add Member

```
POST /api/team/projects/:id/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 3
}

Response: 201 Created
```

---

### Admin

All admin endpoints require admin role. Prefix: `/api/admin`.

| Method | Endpoint                                   | Description                    |
|--------|--------------------------------------------|--------------------------------|
| GET    | /api/admin/stats                           | System-wide statistics         |
| GET    | /api/admin/users                           | List all users (with filters)  |
| GET    | /api/admin/users/:id                       | Get user details               |
| PUT    | /api/admin/users/:id/role                  | Change user role               |
| PUT    | /api/admin/users/:id/status                | Change user status             |
| PUT    | /api/admin/users/:id/profile               | Update user profile            |
| DELETE | /api/admin/users/:id                       | Delete user                    |
| GET    | /api/admin/pending-admins                  | List pending admin requests    |
| PUT    | /api/admin/pending-admins/:id/approve      | Approve admin request          |
| DELETE | /api/admin/pending-admins/:id/reject       | Reject admin request           |
| GET    | /api/admin/projects                        | List all projects              |
| DELETE | /api/admin/projects/:id                    | Delete project                 |

---

## Database Schema

```
users
├── id              INTEGER   PRIMARY KEY
├── name            VARCHAR   NOT NULL
├── email           VARCHAR   UNIQUE, NOT NULL
├── password        VARCHAR   NOT NULL (hashed)
├── role            VARCHAR   DEFAULT 'member'    (admin | member)
├── phone           VARCHAR   NULLABLE
├── department      VARCHAR   NULLABLE
├── status          VARCHAR   DEFAULT 'active'    (active | inactive | suspended)
├── is_admin_approved BOOLEAN DEFAULT FALSE
├── created_at      DATETIME
├── updated_at      DATETIME
└── last_login      DATETIME  NULLABLE

projects
├── id              INTEGER   PRIMARY KEY
├── name            VARCHAR   NOT NULL
├── description     TEXT      NULLABLE
├── owner_id        INTEGER   FOREIGN KEY -> users.id
├── created_at      DATETIME
└── updated_at      DATETIME

project_members (many-to-many)
├── project_id      INTEGER   FOREIGN KEY -> projects.id
└── user_id         INTEGER   FOREIGN KEY -> users.id

tasks
├── id              INTEGER   PRIMARY KEY
├── title           VARCHAR   NOT NULL
├── description     TEXT      NULLABLE
├── project_id      INTEGER   FOREIGN KEY -> projects.id
├── assigned_user_id INTEGER  FOREIGN KEY -> users.id, NULLABLE
├── status          VARCHAR   DEFAULT 'pending'   (pending | in-progress | completed | overdue)
├── priority        VARCHAR   DEFAULT 'medium'    (low | medium | high)
├── due_date        DATETIME  NULLABLE
├── created_at      DATETIME
└── updated_at      DATETIME
```

---

## Architecture

```
Client (React)
    │
    ├── Axios (with JWT interceptor)
    │
    ▼
Flask Server (port 5000)
    │
    ├── CORS middleware
    ├── JWT authentication (@token_required)
    ├── Role authorization (@admin_required)
    │
    ├── /api/auth/*        → auth.py
    ├── /api/users/*       → users.py
    ├── /api/projects/*    → projects.py
    ├── /api/tasks/*       → tasks.py
    ├── /api/team/*        → team.py
    └── /api/admin/*       → admin.py
         │
         ▼
    SQLAlchemy ORM
         │
         ▼
    SQLite Database (task_manager.db)
```

### Key Design Decisions

- **SQLite** is used for zero-config development. Switch to PostgreSQL/MySQL via the `DATABASE_URL` environment variable for production.
- **JWT tokens** are stored in `localStorage` on the client and sent via `Authorization: Bearer` headers.
- **CORS** is configured to allow all origins in development. Restrict this in production.
- **Password hashing** uses Werkzeug's `pbkdf2:sha256` algorithm.
- **Cascade deletes** are configured so deleting a project also removes its tasks.

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'flask'"

Ensure the virtual environment is activated and dependencies are installed:

```bash
venv\Scripts\activate
pip install -r requirements.txt
```

### CORS errors in the browser console

The backend must be running on port 5000. Verify with:

```bash
python app.py
```

If using a different port, update `VITE_API_URL` in the frontend:

```bash
# frontend/.env
VITE_API_URL=http://localhost:5000
```

### "Token is invalid or expired"

JWT tokens expire after 30 days. Log out and log back in to get a new token.

### Database reset

To start fresh, delete the SQLite database and restart:

```bash
del backend\task_manager.db    # Windows
# rm backend/task_manager.db   # macOS/Linux

python app.py                  # Recreates tables
python create_test_accounts.py # Re-seed test data
```

---

## Environment Variables

| Variable       | Default                              | Description                |
|----------------|--------------------------------------|----------------------------|
| SECRET_KEY     | dev-secret-key-change-in-production  | Flask secret key           |
| JWT_SECRET     | jwt-secret-key-change-in-production  | JWT signing key            |
| DATABASE_URL   | sqlite:///task_manager.db            | Database connection string |
| VITE_API_URL   | http://localhost:5000                | Backend URL for frontend   |

---

## License

This project was built as part of the Ethara.Ai assignment.