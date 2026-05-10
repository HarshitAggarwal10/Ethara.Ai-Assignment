from functools import wraps
from flask import jsonify, request
from models import User

def handle_errors(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Internal server error'}), 500
    return decorated

def validate_json(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not request.is_json:
            return jsonify({'message': 'Request must be JSON'}), 400
        return f(*args, **kwargs)
    return decorated

def role_required(required_role):
    """Decorator to check if user has required role"""
    def decorator(f):
        @wraps(f)
        def decorated(user_id, *args, **kwargs):
            user = User.query.get(user_id)
            if not user:
                return jsonify({'message': 'User not found'}), 404
            
            if user.role != required_role and required_role != 'any':
                return jsonify({'message': f'Access denied. Required role: {required_role}'}), 403
            
            return f(user_id, *args, **kwargs)
        return decorated
    return decorator

def admin_required(f):
    """Decorator to check if user is admin"""
    @wraps(f)
    def decorated(user_id, *args, **kwargs):
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if user.role != 'admin':
            return jsonify({'message': 'Access denied. Admin privileges required'}), 403
        
        return f(user_id, *args, **kwargs)
    return decorated
