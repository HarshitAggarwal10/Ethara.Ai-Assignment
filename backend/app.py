from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.tasks import tasks_bp
from routes.users import users_bp
from routes.team import team_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    CORS(app)
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(team_bp)
    
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
