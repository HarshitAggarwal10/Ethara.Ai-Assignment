# Setup Guide

Quick start guide for setting up the Team Task Manager application locally.

## Requirements

- Node.js v18+ (https://nodejs.org/)
- Python 3.8+ (https://www.python.org/)
- PostgreSQL 12+ (https://www.postgresql.org/)
- Git (https://git-scm.com/)

## Step 1: Clone Repository

```bash
git clone https://github.com/HarshitAggarwal10/Ethara.Ai-Assignment.git
cd Ethara.Ai-Assignment
```

## Step 2: Setup PostgreSQL

### Windows
1. Install PostgreSQL from https://www.postgresql.org/download/windows/
2. Open pgAdmin or psql command line
3. Create database:
```sql
CREATE DATABASE task_manager;
```

### macOS
```bash
brew install postgresql
brew services start postgresql
createdb task_manager
```

### Linux
```bash
sudo apt-get install postgresql
sudo -u postgres createdb task_manager
```

## Step 3: Setup Backend

### Navigate to backend directory
```bash
cd backend
```

### Create virtual environment
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Create .env file
Create `backend/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/task_manager
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET=jwt-secret-key-change-in-production
FLASK_ENV=development
FLASK_DEBUG=True
```

Note: Replace `password` with your PostgreSQL password

### Run backend server
```bash
python app.py
```

Backend will start at `http://localhost:5000`

## Step 4: Setup Frontend

### Open new terminal and navigate to frontend
```bash
cd frontend
```

### Install dependencies
```bash
npm install
```

### Create .env file
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

### Start frontend development server
```bash
npm run dev
```

Frontend will start at `http://localhost:3000`

## Step 5: Access Application

1. Open browser and go to `http://localhost:3000`
2. Sign up with a new account or use test credentials
3. Create projects and tasks
4. Manage team members
5. Track progress

## Test Credentials

You can create your own account or use these test credentials:

```
Email: test@example.com
Password: TestPassword123
```

## Troubleshooting

### PostgreSQL Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database `task_manager` exists
- Verify username and password

### Port Already in Use
- Backend port 5000: `lsof -i :5000` (find and kill process)
- Frontend port 3000: `lsof -i :3000` (find and kill process)

### Module Not Found (Backend)
```bash
pip install -r requirements.txt
```

### Module Not Found (Frontend)
```bash
npm install
```

### CORS Error
- Ensure backend is running
- Check VITE_API_URL in frontend .env
- Verify CORS is enabled in Flask app

## Database Reset

To reset the database and start fresh:

### Option 1: Drop and recreate database
```bash
# Using psql
DROP DATABASE task_manager;
CREATE DATABASE task_manager;
```

### Option 2: Delete database tables (in backend)
```bash
python
>>> from app import app, db
>>> with app.app_context():
...     db.drop_all()
...     db.create_all()
>>> exit()
```

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Backend
- Set `FLASK_ENV=production`
- Use a production WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app()
```

## Environment Variables Reference

### Backend (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | Required | PostgreSQL connection string |
| SECRET_KEY | dev-key | Flask secret key |
| JWT_SECRET | jwt-key | JWT signing secret |
| FLASK_ENV | production | Environment mode |
| FLASK_DEBUG | False | Enable debug mode |

### Frontend (.env)
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:5000 | Backend API URL |

## File Structure

```
project/
├── backend/
│   ├── routes/          # API routes
│   ├── utils/           # Utilities
│   ├── models.py        # Database models
│   ├── config.py        # Configuration
│   ├── app.py           # Flask app
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Common Commands

### Backend
```bash
# Start development server
python app.py

# Run with specific port
python -c "from app import create_app; create_app().run(port=5001)"

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Performance Tips

1. Use production build for frontend (`npm run build`)
2. Enable gzip compression in backend
3. Add pagination for large datasets
4. Implement caching for frequently accessed data
5. Use connection pooling for database

## Security Considerations

1. Never commit .env files
2. Use strong SECRET_KEY and JWT_SECRET
3. Validate all inputs on backend
4. Use HTTPS in production
5. Implement rate limiting
6. Keep dependencies updated

## Getting Help

- Check GitHub Issues: https://github.com/HarshitAggarwal10/Ethara.Ai-Assignment/issues
- Review API documentation in API_DOCUMENTATION.md
- Check Flask documentation: https://flask.palletsprojects.com/
- Check React documentation: https://react.dev/

## Next Steps

1. Explore the dashboard
2. Create a test project
3. Add team members
4. Create and assign tasks
5. Track project progress

Happy coding!