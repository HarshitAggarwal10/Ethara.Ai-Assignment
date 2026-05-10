from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.tasks import tasks_bp
from routes.users import users_bp
from routes.team import team_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True,
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"])
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(admin_bp)
    
    with app.app_context():
        db.create_all()
        
        # Auto-create default admin for deployment testing
        from models import User
        from werkzeug.security import generate_password_hash
        if not User.query.filter_by(email='admin@test.com').first():
            default_admin = User(
                name='Admin User',
                email='admin@test.com',
                password=generate_password_hash('adminpass'),
                role='admin',
                status='active',
                is_admin_approved=True,
                department='Administration'
            )
            db.session.add(default_admin)
            db.session.commit()
            print("Default admin created automatically!")
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
