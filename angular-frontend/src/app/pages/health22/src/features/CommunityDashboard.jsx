import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

const CommunityDashboard = () => {
    const data = [
        { name: 'Mon', cases: 4000, active: 2400 },
        { name: 'Tue', cases: 3000, active: 2200 },
        { name: 'Wed', cases: 5000, active: 2800 },
        { name: 'Thu', cases: 2780, active: 2000 },
        { name: 'Fri', cases: 4890, active: 3100 },
        { name: 'Sat', cases: 3390, active: 2500 },
        { name: 'Sun', cases: 5490, active: 3800 },
    ];

    return (
        <div style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>Community Health Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time overview of community health trends.</p>
                </div>
                <div style={{ background: 'var(--card)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary)', background: 'rgba(16, 185, 129, 0.1)' }}>
                    Live Updates On
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Total Active Cases</span>
                        <Users size={20} color="var(--primary)" />
                    </div>
                    <div className="heading" style={{ fontSize: '2.5rem', margin: 0 }}>452</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                        <TrendingUp size={16} /> <span>12% decrease</span> <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>from last week</span>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Critical Health Alerts</span>
                        <AlertTriangle size={20} color="#f43f5e" />
                    </div>
                    <div className="heading" style={{ fontSize: '2.5rem', margin: 0 }}>3</div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Flu outbreak reported in Sector 4</span>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Immunity Coverage</span>
                        <Activity size={20} color="var(--secondary)" />
                    </div>
                    <div className="heading" style={{ fontSize: '2.5rem', margin: 0 }}>87%</div>
                    <div style={{ width: '100%', background: 'var(--border)', height: '6px', borderRadius: '10px', marginTop: 'auto' }}>
                        <div style={{ width: '87%', background: 'var(--secondary)', height: '100%', borderRadius: '10px' }}></div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ height: '400px', paddingBottom: '3rem' }}>
                <h3 className="heading" style={{ marginBottom: '2rem' }}>Weekly Infection vs Recovery Trends</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'var(--surface)', color: 'var(--text)' }}
                            cursor={{ stroke: 'var(--text-muted)', strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Area type="monotone" dataKey="cases" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCases)" strokeWidth={3} />
                        <Area type="monotone" dataKey="active" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export default CommunityDashboard;
