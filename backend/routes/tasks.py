from flask import Blueprint, request, jsonify
from models import db, Task, Project, User
from utils.auth import token_required
from datetime import datetime

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@tasks_bp.route('', methods=['GET'])
@token_required
def get_tasks(user_id):
    """Get tasks - Own tasks or project owner/admin can see all project tasks"""
    try:
        user = User.query.get(user_id)
        
        # Admins can see all tasks
        if user.role == 'admin':
            tasks = Task.query.all()
        else:
            # Members see: tasks assigned to them OR tasks in their projects
            tasks = Task.query.filter(
                (Task.assigned_user_id == user_id) | (Task.project.has(owner_id=user_id))
            ).all()
        
        task_list = [{
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'project_id': t.project_id,
            'project_name': t.project.name,
            'assigned_to': t.assignee.name if t.assignee else 'Unassigned',
            'assigned_to_id': t.assigned_user_id,
            'status': t.status,
            'priority': t.priority,
            'due_date': t.due_date.isoformat() if t.due_date else None,
            'created_at': t.created_at.isoformat()
        } for t in tasks]
        
        return jsonify({'success': True, 'data': task_list}), 200
    except Exception as e:
        print(f"Error fetching tasks: {str(e)}")
        return jsonify({'message': 'Error fetching tasks'}), 500

@tasks_bp.route('', methods=['POST'])
@token_required
def create_task(user_id):
    """Create task - Only project owner or admin"""
    try:
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('project_id'):
            return jsonify({'message': 'Title and project_id are required'}), 400
        
        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({'message': 'Project not found'}), 404
        
        # Check permissions
        user = User.query.get(user_id)
        is_owner = project.owner_id == user_id
        is_admin = user.role == 'admin'
        
        if not (is_owner or is_admin):
            return jsonify({'message': 'Unauthorized. Only project owner or admin can create tasks'}), 403
        
        # Validate assigned_user_id if provided
        assigned_user_id = data.get('assigned_user_id')
        if assigned_user_id:
            assigned_user = User.query.get(assigned_user_id)
            if not assigned_user:
                return jsonify({'message': 'User not found'}), 404
        
        # Parse due_date if provided
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data.get('due_date').replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return jsonify({'message': 'Invalid due_date format. Use ISO 8601 format'}), 400
        
        task = Task(
            title=data.get('title'),
            description=data.get('description'),
            project_id=data.get('project_id'),
            assigned_user_id=assigned_user_id,
            status=data.get('status', 'pending'),
            priority=data.get('priority', 'medium'),
            due_date=due_date
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Task created successfully',
            'data': {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'project_id': task.project_id,
                'project_name': task.project.name,
                'assigned_to': task.assignee.name if task.assignee else 'Unassigned',
                'assigned_to_id': task.assigned_user_id,
                'status': task.status,
                'priority': task.priority,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'created_at': task.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating task: {str(e)}")
        return jsonify({'message': f'Error creating task: {str(e)}'}), 500

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@token_required
def get_task(user_id, task_id):
    """Get single task - Assigned user, project owner, or admin"""
    try:
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({'message': 'Task not found'}), 404
        
        user = User.query.get(user_id)
        is_assigned = task.assigned_user_id == user_id
        is_project_owner = task.project.owner_id == user_id
        is_admin = user.role == 'admin'
        
        if not (is_assigned or is_project_owner or is_admin):
            return jsonify({'message': 'Access denied'}), 403
        
        return jsonify({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'project_id': task.project_id,
            'project_name': task.project.name,
            'assigned_to': task.assignee.name if task.assignee else 'Unassigned',
            'assigned_to_id': task.assigned_user_id,
            'status': task.status,
            'priority': task.priority,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat()
        }), 200
    except Exception as e:
        print(f"Error fetching task: {str(e)}")
        return jsonify({'message': 'Error fetching task'}), 500

@tasks_bp.route('/<int:task_id>/status', methods=['PATCH'])
@token_required
def update_task_status(user_id, task_id):
    """Update task status - Assigned user, project owner, or admin"""
    try:
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({'message': 'Task not found'}), 404
        
        user = User.query.get(user_id)
        is_assigned = task.assigned_user_id == user_id
        is_project_owner = task.project.owner_id == user_id
        is_admin = user.role == 'admin'
        
        if not (is_assigned or is_project_owner or is_admin):
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'in-progress', 'completed', 'overdue']:
            return jsonify({'message': 'Invalid status'}), 400
        
        task.status = new_status
        db.session.commit()
        
        return jsonify({
            'id': task.id,
            'title': task.title,
            'status': task.status,
            'updated_at': task.updated_at.isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating task'}), 500

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@token_required
def update_task(user_id, task_id):
    """Update task - Project owner or admin"""
    try:
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({'message': 'Task not found'}), 404
        
        user = User.query.get(user_id)
        is_project_owner = task.project.owner_id == user_id
        is_admin = user.role == 'admin'
        
        if not (is_project_owner or is_admin):
            return jsonify({'message': 'Unauthorized. Only project owner or admin can update'}), 403
        
        data = request.get_json()
        
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.priority = data.get('priority', task.priority)
        
        if data.get('assigned_user_id'):
            assigned_user = User.query.get(data['assigned_user_id'])
            if not assigned_user:
                return jsonify({'message': 'User not found'}), 404
            task.assigned_user_id = data['assigned_user_id']
        
        if data.get('due_date'):
            try:
                task.due_date = datetime.fromisoformat(data.get('due_date').replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return jsonify({'message': 'Invalid due_date format'}), 400
        
        db.session.commit()
        
        return jsonify({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'project_id': task.project_id,
            'project_name': task.project.name,
            'assigned_to': task.assignee.name if task.assignee else 'Unassigned',
            'assigned_to_id': task.assigned_user_id,
            'status': task.status,
            'priority': task.priority,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'updated_at': task.updated_at.isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating task'}), 500

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(user_id, task_id):
    """Delete task - Project owner or admin"""
    try:
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({'message': 'Task not found'}), 404
        
        user = User.query.get(user_id)
        is_project_owner = task.project.owner_id == user_id
        is_admin = user.role == 'admin'
        
        if not (is_project_owner or is_admin):
            return jsonify({'message': 'Unauthorized. Only project owner or admin can delete'}), 403
        
        task_title = task.title
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Task "{task_title}" deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting task'}), 500
