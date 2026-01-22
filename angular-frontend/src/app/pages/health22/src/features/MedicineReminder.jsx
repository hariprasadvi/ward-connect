import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, Trash2, Pill } from 'lucide-react';

const MedicineReminder = () => {
    const [medicines, setMedicines] = useState([
        { id: 1, name: 'Amoxicillin', dose: '500mg', time: '08:00', taken: false },
        { id: 2, name: 'Vitamin D', dose: '1000IU', time: '09:00', taken: true },
        { id: 3, name: 'Paracetamol', dose: '500mg', time: '20:00', taken: false },
    ]);

    const toggleTaken = (id) => {
        setMedicines(medicines.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
    };

    return (
        <div style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>Medicine Schedule</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Keep track of your daily intake.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={20} /> Add Medicine
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {medicines.map((med) => (
                    <div key={med.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `6px solid ${med.taken ? 'var(--secondary)' : 'var(--primary)'}`, opacity: med.taken ? 0.7 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ background: med.taken ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 165, 233, 0.1)', padding: '1rem', borderRadius: '50%', color: med.taken ? 'var(--secondary)' : 'var(--primary)' }}>
                                <Pill size={24} />
                            </div>
                            <div>
                                <h3 className="heading" style={{ margin: 0, fontSize: '1.25rem', textDecoration: med.taken ? 'line-through' : 'none', color: med.taken ? 'var(--text-muted)' : 'var(--text)' }}>{med.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    <Clock size={16} /> <span>{med.time}</span>
                                    <span style={{ width: '4px', height: '4px', background: 'currentColor', borderRadius: '50%' }}></span>
                                    <span>{med.dose}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <button
                                onClick={() => toggleTaken(med.id)}
                                className="btn"
                                style={{
                                    background: med.taken ? 'var(--secondary)' : 'transparent',
                                    border: `2px solid ${med.taken ? 'var(--secondary)' : 'var(--border)'}`,
                                    color: med.taken ? 'white' : 'var(--text-muted)',
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    width: '48px', height: '48px'
                                }}
                                title={med.taken ? "Mark as untaken" : "Mark as taken"}
                            >
                                <CheckCircle size={24} />
                            </button>
                        </div>
                    </div>
                ))}
                {medicines.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        No medicines scheduled.
                    </div>
                )}
            </div>
        </div>
    );
};
export default MedicineReminder;
