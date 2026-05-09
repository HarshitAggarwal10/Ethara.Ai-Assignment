from flask import Blueprint, request, jsonify
from models import db, User
from utils.auth import token_required

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('', methods=['GET'])
@token_required
def get_users(user_id):
    users = User.query.all()
    
    return jsonify([{
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'role': u.role,
        'created_at': u.created_at.isoformat()
    } for u in users]), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user_id, user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat()
    }), 200

@users_bp.route('/<int:user_id>', methods=['PUT'])
@token_required
def update_user(current_user_id, user_id):
    if current_user_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    user.name = data.get('name', user.name)
    
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat()
    }), 200
