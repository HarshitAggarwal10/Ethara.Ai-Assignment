import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function ProjectManagementAdmin() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => {
    setFiltered(projects.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(search.toLowerCase())
    ));
  }, [projects, search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const r = await api.get('/api/admin/projects');
      setProjects(r.data.data || []);
    } catch { setError('Failed to load projects'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"?`)) return;
    try {
      await api.delete(`/api/admin/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
      setSuccess('Project deleted'); setTimeout(() => setSuccess(''), 3000);
    } catch (err) { 
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete project'); 
    }
  };

  if (loading) return <div className="loading-page" style={{minHeight:'200px'}}><div className="spinner" /></div>;

  return (
    <div>
      <h2 style={{fontSize:'1.25rem',fontWeight:700,color:'#f1f5f9',marginBottom:'1rem'}}>Project Management</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-bar">
        <input placeholder="Search by project name or owner..." value={search} onChange={e => setSearch(e.target.value)} style={{flex:1}} />
        <div className="filter-count">{filtered.length} projects</div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📁</div><h3>No projects found</h3></div>
      ) : (
        <div className="grid-3">
          {filtered.map(p => (
            <div key={p.id} className="card">
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
                <span style={{fontSize:'1.5rem'}}>📁</span>
                <div>
                  <div style={{fontWeight:700,color:'#f1f5f9'}}>{p.name}</div>
                  <div style={{fontSize:'0.75rem',color:'#64748b'}}>{new Date(p.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              {p.description && <div style={{fontSize:'0.8rem',color:'#64748b',marginBottom:'0.75rem',lineHeight:1.5}}>{p.description}</div>}
              <div style={{display:'flex',gap:'1rem',fontSize:'0.8rem',color:'#94a3b8',marginBottom:'1rem',background:'#0f172a',padding:'0.75rem',borderRadius:'0.5rem'}}>
                <span>👤 {p.owner_name}</span>
                <span>👥 {p.member_count} members</span>
                <span>📋 {p.task_count} tasks</span>
              </div>
              <button className="btn-danger btn-sm" style={{width:'100%'}} onClick={() => handleDelete(p.id, p.name)}>🗑 Delete Project</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
