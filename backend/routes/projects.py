from flask import Blueprint, request, jsonify
from models import db, Project, User, Task
from utils.auth import token_required, admin_required
from datetime import datetime

projects_bp = Blueprint('projects', __name__, url_prefix='/api/projects')

@projects_bp.route('', methods=['GET'])
@token_required
def get_projects(user_id):
    """
    Get all projects for current user
    - Admin: sees all projects
    - Member: sees only their projects and projects they're members of
    """
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Admins can see all projects
        if user.role == 'admin':
            projects = Project.query.all()
        else:
            # Members see their own and projects they're part of
            projects = Project.query.filter(
                (Project.owner_id == user_id) | (Project.members.any(id=user_id))
            ).all()
        
        return jsonify({
            'success': True,
            'count': len(projects),
            'data': [{
                'id': p.id,
                'name': p.name,
                'description': p.description,
                'owner_id': p.owner_id,
                'owner_name': p.owner.name,
                'team_members': len(p.members),
                'total_tasks': len(p.tasks),
                'created_at': p.created_at.isoformat()
            } for p in projects]
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500

@projects_bp.route('', methods=['POST'])
@token_required
def create_project(user_id):
    """Create a new project - Any authenticated user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be JSON'
            }), 400
        
        if not data.get('name') or len(data.get('name', '').strip()) == 0:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Project name is required'
            }), 400
        
        project = Project(
            name=data['name'].strip(),
            description=data.get('description', '').strip(),
            owner_id=user_id
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Project created successfully',
            'data': {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'owner_id': project.owner_id,
                'owner_name': project.owner.name,
                'team_members': 0,
                'total_tasks': 0,
                'created_at': project.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Creation failed',
            'message': str(e)
        }), 500

@projects_bp.route('/<int:project_id>', methods=['GET'])
@token_required
def get_project(user_id, project_id):
    """Get single project details"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({
                'error': 'Not found',
                'message': 'Project not found'
            }), 404
        
        user = User.query.get(user_id)
        
        # Check permissions: owner, member, or admin
        is_owner = project.owner_id == user_id
        is_member = user_id in [m.id for m in project.members]
        is_admin = user.role == 'admin'
        
        if not (is_owner or is_member or is_admin):
            return jsonify({
                'error': 'Access denied',
                'message': 'You do not have access to this project'
            }), 403
        
        # Get task statistics
        tasks = project.tasks
        task_stats = {
            'total': len(tasks),
            'pending': len([t for t in tasks if t.status == 'pending']),
            'in_progress': len([t for t in tasks if t.status == 'in-progress']),
            'completed': len([t for t in tasks if t.status == 'completed']),
            'overdue': len([t for t in tasks if t.status == 'overdue'])
        }
        
        return jsonify({
            'success': True,
            'data': {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'owner_id': project.owner_id,
                'owner_name': project.owner.name,
                'team_members': len(project.members),
                'members': [{
                    'id': m.id,
                    'name': m.name,
                    'email': m.email,
                    'role': m.role
                } for m in project.members],
                'task_stats': task_stats,
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat()
            }
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@token_required
def update_project(user_id, project_id):
    """Update project - Owner or Admin only"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({
                'error': 'Not found',
                'message': 'Project not found'
            }), 404
        
        user = User.query.get(user_id)
        is_owner = project.owner_id == user_id
        is_admin = user.role == 'admin'
        
        if not (is_owner or is_admin):
            return jsonify({
                'error': 'Access denied',
                'message': 'Only owner or admin can update this project'
            }), 403
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be JSON'
            }), 400
        
        if 'name' in data and data.get('name'):
            project.name = data['name'].strip()
        
        if 'description' in data:
            project.description = data.get('description', '').strip()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Project updated successfully',
            'data': {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'owner_id': project.owner_id,
                'owner_name': project.owner.name,
                'team_members': len(project.members),
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Update failed',
            'message': str(e)
        }), 500

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@token_required
def delete_project(user_id, project_id):
    """Delete project - Owner or Admin only"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({
                'error': 'Not found',
                'message': 'Project not found'
            }), 404
        
        user = User.query.get(user_id)
        is_owner = project.owner_id == user_id
        is_admin = user.role == 'admin'
        
        if not (is_owner or is_admin):
            return jsonify({
                'error': 'Access denied',
                'message': 'Only owner or admin can delete this project'
            }), 403
        
        project_name = project.name
        # Clear many-to-many relationship to prevent Postgres ForeignKey violation
        project.members = []
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Project "{project_name}" deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Delete failed',
            'message': str(e)
        }), 500

@projects_bp.route('/<int:project_id>/stats', methods=['GET'])
@token_required
def get_project_stats(user_id, project_id):
    """Get project statistics"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({
                'error': 'Not found',
                'message': 'Project not found'
            }), 404
        
        user = User.query.get(user_id)
        
        # Check permissions
        is_owner = project.owner_id == user_id
        is_member = user_id in [m.id for m in project.members]
        is_admin = user.role == 'admin'
        
        if not (is_owner or is_member or is_admin):
            return jsonify({
                'error': 'Access denied',
                'message': 'You do not have access to this project'
            }), 403
        
        # Calculate statistics
        tasks = project.tasks
        
        task_by_status = {
            'pending': len([t for t in tasks if t.status == 'pending']),
            'in_progress': len([t for t in tasks if t.status == 'in-progress']),
            'completed': len([t for t in tasks if t.status == 'completed']),
            'overdue': len([t for t in tasks if t.status == 'overdue'])
        }
        
        task_by_priority = {
            'low': len([t for t in tasks if t.priority == 'low']),
            'medium': len([t for t in tasks if t.priority == 'medium']),
            'high': len([t for t in tasks if t.priority == 'high'])
        }
        
        completion_rate = 0
        if len(tasks) > 0:
            completion_rate = round((task_by_status['completed'] / len(tasks)) * 100, 2)
        
        return jsonify({
            'success': True,
            'data': {
                'project_id': project.id,
                'project_name': project.name,
                'total_members': len(project.members),
                'total_tasks': len(tasks),
                'tasks_by_status': task_by_status,
                'tasks_by_priority': task_by_priority,
                'completion_rate': completion_rate
            }
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500

