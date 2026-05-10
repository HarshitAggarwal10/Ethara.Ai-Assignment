from flask import Blueprint, request, jsonify
from models import db, Project, User, project_members
from utils.auth import token_required

team_bp = Blueprint('team', __name__, url_prefix='/api/team')

@team_bp.route('/projects/<int:project_id>/members', methods=['GET'])
@token_required
def get_project_members(user_id, project_id):
    """Get project members - Project owner, member, or admin"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({
                'error': 'Not found',
                'message': 'Project not found'
            }), 404
        
        user = User.query.get(user_id)
        is_owner = project.owner_id == user_id
        is_member = user_id in [m.id for m in project.members]
        is_admin = user.role == 'admin'
        
        if not (is_owner or is_member or is_admin):
            return jsonify({
                'error': 'Access denied',
                'message': 'You do not have access to view this project members'
            }), 403
        
        members = project.members
        
        return jsonify({
            'success': True,
            'count': len(members),
            'data': [{
                'id': m.id,
                'name': m.name,
                'email': m.email,
                'role': m.role
            } for m in members]
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500

@team_bp.route('/projects/<int:project_id>/members', methods=['POST'])
@token_required
def add_project_member(user_id, project_id):
    """Add member to project - Project owner or admin"""
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
                'message': 'Only project owner or admin can add members'
            }), 403
        
        data = request.get_json()
        member_id = data.get('user_id')
        
        if not member_id:
            return jsonify({
                'error': 'Missing field',
                'message': 'user_id is required'
            }), 400
        
        member = User.query.get(member_id)
        if not member:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        if member in project.members:
            return jsonify({
                'error': 'Already exists',
                'message': 'User is already a member of this project'
            }), 409
        
        project.members.append(member)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{member.name} added to project',
            'data': {
                'id': member.id,
                'name': member.name,
                'email': member.email,
                'role': member.role
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Add failed',
            'message': str(e)
        }), 500

@team_bp.route('/projects/<int:project_id>/members/<int:member_id>', methods=['DELETE'])
@token_required
def remove_project_member(user_id, project_id, member_id):
    """Remove member from project - Project owner or admin"""
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
                'message': 'Only project owner or admin can remove members'
            }), 403
        
        member = User.query.get(member_id)
        if not member:
            return jsonify({
                'error': 'Not found',
                'message': 'User not found'
            }), 404
        
        if member not in project.members:
            return jsonify({
                'error': 'Not found',
                'message': 'User is not a member of this project'
            }), 404
        
        project.members.remove(member)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{member.name} removed from project'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Remove failed',
            'message': str(e)
        }), 500

@team_bp.route('/projects/<int:project_id>/members/<int:member_id>', methods=['GET'])
@token_required
def get_project_member(user_id, project_id, member_id):
    """Get specific project member details"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({
                'error': 'Not found',
                'message': 'Project not found'
            }), 404
        
        user = User.query.get(user_id)
        is_owner = project.owner_id == user_id
        is_member = user_id in [m.id for m in project.members]
        is_admin = user.role == 'admin'
        
        if not (is_owner or is_member or is_admin):
            return jsonify({
                'error': 'Access denied',
                'message': 'You do not have access to this project'
            }), 403
        
        member = User.query.get(member_id)
        if not member or member not in project.members:
            return jsonify({
                'error': 'Not found',
                'message': 'Member not found in this project'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'id': member.id,
                'name': member.name,
                'email': member.email,
                'role': member.role,
                'is_owner': project.owner_id == member.id
            }
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Fetch failed',
            'message': str(e)
        }), 500

