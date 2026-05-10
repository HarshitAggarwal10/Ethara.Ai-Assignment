import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

export default function AdminAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email.toLowerCase(), password: form.password });
      if (res.data.user.role !== 'admin') {
        setError('Only admin users can access this panel. Contact an admin to get promoted.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Name, email, and password are required'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      const res = await authAPI.signup({
        name: form.name.trim(), email: form.email.toLowerCase(),
        password: form.password, phone: form.phone.trim(),
        department: form.department.trim(), is_admin_signup: true,
      });
      setSuccess(res.data.message + ' Your account is pending admin approval.');
      setForm({ name: '', email: '', password: '', phone: '', department: '' });
      setTimeout(() => { setIsLogin(true); setSuccess(''); }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{maxWidth:'460px'}}>
        <div className="auth-logo">
          <div className="logo-icon">🛡️</div>
          <h1>Admin Portal</h1>
          <p>Task Management System</p>
        </div>

        {/* Toggle */}
        <div style={{display:'flex',gap:'0.25rem',background:'#0f172a',borderRadius:'0.5rem',padding:'0.25rem',marginBottom:'1.5rem'}}>
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            style={{flex:1,padding:'0.5rem',borderRadius:'0.4rem',border:'none',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',
              background:isLogin?'linear-gradient(135deg,#6366f1,#8b5cf6)':'transparent',color:isLogin?'#fff':'#64748b',transition:'all 0.2s'}}
          >Login</button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            style={{flex:1,padding:'0.5rem',borderRadius:'0.4rem',border:'none',fontSize:'0.875rem',fontWeight:600,cursor:'pointer',
              background:!isLogin?'linear-gradient(135deg,#6366f1,#8b5cf6)':'transparent',color:!isLogin?'#fff':'#64748b',transition:'all 0.2s'}}
          >Request Access</button>
        </div>

        {error && <div className="form-error" style={{marginBottom:'1rem'}}>{error}</div>}
        {success && <div className="form-success" style={{marginBottom:'1rem'}}>{success}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" placeholder="admin@test.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="Your admin password" value={form.password} onChange={handleChange} />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Logging in...' : 'Login to Admin Panel'}</button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" placeholder="admin@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password * <span style={{color:'#64748b',fontSize:'0.75rem'}}>(min 8 chars)</span></label>
              <input name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone <span style={{color:'#64748b',fontSize:'0.75rem'}}>(optional)</span></label>
              <input name="phone" type="tel" placeholder="+1 (555) 123-4567" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Department <span style={{color:'#64748b',fontSize:'0.75rem'}}>(optional)</span></label>
              <input name="department" type="text" placeholder="Engineering" value={form.department} onChange={handleChange} />
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Submitting...' : 'Request Admin Access'}</button>
            <p style={{fontSize:'0.78rem',color:'#64748b',textAlign:'center'}}>Your account will be reviewed by an existing admin before approval</p>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to regular login</Link>
        </div>
      </div>
    </div>
  );
}
