# Team Task Manager

A full-stack web application for project and task management with role-based access control.

## Features

- **Authentication**: Secure signup and login system with JWT tokens
- **Project & Team Management**: Create and manage projects with team members
- **Task Management**: Create, assign, and track task status with priority levels
- **Dashboard**: View tasks, status, and overdue items with real-time statistics
- **Role-Based Access**: Admin and Member roles with permission controls
- **Real-time Tracking**: Monitor project progress with filters and statistics
- **Team Collaboration**: Invite team members and manage permissions

## Tech Stack

### Frontend
- React 18
- Vite (Modern bundler)
- Tailwind CSS (New setup with PostCSS)
- Axios (HTTP client)
- React Router DOM (Navigation)

### Backend
- Python Flask
- PostgreSQL
- SQLAlchemy ORM
- Flask-CORS
- PyJWT (Authentication)

### Deployment
- Railway

## Project Structure

```
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # API client and utilities
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Tailwind CSS
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                  # Flask API server
│   ├── routes/              # API endpoints
│   ├── utils/               # Helper functions
│   ├── models.py            # Database models
│   ├── config.py            # Configuration
│   ├── app.py               # Flask app
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- PostgreSQL (v12 or higher)

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
VITE_API_URL=http://localhost:5000
```

4. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create .env file:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/task_manager
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
FLASK_ENV=development
FLASK_DEBUG=True
```

5. Initialize database:
```bash
python app.py
```

The backend API will be available at `http://localhost:5000`

### Database Setup

1. Create PostgreSQL database:
```bash
createdb task_manager
```

2. The database tables will be created automatically when you run the app

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/<id>` - Update project
- `DELETE /api/projects/<id>` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/<id>/status` - Update task status
- `DELETE /api/tasks/<id>` - Delete task

### Team
- `GET /api/team/projects/<id>/members` - Get project members
- `POST /api/team/projects/<id>/members` - Add team member
- `DELETE /api/team/projects/<id>/members/<member_id>` - Remove member

### Users
- `GET /api/users` - Get all users
- `GET /api/users/<id>` - Get user details
- `PUT /api/users/<id>` - Update user profile

## Features

### Dashboard
- Real-time task statistics
- Task filtering by status and priority
- Project overview
- Quick task creation

### Project Management
- Create and manage projects
- Add team members
- View project tasks
- Track project progress

### Task Management
- Create tasks with title and description
- Assign tasks to team members
- Set priorities (Low, Medium, High)
- Track task status (Pending, In Progress, Completed, Overdue)
- Set due dates

### Team Collaboration
- Manage team members per project
- View all team members
- Role-based access control

## Authentication

The app uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage
- All protected routes require a valid token
- Tokens include user ID and expiration time (30 days)

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

This generates optimized files in the `dist/` folder.

### Backend
Ensure all environment variables are properly set in .env for production.

## Deployment

The application is designed to be deployed on Railway:

1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy frontend and backend separately
4. Configure PostgreSQL database connection

## API Response Format

All API responses follow this format:

Success (2xx):
```json
{
  "id": 1,
  "name": "Project Name",
  ...
}
```

Error (4xx/5xx):
```json
{
  "message": "Error description"
}
```

## Security Features

- JWT-based authentication
- Password hashing using werkzeug
- CORS protection
- SQL injection prevention via SQLAlchemy ORM
- Environment variables for sensitive data

## Error Handling

The application includes comprehensive error handling:
- Validation of all inputs
- Proper HTTP status codes
- User-friendly error messages
- Server-side error logging

## Development

### Running Tests

For backend:
```bash
python -m pytest
```

### Code Style

- Frontend: Follow React best practices
- Backend: Follow PEP 8 Python style guide

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License

## Support

For issues and questions, please create an issue in the GitHub repository.

## Live Deployment

[Live URL will be added after deployment on Railway]

## Demo Video

[Demo video link will be added - 2-5 minutes duration]
