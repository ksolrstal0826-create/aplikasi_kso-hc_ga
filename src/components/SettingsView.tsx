import React, { useState } from 'react';
import {
  Building2,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Save,
  Image,
  FileCode,
  Sparkles,
  Sheet,
  ExternalLink,
  CloudUpload,
  CloudDownload,
  FolderSync,
  LogOut
} from 'lucide-react';
import { CompanySettings, AppState } from '../types';

interface SettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onExportData: () => void;
  onImportData: (data: AppState) => void;
  onResetData: () => void;
  // Google Workspace Props
  isGoogleConnected: boolean;
  googleUserEmail?: string;
  spreadsheetUrl?: string;
  isSyncing: boolean;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onPushToSheets: () => void;
  onPullFromSheets: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onExportData,
  onImportData,
  onResetData,
  isGoogleConnected,
  googleUserEmail,
  spreadsheetUrl,
  isSyncing,
  onConnectGoogle,
  onDisconnectGoogle,
  onPushToSheets,
  onPullFromSheets
}) => {
  const [companyName, setCompanyName] = useState(settings.company_name);
  const [npwp, setNpwp] = useState(settings.company_npwp);
  const [address, setAddress] = useState(settings.company_address);
  const [phone, setPhone] = useState(settings.company_phone || '');
  const [email, setEmail] = useState(settings.company_email || '');
  const [logoUrl, setLogoUrl] = useState(settings.company_logo);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setLogoUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.employees && parsed.assets) {
          onImportData(parsed);
          alert('Data cadangan berhasil diimpor!');
        } else {
          alert('Format file JSON tidak valid untuk aplikasi KSO LRS-TAL.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      company_name: companyName.trim(),
      company_npwp: npwp.trim(),
      company_address: address.trim(),
      company_phone: phone.trim(),
      company_email: email.trim(),
      company_logo: logoUrl
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Pengaturan Perusahaan &amp; Database Cloud
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Sesuaikan profil institusi, kop surat resmi, integrasi database Google Sheets &amp; Drive, serta arsip cadangan.
        </p>
      </div>

      {/* GOOGLE DRIVE & GOOGLE SHEETS DATABASE SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Database Utama: Google Sheets &amp; Drive</span>
                {isGoogleConnected && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    ✓ Terhubung
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Penyimpanan cloud untuk data Karyawan, Aset, Penyerahan BAST, Riwayat Servis, dan arsip nota di Drive.
              </p>
            </div>
          </div>

          <div>
            {!isGoogleConnected ? (
              <button
                type="button"
                onClick={onConnectGoogle}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition"
              >
                <Sheet className="w-4 h-4" />
                <span>Hubungkan Google Workspace</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onDisconnectGoogle}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putuskan Akun</span>
              </button>
            )}
          </div>
        </div>

        {isGoogleConnected ? (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block mb-1">Akun Google Terhubung:</span>
                <strong className="text-white font-medium">{googleUserEmail || 'Akun Google'}</strong>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block mb-1">Spreadsheet Database:</span>
                  <strong className="text-emerald-400 font-medium">KSO LRS-TAL - Database HC & GA</strong>
                </div>
                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-400 rounded-lg flex items-center gap-1 font-bold text-[11px]"
                    title="Buka Spreadsheet di Tab Baru"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onPushToSheets}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Mengunggah Data...' : 'Kirim / Sinkronkan ke Google Sheets'}</span>
              </button>

              <button
                type="button"
                onClick={onPullFromSheets}
                disabled={isSyncing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <CloudDownload className="w-4 h-4 text-blue-400" />
                <span>Tarik Data Terbaru dari Google Sheets</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">
              Sinkronisasi Cloud dengan Google Sheets &amp; Google Drive
            </p>
            <p>
              Hubungkan akun Google Anda untuk otomatis membuat spreadsheet database dengan tab <em>Karyawan, Aset, Penyerahan_Aset, Riwayat_Servis, Kategori, Lokasi, dan Pengaturan</em>, serta menyimpan nota tanda terima langsung ke Google Drive.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Settings Left & Middle */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Profil Identitas Perusahaan</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Perusahaan / Konsorsium <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Contoh: KSO LRS-TAL"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">NPWP Resmi</label>
                <input
                  type="text"
                  value={npwp}
                  onChange={(e) => setNpwp(e.target.value)}
                  placeholder="01.234.567.8-901.000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">No. Telepon / Hotline</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 731 xxxxxx"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Kantor / Site Utama</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap perusahaan yang tertera di surat resmi dan Berita Acara"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Logo Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Logo Resmi Perusahaan (Digunakan pada Semua Cetakan BAST &amp; Profil)
              </label>
              <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 p-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <Image className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-amber-400 hover:file:bg-slate-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400">
                    Format disarankan: PNG atau JPG transparan berresolusi tajam.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Pengaturan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Data Management & Backup Tools */}
        <div className="space-y-6">
          {/* Backup & Restore Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Cadangan &amp; Pemulihan JSON</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Anda dapat mengunduh arsip file JSON mandiri sebagai cadangan offline selain Google Sheets.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onExportData}
                className="w-full py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor File JSON (Backup)</span>
              </button>

              <label className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Impor File JSON (Restore)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Demo Data Card */}
          <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Zona Berbahaya</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mengembalikan seluruh data karyawan, master kategori, aset, penyerahan, dan servis ke data awal demo default pabrik.
            </p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database ke data awal bawaan sistem?')) {
                  onResetData();
                }
              }}
              className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Data Default</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
