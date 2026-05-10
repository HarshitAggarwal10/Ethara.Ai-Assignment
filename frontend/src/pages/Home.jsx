import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiFlashlightFill, 
  RiShieldStarLine, 
  RiDashboard2Line, 
  RiGroupLine, 
  RiCheckboxCircleLine,
  RiArrowRightLine
} from 'react-icons/ri';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav className="navbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiFlashlightFill style={{ color: '#8b5cf6', fontSize: '1.5rem' }} />
          <span>TaskFlow</span>
        </div>
        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="nav-link" onClick={() => navigate('/login')}>Sign In</button>
          <button className="nav-link" onClick={() => navigate('/admin-auth')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RiShieldStarLine style={{ fontSize: '1.1rem', color: '#94a3b8' }} /> Admin
          </button>
          <button className="btn-primary btn-sm" onClick={() => navigate('/signup')} style={{ borderRadius: '99px', padding: '0.5rem 1.25rem' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '4rem', paddingBottom: '4rem', position: 'relative' }}>
        
        {/* Decorative background blur */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(15,23,42,0) 70%)', zIndex: -1, borderRadius: '50%' }}></div>

        <div style={{ textAlign: 'center', marginBottom: '5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(139,92,246,0.3)',
            marginBottom: '2rem',
            boxShadow: '0 0 40px rgba(139,92,246,0.2)'
          }}>
            <RiFlashlightFill style={{ fontSize: '2.5rem', color: '#a78bfa' }} />
          </div>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            The smartest way to <br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              manage your team's work
            </span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Organize, collaborate, and track your projects with beautiful precision. Built for modern teams that want to get things done.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px' }} onClick={() => navigate('/signup')}>
              Start Free <RiArrowRightLine />
            </button>
            <button className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid-3" style={{ maxWidth: '1000px', margin: '0 auto 4rem auto', position: 'relative', zIndex: 1, width: '100%' }}>
          {[
            { icon: <RiDashboard2Line />, title: 'Real-time Dashboard', desc: 'View all tasks and projects in one place with live statistics and dynamic progress tracking.' },
            { icon: <RiGroupLine />, title: 'Team Collaboration', desc: 'Manage team members, assign responsibilities, and track project milestones together seamlessly.' },
            { icon: <RiCheckboxCircleLine />, title: 'Smart Task Tracking', desc: 'Create, assign, and monitor tasks with customized priorities, due dates, and status workflows.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 2rem', background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default', height: '100%' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)' }} onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ 
                fontSize: '2rem', 
                color: '#8b5cf6', 
                marginBottom: '1.5rem',
                display: 'inline-flex',
                padding: '1rem',
                borderRadius: '16px',
                background: 'rgba(139,92,246,0.1)'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.75rem' }}>{f.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card" style={{ 
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.15))', 
          borderColor: 'rgba(139,92,246,0.3)', 
          textAlign: 'center', 
          padding: '4rem 2rem',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '1rem' }}>Ready to streamline your workflow?</h2>
            <p style={{ color: '#cbd5e1', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
              Join forward-thinking teams using TaskFlow to manage projects more effectively.
            </p>
            <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '99px', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)' }} onClick={() => navigate('/signup')}>
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
