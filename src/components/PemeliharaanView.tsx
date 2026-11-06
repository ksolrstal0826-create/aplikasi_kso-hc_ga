import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Trash2,
  Printer,
  Calendar,
  X,
  CreditCard,
  Building,
  CheckCircle2,
  Boxes,
  Eye,
  Edit2,
  FileText,
  ExternalLink,
  Paperclip,
  Download,
  HardDrive
} from 'lucide-react';
import { AssetMaintenance, Asset } from '../types';
import { formatRupiah, formatShortDate, formatDateIndo } from '../utils/formatters';
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

interface PemeliharaanViewProps {
  maintenances: AssetMaintenance[];
  assets: Asset[];
  onSaveMaintenance: (m: AssetMaintenance) => void;
  onDeleteMaintenance: (id: string) => void;
  onPrintMaintenance: (m: AssetMaintenance) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

export const PemeliharaanView: React.FC<PemeliharaanViewProps> = ({
  maintenances,
  assets,
  onSaveMaintenance,
  onDeleteMaintenance,
  onPrintMaintenance,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // View Detail Modal State
  const [viewDetailMnt, setViewDetailMnt] = useState<AssetMaintenance | null>(null);
  const [modalPreviewDoc, setModalPreviewDoc] = useState<{
    title: string;
    fileUrlOrBase64: string;
    fileName?: string;
    driveUrl?: string;
    categoryLabel?: string;
  } | null>(null);

  // Edit State
  const [editingMnt, setEditingMnt] = useState<AssetMaintenance | null>(null);

  // Form states (Add / Edit)
  const [selectedAssetId, setSelectedAssetId] = useState<string | number>('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [cost, setCost] = useState<number | string>('');
  const [vendorName, setVendorName] = useState('');
  const [description, setDescription] = useState('');
  const [receiptPhotos, setReceiptPhotos] = useState<string[]>([]);

  const totalCost = maintenances.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);

  const handleOpenAdd = () => {
    setEditingMnt(null);
    setSelectedAssetId(assets[0]?.asset_id || '');
    setMaintenanceDate(new Date().toISOString().split('T')[0]);
    setCost('');
    setVendorName('');
    setDescription('');
    setReceiptPhotos([]);
    onOpenAddModal();
  };

  const handleOpenEdit = (m: AssetMaintenance) => {
    setEditingMnt(m);
    setSelectedAssetId(m.asset_id);
    setMaintenanceDate(m.maintenance_date);
    setCost(m.cost);
    setVendorName(m.vendor_name || '');
    setDescription(m.description);
    setReceiptPhotos(m.payment_receipt || []);
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
          setReceiptPhotos([base64Data]);

          // Upload to Google Drive if connected
          try {
            const token = await getAccessToken();
            if (token) {
              const driveRes = await uploadFileToDrive(
                token,
                base64Data,
                `Nota-${Date.now()}-${fileName}`,
                'KSO LRS-TAL - Nota Servis & Pemeliharaan'
              );
              if (driveRes.webViewLink) {
                setReceiptPhotos([driveRes.webViewLink]);
              }
            }
          } catch (err) {
            console.warn('Google Drive direct upload skipped/failed for nota:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !cost || !description.trim()) return;

    const payload: AssetMaintenance = {
      maintenance_id: editingMnt
        ? editingMnt.maintenance_id
        : `MNT-${new Date().getFullYear()}-${String(maintenances.length + 1).padStart(3, '0')}`,
      asset_id: selectedAssetId,
      maintenance_date: maintenanceDate,
      cost: Number(cost) || 0,
      description: description.trim(),
      vendor_name: vendorName.trim() || 'Internal Workshop',
      payment_receipt: receiptPhotos
    };

    onSaveMaintenance(payload);
    onCloseAddModal();
  };

  const filteredMaintenances = maintenances.filter((m) => {
    const ast = assets.find((a) => String(a.asset_id) === String(m.asset_id));
    const q = searchQuery.toLowerCase();
    return (
      m.maintenance_id.toLowerCase().includes(q) ||
      (ast && (ast.asset_name.toLowerCase().includes(q) || ast.asset_code.toLowerCase().includes(q))) ||
      (m.vendor_name && m.vendor_name.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Riwayat Servis &amp; Pemeliharaan Aset
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Pencatatan perbaikan berkala, penggantian oli, reparasi mekanikal, pelaporan biaya operasional alat, dan bukti nota pembayaran.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Log Servis</span>
        </button>
      </div>

      {/* Summary Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Akumulasi Biaya Servis</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{formatRupiah(totalCost)}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Frekuensi Servis Tercatat</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{maintenances.length} Pekerjaan</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID servis, nama aset, atau vendor..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="text-xs text-slate-400">
            Menampilkan: <strong className="text-amber-400">{filteredMaintenances.length}</strong> Catatan
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">ID Servis</th>
                <th className="py-3.5 px-4 font-bold">Aset / Unit</th>
                <th className="py-3.5 px-4 font-bold">Tanggal</th>
                <th className="py-3.5 px-4 font-bold">Vendor / Bengkel</th>
                <th className="py-3.5 px-4 font-bold text-right">Biaya (Rp)</th>
                <th className="py-3.5 px-4 font-bold">Uraian Perbaikan</th>
                <th className="py-3.5 px-4 text-center font-bold">Nota</th>
                <th className="py-3.5 px-4 text-center font-bold">Aksi Lengkap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMaintenances.length > 0 ? (
                filteredMaintenances.map((m) => {
                  const ast = assets.find((a) => String(a.asset_id) === String(m.asset_id));
                  const hasReceipt = m.payment_receipt && m.payment_receipt.length > 0;

                  return (
                    <tr key={m.maintenance_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-amber-400">
                        {m.maintenance_id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs sm:text-sm">{ast?.asset_name || '-'}</div>
                        <span className="font-mono text-[11px] text-slate-400">{ast?.asset_code}</span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300">
                        {formatShortDate(m.maintenance_date)}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-200">
                        {m.vendor_name || 'Internal Workshop'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400 text-xs">
                        {formatRupiah(m.cost)}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300 max-w-xs truncate" title={m.description}>
                        {m.description}
                      </td>

                      {/* Nota Status */}
                      <td className="py-3 px-4 text-center">
                        {hasReceipt ? (
                          <button
                            onClick={() => setViewDetailMnt(m)}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg font-medium cursor-pointer"
                            title="Lihat lampiran nota"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>Ada Nota</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions: Lihat Detail, Edit, Cetak Nota, Hapus */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewDetailMnt(m)}
                            className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Lihat Detail & Nota Pembayaran"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Edit Data Servis"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onPrintMaintenance(m)}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Cetak Berita Acara Servis A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus catatan servis ${m.maintenance_id}?`)) {
                                onDeleteMaintenance(m.maintenance_id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer"
                            title="Hapus"
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
                    Tidak ada catatan pemeliharaan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LIHAT DETAIL & NOTA SERVIS */}
      {viewDetailMnt && (() => {
        const ast = assets.find((a) => String(a.asset_id) === String(viewDetailMnt.asset_id));
        const receipt = viewDetailMnt.payment_receipt && viewDetailMnt.payment_receipt.length > 0 ? viewDetailMnt.payment_receipt[0] : null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Detail Riwayat Servis &amp; Nota Pembayaran
                    </h3>
                    <p className="text-xs font-mono text-amber-400">ID: {viewDetailMnt.maintenance_id}</p>
                  </div>
                </div>
                <button onClick={() => setViewDetailMnt(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cost Banner */}
              <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Biaya Perbaikan</span>
                  <span className="text-2xl font-black text-amber-400">
                    {formatRupiah(viewDetailMnt.cost)}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Tanggal Pekerjaan</span>
                  <span className="font-bold text-white">{formatDateIndo(viewDetailMnt.maintenance_date)}</span>
                </div>
              </div>

              {/* Asset & Vendor Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block">
                    Unit Aset Yang Diperbaiki
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
                      <p className="text-slate-400">Merek / Model:</p>
                      <p className="text-slate-200">{ast?.brand || '-'} {ast?.model_number || ''}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider block">
                    Pelaksana / Vendor Rekanan
                  </span>
                  <div>
                    <p className="text-slate-400">Bengkel / Vendor:</p>
                    <p className="text-white font-bold text-sm">{viewDetailMnt.vendor_name || 'Internal Workshop'}</p>
                  </div>
                  <div className="pt-1 border-t border-slate-700/60">
                    <p className="text-slate-400">Kategori Pekerjaan:</p>
                    <p className="text-slate-200">Maintenance &amp; Mechanical Repair</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Uraian Lengkap Pekerjaan / Komponen Yang Diganti
                </span>
                <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                  {viewDetailMnt.description}
                </p>
              </div>

              {/* Uploaded Receipt / Nota */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider block">
                  Lampiran Nota Pembayaran / Bukti Kasbon
                </span>
                {receipt ? (
                  <div className="space-y-3">
                    {(() => {
                      const notaPreviewImg = getDocumentPreviewImage(receipt);
                      return (
                        <div
                          onClick={() =>
                            setModalPreviewDoc({
                              title: `Nota Servis: ${ast?.asset_name || 'Aset'} (${formatShortDate(viewDetailMnt.maintenance_date)})`,
                              fileUrlOrBase64: receipt,
                              fileName: `Nota-${viewDetailMnt.maintenance_id}.pdf`,
                              driveUrl: isGoogleDriveUrl(receipt) ? receipt : undefined,
                              categoryLabel: 'Nota Servis & Pemeliharaan'
                            })
                          }
                          className="max-h-80 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center p-2 cursor-pointer hover:border-slate-600 transition"
                          title="Buka / Preview Berkas"
                        >
                          {notaPreviewImg ? (
                            <img src={notaPreviewImg} alt="Nota Pembayaran" className="max-h-72 object-contain rounded-lg shadow-lg" />
                          ) : isPdfDocument(receipt) ? (
                            <div className="p-8 text-center text-xs space-y-3">
                              <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm">Dokumen Nota Format PDF</p>
                                <p className="text-slate-400 text-xs mt-0.5">Klik untuk pratinjau layar penuh &amp; unduh berkas</p>
                              </div>
                            </div>
                          ) : isGoogleDriveUrl(receipt) ? (
                            <div className="w-full h-72 rounded-lg overflow-hidden bg-slate-950">
                              <iframe src={getDrivePreviewEmbedUrl(receipt)} title="Nota Drive" className="w-full h-full rounded-lg border-0" allow="autoplay" />
                            </div>
                          ) : (
                            <div className="p-6 text-center text-xs space-y-2">
                              <FileText className="w-10 h-10 text-amber-400 mx-auto" />
                              <p className="text-slate-300 font-semibold">Berkas Nota Terlampir</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <span>Bukti transaksi resmi invoice / kuitansi bengkel</span>
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
                          onClick={() => downloadDocument(receipt, `Nota-${viewDetailMnt.maintenance_id}.pdf`)}
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
                              title: `Nota Servis: ${ast?.asset_name || 'Aset'} (${formatShortDate(viewDetailMnt.maintenance_date)})`,
                              fileUrlOrBase64: receipt,
                              fileName: `Nota-${viewDetailMnt.maintenance_id}.pdf`,
                              driveUrl: isGoogleDriveUrl(receipt) ? receipt : undefined,
                              categoryLabel: 'Nota Servis & Pemeliharaan'
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
                    Belum ada lampiran nota atau invoice yang diunggah. Anda dapat mengunggahnya melalui tombol Edit.
                  </div>
                )}
              </div>

              {/* Action buttons in View Modal */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setViewDetailMnt(null);
                    handleOpenEdit(viewDetailMnt);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Data Servis</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onPrintMaintenance(viewDetailMnt);
                      setViewDetailMnt(null);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Nota A4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDetailMnt(null)}
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

      {/* MODAL FORM TAMBAH / EDIT LOG SERVIS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingMnt ? 'Edit Log Servis & Nota' : 'Catat Servis / Perbaikan Aset'}
                </h3>
              </div>
              <button onClick={onCloseAddModal} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Aset Yang Diperbaiki <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {assets.map((a) => (
                    <option key={a.asset_id} value={a.asset_id}>
                      {a.asset_code} - {a.asset_name} ({a.brand} {a.model_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Servis <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={maintenanceDate}
                    onChange={(e) => setMaintenanceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Total Biaya (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Contoh: 5000000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bengkel / Vendor Rekanan
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Contoh: PT United Tractors Tbk / Workshop Internal"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detail Pekerjaan / Spare Part Yang Diganti <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ganti oli berkala, perbaikan sistem hidrolik, ganti filter..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Upload receipt */}
              <div className="space-y-1.5 p-3 bg-slate-800/40 rounded-xl border border-slate-700">
                <label className="block text-xs font-semibold text-slate-200">
                  Upload Dokumen Nota / Faktur Pembayaran Servis
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-amber-400 hover:file:bg-slate-600 cursor-pointer"
                />
                {receiptPhotos.length > 0 && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Berkas nota terlampir
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
                  {editingMnt ? 'Simpan Perubahan' : 'Simpan Log Servis'}
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
