import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SalaryStructures from './pages/SalaryStructures';

function AppContent() {
  const location = useLocation();
  const isViewportLocked = ['/', '/dashboard', '/structures'].includes(location.pathname);

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased ${isViewportLocked ? 'h-screen overflow-hidden' : ''}`}>
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Pages */}
      <main className={`flex-1 w-full px-[3%] ${isViewportLocked ? 'py-3 flex flex-col min-h-0 overflow-hidden' : 'py-6'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/structures" element={<SalaryStructures />} />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className={`border-t border-slate-200 bg-white ${isViewportLocked ? 'shrink-0 py-2' : 'py-4 mt-8'}`}>
        <div className="w-full px-[3%] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Salary Manager</p>
          <p className="flex items-center gap-2">
            <span className="text-emerald-600 font-medium">Enterprise Edition</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
