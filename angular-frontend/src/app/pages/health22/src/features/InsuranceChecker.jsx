import React, { useState } from 'react';
import { FileText, Check, X, Shield, Info } from 'lucide-react';

const InsuranceChecker = () => {
    const [result, setResult] = useState(null);

    const checkEligibility = (e) => {
        e.preventDefault();
        setResult([
            { name: 'Pradhan Mantri Jan Arogya Yojana', eligible: true, cover: '5 Lakhs', desc: 'Comprehensive coverage for secondary and tertiary care hospitalization.' },
            { name: 'Employees State Insurance', eligible: false, reason: 'Salary exceeds threshold', desc: 'Social security and health insurance for employees.' },
            { name: 'Senior Citizen Health Insurance', eligible: false, reason: 'Age must be > 60', desc: 'Specialized care for senior citizens.' },
        ]);
    };

    return (
        <div style={{ padding: '2rem 0', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="heading" style={{ fontSize: '2rem' }}>Scheme Eligibility Checker</h1>
                <p style={{ color: 'var(--text-muted)' }}>Find Government and Private health schemes relevant to you.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <h3 className="heading" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Info size={20} color="var(--primary)" /> Your Profile
                    </h3>
                    <form onSubmit={checkEligibility} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Age</label>
                            <input type="number" placeholder="e.g. 30" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Annual Income</label>
                            <input type="number" placeholder="₹" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Employment Type</label>
                            <select>
                                <option>Private Sector</option>
                                <option>Government</option>
                                <option>Self Employed</option>
                                <option>Unemployed</option>
                                <option>Student</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>State of Residence</label>
                            <select>
                                <option>Delhi</option>
                                <option>Maharashtra</option>
                                <option>Karnataka</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Check Eligibility</button>
                    </form>
                </div>

                <div>
                    {result ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 className="heading" style={{ marginBottom: '1rem' }}>Results</h3>
                            {result.map((item, i) => (
                                <div key={i} className="card" style={{ borderLeft: `4px solid ${item.eligible ? 'var(--secondary)' : 'var(--text-muted)'}`, padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 className="heading" style={{ margin: 0, fontSize: '1.1rem', color: item.eligible ? 'var(--text)' : 'var(--text-muted)' }}>{item.name}</h4>
                                        {item.eligible ? <Check size={20} color="var(--secondary)" /> : <X size={20} color="var(--text-muted)" />}
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{item.desc}</p>

                                    {item.eligible ? (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <Shield size={14} /> Coverage: {item.cover}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.85rem', color: '#f43f5e', fontStyle: 'italic' }}>
                                            Reason: {item.reason}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
                            <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p style={{ fontSize: '1.1rem' }}>Fill the form to see eligible Government and Private health schemes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default InsuranceChecker;
