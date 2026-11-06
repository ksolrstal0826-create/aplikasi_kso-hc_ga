import React, { useState } from 'react';
import {
  Menu,
  Shield,
  User,
  Building2,
  Calendar,
  ChevronDown,
  Download,
  RotateCcw,
  Sparkles,
  Sheet,
  ExternalLink,
  CheckCircle2,
  CloudUpload,
  Cloud,
  Landmark
} from 'lucide-react';
import { ActiveTab, UserRole } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  currentUserRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  companyName: string;
  activeTab: ActiveTab;
  onRefresh: () => void;
  onExport: () => void;
  // Google Workspace props
  isGoogleConnected: boolean;
  googleUserEmail?: string;
  spreadsheetUrl?: string;
  isSyncing: boolean;
  onConnectGoogle: () => void;
  onSyncGoogleSheets: () => void;
}

const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Executive KPI Dashboard', subtitle: 'Ringkasan operasional real-time KSO LRS-TAL' },
  karyawan: { title: 'Database Karyawan (Human Capital)', subtitle: 'Data biodata, kompetensi, administrasi & sertifikasi' },
  master: { title: 'Master Kategori & Lokasi', subtitle: 'Konfigurasi klasifikasi aset dan site kerja' },
  aset: { title: 'Database Inventaris Aset (GA)', subtitle: 'Pencatatan alat berat, kendaraan LV, survey & IT' },
  peminjaman: { title: 'Penyerahan & Peminjaman Aset', subtitle: 'Distribusi aset kerja & Berita Acara Serah Terima' },
  pemeliharaan: { title: 'Riwayat Servis & Perbaikan', subtitle: 'Log pemeliharaan berkala dan nota biaya reparasi' },
  finance: { title: 'Keuangan & Kas Perusahaan (Finance)', subtitle: '3 Rekening bank kas operasional, pencatatan transaksi masuk & keluar' },
  settings: { title: 'Profil Perusahaan & Database', subtitle: 'Identitas institusi, Google Sheets & Drive database' }
};

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  currentUserRole,
  onChangeRole,
  companyName,
  activeTab,
  onRefresh,
  onExport,
  isGoogleConnected,
  googleUserEmail,
  spreadsheetUrl,
  isSyncing,
  onConnectGoogle,
  onSyncGoogleSheets
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const currentTabInfo = tabTitles[activeTab] || { title: 'Portal HC & GA', subtitle: companyName };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between no-print">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition lg:hidden cursor-pointer"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight truncate">
              {currentTabInfo.title}
            </h2>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[10px] text-amber-400 font-semibold">
              {companyName}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block truncate mt-0.5">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Google Sheets / Drive Cloud Database Badge */}
        {isGoogleConnected ? (
          <div className="flex items-center gap-1 bg-slate-800/90 border border-emerald-500/40 rounded-xl px-2.5 py-1 text-xs">
            <Sheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline text-emerald-300 font-semibold text-[11px]">Google Sheets</span>
            <button
              onClick={onSyncGoogleSheets}
              disabled={isSyncing}
              className="ml-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Sinkronkan data ke Google Sheets"
            >
              <CloudUpload className={`w-3 h-3 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden lg:inline">{isSyncing ? 'Sinkron...' : 'Sync'}</span>
            </button>
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-0.5 text-slate-400 hover:text-white ml-0.5 cursor-pointer"
                title="Buka Spreadsheet di Google Sheets"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          <button
            onClick={onConnectGoogle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition cursor-pointer"
            title="Hubungkan Google Sheets & Drive sebagai database utama"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Hubungkan Google Sheets</span>
            <span className="sm:hidden text-[11px]">Sheets</span>
          </button>
        )}

        {/* Date badge */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{todayStr}</span>
        </div>

        {/* Quick Backup Export button */}
        <button
          onClick={onExport}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition cursor-pointer"
          title="Download Cadangan Data (JSON)"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Backup</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-amber-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition cursor-pointer"
          title="Sinkronisasi & Segarkan Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Role Switcher Popover */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30 shrink-0">
              {currentUserRole === 'Super Admin' && <Shield className="w-3.5 h-3.5 text-amber-400" />}
              {currentUserRole === 'Admin HC' && <User className="w-3.5 h-3.5 text-blue-400" />}
              {currentUserRole === 'Admin GA' && <Building2 className="w-3.5 h-3.5 text-emerald-400" />}
              {currentUserRole === 'Admin Finance' && <Landmark className="w-3.5 h-3.5 text-purple-400" />}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{currentUserRole}</p>
              <p className="text-[10px] text-amber-400">Ganti Hak Akses</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-40 space-y-1">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Simulasi Hak Akses:
                </div>

                <button
                  onClick={() => {
                    onChangeRole('Super Admin');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    currentUserRole === 'Super Admin'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Super Admin</span>
                  </div>
                  {currentUserRole === 'Super Admin' && <span className="text-[10px]">Aktif</span>}
                </button>

                <button
                  onClick={() => {
                    onChangeRole('Admin HC');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    currentUserRole === 'Admin HC'
                      ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Admin Human Capital</span>
                  </div>
                  {currentUserRole === 'Admin HC' && <span className="text-[10px]">Aktif</span>}
                </button>

                <button
                  onClick={() => {
                    onChangeRole('Admin GA');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    currentUserRole === 'Admin GA'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin General Affairs</span>
                  </div>
                  {currentUserRole === 'Admin GA' && <span className="text-[10px]">Aktif</span>}
                </button>

                <button
                  onClick={() => {
                    onChangeRole('Admin Finance');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    currentUserRole === 'Admin Finance'
                      ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-purple-400" />
                    <span>Admin Finance</span>
                  </div>
                  {currentUserRole === 'Admin Finance' && <span className="text-[10px]">Aktif</span>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
