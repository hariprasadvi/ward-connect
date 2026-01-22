import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Shield, Heart, Users, FileText, Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const links = [
    { to: '/', label: 'Home', icon: <Home size={20} /> },
    { to: '/medicines', label: 'Medicines', icon: <Activity size={20} /> },
    { to: '/vault', label: 'Health Vault', icon: <Shield size={20} /> },
    { to: '/dashboard', label: 'Community', icon: <Users size={20} /> },
    { to: '/donation', label: 'Donation', icon: <Heart size={20} /> },
    { to: '/insurance', label: 'Insurance', icon: <FileText size={20} /> },
  ];

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
            <Activity size={24} />
          </div>
          <span className="heading" style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HealthPlus
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: 'none',
                color: location.pathname === link.to ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                background: location.pathname === link.to ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
