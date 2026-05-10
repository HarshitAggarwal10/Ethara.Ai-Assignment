import jwt
import os
import re
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

SECRET_KEY = os.getenv('JWT_SECRET', 'jwt-secret-key-change-in-production')

class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, message, field=None):
        self.message = message
        self.field = field
        super().__init__(self.message)

def validate_password_strength(password):
    """Validate password - minimum 8 characters"""
    if not password or len(password) < 8:
        raise ValidationError('Password must be at least 8 characters long', 'password')
    return True

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError('Invalid email format', 'email')
    return True

def validate_name(name):
    """Validate user name"""
    if not name or len(name.strip()) == 0:
        raise ValidationError('Name cannot be empty', 'name')
    if len(name) < 2:
        raise ValidationError('Name must be at least 2 characters', 'name')
    if len(name) > 255:
        raise ValidationError('Name cannot exceed 255 characters', 'name')
    return True

def hash_password(password):
    """Hash password using werkzeug security"""
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password(hashed_password, password):
    """Verify password against hash"""
    return check_password_hash(hashed_password, password)

def generate_token(user_id):
    """Generate JWT token"""
    try:
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=30),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return token
    except Exception as e:
        raise ValidationError(f'Error generating token: {str(e)}')

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format', 'message': 'Authorization header format: Bearer <token>'}), 401
        
        if not token:
            return jsonify({'error': 'Token missing', 'message': 'Authorization token is required'}), 401
        
        user_id = verify_token(token)
        if user_id is None:
            return jsonify({'error': 'Invalid token', 'message': 'Token is invalid or expired'}), 401
        
        return f(user_id, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated(user_id, *args, **kwargs):
        from models import User
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found', 'message': 'User no longer exists'}), 404
        
        if user.role != 'admin':
            return jsonify({
                'error': 'Access denied',
                'message': 'This action requires admin privileges'
            }), 403
        
        return f(user_id, *args, **kwargs)
    
    return decorated
