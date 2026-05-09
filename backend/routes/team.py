from flask import Blueprint, request, jsonify
from models import db, Project, User, project_members
from utils.auth import token_required

team_bp = Blueprint('team', __name__, url_prefix='/api/team')

@team_bp.route('/projects/<int:project_id>/members', methods=['GET'])
@token_required
def get_project_members(user_id, project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'message': 'Project not found'}), 404
        
        members = project.members
        
        return jsonify([{
            'id': m.id,
            'name': m.name,
            'email': m.email,
            'role': m.role
        } for m in members]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching members'}), 500

@team_bp.route('/projects/<int:project_id>/members', methods=['POST'])
@token_required
def add_project_member(user_id, project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'message': 'Project not found'}), 404
        
        if project.owner_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        member_id = data.get('user_id')
        
        if not member_id:
            return jsonify({'message': 'user_id is required'}), 400
        
        user = User.query.get(member_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if user in project.members:
            return jsonify({'message': 'User is already a member'}), 409
        
        project.members.append(user)
        db.session.commit()
        
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error adding member'}), 500

@team_bp.route('/projects/<int:project_id>/members/<int:member_id>', methods=['DELETE'])
@token_required
def remove_project_member(user_id, project_id, member_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'message': 'Project not found'}), 404
        
        if project.owner_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        member = User.query.get(member_id)
        if not member:
            return jsonify({'message': 'User not found'}), 404
        
        if member not in project.members:
            return jsonify({'message': 'User is not a member'}), 404
        
        project.members.remove(member)
        db.session.commit()
        
        return jsonify({'message': 'Member removed'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error removing member'}), 500
