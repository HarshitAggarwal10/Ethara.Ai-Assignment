import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { projectAPI, taskAPI } from '../utils/api';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';

const statusBadge = (s) => {
  const map = { pending:'badge-pending', 'in-progress':'badge-in-progress', completed:'badge-completed', overdue:'badge-overdue' };
  return `badge ${map[s] || 'badge-pending'}`;
};
const priorityBadge = (p) => {
  const map = { high:'badge-high', medium:'badge-medium', low:'badge-low' };
  return `badge ${map[p] || 'badge-medium'}`;
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true); setError('');
      const [pRes, tRes] = await Promise.all([projectAPI.getAll(), taskAPI.getAll()]);
      setProjects(pRes.data.data || []);
      setTasks(tRes.data.data || []);
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch { setError('Failed to update status.'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch { setError('Failed to delete task.'); }
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const filteredTasks = tasks.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (priorityFilter === 'all' || t.priority === priorityFilter)
  );

  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">⚡ TaskFlow</div>
        <div className="navbar-links">
          {isAdmin && (
            <button className="nav-link" onClick={() => navigate('/admin')}>Admin Panel</button>
          )}
          <button className="nav-link" onClick={() => navigate('/profile')}>Profile</button>
          <div className="nav-avatar" onClick={logout} title="Logout">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Welcome, {user.name} 👋</h1>
            <p className="page-subtitle">Here's what's happening across your projects.</p>
          </div>
          <div className="flex-row">
            <button className="btn-secondary btn-sm" onClick={() => setShowProjectModal(true)}>+ Project</button>
            {(isAdmin || projects.some(p => p.owner_id === user.id)) && (
              <button className="btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ Task</button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📁</div>
            <div><div className="stat-value">{projects.length}</div><div className="stat-label">Projects</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">📋</div>
            <div><div className="stat-value">{tasks.length}</div><div className="stat-label">Total Tasks</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">⚡</div>
            <div><div className="stat-value">{inProgress}</div><div className="stat-label">In Progress</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">⚠️</div>
            <div><div className="stat-value">{overdue}</div><div className="stat-label">Overdue</div></div>
          </div>
        </div>

        {/* Progress */}
        {tasks.length > 0 && (
          <div className="card progress-wrap" style={{marginBottom:'1.5rem'}}>
            <div className="progress-label">
              <span>Overall Completion</span>
              <span style={{color:'#818cf8',fontWeight:700}}>{pct}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width:`${pct}%`}} />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab==='tasks'?'active':''}`} onClick={() => setActiveTab('tasks')}>📋 Tasks ({tasks.length})</button>
          <button className={`tab-btn ${activeTab==='projects'?'active':''}`} onClick={() => setActiveTab('projects')}>📁 Projects ({projects.length})</button>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <>
            <div className="filter-bar">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="filter-count">{filteredTasks.length} tasks</div>
            </div>
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No tasks found</h3>
                <p>Try adjusting your filters or create a new task.</p>
              </div>
            ) : (
              <div className="grid-2">
                {filteredTasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="task-desc">{task.description}</div>}
                    <div className="task-badges" style={{marginBottom:'0.75rem'}}>
                      <span className={statusBadge(task.status)}>{task.status}</span>
                      <span className={priorityBadge(task.priority)}>{task.priority}</span>
                    </div>
                    <div className="task-meta">
                      <div className="task-info">
                        <div>👤 {task.assigned_to}</div>
                        <div>📁 {task.project_name}</div>
                        {task.due_date && <div>📅 {new Date(task.due_date).toLocaleDateString()}</div>}
                      </div>
                      <div className="flex-row">
                        <select
                          className="status-select"
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        {(isAdmin || task.assigned_to_id === user.id) && (
                          <button className="btn-danger btn-sm" onClick={() => handleDeleteTask(task.id)}>🗑</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started.</p>
            </div>
          ) : (
            <div className="grid-3">
              {projects.map(p => (
                <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="project-card-header">
                    <div>
                      <div className="project-name">{p.name}</div>
                      <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:'0.2rem'}}>by {p.owner_name}</div>
                    </div>
                    <span style={{fontSize:'1.5rem'}}>📁</span>
                  </div>
                  {p.description && <div className="project-desc">{p.description}</div>}
                  <div className="project-stats">
                    <div className="project-stat">👥 <span>{p.team_members}</span> members</div>
                    <div className="project-stat">📋 <span>{p.total_tasks}</span> tasks</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <ProjectModal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} onProjectCreated={() => { setShowProjectModal(false); fetchData(); }} />
      <TaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} onTaskCreated={() => { setShowTaskModal(false); fetchData(); }} projects={projects} />
    </div>
  );
}
