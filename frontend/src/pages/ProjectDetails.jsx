import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';

const statusBadge = (s) => {
  const map = { pending:'badge-pending', 'in-progress':'badge-in-progress', completed:'badge-completed', overdue:'badge-overdue' };
  return `badge ${map[s] || 'badge-pending'}`;
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchData(); }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true); setError('');
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get('/api/tasks'),
        api.get('/api/users'),
      ]);
      const proj = projRes.data.data;
      setProject(proj);
      setMembers(proj.members || []);
      const allTasks = tasksRes.data.data || [];
      setTasks(allTasks.filter(t => t.project_id === parseInt(projectId)));
      setAllUsers(usersRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 403) setError('You do not have access to this project.');
      else if (err.response?.status === 404) setError('Project not found.');
      else setError('Failed to load project details.');
    } finally { setLoading(false); }
  };

  const isOwner = project && project.owner_id === user.id;
  const isAdmin = user.role === 'admin';
  const canManage = isOwner || isAdmin;

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3500);
  };

  const handleAddMember = async () => {
    if (!selectedMember) return;
    setAddingMember(true);
    try {
      await api.post(`/api/team/projects/${projectId}/members`, { user_id: parseInt(selectedMember) });
      showMsg('✅ Member added successfully!');
      setSelectedMember('');
      setShowAddMember(false);
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to add member', true);
    } finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return;
    try {
      await api.delete(`/api/team/projects/${projectId}/members/${memberId}`);
      showMsg(`✅ ${memberName} removed`);
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to remove member', true);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch { showMsg('Failed to update task status', true); }
  };

  const availableUsers = allUsers.filter(u =>
    !members.some(m => m.id === u.id) && u.id !== project?.owner_id
  );

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="page">
      <Navbar />
      <div className="loading-page" style={{minHeight:'60vh'}}><div className="spinner" /><span>Loading project...</span></div>
    </div>
  );

  if (error && !project) return (
    <div className="page">
      <Navbar />
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Header */}
        <div style={{marginBottom:'1.5rem'}}>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/dashboard')} style={{marginBottom:'1rem'}}>← Back to Dashboard</button>
          <div className="page-header">
            <div>
              <h1 className="page-title">📁 {project.name}</h1>
              {project.description && <p className="page-subtitle">{project.description}</p>}
              <p style={{color:'#64748b',fontSize:'0.8rem',marginTop:'0.25rem'}}>
                Owner: {project.owner_name} · Created: {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
            {canManage && (
              <button className="btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📋</div>
            <div><div className="stat-value">{project.task_stats?.total || tasks.length}</div><div className="stat-label">Total Tasks</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div><div className="stat-value">{project.task_stats?.completed || completed}</div><div className="stat-label">Completed</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">👥</div>
            <div><div className="stat-value">{members.length}</div><div className="stat-label">Team Members</div></div>
          </div>
        </div>

        {/* Progress */}
        {tasks.length > 0 && (
          <div className="card progress-wrap" style={{marginBottom:'1.5rem'}}>
            <div className="progress-label">
              <span>Project Completion</span>
              <span style={{color:'#818cf8',fontWeight:700}}>{pct}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{width:`${pct}%`}} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
          {/* Tasks */}
          <div>
            <h2 style={{fontSize:'1.15rem',fontWeight:700,color:'#f1f5f9',marginBottom:'1rem'}}>📋 Project Tasks</h2>
            {tasks.length === 0 ? (
              <div className="card empty-state" style={{padding:'2rem'}}>
                <div className="empty-icon">📋</div>
                <h3>No tasks yet</h3>
                <p>Create a task to get started.</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {tasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="task-desc">{task.description}</div>}
                    <div className="task-badges" style={{marginBottom:'0.5rem'}}>
                      <span className={statusBadge(task.status)}>{task.status}</span>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </div>
                    <div className="task-meta">
                      <div className="task-info">
                        <span>👤 {task.assigned_to}</span>
                        {task.due_date && <span> · 📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                      </div>
                      <select className="status-select" value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <h2 style={{fontSize:'1.15rem',fontWeight:700,color:'#f1f5f9'}}>👥 Team Members</h2>
              {canManage && (
                <button className="btn-primary btn-sm" onClick={() => setShowAddMember(!showAddMember)}>
                  {showAddMember ? 'Cancel' : '+ Add Member'}
                </button>
              )}
            </div>

            {showAddMember && (
              <div className="card" style={{marginBottom:'1rem',padding:'1rem'}}>
                <div className="form-group" style={{marginBottom:'0.75rem'}}>
                  <label>Select User</label>
                  <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
                    <option value="">-- Select a user --</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-primary btn-sm"
                  onClick={handleAddMember}
                  disabled={!selectedMember || addingMember}
                >
                  {addingMember ? 'Adding...' : 'Add to Project'}
                </button>
              </div>
            )}

            {/* Owner */}
            <div className="card" style={{marginBottom:'0.75rem',padding:'1rem',borderLeft:'3px solid #6366f1'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600,color:'#f1f5f9'}}>{project.owner_name}</div>
                  <div style={{fontSize:'0.8rem',color:'#64748b'}}>Project Owner</div>
                </div>
                <span className="badge badge-admin">Owner</span>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="card empty-state" style={{padding:'2rem'}}>
                <div className="empty-icon">👥</div>
                <h3>No members yet</h3>
                <p>Add team members to collaborate.</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {members.map(m => (
                  <div key={m.id} className="card" style={{padding:'1rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontWeight:600,color:'#f1f5f9'}}>{m.name}</div>
                        <div style={{fontSize:'0.8rem',color:'#64748b'}}>{m.email}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <span className={`badge badge-${m.role}`}>{m.role}</span>
                        {canManage && (
                          <button className="btn-danger btn-sm" onClick={() => handleRemoveMember(m.id, m.name)}>✕</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onTaskCreated={() => { setShowTaskModal(false); fetchData(); }}
        projects={project ? [project] : []}
      />
    </div>
  );
}
