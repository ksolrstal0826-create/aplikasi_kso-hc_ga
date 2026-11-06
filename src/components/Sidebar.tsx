import React from 'react';
import {
  PieChart,
  Users,
  FolderTree,
  Boxes,
  Handshake,
  Wrench,
  Settings,
  LogOut,
  HardHat,
  X,
  ShieldAlert,
  Sparkles,
  Landmark
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUserRole: UserRole;
  onLogout: () => void;
  companyName: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  employeeCount: number;
  assetCount: number;
  activeLoanCount: number;
  maintenanceCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUserRole,
  onLogout,
  companyName,
  isOpenMobile,
  onCloseMobile,
  employeeCount,
  assetCount,
  activeLoanCount,
  maintenanceCount
}) => {
  const isSuperAdmin = currentUserRole === 'Super Admin';
  const isAdminHC = currentUserRole === 'Admin HC';
  const isAdminGA = currentUserRole === 'Admin GA';
  const isAdminFinance = currentUserRole === 'Admin Finance';

  const canAccessHC = isSuperAdmin || isAdminHC;
  const canAccessGA = isSuperAdmin || isAdminGA;
  const canAccessFinance = isSuperAdmin || isAdminFinance;
  const canAccessSettings = isSuperAdmin;

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20 shrink-0">
              <HardHat className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base tracking-tight text-white truncate">
                {companyName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-amber-400">Portal HC & GA</span>
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Main Group */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Utama
            </div>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <PieChart className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Dashboard KPI</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Live</span>
            </button>
          </div>

          {/* Human Capital Group */}
          {canAccessHC && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Human Capital (HC)</span>
                {isAdminHC && <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Divisi Anda</span>}
              </div>
              <button
                onClick={() => handleNavClick('karyawan')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'karyawan'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === 'karyawan' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Database Karyawan</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700/60">
                  {employeeCount}
                </span>
              </button>
            </div>
          )}

          {/* General Affairs Group */}
          {canAccessGA && (
            <div className="space-y-1">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>General Affairs (GA)</span>
                {isAdminGA && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Divisi Anda</span>}
              </div>

              <button
                onClick={() => handleNavClick('master')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'master'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderTree className={`w-4 h-4 ${activeTab === 'master' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Master Kategori & Lokasi</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('aset')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'aset'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Boxes className={`w-4 h-4 ${activeTab === 'aset' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Database Aset</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700/60">
                  {assetCount}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('peminjaman')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'peminjaman'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Handshake className={`w-4 h-4 ${activeTab === 'peminjaman' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Penyerahan Aset</span>
                </div>
                {activeLoanCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {activeLoanCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('pemeliharaan')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'pemeliharaan'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className={`w-4 h-4 ${activeTab === 'pemeliharaan' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Riwayat Servis</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700/60">
                  {maintenanceCount}
                </span>
              </button>
            </div>
          )}

          {/* Finance Group */}
          {canAccessFinance && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Keuangan &amp; Kas (Finance)</span>
                {isAdminFinance && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Divisi Anda</span>}
              </div>
              <button
                onClick={() => handleNavClick('finance')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'finance'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Landmark className={`w-4 h-4 ${activeTab === 'finance' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Keuangan &amp; Kas</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700/60">
                  3 Rekening
                </span>
              </button>
            </div>
          )}

          {/* System Group */}
          {canAccessSettings && (
            <div>
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sistem & Konfigurasi
              </div>
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>Profil & Backup Data</span>
                </div>
              </button>
            </div>
          )}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                {currentUserRole[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUserRole}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sesi Terverifikasi
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
};
