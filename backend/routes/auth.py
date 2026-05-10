from flask import Blueprint, request, jsonify
from models import db, User
from datetime import datetime
from utils.auth import (
    hash_password, verify_password, generate_token,
    validate_password_strength, validate_email, validate_name,
    ValidationError, token_required, admin_required
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    User registration endpoint
    Accepts: {name, email, password, is_admin_signup (optional)}
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be JSON'
            }), 400
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        missing_fields = [f for f in required_fields if f not in data or not data.get(f)]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing fields',
                'message': f'Required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Validate inputs
        validation_errors = {}
        
        try:
            validate_name(data['name'])
        except ValidationError as e:
            validation_errors['name'] = e.message
        
        try:
            validate_email(data['email'])
        except ValidationError as e:
            validation_errors['email'] = e.message
        
        try:
            validate_password_strength(data['password'])
        except ValidationError as e:
            validation_errors['password'] = e.message
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Please check the following fields',
                'errors': validation_errors
            }), 400
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email'].lower()).first()
        if existing_user:
            return jsonify({
                'error': 'Email exists',
                'message': f'Email {data["email"]} is already registered'
            }), 409
        
        # Check if signup is admin signup
        is_admin_signup = data.get('is_admin_signup', False)
        
        # Create new user
        user = User(
            name=data['name'].strip(),
            email=data['email'].lower(),
            password=hash_password(data['password']),
            role='admin' if is_admin_signup else 'member',
            status='active',
            is_admin_approved=not is_admin_signup,  # Non-admin admins need approval
            phone=data.get('phone', ''),
            department=data.get('department', '')
        )
        
        db.session.add(user)
        db.session.commit()
        
        token = generate_token(user.id)
        
        response = {
            'success': True,
            'message': 'Account created successfully',
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'status': user.status
            }
        }
        
        if is_admin_signup:
            response['admin_note'] = 'Your admin account is pending approval from an existing admin.'
        
        return jsonify(response), 201
        
    except ValidationError as e:
        return jsonify({
            'error': 'Validation error',
            'message': e.message,
            'field': e.field
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Signup failed',
            'message': 'An error occurred while creating the account. Please try again.'
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    Accepts: {email, password}
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be JSON'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate required fields
        if not email or not password:
            return jsonify({
                'error': 'Missing credentials',
                'message': 'Email and password are required'
            }), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        # Verify credentials
        if not user or not verify_password(user.password, password):
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Invalid email or password'
            }), 401
        
        # Check if user account is active
        if user.status != 'active':
            return jsonify({
                'error': 'Account inactive',
                'message': f'Your account status is {user.status}'
            }), 403
        
        # Check if admin user is approved
        if user.role == 'admin' and not user.is_admin_approved:
            return jsonify({
                'error': 'Admin pending',
                'message': 'Your admin account is pending approval'
            }), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'status': user.status
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Login failed',
            'message': 'An error occurred during login. Please try again.'
        }), 500

@auth_bp.route('/verify', methods=['GET'])
def verify_auth():
    """
    Verify if current token is valid
    Used for checking if user is still logged in
    """
    try:
        from utils.auth import token_required
        
        @token_required
        def check_token(user_id):
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'message': 'User associated with token not found'
                }), 404
            
            return jsonify({
                'success': True,
                'message': 'Token is valid',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role
                }
            }), 200
        
        return check_token()
        
    except Exception as e:
        return jsonify({
            'error': 'Verification failed',
            'message': str(e)
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """
    Change user password
    Requires: {current_password, new_password}
    Requires authentication token
    """
    try:
        from utils.auth import token_required
        
        @token_required
        def do_change_password(user_id):
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'error': 'Invalid request',
                    'message': 'Request body must be JSON'
                }), 400
            
            current_password = data.get('current_password', '')
            new_password = data.get('new_password', '')
            
            if not current_password or not new_password:
                return jsonify({
                    'error': 'Missing fields',
                    'message': 'current_password and new_password are required'
                }), 400
            
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'error': 'User not found',
                    'message': 'User not found'
                }), 404
            
            # Verify current password
            if not verify_password(user.password, current_password):
                return jsonify({
                    'error': 'Authentication failed',
                    'message': 'Current password is incorrect'
                }), 401
            
            # Validate new password strength
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
        
        return do_change_password()
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Password change failed',
            'message': 'An error occurred while changing password'
        }), 500
