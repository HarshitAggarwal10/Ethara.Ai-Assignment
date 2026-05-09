from flask import Blueprint, request, jsonify
from models import db, Task, Project, User
from utils.auth import token_required

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@tasks_bp.route('', methods=['GET'])
@token_required
def get_tasks(user_id):
    tasks = Task.query.filter(
        (Task.assigned_user_id == user_id) | (Task.project.has(owner_id=user_id))
    ).all()
    
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'project_id': t.project_id,
        'assigned_to': t.assignee.name if t.assignee else 'Unassigned',
        'status': t.status,
        'priority': t.priority,
        'due_date': t.due_date.isoformat() if t.due_date else None,
        'created_at': t.created_at.isoformat()
    } for t in tasks]), 200

@tasks_bp.route('', methods=['POST'])
@token_required
def create_task(user_id):
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('project_id'):
        return jsonify({'message': 'Title and project_id are required'}), 400
    
    project = Project.query.get(data['project_id'])
    if not project:
        return jsonify({'message': 'Project not found'}), 404
    
    task = Task(
        title=data['title'],
        description=data.get('description'),
        project_id=data['project_id'],
        assigned_user_id=data.get('assigned_user_id'),
        status=data.get('status', 'pending'),
        priority=data.get('priority', 'medium'),
        due_date=data.get('due_date')
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'project_id': task.project_id,
        'assigned_to': task.assignee.name if task.assignee else 'Unassigned',
        'status': task.status,
        'priority': task.priority,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'created_at': task.created_at.isoformat()
    }), 201

@tasks_bp.route('/<int:task_id>/status', methods=['PATCH'])
@token_required
def update_task_status(user_id, task_id):
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    data = request.get_json()
    task.status = data.get('status', task.status)
    
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'status': task.status,
        'updated_at': task.updated_at.isoformat()
    }), 200

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(user_id, task_id):
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted'}), 200
