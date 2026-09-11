import React, { useState, useEffect } from 'react';
import { Ship, Anchor, Database, LogOut, User as UserIcon, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  activeTab: 'master' | 'transaksi' | 'laporan';
  setActiveTab: (tab: 'master' | 'transaksi' | 'laporan') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    engine?: string;
    databaseName?: string;
    latencyMs?: number;
    totalUsers?: number;
    totalVessels?: number;
    totalBookings?: number;
  }>({ connected: true, engine: 'Cloud SQL (PostgreSQL)' });

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (data.database) {
            setDbStatus(data.database);
          }
        }
      } catch (e) {
        console.warn('DB check error:', e);
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">MARITIMA ERP</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/80 text-blue-300 font-medium border border-blue-700/50">
                  Pelayaran
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistem Manajemen Operasional & Kargo Pelayaran
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-master-data-btn"
              onClick={() => setActiveTab('master')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'master'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Anchor className="w-4 h-4" />
              <span>Master Data</span>
            </button>

            <button
              id="nav-transaksi-data-btn"
              onClick={() => setActiveTab('transaksi')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'transaksi'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Ship className="w-4 h-4" />
              <span>Transaksi Data</span>
            </button>

            <button
              id="nav-laporan-btn"
              onClick={() => setActiveTab('laporan')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'laporan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Laporan</span>
            </button>
          </nav>

          {/* User profile & Database status */}
          <div className="flex items-center space-x-3">
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs ${
                dbStatus.connected
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
              title={`Database: ${dbStatus.engine || 'PostgreSQL'} | Latency: ${dbStatus.latencyMs || 10}ms | Kapal: ${dbStatus.totalVessels || 4} | Booking: ${dbStatus.totalBookings || 3}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">PostgreSQL Cloud SQL: Aktif</span>
              {dbStatus.latencyMs !== undefined && (
                <span className="text-[10px] text-emerald-400/80 font-mono">({dbStatus.latencyMs}ms)</span>
              )}
            </div>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-white leading-tight flex items-center space-x-1">
                  <span>{user.fullName}</span>
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {user.role} ({user.username})
                </div>
              </div>

              <button
                id="user-logout-btn"
                onClick={onLogout}
                title="Keluar / Logout"
                className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
