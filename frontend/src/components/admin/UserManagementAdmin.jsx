import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function UserManagementAdmin() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null); // {user, action}
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => {
    let f = users;
    if (search) f = f.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter !== 'all') f = f.filter(u => u.role === roleFilter);
    if (statusFilter !== 'all') f = f.filter(u => u.status === statusFilter);
    setFiltered(f);
  }, [users, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const r = await api.get('/api/admin/users');
      setUsers(r.data.data || []);
    } catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  };

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3500);
  };

  const openModal = (user, action) => {
    setModal({ user, action });
    setNewRole(user.role);
    setNewStatus(user.status);
    setError(''); setSuccess('');
  };
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleSave = async () => {
    if (!modal) return;
    const { user, action } = modal;
    setSaving(true);
    try {
      if (action === 'role') {
        await api.put(`/api/admin/users/${user.id}/role`, { role: newRole });
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole, is_admin_approved: newRole === 'admin' ? true : u.is_admin_approved } : u));
        showMsg(`✅ Role updated to "${newRole}" for ${user.name}`);
      } else if (action === 'status') {
        await api.put(`/api/admin/users/${user.id}/status`, { status: newStatus });
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        showMsg(`✅ Status updated to "${newStatus}" for ${user.name}`);
      } else if (action === 'delete') {
        await api.delete(`/api/admin/users/${user.id}`);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        showMsg(`✅ User "${user.name}" deleted`);
      }
      closeModal();
    } catch (err) {
      showMsg(err.response?.data?.error || err.response?.data?.message || 'Action failed', true);
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-page" style={{minHeight:'200px'}}><div className="spinner" /></div>;

  return (
    <div>
      <h2 style={{fontSize:'1.25rem',fontWeight:700,color:'#f1f5f9',marginBottom:'1rem'}}>User Management</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-bar">
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <div className="filter-count">{filtered.length} users</div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{fontWeight:600,color:'#f1f5f9'}}>{u.name} {u.id === currentUser.id && <span style={{color:'#6366f1',fontSize:'0.75rem'}}>(you)</span>}</td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                <td style={{color:'#64748b'}}>{u.department || '—'}</td>
                <td>
                  {u.id === currentUser.id ? (
                    <span style={{color:'#64748b',fontSize:'0.8rem'}}>Current user</span>
                  ) : (
                    <div className="action-btns">
                      <button className="btn-secondary btn-sm" onClick={() => openModal(u, 'role')}>Role</button>
                      <button className="btn-secondary btn-sm" onClick={() => openModal(u, 'status')}>Status</button>
                      <button className="btn-danger btn-sm" onClick={() => openModal(u, 'delete')}>🗑</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{textAlign:'center',color:'#64748b',padding:'2rem'}}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>
                {modal.action === 'role' && `Change Role — ${modal.user.name}`}
                {modal.action === 'status' && `Change Status — ${modal.user.name}`}
                {modal.action === 'delete' && `Delete User`}
              </h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-form">
              {modal.action === 'role' && (
                <div className="form-group">
                  <label>New Role</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span style={{fontSize:'0.78rem',color:'#64748b'}}>Current: <strong style={{color:'#a5b4fc'}}>{modal.user.role}</strong></span>
                </div>
              )}
              {modal.action === 'status' && (
                <div className="form-group">
                  <label>New Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <span style={{fontSize:'0.78rem',color:'#64748b'}}>Current: <strong style={{color:'#a5b4fc'}}>{modal.user.status}</strong></span>
                </div>
              )}
              {modal.action === 'delete' && (
                <div className="alert alert-error">
                  Are you sure you want to permanently delete <strong>{modal.user.name}</strong>? This cannot be undone.
                </div>
              )}
              <div className="modal-actions">
                <button className="btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                <button
                  className={modal.action === 'delete' ? 'btn-danger' : 'btn-primary'}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : modal.action === 'delete' ? 'Delete' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
