from flask import Blueprint, request, jsonify
from models import db, Project, User
from utils.auth import token_required

projects_bp = Blueprint('projects', __name__, url_prefix='/api/projects')

@projects_bp.route('', methods=['GET'])
@token_required
def get_projects(user_id):
    user = User.query.get(user_id)
    projects = Project.query.filter(
        (Project.owner_id == user_id) | (Project.members.any(id=user_id))
    ).all()
    
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'owner_id': p.owner_id,
        'team_members': len(p.members),
        'created_at': p.created_at.isoformat()
    } for p in projects]), 200

@projects_bp.route('', methods=['POST'])
@token_required
def create_project(user_id):
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Project name is required'}), 400
    
    project = Project(
        name=data['name'],
        description=data.get('description'),
        owner_id=user_id
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify({
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'owner_id': project.owner_id,
        'team_members': 0,
        'created_at': project.created_at.isoformat()
    }), 201

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@token_required
def update_project(user_id, project_id):
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
    
    if project.owner_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    project.name = data.get('name', project.name)
    project.description = data.get('description', project.description)
    
    db.session.commit()
    
    return jsonify({
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'owner_id': project.owner_id,
        'team_members': len(project.members),
        'created_at': project.created_at.isoformat()
    }), 200

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@token_required
def delete_project(user_id, project_id):
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
    
    if project.owner_id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': 'Project deleted'}), 200
