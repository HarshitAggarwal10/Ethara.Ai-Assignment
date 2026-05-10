from flask import Blueprint, request, jsonify
from models import db, User
from utils.auth import token_required, hash_password, validate_password_strength, ValidationError
from utils.auth import admin_required
from datetime import datetime

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('', methods=['GET'])
@token_required
def get_all_users(user_id):
    """Get all users - All authenticated users can see basic info"""
    try:
        current_user = User.query.get(user_id)
        users = User.query.filter_by(status='active').all()
        
        if current_user and current_user.role == 'admin':
            # Admins get full details
            data = [{
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'role': u.role,
                'status': u.status,
                'department': u.department,
                'created_at': u.created_at.isoformat()
            } for u in users]
        else:
            # Members get basic info only
            data = [{
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'role': u.role
            } for u in users]
        
        return jsonify({
            'success': True,
            'count': len(users),
            'data': data
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500

@users_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(user_id):
    """Get current user profile"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            }
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user_id, user_id):
    """Get specific user profile - Admin or self"""
    try:
        current_user = User.query.get(current_user_id)
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        # Allow if admin or requesting own profile
        if current_user.role != 'admin' and current_user_id != user_id:
            return jsonify({
                'error': 'Access denied',
                'message': 'You do not have permission to view this profile'
            }), 403
        
        return jsonify({
            'success': True,
            'data': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            }
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500

@users_bp.route('/me/profile', methods=['PUT'])
@token_required
def update_own_profile(user_id):
    """Update own user profile"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be JSON'
            }), 400
        
        if 'name' in data and data.get('name'):
            name = data['name'].strip()
            if len(name) < 2:
                return jsonify({
                    'error': 'Validation failed',
                    'message': 'Name must be at least 2 characters'
                }), 400
            user.name = name
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'data': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Update failed',
            'message': str(e)
        }), 500

@users_bp.route('/<int:target_user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(current_user_id, target_user_id):
    """Update user profile - Admin only"""
    try:
        if current_user_id == target_user_id:
            return jsonify({
                'error': 'Cannot update',
                'message': 'Use /me/profile endpoint to update your own profile'
            }), 400
        
        user = User.query.get(target_user_id)
        
        if not user:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be JSON'
            }), 400
        
        if 'name' in data and data.get('name'):
            name = data['name'].strip()
            if len(name) < 2:
                return jsonify({
                    'error': 'Validation failed',
                    'message': 'Name must be at least 2 characters'
                }), 400
            user.name = name
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'data': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Update failed',
            'message': str(e)
        }), 500

@users_bp.route('/<int:target_user_id>/role', methods=['PUT'])
@token_required
@admin_required
def update_user_role(current_user_id, target_user_id):
    """Update user role - Admin only"""
    try:
        if current_user_id == target_user_id:
            return jsonify({
                'error': 'Cannot update',
                'message': 'Cannot change your own role'
            }), 400
        
        user = User.query.get(target_user_id)
        
        if not user:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        new_role = data.get('role', '').lower()
        
        if new_role not in ['admin', 'member']:
            return jsonify({
                'error': 'Invalid role',
                'message': 'Role must be "admin" or "member"'
            }), 400
        
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User role updated to {new_role}',
            'data': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Update failed',
            'message': str(e)
        }), 500

@users_bp.route('/<int:target_user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user_id, target_user_id):
    """Delete user - Admin only"""
    try:
        if current_user_id == target_user_id:
            return jsonify({
                'error': 'Cannot delete',
                'message': 'Cannot delete your own account'
            }), 400
        
        user = User.query.get(target_user_id)
        
        if not user:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        user_name = user.name
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User "{user_name}" deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Delete failed',
            'message': str(e)
        }), 500

@users_bp.route('/search', methods=['GET'])
@token_required
def search_users(user_id):
    """Search users by email or name"""
    try:
        query = request.args.get('q', '').strip()
        
        if len(query) < 2:
            return jsonify({
                'error': 'Invalid query',
                'message': 'Search query must be at least 2 characters'
            }), 400
        
        # Search in name and email
        users = User.query.filter(
            (User.name.ilike(f'%{query}%')) | (User.email.ilike(f'%{query}%'))
        ).all()
        
        return jsonify({
            'success': True,
            'count': len(users),
            'data': [{
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'role': u.role
            } for u in users]
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Search failed',
            'message': str(e)
        }), 500

@users_bp.route('/me/password', methods=['PUT'])
@token_required
def change_password(user_id):
    """Change current user password"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be JSON'
            }), 400
        
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')
        
        if not old_password or not new_password or not confirm_password:
            return jsonify({
                'error': 'Missing fields',
                'message': 'old_password, new_password, and confirm_password are required'
            }), 400
        
        # Verify old password
        from utils.auth import verify_password
        if not verify_password(user.password, old_password):
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Current password is incorrect'
            }), 401
        
        # Check passwords match
        if new_password != confirm_password:
            return jsonify({
                'error': 'Validation failed',
                'message': 'New passwords do not match'
            }), 400
        
        # Validate password strength
        try:
            validate_password_strength(new_password)
        except ValidationError as e:
            return jsonify({
                'error': 'Weak password',
                'message': e.message,
                'field': 'new_password'
            }), 400
        
        # Update password
        user.password = hash_password(new_password)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Password change failed',
            'message': str(e)
        }), 500

@users_bp.route('/statistics', methods=['GET'])
@token_required
@admin_required
def get_user_statistics(user_id):
    """Get user statistics - Admin only"""
    try:
        all_users = User.query.all()
        admins = [u for u in all_users if u.role == 'admin']
        members = [u for u in all_users if u.role == 'member']
        
        return jsonify({
            'success': True,
            'data': {
                'total_users': len(all_users),
                'admin_count': len(admins),
                'member_count': len(members),
                'users_by_role': {
                    'admin': len(admins),
                    'member': len(members)
                }
            }
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500
