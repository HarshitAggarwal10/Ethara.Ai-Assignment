from flask import Blueprint, request, jsonify
from models import db, User, Project, Task
from utils.auth import token_required, admin_required
from datetime import datetime

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ==================== STATISTICS ====================

@admin_bp.route('/stats', methods=['GET'])
@token_required
@admin_required
def get_stats(user_id):
    """Get overall system statistics"""
    try:
        total_users = User.query.count()
        total_admins = User.query.filter_by(role='admin').count()
        total_members = User.query.filter_by(role='member').count()
        active_users = User.query.filter_by(status='active').count()
        
        total_projects = Project.query.count()
        total_tasks = Task.query.count()
        
        completed_tasks = Task.query.filter_by(status='completed').count()
        pending_tasks = Task.query.filter_by(status='pending').count()
        in_progress_tasks = Task.query.filter_by(status='in-progress').count()
        
        return jsonify({
            'success': True,
            'data': {
                'users': {
                    'total': total_users,
                    'admins': total_admins,
                    'members': total_members,
                    'active': active_users
                },
                'projects': {
                    'total': total_projects
                },
                'tasks': {
                    'total': total_tasks,
                    'completed': completed_tasks,
                    'pending': pending_tasks,
                    'in_progress': in_progress_tasks,
                    'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)
                }
            }
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch statistics', 'message': str(e)}), 500


# ==================== USER MANAGEMENT ====================

@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def list_users(user_id):
    """List all users with filters"""
    try:
        role = request.args.get('role')
        status = request.args.get('status')
        
        query = User.query
        
        if role:
            query = query.filter_by(role=role)
        if status:
            query = query.filter_by(status=status)
        
        users = query.all()
        
        return jsonify({
            'success': True,
            'data': [user.to_dict(include_details=True) for user in users]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users', 'message': str(e)}), 500


@admin_bp.route('/users/<int:target_user_id>', methods=['GET'])
@token_required
@admin_required
def get_user(admin_id, target_user_id):
    """Get user details"""
    try:
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Count user's tasks
        tasks_count = Task.query.filter_by(assigned_user_id=target_user_id).count()
        completed_tasks = Task.query.filter_by(assigned_user_id=target_user_id, status='completed').count()
        
        user_data = user.to_dict(include_details=True)
        user_data.update({
            'tasks': {
                'total': tasks_count,
                'completed': completed_tasks
            }
        })
        
        return jsonify({
            'success': True,
            'data': user_data
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user', 'message': str(e)}), 500


@admin_bp.route('/users/<int:target_user_id>/role', methods=['PUT'])
@token_required
@admin_required
def update_user_role(admin_id, target_user_id):
    """Update user role"""
    try:
        if target_user_id == admin_id:
            return jsonify({'error': 'Cannot change your own role'}), 400
        
        data = request.get_json()
        if not data or 'role' not in data:
            return jsonify({'error': 'Role is required'}), 400
        
        role = data.get('role')
        if role not in ['admin', 'member']:
            return jsonify({'error': 'Invalid role'}), 400
        
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        old_role = user.role
        user.role = role
        
        # If promoting to admin, set is_admin_approved to True
        if role == 'admin':
            user.is_admin_approved = True
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User role updated from {old_role} to {role}',
            'data': user.to_dict(include_details=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user role', 'message': str(e)}), 500


@admin_bp.route('/users/<int:target_user_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_user_status(admin_id, target_user_id):
    """Update user account status"""
    try:
        if target_user_id == admin_id:
            return jsonify({'error': 'Cannot change your own status'}), 400
        
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        status = data.get('status')
        if status not in ['active', 'inactive', 'suspended']:
            return jsonify({'error': 'Invalid status'}), 400
        
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        old_status = user.status
        user.status = status
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User status updated from {old_status} to {status}',
            'data': user.to_dict(include_details=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user status', 'message': str(e)}), 500


@admin_bp.route('/users/<int:target_user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(admin_id, target_user_id):
    """Delete a user"""
    try:
        if target_user_id == admin_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Reassign user's tasks to unassigned
        Task.query.filter_by(assigned_user_id=target_user_id).update({'assigned_user_id': None})
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User {user.name} has been deleted'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete user', 'message': str(e)}), 500


@admin_bp.route('/users/<int:target_user_id>/profile', methods=['PUT'])
@token_required
@admin_required
def update_user_profile(admin_id, target_user_id):
    """Update user profile details"""
    try:
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name'].strip()
        if 'phone' in data:
            user.phone = data['phone']
        if 'department' in data:
            user.department = data['department']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User profile updated',
            'data': user.to_dict(include_details=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user profile', 'message': str(e)}), 500


# ==================== PENDING ADMIN APPROVALS ====================

@admin_bp.route('/pending-admins', methods=['GET'])
@token_required
@admin_required
def get_pending_admins(user_id):
    """List pending admin approvals"""
    try:
        pending_admins = User.query.filter_by(role='admin', is_admin_approved=False).all()
        
        return jsonify({
            'success': True,
            'data': [admin.to_dict(include_details=True) for admin in pending_admins]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch pending admins', 'message': str(e)}), 500


@admin_bp.route('/pending-admins/<int:target_user_id>/approve', methods=['PUT'])
@token_required
@admin_required
def approve_admin(admin_id, target_user_id):
    """Approve pending admin"""
    try:
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role != 'admin':
            return jsonify({'error': 'User is not an admin applicant'}), 400
        
        if user.is_admin_approved:
            return jsonify({'error': 'User is already approved'}), 400
        
        user.is_admin_approved = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Admin {user.name} has been approved',
            'data': user.to_dict(include_details=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to approve admin', 'message': str(e)}), 500


@admin_bp.route('/pending-admins/<int:target_user_id>/reject', methods=['DELETE'])
@token_required
@admin_required
def reject_admin(admin_id, target_user_id):
    """Reject pending admin and convert to member"""
    try:
        user = User.query.get(target_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.role != 'admin' or user.is_admin_approved:
            return jsonify({'error': 'Not a pending admin'}), 400
        
        user.role = 'member'
        user.is_admin_approved = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Admin request for {user.name} has been rejected. User is now a member.'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reject admin request', 'message': str(e)}), 500


# ==================== PROJECT MANAGEMENT ====================

@admin_bp.route('/projects', methods=['GET'])
@token_required
@admin_required
def list_all_projects(user_id):
    """List all projects (admin view)"""
    try:
        projects = Project.query.all()
        
        projects_data = []
        for project in projects:
            data = project.to_dict()
            data['owner_name'] = project.owner.name
            data['member_count'] = len(project.members)
            data['task_count'] = len(project.tasks)
            projects_data.append(data)
        
        return jsonify({
            'success': True,
            'data': projects_data
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch projects', 'message': str(e)}), 500


@admin_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_project(admin_id, project_id):
    """Delete a project"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        project_name = project.name
        # Clear many-to-many relationship to prevent Postgres ForeignKey violation
        project.members = []
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Project "{project_name}" has been deleted'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete project', 'message': str(e)}), 500
