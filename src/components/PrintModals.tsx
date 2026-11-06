import React from 'react';
import { Printer, X, FileText, CheckCircle2, Shield, Calendar, MapPin, Phone, Mail, Building2 } from 'lucide-react';
import { Employee, Asset, AssetAssignment, AssetMaintenance, CompanySettings, Category, Location } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

// 1. Employee Profile Modal A4
interface EmployeePrintModalProps {
  employee: Employee | null;
  settings: CompanySettings;
  onClose: () => void;
}

export const EmployeePrintModal: React.FC<EmployeePrintModalProps> = ({ employee, settings, onClose }) => {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] rounded-2xl shadow-2xl p-6 sm:p-10 relative flex flex-col justify-between my-auto">
        {/* Floating actions in screen view */}
        <div className="absolute top-4 right-4 no-print flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak / Unduh PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Company Kop Surat */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <img
                src={settings.company_logo || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=160&q=80'}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                  {settings.company_name}
                </h1>
                <p className="text-xs text-slate-600 max-w-md mt-0.5 leading-snug">
                  {settings.company_address}
                </p>
                <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-500 mt-1">
                  <span>NPWP: {settings.company_npwp || '-'}</span>
                  {settings.company_phone && <span>Telp: {settings.company_phone}</span>}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold uppercase rounded-full border border-amber-300">
                Dokumen Resmi HC
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">KARTU PROFIL KARYAWAN</p>
              <p className="text-xs font-mono text-slate-500">ID: {employee.employee_id}</p>
            </div>
          </div>

          {/* Section 1: Data Pribadi */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2">
              1. Identitas & Data Pribadi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200">
              <div><span className="text-slate-500 block">Nama Lengkap</span><strong className="text-slate-900">{employee.nama}</strong></div>
              <div><span className="text-slate-500 block">NIP</span><strong className="text-slate-900">{employee.nip}</strong></div>
              <div><span className="text-slate-500 block">NIK KTP</span><strong className="text-slate-900">{employee.nik}</strong></div>
              <div><span className="text-slate-500 block">Tempat, Tanggal Lahir</span><span className="text-slate-800">{employee.tempat_lahir || '-'}, {formatDateIndo(employee.tanggal_lahir)}</span></div>
              <div><span className="text-slate-500 block">Jenis Kelamin / Agama</span><span className="text-slate-800">{employee.jenis_kelamin} / {employee.agama}</span></div>
              <div><span className="text-slate-500 block">Status Pernikahan</span><span className="text-slate-800">{employee.status_nikah}</span></div>
              <div><span className="text-slate-500 block">No. Telepon / WA</span><span className="text-slate-800">{employee.no_hp || '-'}</span></div>
              <div><span className="text-slate-500 block">Email Kerja</span><span className="text-slate-800">{employee.email || '-'}</span></div>
              <div><span className="text-slate-500 block">Kontak Darurat</span><span className="text-slate-800">{employee.kontak_darurat || '-'}</span></div>
              <div className="col-span-2 sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div><span className="text-slate-500 block">Alamat Sesuai KTP</span><span className="text-slate-800">{employee.alamat_ktp || '-'}</span></div>
                <div><span className="text-slate-500 block">Alamat Domisili Sekarang</span><span className="text-slate-800">{employee.alamat_domisili || '-'}</span></div>
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Pekerjaan */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2">
              2. Informasi Pekerjaan & Penempatan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200">
              <div><span className="text-slate-500 block">Jabatan / Posisi</span><strong className="text-slate-900">{employee.jabatan}</strong></div>
              <div><span className="text-slate-500 block">Divisi / Departemen</span><strong className="text-slate-900">{employee.departemen}</strong></div>
              <div><span className="text-slate-500 block">Lokasi Kerja / Site</span><span className="text-slate-800">{employee.lokasi_kerja || '-'}</span></div>
              <div><span className="text-slate-500 block">Tanggal Mulai Bekerja</span><span className="text-slate-800">{formatDateIndo(employee.tgl_mulai_kerja)}</span></div>
              <div><span className="text-slate-500 block">Status Kepegawaian</span><span className="text-slate-800 font-bold">{employee.status_kepegawaian}</span></div>
              {employee.status_kepegawaian === 'Karyawan Kontrak (PKWT)' && (
                <div><span className="text-slate-500 block">Berakhirnya Kontrak</span><span className="text-amber-700 font-bold">{formatDateIndo(employee.akhir_kontrak)}</span></div>
              )}
            </div>
          </div>

          {/* Section 3: Data Keuangan & BPJS */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2">
              3. Administrasi Keuangan, Pajak & Jaminan Sosial
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200">
              <div><span className="text-slate-500 block">NPWP</span><span className="font-mono text-slate-800">{employee.npwp || '-'}</span></div>
              <div><span className="text-slate-500 block">BPJS Kesehatan</span><span className="font-mono text-slate-800">{employee.bpjs_kes || '-'}</span></div>
              <div><span className="text-slate-500 block">BPJS Ketenagakerjaan</span><span className="font-mono text-slate-800">{employee.bpjs_tk || '-'}</span></div>
              <div><span className="text-slate-500 block">Rekening Bank</span><span className="text-slate-800 font-semibold">{employee.nama_bank || '-'} {employee.no_rekening ? `(${employee.no_rekening})` : ''}</span></div>
            </div>
          </div>

          {/* Section 4: Pendidikan & Multi Sertifikasi */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2">
              4. Pendidikan & Sertifikasi Kompetensi
            </h2>
            <div className="text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200 space-y-2">
              <p>
                <strong>Pendidikan Terakhir:</strong> {employee.pendidikan_terakhir || '-'} {employee.instansi_pendidikan ? `di ${employee.instansi_pendidikan}` : ''} {employee.jurusan ? `(Jurusan: ${employee.jurusan})` : ''}
              </p>
              <div>
                <strong className="block text-slate-600 mb-1">Daftar Sertifikasi Terlampir:</strong>
                {employee.sertifikasi && employee.sertifikasi.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {employee.sertifikasi.map((cert) => (
                      <div key={cert.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{cert.nama}</p>
                          <p className="text-[11px] text-slate-600">
                            {cert.penerbit ? `Penerbit: ${cert.penerbit}` : 'Lembaga Resmi'}
                          </p>
                          <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-500 pt-0.5">
                            {cert.tgl_training && (
                              <span>Tgl Training: <strong>{formatDateIndo(cert.tgl_training)}</strong></span>
                            )}
                            {(cert.tgl_expired || cert.tgl_kadaluarsa) && (
                              <span>Expired: <strong>{formatDateIndo(cert.tgl_expired || cert.tgl_kadaluarsa)}</strong></span>
                            )}
                            {cert.file && (
                              <span className="text-emerald-700 font-semibold">• Berkas Terlampir</span>
                            )}
                            {cert.drive_url && (
                              <span className="text-blue-700 font-semibold">• Google Drive</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Belum ada sertifikasi khusus yang ditambahkan.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Kelengkapan Dokumen */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2 flex items-center justify-between">
              <span>5. Checklist Dokumen Fisik / Digital</span>
              {employee.documents && employee.documents.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                  {employee.documents.length} Berkas Digital
                </span>
              )}
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2 rounded-lg border ${employee.doc_ktp || (employee.documents && employee.documents.length > 0) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <span className="font-bold block">KTP</span>
                <span className="text-[10px]">{employee.doc_ktp || (employee.documents && employee.documents.length > 0) ? '✓ Terverifikasi' : 'Belum Ada'}</span>
              </div>
              <div className={`p-2 rounded-lg border ${employee.doc_kk || (employee.documents && employee.documents.length > 1) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <span className="font-bold block">Kartu Keluarga</span>
                <span className="text-[10px]">{employee.doc_kk || (employee.documents && employee.documents.length > 1) ? '✓ Terverifikasi' : 'Belum Ada'}</span>
              </div>
              <div className={`p-2 rounded-lg border ${employee.doc_bpjs_kes || (employee.documents && employee.documents.length > 2) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <span className="font-bold block">BPJS Kesehatan</span>
                <span className="text-[10px]">{employee.doc_bpjs_kes || (employee.documents && employee.documents.length > 2) ? '✓ Terverifikasi' : 'Belum Ada'}</span>
              </div>
              <div className={`p-2 rounded-lg border ${employee.doc_bpjs_tk || (employee.documents && employee.documents.length > 3) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <span className="font-bold block">BPJS TK</span>
                <span className="text-[10px]">{employee.doc_bpjs_tk || (employee.documents && employee.documents.length > 3) ? '✓ Terverifikasi' : 'Belum Ada'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tanda Tangan Resmi HC */}
        <div className="pt-10 border-t border-slate-200 mt-8 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-600">Mengetahui & Menyetujui,</p>
            <p className="font-bold text-slate-900 mt-1 mb-16">Human Capital & GA Manager</p>
            <p className="font-bold text-slate-900 underline">( ................................................. )</p>
            <p className="text-[10px] text-slate-500">NIP: .......................................</p>
          </div>
          <div>
            <p className="text-slate-600">Karyawan Yang Bersangkutan,</p>
            <p className="font-bold text-slate-900 mt-1 mb-16">{employee.jabatan}</p>
            <p className="font-bold text-slate-900 underline">( {employee.nama} )</p>
            <p className="text-[10px] text-slate-500">NIP: {employee.nip}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 border-t pt-3 mt-4 flex items-center justify-between">
          <span>{settings.company_name} - Sistem HC & GA Terpadu</span>
          <span>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};

// 2. Asset Control Card Modal A4
interface AssetPrintModalProps {
  asset: Asset | null;
  category?: Category;
  location?: Location;
  settings: CompanySettings;
  currentHolder?: Employee | null;
  onClose: () => void;
}

export const AssetPrintModal: React.FC<AssetPrintModalProps> = ({
  asset,
  category,
  location,
  settings,
  currentHolder,
  onClose
}) => {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] rounded-2xl shadow-2xl p-6 sm:p-10 relative flex flex-col justify-between my-auto">
        <div className="absolute top-4 right-4 no-print flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak / PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <img
                src={settings.company_logo || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=160&q=80'}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                  {settings.company_name}
                </h1>
                <p className="text-xs text-slate-600 max-w-md">{settings.company_address}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold uppercase rounded-full border border-amber-300">
                General Affairs (GA)
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">KARTU KENDALI ASET RESMI</p>
              <p className="text-xs font-mono font-bold text-amber-700">{asset.asset_code}</p>
            </div>
          </div>

          {/* Title & Status */}
          <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{asset.asset_name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Kode: {asset.asset_code}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-xs font-extrabold rounded-lg ${
                asset.status === 'Aktif'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : asset.status === 'Diperbaiki'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                STATUS: {asset.status}
              </span>
            </div>
          </div>

          {/* Asset Specs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2">
              Spesifikasi & Identitas Aset
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div><span className="text-slate-500 block">Kategori Aset</span><strong className="text-slate-900">{category?.category_name || '-'}</strong></div>
              <div><span className="text-slate-500 block">Lokasi Fisik / Site</span><strong className="text-slate-900">{location?.location_name || '-'}</strong></div>
              <div><span className="text-slate-500 block">Merek Pabrikan</span><span className="text-slate-800">{asset.brand || '-'}</span></div>
              <div><span className="text-slate-500 block">Model / Tipe</span><span className="text-slate-800">{asset.model_number || '-'}</span></div>
              <div><span className="text-slate-500 block">Serial Number (S/N)</span><span className="font-mono font-bold text-slate-900">{asset.serial_number || '-'}</span></div>
              <div><span className="text-slate-500 block">Tanggal Perolehan</span><span className="text-slate-800">{formatDateIndo(asset.purchase_date)}</span></div>
              <div><span className="text-slate-500 block">Harga Pembelian</span><strong className="text-emerald-700">{formatRupiah(asset.purchase_cost)}</strong></div>
              <div className="col-span-2"><span className="text-slate-500 block">Penanggung Jawab Sekarang</span><strong className="text-amber-800">{currentHolder ? `${currentHolder.nama} (${currentHolder.jabatan})` : 'Tersedia di Gudang / Pool'}</strong></div>
              {asset.notes && (
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">Catatan Operasional:</span>
                  <p className="text-slate-700 italic">{asset.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Photo Gallery */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2">
              Dokumentasi Foto Fisik Aset
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {asset.photos && asset.photos.length > 0 ? (
                asset.photos.map((photo, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                    <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-36 object-cover" />
                    <p className="p-1.5 text-center text-[10px] text-slate-500 font-medium">Foto Unit #{i + 1}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Belum ada foto fisik yang dilampirkan.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-10 border-t border-slate-200 mt-8 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-600">Diserahkan Oleh,</p>
            <p className="font-bold text-slate-900 mt-1 mb-16">General Affairs & Asset Custodian</p>
            <p className="font-bold text-slate-900 underline">( ................................................. )</p>
            <p className="text-[10px] text-slate-500">Tanggal: .......................................</p>
          </div>
          <div>
            <p className="text-slate-600">Mengetahui Kepala Divisi,</p>
            <p className="font-bold text-slate-900 mt-1 mb-16">Project Site Management</p>
            <p className="font-bold text-slate-900 underline">( ................................................. )</p>
            <p className="text-[10px] text-slate-500">Tanggal: .......................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Handover Receipt Modal A4 (BAST)
interface HandoverPrintModalProps {
  assignment: AssetAssignment | null;
  asset: Asset | null;
  employee: Employee | null;
  settings: CompanySettings;
  onClose: () => void;
}

export const HandoverPrintModal: React.FC<HandoverPrintModalProps> = ({
  assignment,
  asset,
  employee,
  settings,
  onClose
}) => {
  if (!assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] rounded-2xl shadow-2xl p-6 sm:p-10 relative flex flex-col justify-between my-auto">
        <div className="absolute top-4 right-4 no-print flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Dokumen BAST</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <img
                src={settings.company_logo || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=160&q=80'}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                  {settings.company_name}
                </h1>
                <p className="text-xs text-slate-600 max-w-md">{settings.company_address}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold uppercase rounded-full border border-amber-300">
                Formulir Resmi GA
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">BERITA ACARA SERAH TERIMA</p>
              <p className="text-xs font-mono text-slate-500">Ref: {assignment.assignment_id}</p>
            </div>
          </div>

          <div className="text-center py-2">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 underline">
              BERITA ACARA SERAH TERIMA ASET / PERALATAN KERJA (BAST)
            </h2>
            <p className="text-xs text-slate-500 mt-1">Nomor: {assignment.assignment_id}/BAST-GA/KSO/{new Date().getFullYear()}</p>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed text-justify">
            Pada hari ini, tanggal <strong>{formatDateIndo(assignment.assigned_date)}</strong>, telah dilakukan serah terima fasilitas dan peralatan kerja operasional milik perusahaan <strong>{settings.company_name}</strong> antara pihak pertama (Pengelola Aset / GA) kepada pihak kedua (Karyawan Penanggung Jawab) dengan rincian identitas berikut:
          </p>

          {/* Parties Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase block mb-1">PIHAK PERTAMA (YANG MENYERAHKAN):</span>
              <p><strong>Nama:</strong> Tim General Affairs (GA)</p>
              <p><strong>Divisi:</strong> HC, Finance &amp; GA</p>
              <p><strong>Perusahaan:</strong> {settings.company_name}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase block mb-1">PIHAK KEDUA (PENERIMA / PENANGGUNG JAWAB):</span>
              <p><strong>Nama:</strong> {employee?.nama || '-'}</p>
              <p><strong>NIP:</strong> {employee?.nip || '-'}</p>
              <p><strong>Jabatan:</strong> {employee?.jabatan || '-'} ({employee?.departemen || '-'})</p>
            </div>
          </div>

          {/* Asset Info Card */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2">
              Rincian Barang / Aset Yang Diserahterimakan
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 border-b">
                  <tr>
                    <th className="p-2.5">Kode Aset</th>
                    <th className="p-2.5">Nama & Deskripsi Barang</th>
                    <th className="p-2.5">Merek & Model</th>
                    <th className="p-2.5">Serial Number (S/N)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-mono font-bold text-amber-700">{asset?.asset_code || '-'}</td>
                    <td className="p-3 font-semibold text-slate-900">{asset?.asset_name || '-'}</td>
                    <td className="p-3 text-slate-700">{asset?.brand || '-'} {asset?.model_number || ''}</td>
                    <td className="p-3 font-mono text-slate-700">{asset?.serial_number || '-'}</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                <strong className="text-slate-700">Catatan Kondisi Fisik Saat Serah Terima:</strong>
                <p className="text-slate-600 mt-1 italic">{assignment.condition_notes || 'Barang diterima dalam kondisi prima, berfungsi normal, dan siap pakai.'}</p>
              </div>
            </div>
          </div>

          {/* Clauses */}
          <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
            <p className="font-bold text-slate-800">Ketentuan & Tanggung Jawab Penerima:</p>
            <p>1. Pihak Kedua bertanggung jawab penuh atas pemeliharaan kebersihan, keselamatan, dan penggunaan aset sesuai Standard Operating Procedure (SOP) perusahaan.</p>
            <p>2. Aset ini dilarang keras dipindahtangankan kepada pihak luar atau digunakan di luar kepentingan operasional {settings.company_name}.</p>
            <p>3. Apabila terjadi kerusakan atau kehilangan akibat kelalaian, Pihak Kedua bersedia mengikuti tata tertib investigasi dan pertanggungjawaban internal.</p>
          </div>
        </div>

        {/* Formal Signature Blocks */}
        <div className="pt-10 border-t border-slate-200 mt-8 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-600">Penerima / Penanggung Jawab,</p>
            <p className="font-bold text-slate-900 mt-1 mb-16">{employee?.jabatan || 'Karyawan'}</p>
            <p className="font-bold text-slate-900 underline">( {employee?.nama || '...........................................'} )</p>
            <p className="text-[10px] text-slate-500">NIP: {employee?.nip || '.......................'}</p>
          </div>
          <div>
            <p className="text-slate-600">Yang Menyerahkan,</p>
            <p className="font-bold text-slate-900 mt-1 mb-16">Officer General Affairs (GA)</p>
            <p className="font-bold text-slate-900 underline">( ................................................. )</p>
            <p className="text-[10px] text-slate-500">KSO LRS-TAL GA Dept</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Maintenance Service Modal A4
interface MaintenancePrintModalProps {
  maintenance: AssetMaintenance | null;
  asset: Asset | null;
  settings: CompanySettings;
  onClose: () => void;
}

export const MaintenancePrintModal: React.FC<MaintenancePrintModalProps> = ({
  maintenance,
  asset,
  settings,
  onClose
}) => {
  if (!maintenance) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] rounded-2xl shadow-2xl p-6 sm:p-10 relative flex flex-col justify-between my-auto">
        <div className="absolute top-4 right-4 no-print flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Nota Servis</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <img
                src={settings.company_logo || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=160&q=80'}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
                  {settings.company_name}
                </h1>
                <p className="text-xs text-slate-600 max-w-md">{settings.company_address}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold uppercase rounded-full border border-amber-300">
                Log Servis Resmi
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">BERITA ACARA PEMELIHARAAN</p>
              <p className="text-xs font-mono font-bold text-amber-700">{maintenance.maintenance_id}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h2 className="text-base font-bold text-slate-900">LEMBAR NOTA & PERBAIKAN ASET OPERASIONAL</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tanggal Servis: {formatDateIndo(maintenance.maintenance_date)}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div><span className="text-slate-500 block">Nama Aset</span><strong className="text-slate-900">{asset?.asset_name || '-'}</strong></div>
            <div><span className="text-slate-500 block">Kode Aset</span><strong className="font-mono text-amber-700">{asset?.asset_code || '-'}</strong></div>
            <div><span className="text-slate-500 block">Merek / Seri</span><span className="text-slate-800">{asset?.brand || '-'} {asset?.model_number || ''}</span></div>
            <div><span className="text-slate-500 block">Bengkel / Vendor Rekanan</span><strong className="text-slate-900">{maintenance.vendor_name || 'Internal Workshop'}</strong></div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-slate-500 block text-xs">Total Biaya Pemeliharaan:</span>
              <span className="text-xl font-black text-amber-700">{formatRupiah(maintenance.cost)}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded border-l-4 border-amber-500 mb-2">
              Uraian Pekerjaan / Komponen Yang Diganti
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-line leading-relaxed">
              {maintenance.description}
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-10 border-t border-slate-200 mt-8 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-600">Teknisi / Bengkel Pelaksana,</p>
            <p className="font-bold text-slate-900 mt-1 mb-16">{maintenance.vendor_name || 'Chief Mechanic Yard'}</p>
            <p className="font-bold text-slate-900 underline">( ................................................. )</p>
            <p className="text-[10px] text-slate-500">Tanggal: {maintenance.maintenance_date}</p>
          </div>
          <div>
            <p className="text-slate-600">Disetujui Oleh,</p>
            <p className="font-bold text-slate-900 mt-1 mb-16">Kepala Bagian GA &amp; Finance</p>
            <p className="font-bold text-slate-900 underline">( ................................................. )</p>
            <p className="text-[10px] text-slate-500">KSO LRS-TAL</p>
          </div>
        </div>
      </div>
    </div>
  );
};
