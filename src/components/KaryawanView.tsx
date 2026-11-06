import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  CreditCard,
  FileText,
  X,
  Upload,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  HardDrive,
  Paperclip,
  Printer,
  Link as LinkIcon
} from 'lucide-react';
import { Employee, EmployeeCertification, EmploymentStatus } from '../types';
import { formatShortDate } from '../utils/formatters';
import { getAccessToken, uploadFileToDrive } from '../utils/googleWorkspace';
import {
  downloadDocument,
  isGoogleDriveUrl,
  isPdfDocument,
  isImageDocument,
  getDocumentPreviewImage,
  openDocumentInNewTab
} from '../utils/fileDownloader';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface KaryawanViewProps {
  employees: Employee[];
  onSaveEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onViewEmployee: (employee: Employee) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

const DEPARTMENTS = [
  'Project Management',
  'Operasional Lapangan',
  'Engineering & Maintenance',
  'HSE & Safety',
  'HC, Finance & GA'
];

const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  'Karyawan Tetap',
  'Karyawan Kontrak (PKWT)',
  'Paruh Waktu',
  'Outsourcing'
];

export const KaryawanView: React.FC<KaryawanViewProps> = ({
  employees,
  onSaveEmployee,
  onDeleteEmployee,
  onViewEmployee,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Detail Modal State
  const [viewDetailEmp, setViewDetailEmp] = useState<Employee | null>(null);

  // Edit State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [activeFormTab, setActiveFormTab] = useState<number>(1);
  const [formNama, setFormNama] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formTempatLahir, setFormTempatLahir] = useState('');
  const [formTglLahir, setFormTglLahir] = useState('');
  const [formJenisKelamin, setFormJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formAgama, setFormAgama] = useState('Islam');
  const [formStatusNikah, setFormStatusNikah] = useState<'Belum Menikah' | 'Menikah' | 'Cerai'>('Belum Menikah');
  const [formHp, setFormHp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formKontakDarurat, setFormKontakDarurat] = useState('');
  const [formAlamatKtp, setFormAlamatKtp] = useState('');
  const [formAlamatDomisili, setFormAlamatDomisili] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formDepartemen, setFormDepartemen] = useState(DEPARTMENTS[0]);
  const [formTglMulai, setFormTglMulai] = useState('');
  const [formLokasiKerja, setFormLokasiKerja] = useState('');
  const [formStatusKepegawaian, setFormStatusKepegawaian] = useState<EmploymentStatus>('Karyawan Tetap');
  const [formAkhirKontrak, setFormAkhirKontrak] = useState('');
  const [formNpwp, setFormNpwp] = useState('');
  const [formBpjsKes, setFormBpjsKes] = useState('');
  const [formBpjsTk, setFormBpjsTk] = useState('');
  const [formNamaBank, setFormNamaBank] = useState('');
  const [formNoRekening, setFormNoRekening] = useState('');
  const [formPendidikan, setFormPendidikan] = useState('S1');
  const [formInstansi, setFormInstansi] = useState('');
  const [formJurusan, setFormJurusan] = useState('');
  const [formSertifikasi, setFormSertifikasi] = useState<EmployeeCertification[]>([]);
  const [formDocKtp, setFormDocKtp] = useState('');
  const [formDocKk, setFormDocKk] = useState('');
  const [formDocBpjsKes, setFormDocBpjsKes] = useState('');
  const [formDocBpjsTk, setFormDocBpjsTk] = useState('');
  const [formDocuments, setFormDocuments] = useState<string[]>([]);
  const [inputDocLink, setInputDocLink] = useState('');
  const [modalPreviewDoc, setModalPreviewDoc] = useState<{
    title: string;
    fileUrlOrBase64: string;
    fileName?: string;
    driveUrl?: string;
    categoryLabel?: string;
  } | null>(null);

  const handleAddDocLink = () => {
    const trimmed = inputDocLink.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      alert('Format link dokumen tidak valid. Gunakan link lengkap diawali https:// (contoh: link Google Drive).');
      return;
    }
    if (formDocuments.length >= 10) {
      alert('Maksimal 10 dokumen pendukung per karyawan.');
      return;
    }
    setFormDocuments((prev) => [...prev, trimmed]);
    setInputDocLink('');
  };

  // Handle open modal for Edit
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormNama(emp.nama || '');
    setFormNip(emp.nip || '');
    setFormNik(emp.nik || '');
    setFormTempatLahir(emp.tempat_lahir || '');
    setFormTglLahir(emp.tanggal_lahir || '');
    setFormJenisKelamin(emp.jenis_kelamin || 'Laki-laki');
    setFormAgama(emp.agama || 'Islam');
    setFormStatusNikah(emp.status_nikah || 'Belum Menikah');
    setFormHp(emp.no_hp || '');
    setFormEmail(emp.email || '');
    setFormKontakDarurat(emp.kontak_darurat || '');
    setFormAlamatKtp(emp.alamat_ktp || '');
    setFormAlamatDomisili(emp.alamat_domisili || '');
    setFormJabatan(emp.jabatan || '');
    setFormDepartemen(emp.departemen || DEPARTMENTS[0]);
    setFormTglMulai(emp.tgl_mulai_kerja || '');
    setFormLokasiKerja(emp.lokasi_kerja || '');
    setFormStatusKepegawaian(emp.status_kepegawaian || 'Karyawan Tetap');
    setFormAkhirKontrak(emp.akhir_kontrak || '');
    setFormNpwp(emp.npwp || '');
    setFormBpjsKes(emp.bpjs_kes || '');
    setFormBpjsTk(emp.bpjs_tk || '');
    setFormNamaBank(emp.nama_bank || '');
    setFormNoRekening(emp.no_rekening || '');
    setFormPendidikan(emp.pendidikan_terakhir || 'S1');
    setFormInstansi(emp.instansi_pendidikan || '');
    setFormJurusan(emp.jurusan || '');
    setFormSertifikasi(emp.sertifikasi || []);
    setFormDocKtp(emp.doc_ktp || '');
    setFormDocKk(emp.doc_kk || '');
    setFormDocBpjsKes(emp.doc_bpjs_kes || '');
    setFormDocBpjsTk(emp.doc_bpjs_tk || '');
    const initialDocs = emp.documents && emp.documents.length > 0
      ? [...emp.documents]
      : ([emp.doc_ktp, emp.doc_kk, emp.doc_bpjs_kes, emp.doc_bpjs_tk].filter(Boolean) as string[]);
    setFormDocuments(initialDocs);
    setActiveFormTab(1);
    onOpenAddModal();
  };

  const handleOpenNew = () => {
    setEditingEmployee(null);
    setFormNama('');
    setFormNip(`LRS-00${employees.length + 1}`);
    setFormNik('');
    setFormTempatLahir('');
    setFormTglLahir('');
    setFormJenisKelamin('Laki-laki');
    setFormAgama('Islam');
    setFormStatusNikah('Belum Menikah');
    setFormHp('');
    setFormEmail('');
    setFormKontakDarurat('');
    setFormAlamatKtp('');
    setFormAlamatDomisili('');
    setFormJabatan('');
    setFormDepartemen(DEPARTMENTS[0]);
    setFormTglMulai(new Date().toISOString().split('T')[0]);
    setFormLokasiKerja('Site Lahat');
    setFormStatusKepegawaian('Karyawan Tetap');
    setFormAkhirKontrak('');
    setFormNpwp('');
    setFormBpjsKes('');
    setFormBpjsTk('');
    setFormNamaBank('Bank Mandiri');
    setFormNoRekening('');
    setFormPendidikan('S1');
    setFormInstansi('');
    setFormJurusan('');
    setFormSertifikasi([{
      id: 'cert-' + Date.now(),
      nama: '',
      penerbit: '',
      tgl_training: '',
      tgl_expired: '',
      tgl_kadaluarsa: '',
      file: '',
      file_name: ''
    }]);
    setFormDocKtp('');
    setFormDocKk('');
    setFormDocBpjsKes('');
    setFormDocBpjsTk('');
    setFormDocuments([]);
    setActiveFormTab(1);
    onOpenAddModal();
  };

  const handleAddCertRow = () => {
    setFormSertifikasi([
      ...formSertifikasi,
      {
        id: 'cert-' + Date.now() + Math.random().toString(36).substring(2, 5),
        nama: '',
        penerbit: '',
        tgl_training: '',
        tgl_expired: '',
        tgl_kadaluarsa: '',
        file: '',
        file_name: ''
      }
    ]);
  };

  const handleUpdateCertRow = (index: number, field: keyof EmployeeCertification, val: string) => {
    const updated = [...formSertifikasi];
    const target = { ...updated[index], [field]: val };
    // Synchronize tgl_expired and tgl_kadaluarsa
    if (field === 'tgl_expired') {
      target.tgl_kadaluarsa = val;
    } else if (field === 'tgl_kadaluarsa') {
      target.tgl_expired = val;
    }
    updated[index] = target;
    setFormSertifikasi(updated);
  };

  const handleCertFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64Data = ev.target?.result as string;
        const updated = [...formSertifikasi];
        updated[index] = {
          ...updated[index],
          file: base64Data,
          file_name: fileName
        };
        setFormSertifikasi(updated);

        // Upload to Google Drive if signed in
        try {
          const token = await getAccessToken();
          if (token) {
            const driveRes = await uploadFileToDrive(
              token,
              base64Data,
              `Sertifikat-${fileName}`,
              'KSO LRS-TAL - Sertifikat Karyawan'
            );
            setFormSertifikasi((prev) => {
              const next = [...prev];
              if (next[index]) {
                next[index] = {
                  ...next[index],
                  drive_url: driveRes.webViewLink,
                  drive_file_id: driveRes.fileId,
                  drive_download_url: driveRes.downloadUrl
                };
              }
              return next;
            });
          }
        } catch (err) {
          console.warn('Google Drive direct upload skipped/failed:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCertRow = (index: number) => {
    setFormSertifikasi(formSertifikasi.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setter(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Multi-documents upload (up to 10) with Google Drive auto-upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formDocuments.length + files.length > 10) {
      alert('Maksimal 10 dokumen pendukung per karyawan.');
      return;
    }

    Array.from(files).forEach((file) => {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const base64Data = ev.target.result as string;
          // Optimistically add local preview
          setFormDocuments((prev) => [...prev, base64Data]);

          // Upload to Google Drive in background if connected (preserves base64 for instant preview)
          try {
            const token = await getAccessToken();
            if (token) {
              await uploadFileToDrive(
                token,
                base64Data,
                `Karyawan-${formNama || 'EMP'}-${Date.now()}-${fileName}`,
                'KSO LRS-TAL - Dokumen Karyawan'
              );
            }
          } catch (err) {
            console.warn('Google Drive direct upload skipped/failed for employee doc:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveDocument = (index: number) => {
    setFormDocuments(formDocuments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formNip.trim()) return;

    const payload: Employee = {
      employee_id: editingEmployee ? editingEmployee.employee_id : `EMP-${1000 + employees.length + 1}`,
      nip: formNip,
      nik: formNik || formNip,
      nama: formNama,
      tempat_lahir: formTempatLahir,
      tanggal_lahir: formTglLahir,
      jenis_kelamin: formJenisKelamin,
      agama: formAgama,
      status_nikah: formStatusNikah,
      no_hp: formHp,
      email: formEmail,
      kontak_darurat: formKontakDarurat,
      alamat_ktp: formAlamatKtp,
      alamat_domisili: formAlamatDomisili,
      jabatan: formJabatan,
      departemen: formDepartemen,
      tgl_mulai_kerja: formTglMulai,
      lokasi_kerja: formLokasiKerja,
      status_kepegawaian: formStatusKepegawaian,
      akhir_kontrak: formStatusKepegawaian === 'Karyawan Kontrak (PKWT)' ? formAkhirKontrak : '',
      no_ktp: formNik,
      npwp: formNpwp,
      bpjs_kes: formBpjsKes,
      bpjs_tk: formBpjsTk,
      nama_bank: formNamaBank,
      no_rekening: formNoRekening,
      pendidikan_terakhir: formPendidikan,
      instansi_pendidikan: formInstansi,
      jurusan: formJurusan,
      sertifikasi: formSertifikasi.filter((c) => c.nama.trim()),
      doc_ktp: formDocuments[0] || formDocKtp || '',
      doc_kk: formDocuments[1] || formDocKk || '',
      doc_bpjs_kes: formDocuments[2] || formDocBpjsKes || '',
      doc_bpjs_tk: formDocuments[3] || formDocBpjsTk || '',
      documents: formDocuments
    };

    onSaveEmployee(payload);
    onCloseAddModal();
  };

  // Filter logic
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      (emp.nama && emp.nama.toLowerCase().includes(q)) ||
      (emp.nip && emp.nip.toLowerCase().includes(q)) ||
      (emp.nik && emp.nik.toLowerCase().includes(q)) ||
      (emp.jabatan && emp.jabatan.toLowerCase().includes(q)) ||
      (emp.departemen && emp.departemen.toLowerCase().includes(q));

    const matchDept = filterDept === 'all' || emp.departemen === filterDept;
    const matchStatus = filterStatus === 'all' || emp.status_kepegawaian === filterStatus;

    return matchQuery && matchDept && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Database Karyawan (Human Capital)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Kelola data identitas, kompetensi, administrasi BPJS, dan sertifikasi keahlian personil KSO LRS-TAL.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Karyawan Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari NIP, NIK, nama lengkap, atau jabatan..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>Filter:</span>
            </div>

            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Semua Departemen</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              {EMPLOYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="text-xs text-slate-400 font-medium ml-auto md:ml-2">
              Total: <strong className="text-amber-400">{filteredEmployees.length}</strong> Karyawan
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">Karyawan & NIP/NIK</th>
                <th className="py-3.5 px-4 font-bold">Divisi & Jabatan</th>
                <th className="py-3.5 px-4 font-bold">Kontak & Lokasi</th>
                <th className="py-3.5 px-4 font-bold">Sertifikasi Keahlian</th>
                <th className="py-3.5 px-4 text-center font-bold">Dokumen</th>
                <th className="py-3.5 px-4 font-bold">Status & Keuangan</th>
                <th className="py-3.5 px-4 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.employee_id} className="hover:bg-slate-800/40 transition">
                    {/* Name & NIP */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white leading-snug">{emp.nama}</div>
                      <div className="text-xs text-amber-400 font-mono mt-0.5">
                        NIP: {emp.nip} • NIK: {emp.nik}
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{emp.jabatan}</div>
                      <div className="text-xs text-slate-400">{emp.departemen}</div>
                    </td>

                    {/* Contact & Site */}
                    <td className="py-3 px-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{emp.no_hp || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{emp.lokasi_kerja || '-'}</span>
                      </div>
                    </td>

                    {/* Certifications */}
                    <td className="py-3 px-4 text-xs">
                      {emp.sertifikasi && emp.sertifikasi.length > 0 ? (
                        <div className="space-y-1.5 max-w-xs">
                          {emp.sertifikasi.map((c, i) => {
                            const expDate = c.tgl_expired || c.tgl_kadaluarsa;
                            const isExpired = expDate && new Date(expDate) < new Date();
                            return (
                              <div
                                key={c.id || i}
                                className="p-1.5 bg-slate-800/90 rounded-lg border border-slate-700/80 text-[11px]"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-semibold text-amber-300 truncate" title={c.nama}>
                                    {c.nama}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {c.drive_url && (
                                      <span title="Tersimpan di Google Drive" className="text-emerald-400">
                                        <HardDrive className="w-3 h-3" />
                                      </span>
                                    )}
                                    {(c.file || c.drive_url) && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setModalPreviewDoc({
                                              title: `Sertifikat: ${c.nama} - ${emp.nama}`,
                                              fileUrlOrBase64: c.file || c.drive_url || '',
                                              fileName: c.file_name || `${c.nama}.pdf`,
                                              driveUrl: c.drive_url,
                                              categoryLabel: 'Sertifikat Keahlian Karyawan'
                                            })
                                          }
                                          className="p-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 rounded cursor-pointer"
                                          title="Lihat Berkas Sertifikat"
                                        >
                                          <FileCheck className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            downloadDocument(
                                              c.file || c.drive_download_url || c.drive_url || '',
                                              c.file_name || `${c.nama}.pdf`
                                            )
                                          }
                                          className="p-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 rounded cursor-pointer"
                                          title="Unduh Dokumen Sertifikat"
                                        >
                                          <Download className="w-3 h-3" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 mt-0.5">
                                  {c.tgl_training && (
                                    <span>Tr: {formatShortDate(c.tgl_training)}</span>
                                  )}
                                  {expDate && (
                                    <span className={isExpired ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                                      Exp: {formatShortDate(expDate)} {isExpired ? '(Expired)' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">-</span>
                      )}
                    </td>

                    {/* Dokumen Pendukung */}
                    <td className="py-3 px-4 text-center">
                      {emp.documents && emp.documents.length > 0 ? (
                        <button
                          onClick={() => setViewDetailEmp(emp)}
                          className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-medium cursor-pointer"
                          title="Buka lampiran dokumen pendukung"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{emp.documents.length} Berkas</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>

                    {/* Status & Bank */}
                    <td className="py-3 px-4 text-xs">
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            emp.status_kepegawaian === 'Karyawan Tetap'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {emp.status_kepegawaian}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-1">
                        Bank: {emp.nama_bank || '-'} {emp.no_rekening ? `(${emp.no_rekening})` : ''}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewDetailEmp(emp)}
                          className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-slate-700 transition cursor-pointer"
                          title="Lihat Detail Profil & Dokumen Pendukung"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewEmployee(emp)}
                          className="p-1.5 bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-slate-700 transition cursor-pointer"
                          title="Cetak Kartu Profil Pegawai A4"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-slate-700 transition cursor-pointer"
                          title="Edit Data Karyawan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data karyawan ${emp.nama}?`)) {
                              onDeleteEmployee(emp.employee_id);
                            }
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-slate-700 transition cursor-pointer"
                          title="Hapus Karyawan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    Tidak ditemukan data karyawan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT KARYAWAN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingEmployee ? 'Edit Data Karyawan' : 'Formulir Karyawan Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Standar Pengisian Rekam Jejak Pegawai HC KSO LRS-TAL
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseAddModal}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 border-b border-slate-800 bg-slate-950/30 flex overflow-x-auto shrink-0 gap-1 pt-2">
              {[
                { id: 1, label: '1. Data Pribadi' },
                { id: 2, label: '2. Pekerjaan' },
                { id: 3, label: '3. Finansial & BPJS' },
                { id: 4, label: '4. Pendidikan & Sertifikasi' },
                { id: 5, label: '5. Dokumen Lampiran' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFormTab(tab.id)}
                  type="button"
                  className={`px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                    activeFormTab === tab.id
                      ? 'border-amber-400 text-amber-400 bg-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* TAB 1: DATA PRIBADI */}
              {activeFormTab === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    Informasi Identitas Personal
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nama Lengkap Beserta Gelar <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formNama}
                        onChange={(e) => setFormNama(e.target.value)}
                        placeholder="Contoh: Budi Santoso, S.T."
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={formTempatLahir}
                        onChange={(e) => setFormTempatLahir(e.target.value)}
                        placeholder="Kota Lahir"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={formTglLahir}
                        onChange={(e) => setFormTglLahir(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label>
                      <select
                        value={formJenisKelamin}
                        onChange={(e) => setFormJenisKelamin(e.target.value as 'Laki-laki' | 'Perempuan')}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Agama</label>
                      <select
                        value={formAgama}
                        onChange={(e) => setFormAgama(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen Protestan">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Khonghucu">Khonghucu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Status Pernikahan</label>
                      <select
                        value={formStatusNikah}
                        onChange={(e) => setFormStatusNikah(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Belum Menikah">Belum Menikah</option>
                        <option value="Menikah">Menikah</option>
                        <option value="Cerai">Cerai</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">No. HP / WhatsApp</label>
                      <input
                        type="text"
                        value={formHp}
                        onChange={(e) => setFormHp(e.target.value)}
                        placeholder="Contoh: 081298765432"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Karyawan</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="nama@kso-lrstal.co.id"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Kontak Darurat (Nama & No.HP)</label>
                      <input
                        type="text"
                        value={formKontakDarurat}
                        onChange={(e) => setFormKontakDarurat(e.target.value)}
                        placeholder="Istri: Siti - 081211112222"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Sesuai KTP</label>
                        <textarea
                          rows={2}
                          value={formAlamatKtp}
                          onChange={(e) => setFormAlamatKtp(e.target.value)}
                          placeholder="Alamat lengkap sesuai identitas KTP"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Domisili Sekarang / Mess</label>
                        <textarea
                          rows={2}
                          value={formAlamatDomisili}
                          onChange={(e) => setFormAlamatDomisili(e.target.value)}
                          placeholder="Alamat tempat tinggal aktif atau mess site"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PEKERJAAN */}
              {activeFormTab === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    Informasi Jabatan & Penempatan Proyek
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nomor Induk Pegawai (NIP) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formNip}
                        onChange={(e) => setFormNip(e.target.value)}
                        placeholder="Contoh: LRS-005"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        NIK KTP (16 Digit) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formNik}
                        onChange={(e) => setFormNik(e.target.value)}
                        placeholder="1604xxxxxxxxxxxx"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Jabatan / Posisi <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formJabatan}
                        onChange={(e) => setFormJabatan(e.target.value)}
                        placeholder="Contoh: Site Engineer / Safety Officer"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Divisi / Departemen <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={formDepartemen}
                        onChange={(e) => setFormDepartemen(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Mulai Bekerja</label>
                      <input
                        type="date"
                        value={formTglMulai}
                        onChange={(e) => setFormTglMulai(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Lokasi Kerja / Site</label>
                      <input
                        type="text"
                        value={formLokasiKerja}
                        onChange={(e) => setFormLokasiKerja(e.target.value)}
                        placeholder="Contoh: Site Lahat / Head Office Jakarta"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Status Kepegawaian</label>
                      <select
                        value={formStatusKepegawaian}
                        onChange={(e) => setFormStatusKepegawaian(e.target.value as EmploymentStatus)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        {EMPLOYMENT_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formStatusKepegawaian === 'Karyawan Kontrak (PKWT)' && (
                      <div>
                        <label className="block text-xs font-semibold text-amber-400 mb-1">
                          Tanggal Akhir Kontrak PKWT <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="date"
                          value={formAkhirKontrak}
                          onChange={(e) => setFormAkhirKontrak(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-slate-800 border border-amber-500/50 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ADMINISTRATIF & KEUANGAN */}
              {activeFormTab === 3 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    Data Finansial, Perpajakan &amp; Asuransi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Pokok Wajib Pajak (NPWP)</label>
                      <input
                        type="text"
                        value={formNpwp}
                        onChange={(e) => setFormNpwp(e.target.value)}
                        placeholder="01.234.567.8-901.000"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">No. BPJS Kesehatan</label>
                      <input
                        type="text"
                        value={formBpjsKes}
                        onChange={(e) => setFormBpjsKes(e.target.value)}
                        placeholder="000123456789"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">No. BPJS Ketenagakerjaan</label>
                      <input
                        type="text"
                        value={formBpjsTk}
                        onChange={(e) => setFormBpjsTk(e.target.value)}
                        placeholder="19012345678"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Bank Penggajian</label>
                      <input
                        type="text"
                        value={formNamaBank}
                        onChange={(e) => setFormNamaBank(e.target.value)}
                        placeholder="Contoh: Bank Mandiri / BCA"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Rekening Bank</label>
                      <input
                        type="text"
                        value={formNoRekening}
                        onChange={(e) => setFormNoRekening(e.target.value)}
                        placeholder="Contoh: 137000123456"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PENDIDIKAN & MULTI SERTIFIKASI */}
              {activeFormTab === 4 && (
                <div className="space-y-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    Riwayat Pendidikan &amp; Sertifikat Kompetensi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Pendidikan Terakhir</label>
                      <select
                        value={formPendidikan}
                        onChange={(e) => setFormPendidikan(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="SMA / SMK">SMA / SMK</option>
                        <option value="D3">D3</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Instansi / Universitas</label>
                      <input
                        type="text"
                        value={formInstansi}
                        onChange={(e) => setFormInstansi(e.target.value)}
                        placeholder="Contoh: Universitas Sriwijaya"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Jurusan / Program Studi</label>
                      <input
                        type="text"
                        value={formJurusan}
                        onChange={(e) => setFormJurusan(e.target.value)}
                        placeholder="Contoh: Teknik Pertambangan"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Multi Sertifikasi Dynamic List */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-amber-400" />
                          <span>Daftar Sertifikat Keahlian &amp; Sijil (Multi-Row)</span>
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          Lengkapi dengan Tanggal Training, Tanggal Expired, serta Upload Berkas Sertifikat (PDF/Foto)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCertRow}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Sertifikat</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formSertifikasi.map((cert, index) => (
                        <div
                          key={cert.id || index}
                          className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-2.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-400 font-mono">
                              Sertifikat #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCertRow(index)}
                              className="p-1 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 text-[11px]"
                              title="Hapus Sertifikat Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Baris</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Nama Sertifikasi / Lisensi <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={cert.nama}
                                onChange={(e) => handleUpdateCertRow(index, 'nama', e.target.value)}
                                placeholder="cth: POP Minerba / SIO Operator"
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Lembaga Penerbit
                              </label>
                              <input
                                type="text"
                                value={cert.penerbit || ''}
                                onChange={(e) => handleUpdateCertRow(index, 'penerbit', e.target.value)}
                                placeholder="cth: ESDM / BNSP / Kemenaker"
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Tanggal Training
                              </label>
                              <input
                                type="date"
                                value={cert.tgl_training || ''}
                                onChange={(e) => handleUpdateCertRow(index, 'tgl_training', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Tanggal Expired
                              </label>
                              <input
                                type="date"
                                value={cert.tgl_expired || cert.tgl_kadaluarsa || ''}
                                onChange={(e) => handleUpdateCertRow(index, 'tgl_expired', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          {/* Upload Berkas Sertifikat */}
                          <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-amber-400" />
                                <span>Upload Dokumen Sertifikat:</span>
                              </label>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleCertFileUpload(index, e)}
                                className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-slate-700 file:text-amber-400 hover:file:bg-slate-600 cursor-pointer"
                              />
                            </div>

                            {cert.file && (
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="max-w-[150px] truncate">{cert.file_name || 'Berkas Terunggah'}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModalPreviewDoc({
                                      title: `Sertifikat: ${cert.nama || 'Sertifikat'} - ${formNama || 'Karyawan'}`,
                                      fileUrlOrBase64: cert.file || cert.drive_download_url || cert.drive_url || '',
                                      fileName: cert.file_name || `${cert.nama || 'Sertifikat'}.pdf`,
                                      driveUrl: cert.drive_url,
                                      categoryLabel: 'Sertifikasi Keahlian'
                                    })
                                  }
                                  className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] rounded border border-amber-500/30 cursor-pointer"
                                >
                                  Lihat File
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formSertifikasi];
                                    updated[index] = { ...updated[index], file: '', file_name: '' };
                                    setFormSertifikasi(updated);
                                  }}
                                  className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                                >
                                  Hapus File
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DOKUMEN LAMPIRAN */}
              {activeFormTab === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>Upload Dokumen Digital &amp; Berkas Karyawan</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Upload berkas digital karyawan: KTP, KK, BPJS Kesehatan, BPJS Ketenagakerjaan, Ijazah, CV, Surat Lamaran, MCU, Pakta Integritas (Maksimal 10 Berkas).
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                      {formDocuments.length}/10 Berkas
                    </span>
                  </div>

                  {/* Multi-Files Upload Box & Link Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-700">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-200">
                        1. Upload File Digital (Foto / PDF)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        disabled={formDocuments.length >= 10}
                        onChange={handleDocumentUpload}
                        className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-amber-400 hover:file:bg-slate-600 cursor-pointer disabled:opacity-50"
                      />
                      <p className="text-[10px] text-slate-400 italic">
                        Mendukung PDF, PNG, JPG (Maksimal 10 berkas total).
                      </p>
                    </div>

                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-700/80 pt-3 md:pt-0 md:pl-3">
                      <label className="block text-xs font-semibold text-slate-200">
                        2. Atau Tambah Link Dokumen (Google Drive / Cloud URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={inputDocLink}
                          onChange={(e) => setInputDocLink(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          disabled={formDocuments.length >= 10}
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={handleAddDocLink}
                          disabled={!inputDocLink.trim() || formDocuments.length >= 10}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shrink-0"
                        >
                          + Tambah Link
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        Tempel tautan file Google Drive yang dapat diakses tim.
                      </p>
                    </div>
                  </div>

                  {/* DOKUMEN PENDUKUNG TERLAMPIR (X DARI MAKS 10 BERKAS) */}
                  <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                        DOKUMEN PENDUKUNG TERLAMPIR ({formDocuments.length} DARI MAKS 10 BERKAS)
                      </span>
                    </div>

                    {formDocuments.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                        {formDocuments.map((doc, i) => {
                          const isDocDrive = isGoogleDriveUrl(doc) || doc.startsWith('http');
                          const isDocPdf = isPdfDocument(doc);
                          const previewImg = getDocumentPreviewImage(doc);

                          return (
                            <div
                              key={i}
                              className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden flex flex-col justify-between p-2.5 space-y-2.5 relative group hover:border-slate-600 transition shadow-lg"
                            >
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(i)}
                                className="absolute top-3.5 right-3.5 z-10 w-6 h-6 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-md transition cursor-pointer"
                                title="Hapus berkas ini"
                              >
                                ×
                              </button>

                              {/* Thumbnail Container */}
                              <div
                                onClick={() =>
                                  setModalPreviewDoc({
                                    title: `Dokumen Lampiran ${i + 1} - ${formNama || 'Karyawan'}`,
                                    fileUrlOrBase64: doc,
                                    fileName: `Dokumen_${formNama || 'Karyawan'}_${i + 1}`,
                                    driveUrl: isDocDrive ? doc : undefined,
                                    categoryLabel: 'Dokumen Lampiran Karyawan'
                                  })
                                }
                                className="h-36 sm:h-40 w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition border border-slate-800"
                                title="Buka / Preview Berkas"
                              >
                                {previewImg ? (
                                  <img
                                    src={previewImg}
                                    alt={`Dokumen ${i + 1}`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : isDocPdf ? (
                                  <div className="flex flex-col items-center justify-center p-3 text-center h-full w-full">
                                    <span className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 mb-1.5 shadow-sm">
                                      <FileText className="w-7 h-7" />
                                    </span>
                                    <span className="text-[11px] font-bold text-rose-300">Dokumen PDF</span>
                                    <span className="text-[10px] text-slate-400 truncate max-w-full font-mono">Berkas #{i + 1}</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-3 text-center h-full w-full">
                                    <span className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-1.5 shadow-sm">
                                      <FileText className="w-7 h-7" />
                                    </span>
                                    <span className="text-[11px] font-bold text-amber-300">Dokumen Digital</span>
                                    <span className="text-[10px] text-slate-400 truncate max-w-full font-mono">Berkas #{i + 1}</span>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons: Unduh & Lihat */}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => downloadDocument(doc, `Dokumen_Karyawan_${formNama || 'EMP'}_${i + 1}`)}
                                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer shadow-sm"
                                  title="Unduh Berkas ke Komputer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Unduh</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setModalPreviewDoc({
                                      title: `Dokumen Lampiran ${i + 1} - ${formNama || 'Karyawan'}`,
                                      fileUrlOrBase64: doc,
                                      fileName: `Dokumen_${formNama || 'Karyawan'}_${i + 1}`,
                                      driveUrl: isDocDrive ? doc : undefined,
                                      categoryLabel: 'Dokumen Lampiran Karyawan'
                                    })
                                  }
                                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer shadow-sm"
                                  title="Buka / Preview Berkas"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Lihat</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl">
                        Belum ada dokumen digital yang diunggah. Silakan pilih berkas foto/PDF di atas untuk melampirkan berkas karyawan.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-500">
                  Langkah {activeFormTab} dari 5
                </div>

                <div className="flex items-center gap-2">
                  {activeFormTab > 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveFormTab((prev) => prev - 1)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                    >
                      Sebelumnya
                    </button>
                  )}

                  {activeFormTab < 5 ? (
                    <button
                      type="button"
                      onClick={() => setActiveFormTab((prev) => prev + 1)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                    >
                      Berikutnya →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      {editingEmployee ? 'Simpan Perubahan' : 'Simpan Data Karyawan'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL LIHAT DETAIL KARYAWAN & DOKUMEN PENDUKUNG */}
      {viewDetailEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Detail Data &amp; Berkas Karyawan: {viewDetailEmp.nama}
                  </h3>
                  <p className="text-xs font-mono text-amber-400">
                    NIP: {viewDetailEmp.nip} • NIK: {viewDetailEmp.nik}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewDetailEmp(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Pekerjaan &amp; Penempatan
                </span>
                <p className="font-bold text-white text-sm">{viewDetailEmp.jabatan}</p>
                <p className="text-slate-300">{viewDetailEmp.departemen}</p>
                <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> {viewDetailEmp.lokasi_kerja || 'Site Lahat'}
                </p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {viewDetailEmp.status_kepegawaian}
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Kontak &amp; Identitas
                </span>
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" /> {viewDetailEmp.no_hp || '-'}
                </p>
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" /> {viewDetailEmp.email || '-'}
                </p>
                <p className="text-slate-400 text-[11px]">
                  TTL: {viewDetailEmp.tempat_lahir || '-'}, {formatShortDate(viewDetailEmp.tanggal_lahir)}
                </p>
                <p className="text-slate-400 text-[11px] truncate">
                  Domisili: {viewDetailEmp.alamat_domisili || viewDetailEmp.alamat_ktp || '-'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Finansial &amp; Asuransi
                </span>
                <p className="text-slate-300">
                  Bank: <strong className="text-white">{viewDetailEmp.nama_bank || '-'}</strong>
                </p>
                <p className="text-slate-300 font-mono">Rek: {viewDetailEmp.no_rekening || '-'}</p>
                <p className="text-slate-400 text-[11px]">NPWP: {viewDetailEmp.npwp || '-'}</p>
                <p className="text-slate-400 text-[11px]">
                  BPJS: Kes ({viewDetailEmp.bpjs_kes || '-'}) / TK ({viewDetailEmp.bpjs_tk || '-'})
                </p>
              </div>
            </div>

            {/* Sertifikasi Karyawan */}
            {viewDetailEmp.sertifikasi && viewDetailEmp.sertifikasi.length > 0 && (
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block">
                  Sertifikasi &amp; Lisensi ({viewDetailEmp.sertifikasi.length} Sertifikat)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewDetailEmp.sertifikasi.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/80 flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-white">{c.nama}</p>
                        <p className="text-[11px] text-slate-400">Penerbit: {c.penerbit || '-'}</p>
                        <p className="text-[10px] text-slate-400">
                          Exp:{' '}
                          <span className="text-amber-300">
                            {c.tgl_expired || c.tgl_kadaluarsa
                              ? formatShortDate(c.tgl_expired || c.tgl_kadaluarsa)
                              : '-'}
                          </span>
                        </p>
                      </div>
                      {(c.file || c.drive_url) && (
                        <button
                          type="button"
                          onClick={() =>
                            downloadDocument(
                              c.file || c.drive_download_url || c.drive_url || '',
                              c.file_name || `${c.nama}.pdf`
                            )
                          }
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 cursor-pointer"
                          title="Unduh Sertifikat"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOKUMEN PENDUKUNG TERLAMPIR (X DARI MAKS 10 BERKAS) */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                  DOKUMEN PENDUKUNG TERLAMPIR ({viewDetailEmp.documents?.length || 0} DARI MAKS 10 BERKAS)
                </span>
              </div>

              {viewDetailEmp.documents && viewDetailEmp.documents.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {viewDetailEmp.documents.map((doc, i) => {
                    const isDocDrive = isGoogleDriveUrl(doc) || doc.startsWith('http');
                    const isDocPdf = isPdfDocument(doc);
                    const previewImg = getDocumentPreviewImage(doc);

                    return (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden flex flex-col justify-between p-2.5 space-y-2.5 hover:border-slate-600 transition shadow-lg"
                      >
                        {/* Thumbnail Container */}
                        <div
                          onClick={() =>
                            setModalPreviewDoc({
                              title: `Dokumen ${i + 1} - ${viewDetailEmp.nama}`,
                              fileUrlOrBase64: doc,
                              fileName: `Dokumen_${viewDetailEmp.nama}_${i + 1}`,
                              driveUrl: isDocDrive ? doc : undefined,
                              categoryLabel: 'Dokumen Lampiran Karyawan'
                            })
                          }
                          className="h-36 sm:h-40 w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition border border-slate-800"
                          title="Buka / Preview Berkas"
                        >
                          {previewImg ? (
                            <img
                              src={previewImg}
                              alt={`Dokumen ${i + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : isDocPdf ? (
                            <div className="flex flex-col items-center justify-center p-3 text-center h-full w-full">
                              <span className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 mb-1.5 shadow-sm">
                                <FileText className="w-7 h-7" />
                              </span>
                              <span className="text-[11px] font-bold text-rose-300">Dokumen PDF</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-full font-mono">Berkas #{i + 1}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-center h-full w-full">
                              <span className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-1.5 shadow-sm">
                                <FileText className="w-7 h-7" />
                              </span>
                              <span className="text-[11px] font-bold text-amber-300">Dokumen Digital</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-full font-mono">Berkas #{i + 1}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Unduh & Lihat */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => downloadDocument(doc, `Dokumen-${viewDetailEmp.nama}-${i + 1}`)}
                            className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer shadow-sm"
                            title="Unduh Berkas ke Komputer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setModalPreviewDoc({
                                title: `Dokumen ${i + 1} - ${viewDetailEmp.nama}`,
                                fileUrlOrBase64: doc,
                                fileName: `Dokumen_${viewDetailEmp.nama}_${i + 1}`,
                                driveUrl: isDocDrive ? doc : undefined,
                                categoryLabel: 'Dokumen Lampiran Karyawan'
                              })
                            }
                            className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer shadow-sm"
                            title="Buka / Preview Berkas"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl">
                  Belum ada dokumen pendukung (KTP, KK, BPJS, Ijazah, CV) yang dilampirkan.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const empToPrint = viewDetailEmp;
                    setViewDetailEmp(null);
                    onViewEmployee(empToPrint);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Kartu Profil A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const empToEdit = viewDetailEmp;
                    setViewDetailEmp(null);
                    handleOpenEdit(empToEdit);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Data Karyawan</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewDetailEmp(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global In-App Document Preview Modal */}
      {modalPreviewDoc && (
        <DocumentPreviewModal
          isOpen={!!modalPreviewDoc}
          onClose={() => setModalPreviewDoc(null)}
          title={modalPreviewDoc.title}
          fileUrlOrBase64={modalPreviewDoc.fileUrlOrBase64}
          fileName={modalPreviewDoc.fileName}
          driveUrl={modalPreviewDoc.driveUrl}
          categoryLabel={modalPreviewDoc.categoryLabel}
        />
      )}
    </div>
  );
};
