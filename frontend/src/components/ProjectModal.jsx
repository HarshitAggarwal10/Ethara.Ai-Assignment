import React, { useState } from 'react';
import api from '../utils/api';

export default function ProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/api/projects', form);
      setForm({ name: '', description: '' });
      onProjectCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>📁 Create New Project</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text" required placeholder="Enter project name"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3" placeholder="Describe the project..."
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
