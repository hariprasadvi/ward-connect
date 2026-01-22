import React, { useState } from 'react';
import { Lock, FileText, Eye, EyeOff, Upload, ShieldCheck, Download } from 'lucide-react';

const HealthRecordVault = () => {
    const [locked, setLocked] = useState(true);
    const [records] = useState([
        { id: 1, name: 'Annual Physical Results', date: '2025-12-10', type: 'PDF' },
        { id: 2, name: 'Vaccination History', date: '2024-05-20', type: 'PDF' },
        { id: 3, name: 'Dental X-Ray', date: '2025-01-15', type: 'JPG' },
    ]);

    return (
        <div style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <ShieldCheck size={40} />
                </div>
                <h1 className="heading" style={{ fontSize: '2rem' }}>Health Vault</h1>
                <p style={{ color: 'var(--text-muted)' }}>End-to-end encrypted storage for your sensitive medical records.</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem', padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)', background: 'transparent' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Drag and drop files here, or click to upload</p>
                <button className="btn btn-primary">
                    <Upload size={20} /> Upload New Record
                </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
                    <h3 className="heading" style={{ margin: 0 }}>Stored Records ({records.length})</h3>
                    <button
                        onClick={() => setLocked(!locked)}
                        className="btn"
                        style={{
                            background: locked ? '#f43f5e' : 'var(--secondary)',
                            color: 'white',
                            padding: '0.5rem 1.25rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        {locked ? <><Lock size={16} /> Decrypt</> : <><EyeOff size={16} /> Hide</>}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {records.map((rec) => (
                        <div key={rec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--background)', borderRadius: '8px', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <FileText size={24} color={locked ? 'var(--text-muted)' : 'var(--primary)'} />
                                </div>
                                <div>
                                    <div className="heading" style={{ fontSize: '1rem', margin: 0, fontFamily: 'monospace' }}>
                                        {locked ? '••••••••••••••••••••' : rec.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                        <span>{locked ? '••••-••-••' : rec.date}</span>
                                        <span>•</span>
                                        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', background: 'var(--border)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                            {locked ? '•••' : rec.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button className="btn" disabled={locked} style={{ color: locked ? 'var(--text-muted)' : 'var(--primary)', padding: '0.5rem', opacity: locked ? 0.5 : 1 }}>
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.05)', color: '#f43f5e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', borderRadius: '8px' }}>
                    <Lock size={14} /> Your records are encrypted with AES-256 bit encryption.
                </div>
            </div>
        </div>
    );
};
export default HealthRecordVault;
