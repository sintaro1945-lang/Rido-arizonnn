import React, { useState } from 'react';
import { Ship, Lock, User as UserIcon, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Silakan isi username/email dan kata sandi Anda.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal. Periksa kembali akun Anda.');
      }

      localStorage.setItem('pelayaran_token', data.token);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const googleUser = result.user;
      // Synthesize user object for dashboard
      const userObj: User = {
        id: 999,
        username: googleUser.email?.split('@')[0] || 'admin_google',
        email: googleUser.email || 'admin@pelayaran.co.id',
        fullName: googleUser.displayName || 'Google Admin User',
        role: 'Admin',
      };
      const dummyToken = await googleUser.getIdToken();
      localStorage.setItem('pelayaran_token', dummyToken);
      onLoginSuccess(userObj, dummyToken);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setErrorMessage('Login dengan Google dibatalkan atau terkendala.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle maritime graphic background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-cyan-600 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/30 flex items-center justify-center text-white">
            <Ship className="w-9 h-9" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Sistem Manajemen Pelayaran
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Masuk ke Portal Operasional Armada & Kargo Pelayaran
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-xl sm:px-10">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleAdminLogin}>
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username atau Email Admin
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Contoh: admin atau admin@pelayaran.co.id"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              id="submit-login-btn"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Masuk Sebagai Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>

          {/* Quick fill buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-xs font-medium text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Akun Demo Cepat (Siap Pakai):</span>
              <span className="text-[11px] text-blue-400">Password: admin123</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="quick-login-admin"
                onClick={() => fillCredentials('admin', 'admin123')}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors text-center font-medium"
              >
                Kapten (Admin)
              </button>
              <button
                type="button"
                id="quick-login-operator"
                onClick={() => fillCredentials('operator', 'admin123')}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors text-center font-medium"
              >
                Operator
              </button>
              <button
                type="button"
                id="quick-login-manager"
                onClick={() => fillCredentials('manager', 'admin123')}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors text-center font-medium"
              >
                Manager
              </button>
            </div>
          </div>

          {/* Google SSO Login */}
          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-2 text-slate-500">Atau masuk dengan</span>
              </div>
            </div>

            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.02h3.88c2.27-2.09 3.66-5.17 3.66-9.11z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.26v3.12C3.25 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.59H1.26C.46 8.2.01 10.04.01 12s.45 3.8 1.25 5.41l4.02-3.12z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.59l4.02 3.12c.95-2.84 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Login dengan Google</span>
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center space-x-1.5 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Koneksi Aman Cloud SQL PostgreSQL & JWT Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
