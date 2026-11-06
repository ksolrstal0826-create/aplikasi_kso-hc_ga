import React, { useState } from 'react';
import { HardHat, Lock, User, ArrowRight, ShieldCheck, Sparkles, Building2, Landmark } from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps {
  onLogin: (role: UserRole) => void;
  companyName: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, companyName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const u = username.trim();
    const p = password.trim();

    if (u === 'AdminSuper' && p === 'AdminSuper123') {
      onLogin('Super Admin');
    } else if (u === 'AdminHC' && p === 'AdminHC123') {
      onLogin('Admin HC');
    } else if (u === 'AdminGA' && p === 'AdminGA123') {
      onLogin('Admin GA');
    } else if (u === 'AdminFinance' && p === 'AdminFinance123') {
      onLogin('Admin Finance');
    } else {
      setErrorMsg('Username atau kata sandi tidak valid. Silakan gunakan kredensial demo di bawah.');
    }
  };

  const handleQuickLogin = (role: UserRole, user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
    onLogin(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="p-8 relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25">
              <HardHat className="w-9 h-9 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                Sistem Terpadu HC & GA
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mt-2">{companyName}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Portal Manajemen Sumber Daya Manusia & Inventaris Fasilitas Operasional
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username / ID Akses
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: AdminSuper"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Masuk Sistem</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="border-t border-slate-800/80 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Masuk Cepat (Demo Role):
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('Super Admin', 'AdminSuper', 'AdminSuper123')}
                className="w-full px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-xl text-xs flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Super Admin</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Akses Penuh (HC, GA, Master Data & Konfigurasi)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  AdminSuper
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Admin HC', 'AdminHC', 'AdminHC123')}
                className="w-full px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-xl text-xs flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Admin Human Capital (HC)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Database Karyawan, Sertifikasi, Cetak Profil</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  AdminHC
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Admin GA', 'AdminGA', 'AdminGA123')}
                className="w-full px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-xs flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin General Affairs (GA)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Master Data, Inventaris Aset, Serah Terima & Servis</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  AdminGA
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Admin Finance', 'AdminFinance', 'AdminFinance123')}
                className="w-full px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-xs flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin Finance (Keuangan)</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Pencatatan Transaksi Masuk/Keluar, 3 Rekening Kas Bank, Dokumen</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  AdminFinance
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
