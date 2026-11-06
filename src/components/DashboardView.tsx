import React, { useState } from 'react';
import {
  Users,
  Boxes,
  Handshake,
  Wrench,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Sparkles,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  FileText,
  Award,
  AlertOctagon,
  Download,
  ExternalLink,
  Eye,
  X,
  HardDrive
} from 'lucide-react';
import { AppState, ActiveTab, UserRole, Employee, EmployeeCertification } from '../types';
import { formatRupiah, formatShortDate } from '../utils/formatters';
import {
  downloadDocument,
  isGoogleDriveUrl,
  isPdfDocument,
  isImageDocument,
  getDocumentPreviewImage,
  dataUrlToBlobUrl,
  getDrivePreviewEmbedUrl,
  openDocumentInNewTab
} from '../utils/fileDownloader';

interface DashboardViewProps {
  data: AppState;
  onNavigate: (tab: ActiveTab) => void;
  currentUserRole: UserRole;
  onOpenAddEmployee: () => void;
  onOpenAddAsset: () => void;
  onOpenAddAssignment: () => void;
  onOpenAddMaintenance: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  currentUserRole,
  onOpenAddEmployee,
  onOpenAddAsset,
  onOpenAddAssignment,
  onOpenAddMaintenance
}) => {
  const [selectedCertPreview, setSelectedCertPreview] = useState<{
    employee: Employee;
    cert: EmployeeCertification;
    diffDays: number;
  } | null>(null);
  const totalEmployees = data.employees.length;
  const totalAssets = data.assets.length;
  const activeAssignments = data.assignments.filter((a) => !a.returned_date);
  const totalMaintenanceCost = data.maintenances.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);

  // Asset statuses
  const activeAssetsCount = data.assets.filter((a) => a.status === 'Aktif').length;
  const repairingAssetsCount = data.assets.filter((a) => a.status === 'Diperbaiki').length;
  const damagedAssetsCount = data.assets.filter((a) => a.status === 'Rusak').length;

  // Contracts expiring within 90 days
  const now = new Date();
  const expiringContracts = data.employees.filter((emp) => {
    if (emp.status_kepegawaian !== 'Karyawan Kontrak (PKWT)' || !emp.akhir_kontrak) return false;
    const end = new Date(emp.akhir_kontrak);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 120;
  });

  // Certifications expiring within 60 days (or already expired)
  const expiringCertificates: Array<{
    employee: Employee;
    cert: EmployeeCertification;
    diffDays: number;
    expDate: string;
    isExpired: boolean;
  }> = [];

  data.employees.forEach((emp) => {
    (emp.sertifikasi || []).forEach((cert) => {
      const exp = cert.tgl_expired || cert.tgl_kadaluarsa;
      if (exp) {
        const end = new Date(exp);
        const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 60) {
          expiringCertificates.push({
            employee: emp,
            cert,
            diffDays,
            expDate: exp,
            isExpired: diffDays < 0
          });
        }
      }
    });
  });

  expiringCertificates.sort((a, b) => a.diffDays - b.diffDays);

  // Department distribution
  const deptMap: Record<string, number> = {};
  data.employees.forEach((e) => {
    const dept = e.departemen || 'Lainnya';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });

  // Finance calculations
  const bankAccounts = data.bank_accounts || [];
  const financeTransactions = data.finance_transactions || [];

  const calculatedAccounts = bankAccounts.map((acc) => {
    const accTxs = financeTransactions.filter((tx) => String(tx.account_id) === String(acc.account_id));
    const incoming = accTxs
      .filter((t) => t.type === 'MASUK')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const outgoing = accTxs
      .filter((t) => t.type === 'KELUAR')
      .reduce((sum, t) => sum + (Number(t.amount) || 0) + (Number(t.admin_fee) || 0), 0);
    const currentBalance = (Number(acc.initial_balance) || 0) + incoming - outgoing;
    return { ...acc, current_balance: currentBalance, incoming_total: incoming, outgoing_total: outgoing };
  });

  const totalCompanyBalance = calculatedAccounts.reduce((sum, a) => sum + a.current_balance, 0);

  // 5 Most recent finance transactions
  const recentTransactions = [...financeTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const isSuperAdmin = currentUserRole === 'Super Admin';
  const isAdminHC = currentUserRole === 'Admin HC';
  const isAdminGA = currentUserRole === 'Admin GA';
  const isAdminFinance = currentUserRole === 'Admin Finance';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem HC & GA Terintegrasi KSO LRS-TAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang, <span className="text-amber-400">{currentUserRole}</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitoring terpadu armada alat berat, kendaraan operasional, peralatan survey, serta administrasi ketenagakerjaan dan kompetensi karyawan site Lahat & HO Jakarta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(isSuperAdmin || isAdminHC) && (
              <button
                onClick={onOpenAddEmployee}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>+ Karyawan Baru</span>
              </button>
            )}
            {(isSuperAdmin || isAdminGA) && (
              <>
                <button
                  onClick={onOpenAddAsset}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                >
                  <Boxes className="w-4 h-4 text-amber-400" />
                  <span>+ Aset Baru</span>
                </button>
                <button
                  onClick={onOpenAddAssignment}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                >
                  <Handshake className="w-4 h-4 text-emerald-400" />
                  <span>Serah Terima</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Peringatan Masa Berlaku Sertifikasi Karyawan (≤ 60 Hari) - Format List Banner seperti PKWT */}
      {(isSuperAdmin || isAdminHC) && expiringCertificates.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <span>Peringatan Masa Berlaku Sertifikasi Karyawan ({expiringCertificates.length} Sertifikasi)</span>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  Mendekati ≤ 60 Hari / Expired
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Terdapat sertifikasi kompetensi &amp; izin kerja karyawan yang mendekati batas expired atau telah kedaluwarsa:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {expiringCertificates.map((item, idx) => {
                  const { employee, cert, diffDays, expDate, isExpired } = item;
                  const hasFile = Boolean(cert.file || cert.drive_url || cert.drive_download_url);
                  return (
                    <button
                      key={cert.id || idx}
                      type="button"
                      onClick={() => setSelectedCertPreview({ employee, cert, diffDays })}
                      title="Klik untuk melihat lampiran sertifikat dan unduh berkas"
                      className={`text-xs bg-slate-900/90 border px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition ${
                        isExpired
                          ? 'text-rose-300 border-rose-500/40 hover:border-rose-400'
                          : diffDays <= 30
                          ? 'text-amber-300 border-amber-500/40 hover:border-amber-400'
                          : 'text-amber-200 border-amber-500/30 hover:border-amber-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isExpired ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`} />
                      <span>
                        <strong>{employee.nama}</strong> ({employee.jabatan}) - <strong>{cert.nama}</strong>: {isExpired ? `Expired (${Math.abs(diffDays)} hari lalu)` : diffDays === 0 ? 'Hari Ini Expired' : `Sisa ${diffDays} hari`} (s.d {formatShortDate(expDate)})
                      </span>
                      {hasFile && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0 ml-1">
                          <Eye className="w-3 h-3 text-amber-400" />
                          <span>Lihat</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('karyawan')}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 underline shrink-0 cursor-pointer"
          >
            Lihat di HC
          </button>
        </div>
      )}

      {/* Contract Alert Banner for HC / Super Admin */}
      {(isSuperAdmin || isAdminHC) && expiringContracts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                Peringatan Batas Kontrak PKWT ({expiringContracts.length} Karyawan)
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Terdapat karyawan kontrak yang mendekati masa akhir perjanjian kerja dalam 120 hari ke depan:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {expiringContracts.map((c) => (
                  <span
                    key={c.employee_id}
                    className="text-xs bg-slate-900/80 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                  >
                    <strong>{c.nama}</strong> ({c.jabatan}) - s.d {formatShortDate(c.akhir_kontrak)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('karyawan')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 underline shrink-0 cursor-pointer"
          >
            Lihat di HC
          </button>
        </div>
      )}

      {/* 1. DATA KEUANGAN DIPINDAH MENJADI PALING ATAS */}
      <div className="space-y-4">
        {/* Informasi Rekening dan Saldo Kas Perusahaan (3 Rekening) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Informasi Rekening &amp; Saldo Kas Perusahaan</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    3 Rekening Resmi
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Likuiditas real-time kas operasional site Lahat, workshop, dan kantor pusat Jakarta
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Saldo Kas:
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">
                  {formatRupiah(totalCompanyBalance)}
                </span>
              </div>
              {(isSuperAdmin || isAdminFinance) && (
                <button
                  onClick={() => onNavigate('finance')}
                  className="px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Kelola Finance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3 Bank Account Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {calculatedAccounts.map((acc) => (
              <div
                key={acc.account_id}
                onClick={() => (isSuperAdmin || isAdminFinance) && onNavigate('finance')}
                className={`p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col justify-between ${
                  isSuperAdmin || isAdminFinance ? 'cursor-pointer group' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                    {acc.bank_name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {acc.account_number}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 block">Saldo Rekening:</span>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">
                    {formatRupiah(acc.current_balance)}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">a.n. {acc.account_holder}</span>
                  <span className="text-slate-500 text-[10px]">Aktif</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Aktivitas Terakhir Transaksi Finance */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">5 Aktivitas Terakhir Transaksi Finance</h4>
                <p className="text-[11px] text-slate-400">Arus kas masuk &amp; keluar pada 3 rekening kas perusahaan</p>
              </div>
            </div>
            {(isSuperAdmin || isAdminFinance) && (
              <button
                onClick={() => onNavigate('finance')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua Kas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tipe &amp; Bank</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pihak &amp; Deskripsi</th>
                  <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => {
                    const isIncoming = tx.type === 'MASUK';
                    const partyName = tx.party_name;
                    const bank = calculatedAccounts.find((a) => String(a.account_id) === String(tx.account_id));

                    return (
                      <tr key={tx.transaction_id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                isIncoming
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {isIncoming ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              <span>{isIncoming ? 'Masuk' : 'Keluar'}</span>
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 block mt-1">
                            {bank?.bank_name || 'Bank'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatShortDate(tx.date)}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-200 truncate" title={partyName || '-'}>
                            {partyName || '-'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate" title={tx.description}>
                            {tx.description}
                          </div>
                          {tx.documents && tx.documents.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 mt-0.5">
                              <FileText className="w-2.5 h-2.5" />
                              <span>{tx.documents.length} berkas terlampir</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div
                            className={`font-bold ${
                              isIncoming ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isIncoming ? '+' : '-'} {formatRupiah(tx.amount)}
                          </div>
                          {tx.admin_fee && tx.admin_fee > 0 ? (
                            <div className="text-[10px] text-slate-500">
                              Adm: {formatRupiah(tx.admin_fee)}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 italic">
                      Belum ada rekaman transaksi kas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. KPI STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Karyawan */}
        <div
          onClick={() => (isSuperAdmin || isAdminHC) && onNavigate('karyawan')}
          className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between ${
            isSuperAdmin || isAdminHC ? 'cursor-pointer group' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Karyawan</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">{totalEmployees}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-blue-400 font-semibold">{data.employees.filter(e => e.status_kepegawaian === 'Karyawan Tetap').length} Tetap</span>
              <span>•</span>
              <span>{data.employees.filter(e => e.status_kepegawaian === 'Karyawan Kontrak (PKWT)').length} PKWT</span>
            </p>
          </div>
        </div>

        {/* Total Aset */}
        <div
          onClick={() => (isSuperAdmin || isAdminGA) && onNavigate('aset')}
          className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between ${
            isSuperAdmin || isAdminGA ? 'cursor-pointer group' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Aset Terdaftar</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">{totalAssets}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{activeAssetsCount} Aktif Siap Kerja</span>
              <span>•</span>
              <span>{repairingAssetsCount} Servis</span>
            </p>
          </div>
        </div>

        {/* Aset Dipinjam */}
        <div
          onClick={() => (isSuperAdmin || isAdminGA) && onNavigate('peminjaman')}
          className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between ${
            isSuperAdmin || isAdminGA ? 'cursor-pointer group' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aset Sedang Dipinjam</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Handshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-emerald-400">{activeAssignments.length}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {totalAssets > 0
                ? `${Math.round((activeAssignments.length / totalAssets) * 100)}% aset terdistribusi ke personil`
                : 'Belum ada aset terdaftar'}
            </p>
          </div>
        </div>

        {/* Total Biaya Servis */}
        <div
          onClick={() => (isSuperAdmin || isAdminGA) && onNavigate('pemeliharaan')}
          className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between ${
            isSuperAdmin || isAdminGA ? 'cursor-pointer group' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Biaya Servis</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-amber-400 truncate">{formatRupiah(totalMaintenanceCost)}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Dari {data.maintenances.length} catatan perbaikan operasional
            </p>
          </div>
        </div>
      </div>

      {/* 3. DISTRIBUSI DEPARTEMEN SEBELAH KONDISI ASET OPERASIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kondisi Aset Operasional */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-400" /> Kondisi Aset Operasional
            </h4>
            <span className="text-xs text-slate-400 font-semibold">{totalAssets} Unit Total</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Aktif / Beroperasi
                </span>
                <span className="font-bold text-white">{activeAssetsCount} unit</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalAssets ? (activeAssetsCount / totalAssets) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Dalam Servis / Perbaikan
                </span>
                <span className="font-bold text-white">{repairingAssetsCount} unit</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalAssets ? (repairingAssetsCount / totalAssets) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Rusak / Breakdown
                </span>
                <span className="font-bold text-white">{damagedAssetsCount} unit</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalAssets ? (damagedAssetsCount / totalAssets) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Distribusi Departemen */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" /> Distribusi Departemen
            </h4>
            <span className="text-xs text-slate-400 font-semibold">{Object.keys(deptMap).length} Divisi</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(deptMap).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition">
                <span className="text-slate-300 font-medium truncate">{dept}</span>
                <span className="font-bold text-amber-400 px-2.5 py-0.5 bg-slate-900 rounded-lg border border-slate-800">
                  {count} org
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. PENYERAHAN ASET TERKINI DAN RIWAYAT PEMELIHARAAN PALING BAWAH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Handover Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/40">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Penyerahan Aset Terkini</h4>
            </div>
            {(isSuperAdmin || isAdminGA) && (
              <button
                onClick={() => onNavigate('peminjaman')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Aset</th>
                  <th className="py-3 px-4">Penanggung Jawab</th>
                  <th className="py-3 px-4">Tgl Serah Terima</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.assignments.slice(0, 5).map((asg) => {
                  const ast = data.assets.find((a) => String(a.asset_id) === String(asg.asset_id));
                  const emp = data.employees.find((e) => String(e.employee_id) === String(asg.employee_id));
                  const isReturned = !!asg.returned_date;

                  return (
                    <tr key={asg.assignment_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{ast?.asset_name || '-'}</div>
                        <span className="font-mono text-[10px] text-amber-400">{ast?.asset_code}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{emp?.nama || '-'}</div>
                        <span className="text-[10px] text-slate-400">{emp?.jabatan}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{formatShortDate(asg.assigned_date)}</td>
                      <td className="py-3 px-4 text-center">
                        {isReturned ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Dikembalikan
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Aktif Dipinjam
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Maintenance Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/40">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Riwayat Pemeliharaan &amp; Servis</h4>
            </div>
            {(isSuperAdmin || isAdminGA) && (
              <button
                onClick={() => onNavigate('pemeliharaan')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Aset</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Uraian Servis</th>
                  <th className="py-3 px-4 text-right">Biaya (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.maintenances.slice(0, 5).map((m) => {
                  const ast = data.assets.find((a) => String(a.asset_id) === String(m.asset_id));
                  return (
                    <tr key={m.maintenance_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{ast?.asset_name || '-'}</div>
                        <span className="font-mono text-[10px] text-slate-400">{ast?.asset_code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{formatShortDate(m.maintenance_date)}</td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={m.description}>
                        {m.description}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">
                        {formatRupiah(m.cost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CERTIFICATE PREVIEW & DOWNLOAD MODAL */}
      {selectedCertPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Detail &amp; Lampiran Sertifikat Karyawan</h3>
                  <p className="text-xs text-slate-400">Lampiran dokumen tersimpan di Google Drive &amp; database terpusat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCertPreview(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Karyawan:</span>
                <span className="font-bold text-white text-sm">{selectedCertPreview.employee.nama}</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  NIK: {selectedCertPreview.employee.nik} • {selectedCertPreview.employee.jabatan}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Sertifikasi:</span>
                <span className="font-bold text-amber-400 text-sm">{selectedCertPreview.cert.nama}</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  Penerbit: {selectedCertPreview.cert.penerbit || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Training:</span>
                <span className="font-semibold text-slate-200">
                  {selectedCertPreview.cert.tgl_training ? formatShortDate(selectedCertPreview.cert.tgl_training) : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Expired:</span>
                <span
                  className={`font-bold ${
                    selectedCertPreview.diffDays < 0 ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {formatShortDate(selectedCertPreview.cert.tgl_expired || selectedCertPreview.cert.tgl_kadaluarsa)} (
                  {selectedCertPreview.diffDays < 0
                    ? `Expired ${Math.abs(selectedCertPreview.diffDays)} hari lalu`
                    : `Sisa ${selectedCertPreview.diffDays} hari`}
                  )
                </span>
              </div>
            </div>

            {/* Document Preview Box */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Lampiran Berkas Sertifikat:</span>
                {selectedCertPreview.cert.drive_url && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <HardDrive className="w-3 h-3" />
                    <span>Tersimpan di Google Drive</span>
                  </span>
                )}
              </div>

              {(() => {
                const certFile = selectedCertPreview.cert.file || selectedCertPreview.cert.drive_download_url || selectedCertPreview.cert.drive_url;
                const certImg = getDocumentPreviewImage(selectedCertPreview.cert.file || selectedCertPreview.cert.drive_url);
                const isPdf = isPdfDocument(selectedCertPreview.cert.file);
                const isDrive = isGoogleDriveUrl(selectedCertPreview.cert.drive_url);

                if (!certFile) {
                  return (
                    <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      Belum ada dokumen fisik/digital yang diunggah untuk sertifikasi ini.
                    </div>
                  );
                }

                return (
                  <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 max-h-96 flex items-center justify-center p-3">
                    {certImg ? (
                      <img
                        src={certImg}
                        alt={selectedCertPreview.cert.nama}
                        className="max-h-80 w-auto object-contain rounded-xl shadow-lg border border-slate-800"
                      />
                    ) : isPdf ? (
                      <div className="py-8 text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-bold">
                            {selectedCertPreview.cert.file_name || 'Dokumen Sertifikat Format PDF'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Sertifikat kompetensi tersimpan aman. Klik tombol di bawah untuk membuka atau mengunduh.
                          </p>
                        </div>
                      </div>
                    ) : isDrive ? (
                      <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-950">
                        <iframe
                          src={getDrivePreviewEmbedUrl(selectedCertPreview.cert.drive_url)}
                          title={selectedCertPreview.cert.nama}
                          className="w-full h-full rounded-xl border-0"
                          allow="autoplay"
                        />
                      </div>
                    ) : (
                      <div className="py-10 text-center space-y-2">
                        <FileText className="w-12 h-12 text-amber-400 mx-auto" />
                        <p className="text-xs text-white font-semibold">
                          {selectedCertPreview.cert.file_name || 'Dokumen Sertifikat Terlampir'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedCertPreview(null);
                  onNavigate('karyawan');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Perbarui di Database HC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                {selectedCertPreview.cert.drive_url && (
                  <a
                    href={selectedCertPreview.cert.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Buka di Google Drive</span>
                  </a>
                )}

                {(selectedCertPreview.cert.file || selectedCertPreview.cert.drive_download_url) && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadDocument(
                        selectedCertPreview.cert.file ||
                          selectedCertPreview.cert.drive_download_url ||
                          selectedCertPreview.cert.drive_url ||
                          '',
                        selectedCertPreview.cert.file_name || `${selectedCertPreview.cert.nama}.pdf`
                      )
                    }
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Dokumen</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCertPreview(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
