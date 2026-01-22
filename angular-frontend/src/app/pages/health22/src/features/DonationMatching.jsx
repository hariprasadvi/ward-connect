import React, { useState } from 'react';
import { Heart, User, Droplet, Search, CheckCircle } from 'lucide-react';

const DonationMatching = () => {
    const [role, setRole] = useState('donor'); // donor | recipient
    const [registered, setRegistered] = useState(false);

    const handleRegister = () => {
        setRegistered(true);
        setTimeout(() => setRegistered(false), 3000);
    };

    return (
        <div style={{ padding: '2rem 0', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Heart size={40} fill="#ec4899" />
                </div>
                <h1 className="heading" style={{ fontSize: '2rem' }}>Life Connect</h1>
                <p style={{ color: 'var(--text-muted)' }}>Matching brave donors with those in need.</p>
            </div>

            <div style={{ background: 'var(--border)', padding: '0.25rem', borderRadius: '12px', display: 'flex', marginBottom: '2rem' }}>
                <button
                    onClick={() => setRole('donor')}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: role === 'donor' ? 'var(--surface)' : 'transparent', fontWeight: 600, color: role === 'donor' ? 'var(--text)' : 'var(--text-muted)', boxShadow: role === 'donor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                >
                    I want to Donate
                </button>
                <button
                    onClick={() => setRole('recipient')}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: role === 'recipient' ? 'var(--surface)' : 'transparent', fontWeight: 600, color: role === 'recipient' ? 'var(--text)' : 'var(--text-muted)', boxShadow: role === 'recipient' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
                >
                    I need a Match
                </button>
            </div>

            <div className="card">
                <h3 className="heading">{role === 'donor' ? 'Donor Registration' : 'Find a Donor'}</h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Blood Type</label>
                        <select>
                            <option>A+</option>
                            <option>A-</option>
                            <option>B+</option>
                            <option>B-</option>
                            <option>AB+</option>
                            <option>AB-</option>
                            <option>O+</option>
                            <option>O-</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Location</label>
                        <input type="text" placeholder="Enter zip code or city" />
                    </div>

                    {registered && role === 'donor' ? (
                        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', borderRadius: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={20} /> Thank you! You are registered.
                        </div>
                    ) : (
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', background: role === 'donor' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                            {role === 'donor' ? 'Register as Donor' : <><Search size={20} /> Search Matches</>}
                        </button>
                    )}
                </form>
            </div>

            {role === 'recipient' && (
                <div style={{ marginTop: '2rem' }}>
                    <h4 className="heading">Available Matches Nearby</h4>
                    <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: '#ec4899', color: 'white', fontWeight: 700, padding: '1rem', borderRadius: '12px', fontSize: '1.2rem', minWidth: '60px', textAlign: 'center' }}>O+</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>Anonymous Donor #492</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>5km away • Verified • Available Now</div>
                        </div>
                        <button className="btn" style={{ marginLeft: 'auto', border: '1px solid var(--border)', padding: '0.5rem 1rem' }}>Contact</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DonationMatching;
