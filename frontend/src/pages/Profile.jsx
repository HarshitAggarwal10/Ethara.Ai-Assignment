import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { userAPI } from '../utils/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    setLoading(true);
    try {
      const res = await userAPI.updateProfile({ name: name.trim() });
      const updated = { ...user, name: res.data.data?.name || name.trim() };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setIsEditing(false);
      showMsg('✅ Profile updated successfully!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update profile', true);
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.old_password) { showMsg('Current password is required', true); return; }
    if (!pwForm.new_password || pwForm.new_password.length < 8) { showMsg('New password must be at least 8 characters', true); return; }
    if (pwForm.new_password !== pwForm.confirm_password) { showMsg('Passwords do not match', true); return; }
    setLoading(true);
    try {
      await userAPI.updatePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password, confirm_password: pwForm.confirm_password });
      setPwForm({ old_password: '', new_password: '', confirm_password: '' });
      showMsg('✅ Password changed successfully!');
      setActiveTab('profile');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to change password', true);
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{maxWidth:'700px'}}>
        <div className="page-header">
          <div>
            <h1 className="page-title">⚙️ Profile Settings</h1>
            <p className="page-subtitle">Manage your account information and security</p>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>← Back</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card" style={{marginBottom:'1.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
            <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.75rem',fontWeight:800,color:'#fff',flexShrink:0}}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:'1.2rem',color:'#f1f5f9'}}>{user.name}</div>
              <div style={{color:'#64748b',fontSize:'0.875rem'}}>{user.email}</div>
              <span className={`badge badge-${user.role}`} style={{marginTop:'0.35rem'}}>{user.role}</span>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${activeTab==='profile'?'active':''}`} onClick={() => setActiveTab('profile')}>👤 Profile Info</button>
          <button className={`tab-btn ${activeTab==='password'?'active':''}`} onClick={() => setActiveTab('password')}>🔒 Change Password</button>
        </div>

        {activeTab === 'profile' && (
          <div className="card">
            <form onSubmit={handleSaveProfile}>
              <div className="form-group" style={{marginBottom:'1rem'}}>
                <label>Full Name</label>
                {isEditing
                  ? <input type="text" value={name} onChange={e => setName(e.target.value)} />
                  : <div style={{padding:'0.7rem 1rem',background:'#0f172a',borderRadius:'0.6rem',color:'#f1f5f9'}}>{user.name}</div>
                }
              </div>
              <div className="form-group" style={{marginBottom:'1rem'}}>
                <label>Email <span style={{color:'#64748b',fontSize:'0.75rem'}}>(cannot be changed)</span></label>
                <div style={{padding:'0.7rem 1rem',background:'#0f172a',borderRadius:'0.6rem',color:'#64748b'}}>{user.email}</div>
              </div>
              <div className="form-group" style={{marginBottom:'1.5rem'}}>
                <label>Role <span style={{color:'#64748b',fontSize:'0.75rem'}}>(managed by admin)</span></label>
                <div style={{padding:'0.7rem 1rem',background:'#0f172a',borderRadius:'0.6rem'}}>
                  <span className={`badge badge-${user.role}`}>{user.role}</span>
                </div>
              </div>
              {!isEditing
                ? <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                : <div className="flex-row">
                    <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" className="btn-secondary" onClick={() => { setIsEditing(false); setName(user.name); }}>Cancel</button>
                  </div>
              }
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="card">
            <form onSubmit={handleChangePassword} className="auth-form" style={{gap:'1rem'}}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" value={pwForm.old_password} onChange={e => setPwForm(p => ({...p, old_password: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>New Password <span style={{color:'#64748b',fontSize:'0.75rem'}}>(min 8 chars)</span></label>
                <input type="password" placeholder="Enter new password" value={pwForm.new_password} onChange={e => setPwForm(p => ({...p, new_password: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Repeat new password" value={pwForm.confirm_password} onChange={e => setPwForm(p => ({...p, confirm_password: e.target.value}))} />
              </div>
              <div className="flex-row">
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
                <button type="button" className="btn-secondary" onClick={() => setPwForm({ old_password:'', new_password:'', confirm_password:'' })}>Clear</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
