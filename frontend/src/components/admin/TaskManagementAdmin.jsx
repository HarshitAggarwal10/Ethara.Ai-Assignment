import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function TaskManagementAdmin() {
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => { fetchTasks(); }, []);
  useEffect(() => {
    let f = tasks;
    if (search) f = f.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.description||'').toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') f = f.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') f = f.filter(t => t.priority === priorityFilter);
    setFiltered(f);
  }, [tasks, search, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const r = await api.get('/api/tasks');
      setTasks(r.data.data || []);
    } catch { setError('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
      setSuccess('Task deleted'); setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to delete task'); }
  };

  const getStatusBadge = (s) => {
    const map = { pending:'badge-pending', 'in-progress':'badge-in-progress', completed:'badge-completed', overdue:'badge-overdue' };
    return `badge ${map[s]||'badge-pending'}`;
  };
  const getPriorityBadge = (p) => {
    const map = { high:'badge-high', medium:'badge-medium', low:'badge-low' };
    return `badge ${map[p]||'badge-medium'}`;
  };

  if (loading) return <div className="loading-page" style={{minHeight:'200px'}}><div className="spinner" /></div>;

  return (
    <div>
      <h2 style={{fontSize:'1.25rem',fontWeight:700,color:'#f1f5f9',marginBottom:'1rem'}}>Task Management</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-bar">
        <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
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
        <div className="filter-count">{filtered.length} tasks</div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>No tasks found</h3></div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th><th>Status</th><th>Priority</th><th>Assigned To</th><th>Project</th><th>Due Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{fontWeight:600,color:'#f1f5f9',maxWidth:'200px'}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</div>
                    {t.description && <div style={{fontSize:'0.75rem',color:'#64748b',marginTop:'2px'}}>{t.description.substring(0,60)}{t.description.length>60?'...':''}</div>}
                  </td>
                  <td><span className={getStatusBadge(t.status)}>{t.status}</span></td>
                  <td><span className={getPriorityBadge(t.priority)}>{t.priority}</span></td>
                  <td style={{color:'#94a3b8'}}>{t.assigned_to}</td>
                  <td style={{color:'#94a3b8'}}>{t.project_name}</td>
                  <td style={{color:'#94a3b8'}}>{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(t.id, t.title)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
