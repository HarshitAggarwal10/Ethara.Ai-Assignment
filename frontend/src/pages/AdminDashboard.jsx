import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import UserManagementAdmin from '../components/admin/UserManagementAdmin';
import ProjectManagementAdmin from '../components/admin/ProjectManagementAdmin';
import TaskManagementAdmin from '../components/admin/TaskManagementAdmin';
import PendingAdminsAdmin from '../components/admin/PendingAdminsAdmin';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role !== 'admin') { navigate('/dashboard'); return; }
    api.get('/api/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const tabs = [
    { id: 'stats', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'pending', label: '⏳ Pending Admins' },
    { id: 'projects', label: '📁 Projects' },
    { id: 'tasks', label: '📋 Tasks' },
  ];

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading admin dashboard...</span>
    </div>
  );

  return (
    <div className="page">
      <nav className="navbar">
        <div className="navbar-brand">🛡️ Admin Panel</div>
        <div className="navbar-links">
          <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <div className="nav-avatar" onClick={logout} title="Logout">{user.name?.charAt(0).toUpperCase()}</div>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user.name}</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div><div className="stat-value">{stats.users.total}</div><div className="stat-label">Total Users</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">🛡️</div>
              <div><div className="stat-value">{stats.users.admins}</div><div className="stat-label">Admins</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">👤</div>
              <div><div className="stat-value">{stats.users.members}</div><div className="stat-label">Members</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">📁</div>
              <div><div className="stat-value">{stats.projects.total}</div><div className="stat-label">Projects</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div><div className="stat-value">{stats.tasks.completed}</div><div className="stat-label">Completed Tasks</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">📋</div>
              <div><div className="stat-value">{stats.tasks.total}</div><div className="stat-label">Total Tasks ({stats.tasks.completion_rate}%)</div></div>
            </div>
          </div>
        )}

        {/* Progress */}
        {stats && stats.tasks.total > 0 && (
          <div className="card progress-wrap" style={{marginBottom:'1.5rem'}}>
            <div className="progress-label">
              <span>Overall Task Completion</span>
              <span style={{color:'#818cf8',fontWeight:700}}>{stats.tasks.completion_rate}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width:`${stats.tasks.completion_rate}%`}} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${activeTab===t.id?'active':''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && stats && (
          <div className="grid-2">
            {[
              { label: 'Pending Tasks', val: stats.tasks.pending, icon: '⏳', cls: 'yellow' },
              { label: 'In Progress', val: stats.tasks.in_progress, icon: '⚡', cls: 'blue' },
              { label: 'Completed', val: stats.tasks.completed, icon: '✅', cls: 'green' },
              { label: 'Active Users', val: stats.users.active, icon: '👤', cls: 'purple' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                <div><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'users' && <UserManagementAdmin />}
        {activeTab === 'pending' && <PendingAdminsAdmin />}
        {activeTab === 'projects' && <ProjectManagementAdmin />}
        {activeTab === 'tasks' && <TaskManagementAdmin />}
      </div>
    </div>
  );
}
