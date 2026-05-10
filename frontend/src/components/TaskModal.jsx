import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function TaskModal({ isOpen, onClose, onTaskCreated, projects: propProjects }) {
  const [formData, setFormData] = useState({
    title: '', description: '', project_id: '', assigned_user_id: '', priority: 'medium', due_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (propProjects && propProjects.length > 0) {
        setProjects(propProjects);
      } else {
        api.get('/api/projects').then(r => setProjects(r.data.data || [])).catch(() => {});
      }
      api.get('/api/users').then(r => setUsers(r.data.data || [])).catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_id) { setError('Please select a project'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/api/tasks', {
        ...formData,
        assigned_user_id: formData.assigned_user_id ? parseInt(formData.assigned_user_id) : null,
        project_id: parseInt(formData.project_id),
      });
      setFormData({ title: '', description: '', project_id: '', assigned_user_id: '', priority: 'medium', due_date: '' });
      onTaskCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating task');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group">
            <label>Task Title *</label>
            <input name="title" type="text" required placeholder="Enter task title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Project *</label>
            <select name="project_id" required value={formData.project_id} onChange={handleChange}>
              <option value="">-- Select a project --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="2" placeholder="Task description..." value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Assign To</label>
            <select name="assigned_user_id" value={formData.assigned_user_id} onChange={handleChange}>
              <option value="">-- Unassigned --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input name="due_date" type="date" value={formData.due_date} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
