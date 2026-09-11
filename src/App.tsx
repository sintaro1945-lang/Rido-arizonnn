/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { MasterDataView } from './components/MasterDataView';
import { TransactionDataView } from './components/TransactionDataView';
import { ReportsView } from './components/ReportsView';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'master' | 'transaksi' | 'laporan'>('master');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Restore saved session if available
  useEffect(() => {
    const savedUser = localStorage.getItem('pelayaran_user');
    const token = localStorage.getItem('pelayaran_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('pelayaran_user');
        localStorage.removeItem('pelayaran_token');
      }
    }
    setLoadingInitial(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    localStorage.setItem('pelayaran_user', JSON.stringify(loggedInUser));
    localStorage.setItem('pelayaran_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pelayaran_user');
    localStorage.removeItem('pelayaran_token');
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-300">Memuat Sistem Pelayaran...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, display Admin Login screen
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'master' && <MasterDataView />}
        {activeTab === 'transaksi' && <TransactionDataView />}
        {activeTab === 'laporan' && <ReportsView />}
      </main>

      {/* Modern Status Footer */}
      <footer className="bg-slate-900/70 border-t border-slate-800/80 py-4 text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Real Database: Cloud SQL (PostgreSQL asia-southeast1)</span>
            <span>•</span>
            <span>Firebase Auth Integration</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} MARITIMA SAMUDERA LINES — Sistem Manajemen Perusahaan Pelayaran
          </div>
        </div>
      </footer>
    </div>
  );
}

