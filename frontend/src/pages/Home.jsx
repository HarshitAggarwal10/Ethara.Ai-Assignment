import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, []);

  return (
    <div className="page" style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      {/* Nav */}
      <nav className="navbar">
        <div className="navbar-brand">⚡ TaskFlow</div>
        <div className="navbar-links">
          <button className="nav-link" onClick={() => navigate('/login')}>Sign In</button>
          <button className="nav-link" onClick={() => navigate('/admin-auth')}>🛡️ Admin</button>
          <button className="btn-primary btn-sm" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="container" style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',paddingTop:'3rem',paddingBottom:'3rem'}}>
        <div style={{textAlign:'center',marginBottom:'4rem'}}>
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>⚡</div>
          <h1 style={{fontSize:'3rem',fontWeight:800,lineHeight:1.1,marginBottom:'1rem'}}>
            <span style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              Team Task Manager
            </span>
          </h1>
          <p style={{fontSize:'1.15rem',color:'#94a3b8',maxWidth:'600px',margin:'0 auto 2rem',lineHeight:1.6}}>
            Organize, collaborate, and track your projects with ease. Built for teams that want to get things done.
          </p>
          <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn-primary" style={{padding:'0.85rem 2rem',fontSize:'1rem'}} onClick={() => navigate('/signup')}>
              Start Free →
            </button>
            <button className="btn-secondary" style={{padding:'0.85rem 2rem',fontSize:'1rem'}} onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid-3" style={{marginBottom:'3rem'}}>
          {[
            { icon: '📊', title: 'Dashboard', desc: 'View all tasks and projects in one place with real-time statistics and progress tracking.' },
            { icon: '👥', title: 'Team Collaboration', desc: 'Manage team members, assign tasks, and track project progress together seamlessly.' },
            { icon: '✅', title: 'Task Tracking', desc: 'Create, assign, and monitor tasks with priorities, due dates, and status updates.' },
          ].map(f => (
            <div key={f.title} className="card" style={{textAlign:'center',padding:'2rem'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>{f.icon}</div>
              <h3 style={{fontSize:'1.1rem',fontWeight:700,color:'#f1f5f9',marginBottom:'0.5rem'}}>{f.title}</h3>
              <p style={{color:'#64748b',fontSize:'0.875rem',lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card" style={{background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))',borderColor:'rgba(99,102,241,0.4)',textAlign:'center',padding:'3rem'}}>
          <h2 style={{fontSize:'1.75rem',fontWeight:800,color:'#f1f5f9',marginBottom:'0.75rem'}}>Ready to streamline your workflow?</h2>
          <p style={{color:'#94a3b8',marginBottom:'1.5rem',maxWidth:'500px',margin:'0 auto 1.5rem'}}>
            Join teams using TaskFlow to manage projects more effectively.
          </p>
          <button className="btn-primary" style={{padding:'0.85rem 2.5rem',fontSize:'1rem'}} onClick={() => navigate('/signup')}>
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
}
