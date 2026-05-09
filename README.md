# Team Task Manager

A full-stack web application for project and task management with role-based access control.

## Features

- **Authentication**: Secure signup and login system
- **Project & Team Management**: Create and manage projects with team members
- **Task Management**: Create, assign, and track task status
- **Dashboard**: View tasks, status, and overdue items
- **Role-Based Access**: Admin and Member roles
- **Real-time Tracking**: Monitor project progress

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios

### Backend
- Python Flask/FastAPI
- PostgreSQL
- SQLAlchemy ORM

### Deployment
- Railway

## Installation

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Database Setup
PostgreSQL database configuration in backend/.env

## API Endpoints

### Authentication
- POST /api/auth/signup
- POST /api/auth/login

### Projects
- GET /api/projects
- POST /api/projects
- PUT /api/projects/<id>
- DELETE /api/projects/<id>

### Tasks
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/<id>
- DELETE /api/tasks/<id>
- PATCH /api/tasks/<id>/status

### Users
- GET /api/users
- PUT /api/users/<id>

## Environment Variables

### Backend
```
DATABASE_URL=postgresql://user:password@localhost/task_manager
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
```

### Frontend
```
VITE_API_URL=http://localhost:5000
```

## Demo
[Live URL will be added after deployment]
