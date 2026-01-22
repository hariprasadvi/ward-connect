import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Heart, Users, FileText } from 'lucide-react';

const Home = () => {
    const cards = [
        { to: '/medicines', title: 'Medicine Reminder', desc: 'Never miss a dose with smart scheduling.', icon: <Activity size={32} />, color: 'var(--primary)' },
        { to: '/vault', title: 'Health Vault', desc: 'Securely store and access your medical records.', icon: <Shield size={32} />, color: 'var(--secondary)' },
        { to: '/dashboard', title: 'Community Dashboard', desc: 'View local health trends and alerts.', icon: <Users size={32} />, color: '#f59e0b' },
        { to: '/donation', title: 'Blood Donation', desc: 'Life-saving matching system.', icon: <Heart size={32} />, color: '#ec4899' },
        { to: '/insurance', title: 'Insurance Checker', desc: 'Check eligibility for health schemes.', icon: <FileText size={32} />, color: '#8b5cf6' },
    ];

    return (
        <div style={{ padding: '4rem 0' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="heading" style={{ fontSize: '3.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>
                    Your Health, <span className="text-gradient">Reimagined</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    The complete ecosystem for personal and community wellbeing. Secure, simple, and vital.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {cards.map((card) => (
                    <Link to={card.to} key={card.to} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: `color-mix(in srgb, ${card.color}, transparent 80%)`,
                                color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {card.icon}
                            </div>
                            <h2 className="heading" style={{ fontSize: '1.5rem', margin: 0 }}>{card.title}</h2>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{card.desc}</p>
                            <div style={{ marginTop: 'auto', fontWeight: 600, color: card.color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Access Module <span>&rarr;</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
