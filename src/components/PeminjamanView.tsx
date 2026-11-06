import React, { useState } from 'react';
import {
  Handshake,
  Search,
  Plus,
  Filter,
  Printer,
  RotateCcw,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Boxes,
  X,
  FileCheck,
  Eye,
  Edit2,
  Upload,
  FileText,
  ExternalLink,
  ShieldCheck,
  Paperclip,
  Download,
  HardDrive
} from 'lucide-react';
import { AssetAssignment, Asset, Employee } from '../types';
import { formatShortDate, formatDateIndo } from '../utils/formatters';
import { getAccessToken, uploadFileToDrive } from '../utils/googleWorkspace';
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
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface PeminjamanViewProps {
  assignments: AssetAssignment[];
  assets: Asset[];
  employees: Employee[];
  onSaveAssignment: (assignment: AssetAssignment) => void;
  onReturnAssignment: (assignmentId: string, returnedDate: string, notes?: string) => void;
  onDeleteAssignment: (id: string) => void;
  onPrintReceipt: (assignment: AssetAssignment) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

export const PeminjamanView: React.FC<PeminjamanViewProps> = ({
  assignments,
  assets,
  employees,
  onSaveAssignment,
  onReturnAssignment,
  onDeleteAssignment,
  onPrintReceipt,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'returned'>('all');

  // View Detail Modal State
  const [viewDetailAsg, setViewDetailAsg] = useState<AssetAssignment | null>(null);
  const [modalPreviewDoc, setModalPreviewDoc] = useState<{
    title: string;
    fileUrlOrBase64: string;
    fileName?: string;
    driveUrl?: string;
    categoryLabel?: string;
  } | null>(null);

  // Edit Modal State
  const [editingAsg, setEditingAsg] = useState<AssetAssignment | null>(null);

  // Form states (Add / Edit)
  const [selectedAssetId, setSelectedAssetId] = useState<string | number>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [assignedDate, setAssignedDate] = useState('');
  const [returnedDate, setReturnedDate] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [receiptFiles, setReceiptFiles] = useState<string[]>([]);

  // Return modal states
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnTargetId, setReturnTargetId] = useState('');
  const [returnDateInput, setReturnDateInput] = useState('');
  const [returnNotesInput, setReturnNotesInput] = useState('');

  const handleOpenAdd = () => {
    setEditingAsg(null);
    const loanedAssetIds = assignments.filter((a) => !a.returned_date).map((a) => String(a.asset_id));
    const available = assets.find((a) => !loanedAssetIds.includes(String(a.asset_id)));
    setSelectedAssetId(available ? available.asset_id : assets[0]?.asset_id || '');
    setSelectedEmployeeId(employees[0]?.employee_id || '');
    setAssignedDate(new Date().toISOString().split('T')[0]);
    setReturnedDate('');
    setConditionNotes('Barang dalam keadaan baik, lengkap, dan berfungsi normal saat serah terima.');
    setReceiptFiles([]);
    onOpenAddModal();
  };

  const handleOpenEdit = (asg: AssetAssignment) => {
    setEditingAsg(asg);
    setSelectedAssetId(asg.asset_id);
    setSelectedEmployeeId(asg.employee_id);
    setAssignedDate(asg.assigned_date);
    setReturnedDate(asg.returned_date || '');
    setConditionNotes(asg.condition_notes || '');
    setReceiptFiles(asg.signed_receipt || []);
    onOpenAddModal();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const base64Data = ev.target.result as string;
          setReceiptFiles([base64Data]);

          // Upload to Google Drive if connected
          try {
            const token = await getAccessToken();
            if (token) {
              const driveRes = await uploadFileToDrive(
                token,
                base64Data,
                `BAST-${Date.now()}-${fileName}`,
                'KSO LRS-TAL - BAST Penyerahan Aset'
              );
              if (driveRes.webViewLink) {
                setReceiptFiles([driveRes.webViewLink]);
              }
            }
          } catch (err) {
            console.warn('Google Drive direct upload skipped/failed for BAST:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedEmployeeId) return;

    const payload: AssetAssignment = {
      assignment_id: editingAsg
        ? editingAsg.assignment_id
        : `ASG-${new Date().getFullYear()}-${String(assignments.length + 1).padStart(3, '0')}`,
      asset_id: selectedAssetId,
      employee_id: selectedEmployeeId,
      assigned_date: assignedDate,
      returned_date: returnedDate.trim() || undefined,
      condition_notes: conditionNotes.trim(),
      signed_receipt: receiptFiles
    };

    onSaveAssignment(payload);
    onCloseAddModal();
  };

  const handleOpenReturn = (asg: AssetAssignment) => {
    setReturnTargetId(asg.assignment_id);
    setReturnDateInput(new Date().toISOString().split('T')[0]);
    setReturnNotesInput('Dikembalikan dalam kondisi baik dan lengkap.');
    setIsReturnModalOpen(true);
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTargetId) return;
    onReturnAssignment(returnTargetId, returnDateInput, returnNotesInput);
    setIsReturnModalOpen(false);
  };

  // Filter list
  const filteredAssignments = assignments.filter((asg) => {
    const ast = assets.find((a) => String(a.asset_id) === String(asg.asset_id));
    const emp = employees.find((e) => String(e.employee_id) === String(asg.employee_id));

    const q = searchQuery.toLowerCase();
    const matchQuery =
      asg.assignment_id.toLowerCase().includes(q) ||
      (ast && (ast.asset_name.toLowerCase().includes(q) || ast.asset_code.toLowerCase().includes(q))) ||
      (emp && (emp.nama.toLowerCase().includes(q) || emp.nip.toLowerCase().includes(q)));

    if (!matchQuery) return false;

    if (filterTab === 'active') return !asg.returned_date;
    if (filterTab === 'returned') return !!asg.returned_date;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Penyerahan &amp; Peminjaman Aset
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Kelola distribusi aset operasional ke penanggung jawab, penerbitan Berita Acara (BAST), log pengembalian, dan lampiran tanda terima fisik.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Penyerahan Aset</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor BAST, nama aset, atau nama karyawan..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({assignments.length})
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'active' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dipinjam ({assignments.filter((a) => !a.returned_date).length})
              </button>
              <button
                onClick={() => setFilterTab('returned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterTab === 'returned' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Selesai ({assignments.filter((a) => !!a.returned_date).length})
              </button>
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
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">ID Transaksi / BAST</th>
                <th className="py-3.5 px-4 font-bold">Barang / Aset</th>
                <th className="py-3.5 px-4 font-bold">Penanggung Jawab</th>
                <th className="py-3.5 px-4 font-bold">Tgl Penyerahan</th>
                <th className="py-3.5 px-4 font-bold">Tgl Kembali</th>
                <th className="py-3.5 px-4 text-center font-bold">Lampiran</th>
                <th className="py-3.5 px-4 text-center font-bold">Aksi Lengkap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((asg) => {
                  const ast = assets.find((a) => String(a.asset_id) === String(asg.asset_id));
                  const emp = employees.find((e) => String(e.employee_id) === String(asg.employee_id));
                  const isReturned = !!asg.returned_date;
                  const hasReceipt = asg.signed_receipt && asg.signed_receipt.length > 0;

                  return (
                    <tr key={asg.assignment_id} className="hover:bg-slate-800/40 transition">
                      {/* Status */}
                      <td className="py-3 px-4">
                        {!isReturned ? (
                          <button
                            onClick={() => handleOpenReturn(asg)}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Klik untuk proses pengembalian aset"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Kembalikan</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Selesai</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs font-bold text-amber-400">
                        {asg.assignment_id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs sm:text-sm">{ast?.asset_name || '-'}</div>
                        <span className="font-mono text-[11px] text-slate-400">{ast?.asset_code}</span>
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <div className="font-semibold text-slate-200">{emp?.nama || '-'}</div>
                        <div className="text-slate-400">{emp?.jabatan}</div>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300">
                        {formatShortDate(asg.assigned_date)}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        {asg.returned_date ? (
                          <span className="text-emerald-400 font-medium">
                            {formatShortDate(asg.returned_date)}
                          </span>
                        ) : (
                          <span className="text-amber-400 text-xs italic">Masih digunakan</span>
                        )}
                      </td>

                      {/* Lampiran Indicator */}
                      <td className="py-3 px-4 text-center">
                        {hasReceipt ? (
                          <button
                            onClick={() => setViewDetailAsg(asg)}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-medium cursor-pointer"
                            title="Lihat lampiran tanda terima"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>Ada Berkas</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions: Lihat Detail, Edit, Cetak BAST, Hapus */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewDetailAsg(asg)}
                            className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Lihat Detail & Lampiran Nota"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(asg)}
                            className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Edit Data Penyerahan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onPrintReceipt(asg)}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Cetak Berita Acara (BAST) Resmi A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus catatan transaksi ${asg.assignment_id}?`)) {
                                onDeleteAssignment(asg.assignment_id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                    Tidak ada catatan penyerahan aset yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LIHAT DETAIL & LAMPIRAN PENYERAHAN ASET */}
      {viewDetailAsg && (() => {
        const ast = assets.find((a) => String(a.asset_id) === String(viewDetailAsg.asset_id));
        const emp = employees.find((e) => String(e.employee_id) === String(viewDetailAsg.employee_id));
        const isReturned = !!viewDetailAsg.returned_date;
        const receipt = viewDetailAsg.signed_receipt && viewDetailAsg.signed_receipt.length > 0 ? viewDetailAsg.signed_receipt[0] : null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Detail Penyerahan Aset &amp; Lampiran BAST
                    </h3>
                    <p className="text-xs font-mono text-amber-400">Ref: {viewDetailAsg.assignment_id}</p>
                  </div>
                </div>
                <button onClick={() => setViewDetailAsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-xl border border-slate-700">
                <div>
                  <span className="text-[11px] text-slate-400 block">Status Peminjaman</span>
                  <span className={`text-xs font-bold ${isReturned ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isReturned ? 'Selesai Dikembalikan' : 'Aktif Digunakan Karyawan'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Tanggal Serah Terima</span>
                  <span className="text-xs font-semibold text-white">{formatDateIndo(viewDetailAsg.assigned_date)}</span>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Asset details */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block">
                    Informasi Barang / Unit Aset
                  </span>
                  <div>
                    <p className="text-slate-400">Nama Aset:</p>
                    <p className="text-white font-bold text-sm">{ast?.asset_name || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/60">
                    <div>
                      <p className="text-slate-400">Kode Aset:</p>
                      <p className="font-mono text-amber-400">{ast?.asset_code || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Merek / Seri:</p>
                      <p className="text-slate-200">{ast?.brand || '-'} {ast?.model_number || ''}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Serial Number (S/N):</p>
                      <p className="font-mono text-slate-200">{ast?.serial_number || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Employee details */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider block">
                    Penanggung Jawab / Penerima
                  </span>
                  <div>
                    <p className="text-slate-400">Nama Karyawan:</p>
                    <p className="text-white font-bold text-sm">{emp?.nama || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/60">
                    <div>
                      <p className="text-slate-400">NIP:</p>
                      <p className="font-mono text-slate-200">{emp?.nip || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Departemen:</p>
                      <p className="text-slate-200">{emp?.departemen || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Jabatan &amp; Kontak:</p>
                      <p className="text-slate-200">{emp?.jabatan || '-'} ({emp?.no_hp || '-'})</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Condition Notes */}
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Catatan Kondisi Fisik &amp; Kelengkapan
                </span>
                <p className="text-slate-200 italic">{viewDetailAsg.condition_notes || 'Tidak ada catatan khusus.'}</p>
              </div>

              {/* Uploaded Signed Receipt / Nota Lampiran */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider block">
                  Lampiran Berkas Tanda Terima / Nota Fisik
                </span>
                {receipt ? (
                  <div className="space-y-3">
                    {(() => {
                      const bastPreviewImg = getDocumentPreviewImage(receipt);
                      return (
                        <div
                          onClick={() =>
                            setModalPreviewDoc({
                              title: `Lampiran BAST: ${ast?.asset_name || 'Aset'} - ${emp?.nama || 'Karyawan'}`,
                              fileUrlOrBase64: receipt,
                              fileName: `BAST-${viewDetailAsg.assignment_id}.pdf`,
                              driveUrl: isGoogleDriveUrl(receipt) ? receipt : undefined,
                              categoryLabel: 'Tanda Terima Serah Terima Aset (BAST)'
                            })
                          }
                          className="max-h-80 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center p-2 cursor-pointer hover:border-slate-600 transition"
                          title="Buka / Preview Berkas"
                        >
                          {bastPreviewImg ? (
                            <img src={bastPreviewImg} alt="Nota Tanda Terima" className="max-h-72 object-contain rounded-lg shadow-lg" />
                          ) : isPdfDocument(receipt) ? (
                            <div className="p-8 text-center text-xs space-y-3">
                              <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm">Dokumen BAST Format PDF</p>
                                <p className="text-slate-400 text-xs mt-0.5">Klik untuk pratinjau layar penuh &amp; unduh berkas</p>
                              </div>
                            </div>
                          ) : isGoogleDriveUrl(receipt) ? (
                            <div className="w-full h-72 rounded-lg overflow-hidden bg-slate-950">
                              <iframe src={getDrivePreviewEmbedUrl(receipt)} title="BAST Drive" className="w-full h-full rounded-lg border-0" allow="autoplay" />
                            </div>
                          ) : (
                            <div className="p-6 text-center text-xs space-y-2">
                              <FileText className="w-10 h-10 text-amber-400 mx-auto" />
                              <p className="text-slate-300 font-semibold">Berkas Dokumen Terlampir</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <span>Dokumen fisik resmi serah terima barang</span>
                        {isGoogleDriveUrl(receipt) && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <HardDrive className="w-2.5 h-2.5" />
                            <span>Google Drive</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => downloadDocument(receipt, `BAST-${viewDetailAsg.assignment_id}.pdf`)}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700 shadow-sm"
                          title="Unduh Berkas ke Komputer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalPreviewDoc({
                              title: `Lampiran BAST: ${ast?.asset_name || 'Aset'} - ${emp?.nama || 'Karyawan'}`,
                              fileUrlOrBase64: receipt,
                              fileName: `BAST-${viewDetailAsg.assignment_id}.pdf`,
                              driveUrl: isGoogleDriveUrl(receipt) ? receipt : undefined,
                              categoryLabel: 'Tanda Terima Serah Terima Aset (BAST)'
                            })
                          }
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-blue-400 hover:text-blue-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700 shadow-sm"
                          title="Buka / Preview Berkas"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-700 rounded-xl">
                    Belum ada lampiran tanda terima fisik yang diunggah. Anda dapat mengunggahnya melalui tombol Edit.
                  </div>
                )}
              </div>

              {/* Action buttons in View Modal */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setViewDetailAsg(null);
                    handleOpenEdit(viewDetailAsg);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Data Penyerahan</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onPrintReceipt(viewDetailAsg);
                      setViewDetailAsg(null);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak BAST A4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDetailAsg(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL FORM TAMBAH / EDIT PENYERAHAN ASET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Handshake className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingAsg ? 'Edit Data Penyerahan Aset' : 'Pencatatan Penyerahan Aset (BAST)'}
                </h3>
              </div>
              <button onClick={onCloseAddModal} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Aset Yang Diserahkan <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {assets.map((a) => {
                    const isLoaned = assignments.some(
                      (asg) => String(asg.asset_id) === String(a.asset_id) && !asg.returned_date && (!editingAsg || asg.assignment_id !== editingAsg.assignment_id)
                    );
                    return (
                      <option key={a.asset_id} value={a.asset_id}>
                        {a.asset_code} - {a.asset_name} ({a.brand} {a.model_number}) {isLoaned ? '[SEDANG DIPINJAM]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Karyawan Penerima / Penanggung Jawab <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {employees.map((e) => (
                    <option key={e.employee_id} value={e.employee_id}>
                      {e.nama} ({e.nip}) - {e.jabatan} [{e.departemen}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Serah Terima <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Pengembalian (Opsional)
                  </label>
                  <input
                    type="date"
                    value={returnedDate}
                    onChange={(e) => setReturnedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keterangan Fisik / Kelengkapan Saat Diserahkan
                </label>
                <textarea
                  rows={2}
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder="Kondisi kelengkapan surat, charger, APAR, kunci cadangan, dll."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Upload signed receipt attachment */}
              <div className="space-y-1.5 p-3 bg-slate-800/40 rounded-xl border border-slate-700">
                <label className="block text-xs font-semibold text-slate-200">
                  Upload Dokumen Tanda Terima Fisik / Foto BAST Tertanda-tangan
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-amber-400 hover:file:bg-slate-600 cursor-pointer"
                />
                {receiptFiles.length > 0 && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Berkas tanda terima terlampir
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  {editingAsg ? 'Simpan Perubahan' : 'Terbitkan Penyerahan & Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROSES PENGEMBALIAN */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Konfirmasi Pengembalian Aset</h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tanggal Pengembalian Fisik <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={returnDateInput}
                  onChange={(e) => setReturnDateInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Kondisi Fisik Saat Dikembalikan
                </label>
                <textarea
                  rows={2}
                  value={returnNotesInput}
                  onChange={(e) => setReturnNotesInput(e.target.value)}
                  placeholder="Unit diperiksa dalam keadaan bersih, utuh, dan disimpan di gudang site."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Konfirmasi Selesai
                </button>
              </div>
            </form>
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
