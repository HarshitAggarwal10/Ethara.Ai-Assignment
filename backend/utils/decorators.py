from functools import wraps
from flask import jsonify

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
