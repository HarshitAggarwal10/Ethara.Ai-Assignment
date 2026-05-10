from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class UserRole(Enum):
    ADMIN = 'admin'
    MEMBER = 'member'

class TaskStatus(Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in-progress'
    COMPLETED = 'completed'
    OVERDUE = 'overdue'

class TaskPriority(Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='member')
    phone = db.Column(db.String(20), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default='active')  # active, inactive, suspended
    is_admin_approved = db.Column(db.Boolean, default=False)  # For admin signup approval
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    projects = db.relationship('Project', secondary='project_members', backref='members')
    tasks = db.relationship('Task', backref='assignee', foreign_keys='Task.assigned_user_id')

    def __init__(self, name=None, email=None, password=None, role='member',
                 phone=None, department=None, status='active',
                 is_admin_approved=False, **kwargs):
        self.name = name
        self.email = email
        self.password = password
        self.role = role
        self.phone = phone
        self.department = department
        self.status = status
        self.is_admin_approved = is_admin_approved

    def to_dict(self, include_details=False):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
        if include_details:
            data.update({
                'phone': self.phone,
                'department': self.department,
                'is_admin_approved': self.is_admin_approved,
                'updated_at': self.updated_at.isoformat(),
                'last_login': self.last_login.isoformat() if self.last_login else None
            })
        return data

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = db.relationship('User', backref='owned_projects')
    tasks = db.relationship('Task', backref='project', cascade='all, delete-orphan')

    def __init__(self, name=None, description=None, owner_id=None, **kwargs):
        self.name = name
        self.description = description
        self.owner_id = owner_id

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner_id': self.owner_id,
            'team_members': len(self.members),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

project_members = db.Table(
    'project_members',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    status = db.Column(db.String(50), default='pending')
    priority = db.Column(db.String(50), default='medium')
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, title=None, description=None, project_id=None,
                 assigned_user_id=None, status='pending', priority='medium',
                 due_date=None, **kwargs):
        self.title = title
        self.description = description
        self.project_id = project_id
        self.assigned_user_id = assigned_user_id
        self.status = status
        self.priority = priority
        self.due_date = due_date

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'project_id': self.project_id,
            'assigned_to': self.assignee.name if self.assignee else 'Unassigned',
            'status': self.status,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

