#!/usr/bin/env python3
"""
Create or update test accounts. Does NOT delete existing users.
Credentials use simple passwords (8+ chars) compatible with relaxed validation.
"""
from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

def upsert_user(email, name, role, password, department=''):
    user = User.query.filter_by(email=email).first()
    if user:
        user.role = role
        user.password = generate_password_hash(password)
        user.is_admin_approved = True
        user.status = 'active'
        print(f"  Updated: {email}")
    else:
        user = User(
            name=name, email=email,
            password=generate_password_hash(password),
            role=role, status='active', is_admin_approved=True,
            department=department
        )
        db.session.add(user)
        print(f"  Created: {email}")

def main():
    app = create_app()
    with app.app_context():
        upsert_user('admin@test.com',  'Admin User', 'admin',  'adminpass', 'Administration')
        upsert_user('john@test.com',   'John Doe',   'member', 'johnpass',  'Engineering')
        upsert_user('jane@test.com',   'Jane Smith',  'member', 'janepass',  'Design')
        db.session.commit()

        print("\nTest accounts ready!\n")
        print("Admin:   admin@test.com  /  adminpass")
        print("Member1: john@test.com   /  johnpass")
        print("Member2: jane@test.com   /  janepass\n")

if __name__ == '__main__':
    main()
