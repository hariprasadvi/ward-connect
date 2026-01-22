import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar';
import Home from './features/Home';
import MedicineReminder from './features/MedicineReminder';
import HealthRecordVault from './features/HealthRecordVault';
import CommunityDashboard from './features/CommunityDashboard';
import DonationMatching from './features/DonationMatching';
import InsuranceChecker from './features/InsuranceChecker';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className="container" style={{ flex: 1, paddingBottom: '4rem', paddingTop: '1rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/medicines" element={<MedicineReminder />} />
            <Route path="/vault" element={<HealthRecordVault />} />
            <Route path="/dashboard" element={<CommunityDashboard />} />
            <Route path="/donation" element={<DonationMatching />} />
            <Route path="/insurance" element={<InsuranceChecker />} />
          </Routes>
        </main>
        <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          © 2026 HealthPlus Services. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
