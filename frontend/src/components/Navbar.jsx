import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/dashboard')} style={{cursor:'pointer'}}>
        ⚡ TaskFlow
      </div>
      <div className="navbar-links">
        <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
        {user.role === 'admin' && (
          <button className="nav-link" onClick={() => navigate('/admin')}>Admin Panel</button>
        )}
        <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
        <div className="nav-avatar" onClick={logout} title="Logout">
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
    </nav>
  );
}
