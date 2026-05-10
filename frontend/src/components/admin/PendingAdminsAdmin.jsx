import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function PendingAdminsAdmin() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const r = await api.get('/api/admin/pending-admins');
      setPending(r.data.data || []);
    } catch { setError('Failed to load pending admin requests'); }
    finally { setLoading(false); }
  };

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3500);
  };

  const handleApprove = async (id, name) => {
    try {
      await api.put(`/api/admin/pending-admins/${id}/approve`);
      setPending(prev => prev.filter(a => a.id !== id));
      showMsg(`✅ ${name} approved as admin`);
    } catch { showMsg('Failed to approve admin', true); }
  };

  const handleReject = async (id, name) => {
    if (!confirm(`Reject admin request for ${name}?`)) return;
    try {
      await api.delete(`/api/admin/pending-admins/${id}/reject`);
      setPending(prev => prev.filter(a => a.id !== id));
      showMsg(`${name}'s admin request rejected`);
    } catch { showMsg('Failed to reject admin request', true); }
  };

  if (loading) return <div className="loading-page" style={{minHeight:'200px'}}><div className="spinner" /></div>;

  return (
    <div>
      <h2 style={{fontSize:'1.25rem',fontWeight:700,color:'#f1f5f9',marginBottom:'1rem'}}>Pending Admin Approvals</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {pending.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No pending requests</h3>
          <p>All admin requests have been processed.</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {pending.map(a => (
            <div key={a.id} className="card" style={{borderLeft:'3px solid #eab308'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'1.5rem',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:'0.25rem'}}>👤 {a.name}</div>
                  <div style={{color:'#64748b',fontSize:'0.875rem'}}>✉️ {a.email}</div>
                  {a.department && <div style={{color:'#64748b',fontSize:'0.8rem',marginTop:'0.25rem'}}>🏢 {a.department}</div>}
                </div>
                <div style={{background:'#0f172a',padding:'0.75rem',borderRadius:'0.5rem'}}>
                  <div style={{fontSize:'0.75rem',color:'#64748b',marginBottom:'0.25rem'}}>REQUESTED</div>
                  <div style={{color:'#94a3b8',fontWeight:600}}>{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                  <button className="btn-success btn-sm" onClick={() => handleApprove(a.id, a.name)}>✅ Approve</button>
                  <button className="btn-danger btn-sm" onClick={() => handleReject(a.id, a.name)}>✕ Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
