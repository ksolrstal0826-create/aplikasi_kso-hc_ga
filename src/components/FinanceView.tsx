import React, { useState } from 'react';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CreditCard,
  Building2,
  CheckCircle2,
  Calendar,
  Paperclip,
  X,
  FileText,
  ExternalLink,
  ShieldAlert,
  Wallet,
  TrendingDown,
  TrendingUp,
  Landmark,
  Copy,
  Check,
  Download,
  HardDrive
} from 'lucide-react';
import {
  BankAccount,
  FinanceTransaction,
  FinanceTransactionType,
  UserRole
} from '../types';
import { formatRupiah, formatShortDate, formatDateIndo } from '../utils/formatters';
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

interface FinanceViewProps {
  bankAccounts: BankAccount[];
  transactions: FinanceTransaction[];
  currentUserRole: UserRole;
  onSaveTransaction: (tx: FinanceTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onSaveBankAccount?: (account: BankAccount) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: (type?: FinanceTransactionType) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  bankAccounts,
  transactions,
  currentUserRole,
  onSaveTransaction,
  onDeleteTransaction,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal
}) => {
  const isSuperAdmin = currentUserRole === 'Super Admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MASUK' | 'KELUAR'>('ALL');
  const [filterAccount, setFilterAccount] = useState<string>('ALL');

  // Detail Modal State
  const [viewDetailTx, setViewDetailTx] = useState<FinanceTransaction | null>(null);
  const [modalPreviewDoc, setModalPreviewDoc] = useState<{
    title: string;
    fileUrlOrBase64: string;
    fileName?: string;
    driveUrl?: string;
    categoryLabel?: string;
  } | null>(null);

  // Edit State
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);

  // Form States
  const [formType, setFormType] = useState<FinanceTransactionType>('KELUAR');
  const [formAccountId, setFormAccountId] = useState<string>(bankAccounts[0]?.account_id || '');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formPartyName, setFormPartyName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formAmount, setFormAmount] = useState<number | string>('');
  const [formAdminFee, setFormAdminFee] = useState<number | string>('0');
  const [formDocuments, setFormDocuments] = useState<string[]>([]);

  // Copied state for account numbers
  const [copiedAcc, setCopiedAcc] = useState<string | null>(null);

  const copyToClipboard = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAcc(accNum);
    setTimeout(() => setCopiedAcc(null), 2000);
  };

  // Calculate real-time balance for each account
  const calculateAccountBalance = (accountId: string) => {
    const acc = bankAccounts.find((b) => b.account_id === accountId);
    if (!acc) return 0;
    let balance = acc.initial_balance;
    transactions.forEach((tx) => {
      if (tx.account_id === accountId) {
        if (tx.type === 'MASUK') {
          balance += tx.amount - (tx.admin_fee || 0);
        } else {
          balance -= tx.amount + (tx.admin_fee || 0);
        }
      }
    });
    return balance;
  };

  // Grand total balance across all 3 accounts
  const grandTotalBalance = bankAccounts.reduce((acc, b) => acc + calculateAccountBalance(b.account_id), 0);

  // Open modal for NEW transaction
  const handleOpenAdd = (type: FinanceTransactionType = 'KELUAR') => {
    setEditingTx(null);
    setFormType(type);
    setFormAccountId(bankAccounts[0]?.account_id || '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPartyName('');
    setFormDescription('');
    setFormAmount('');
    setFormAdminFee(0);
    setFormDocuments([]);
    onOpenAddModal(type);
  };

  // Open modal for EDIT
  const handleOpenEdit = (tx: FinanceTransaction) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormAccountId(tx.account_id);
    setFormDate(tx.date);
    setFormPartyName(tx.party_name);
    setFormDescription(tx.description);
    setFormAmount(tx.amount);
    setFormAdminFee(tx.admin_fee || 0);
    setFormDocuments(tx.documents || []);
    onOpenAddModal(tx.type);
  };

  // Multi-documents upload (up to 10)
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formDocuments.length + files.length > 10) {
      alert('Maksimal 10 dokumen pendukung per transaksi.');
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
                `Finance-${Date.now()}-${fileName}`,
                'KSO LRS-TAL - Dokumen Transaksi Finance'
              );
            }
          } catch (err) {
            console.warn('Google Drive direct upload skipped/failed for finance doc:', err);
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
    if (!formAccountId || !formPartyName.trim() || !formAmount || !formDescription.trim()) return;

    const numAmount = Number(formAmount) || 0;
    const numAdmin = Number(formAdminFee) || 0;
    const totalImpact = formType === 'MASUK' ? numAmount - numAdmin : numAmount + numAdmin;

    const payload: FinanceTransaction = {
      transaction_id: editingTx
        ? editingTx.transaction_id
        : `TRX-${formType === 'MASUK' ? 'IN' : 'OUT'}-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`,
      type: formType,
      date: formDate,
      account_id: formAccountId,
      party_name: formPartyName.trim(),
      description: formDescription.trim(),
      amount: numAmount,
      admin_fee: numAdmin,
      total_amount: totalImpact,
      documents: formDocuments,
      created_by: currentUserRole,
      created_at: editingTx?.created_at || new Date().toISOString()
    };

    onSaveTransaction(payload);
    onCloseAddModal();
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    const acc = bankAccounts.find((b) => b.account_id === tx.account_id);
    const matchQuery =
      tx.transaction_id.toLowerCase().includes(q) ||
      tx.party_name.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      (acc && acc.bank_name.toLowerCase().includes(q));

    const matchType = filterType === 'ALL' || tx.type === filterType;
    const matchAccount = filterAccount === 'ALL' || tx.account_id === filterAccount;

    return matchQuery && matchType && matchAccount;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Manajemen Keuangan &amp; Kas Perusahaan
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Divisi Finance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitoring saldo 3 rekening bank operasional, pencatatan transaksi dana masuk &amp; keluar, biaya admin bank, dan arsip dokumen pendukung.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenAdd('MASUK')}
            className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
            <span>+ Dana Masuk</span>
          </button>
          <button
            onClick={() => handleOpenAdd('KELUAR')}
            className="px-3.5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>+ Dana Keluar</span>
          </button>
        </div>
      </div>

      {/* INFORMASI 3 REKENING & SALDO REAL-TIME */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rekening Bank &amp; Saldo Kas Resmi (3 Rekening)
            </h3>
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Total Kas Seluruh Rekening:{' '}
            <strong className="text-emerald-400 font-black text-sm">{formatRupiah(grandTotalBalance)}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankAccounts.map((acc) => {
            const currentBal = calculateAccountBalance(acc.account_id);
            const inTotal = transactions
              .filter((t) => t.account_id === acc.account_id && t.type === 'MASUK')
              .reduce((s, t) => s + t.amount, 0);
            const outTotal = transactions
              .filter((t) => t.account_id === acc.account_id && t.type === 'KELUAR')
              .reduce((s, t) => s + t.amount, 0);

            const isAmber = acc.color === 'amber';
            const isBlue = acc.color === 'blue';

            return (
              <div
                key={acc.account_id}
                className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isAmber
                    ? 'bg-gradient-to-br from-slate-900 to-amber-950/30 border-amber-500/30 shadow-amber-950/20'
                    : isBlue
                    ? 'bg-gradient-to-br from-slate-900 to-blue-950/30 border-blue-500/30 shadow-blue-950/20'
                    : 'bg-gradient-to-br from-slate-900 to-emerald-950/30 border-emerald-500/30 shadow-emerald-950/20'
                } shadow-xl`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isAmber ? 'bg-amber-500/20 text-amber-400' : isBlue ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {acc.bank_name}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">{acc.account_holder}</h4>
                    </div>
                    <CreditCard className={`w-5 h-5 ${isAmber ? 'text-amber-400' : isBlue ? 'text-blue-400' : 'text-emerald-400'}`} />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-xs text-slate-300 tracking-wider font-semibold">
                      {acc.account_number}
                    </span>
                    <button
                      onClick={() => copyToClipboard(acc.account_number)}
                      className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Salin Nomor Rekening"
                    >
                      {copiedAcc === acc.account_number ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Saldo Kas Saat Ini:</span>
                    <h3 className="text-2xl font-black text-white tracking-tight mt-0.5">
                      {formatRupiah(currentBal)}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Masuk: {formatRupiah(inTotal)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-rose-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Keluar: {formatRupiah(outTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, penerima/pengirim, ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Type filter */}
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({transactions.length})
              </button>
              <button
                onClick={() => setFilterType('MASUK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === 'MASUK' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk ({transactions.filter((t) => t.type === 'MASUK').length})
              </button>
              <button
                onClick={() => setFilterType('KELUAR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterType === 'KELUAR' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Keluar ({transactions.filter((t) => t.type === 'KELUAR').length})
              </button>
            </div>

            {/* Account filter */}
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">Semua Rekening Bank</option>
              {bankAccounts.map((b) => (
                <option key={b.account_id} value={b.account_id}>
                  {b.bank_name} - {b.account_number}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE TRANSAKSI */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">Tipe &amp; ID</th>
                <th className="py-3.5 px-4 font-bold">Tanggal</th>
                <th className="py-3.5 px-4 font-bold">Pihak Penerima / Pengirim</th>
                <th className="py-3.5 px-4 font-bold">Rekening Bank</th>
                <th className="py-3.5 px-4 font-bold">Deskripsi Keperluan</th>
                <th className="py-3.5 px-4 font-bold text-right">Nominal Pokok</th>
                <th className="py-3.5 px-4 font-bold text-right">Biaya Admin</th>
                <th className="py-3.5 px-4 font-bold text-right">Total Kas</th>
                <th className="py-3.5 px-4 text-center font-bold">Dokumen</th>
                <th className="py-3.5 px-4 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const acc = bankAccounts.find((b) => b.account_id === tx.account_id);
                  const isMasuk = tx.type === 'MASUK';

                  return (
                    <tr key={tx.transaction_id} className="hover:bg-slate-800/40 transition">
                      {/* Tipe & ID */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isMasuk
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isMasuk ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isMasuk ? 'DANA MASUK' : 'DANA KELUAR'}</span>
                        </span>
                        <div className="font-mono text-xs text-amber-400 font-bold mt-1">
                          {tx.transaction_id}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300">
                        {formatShortDate(tx.date)}
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold text-white">
                        {tx.party_name}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <span className="font-bold text-slate-200">{acc?.bank_name}</span>
                        <div className="font-mono text-[11px] text-slate-400">{acc?.account_number}</div>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300 max-w-xs truncate" title={tx.description}>
                        {tx.description}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-slate-200">
                        {formatRupiah(tx.amount)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">
                        {tx.admin_fee ? formatRupiah(tx.admin_fee) : '-'}
                      </td>

                      <td className={`py-3 px-4 text-right font-mono text-xs font-bold ${
                        isMasuk ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isMasuk ? '+' : '-'}{formatRupiah(tx.total_amount)}
                      </td>

                      {/* Dokumen Count */}
                      <td className="py-3 px-4 text-center">
                        {tx.documents && tx.documents.length > 0 ? (
                          <button
                            onClick={() => setViewDetailTx(tx)}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-medium cursor-pointer"
                            title="Buka lampiran dokumen"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{tx.documents.length} Dokumen</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>

                      {/* Aksi: Lihat, Edit, Hapus (Super Admin Khusus) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* LIHAT */}
                          <button
                            onClick={() => setViewDetailTx(tx)}
                            className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Lihat Detail Transaksi & Berkas"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* EDIT */}
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Edit Data Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* HAPUS - KHUSUS SUPER ADMIN */}
                          {isSuperAdmin ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus transaksi ${tx.transaction_id} (${formatRupiah(tx.amount)})?`)) {
                                  onDeleteTransaction(tx.transaction_id);
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-slate-700 transition cursor-pointer"
                              title="Hapus Transaksi (Khusus Super Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 bg-slate-900 text-slate-600 rounded-lg border border-slate-800 cursor-not-allowed opacity-50"
                              title="Hanya Super Admin yang berhak menghapus transaksi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-sm">
                    Belum ada catatan transaksi keuangan yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LIHAT DETAIL TRANSAKSI & DOKUMEN PENDUKUNG */}
      {viewDetailTx && (() => {
        const acc = bankAccounts.find((b) => b.account_id === viewDetailTx.account_id);
        const isMasuk = viewDetailTx.type === 'MASUK';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isMasuk ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {isMasuk ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Detail Bukti Transaksi Kas ({isMasuk ? 'Penerimaan / Dana Masuk' : 'Pengeluaran / Dana Keluar'})
                    </h3>
                    <p className="text-xs font-mono text-amber-400">ID: {viewDetailTx.transaction_id}</p>
                  </div>
                </div>
                <button onClick={() => setViewDetailTx(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isMasuk ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
              }`}>
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    {isMasuk ? 'Total Dana Masuk Bersih' : 'Total Pengeluaran Kas (Termasuk Admin)'}
                  </span>
                  <span className={`text-2xl font-black ${isMasuk ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isMasuk ? '+' : '-'}{formatRupiah(viewDetailTx.total_amount)}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Tanggal Transaksi</span>
                  <span className="font-bold text-white">{formatDateIndo(viewDetailTx.date)}</span>
                </div>
              </div>

              {/* Transaction Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block">
                    {isMasuk ? 'Data Pengirim Dana' : 'Data Penerima Dana'}
                  </span>
                  <div>
                    <p className="text-slate-400">{isMasuk ? 'Nama Pengirim:' : 'Nama Penerima / Vendor:'}</p>
                    <p className="text-white font-bold text-sm">{viewDetailTx.party_name}</p>
                  </div>
                  <div className="pt-1 border-t border-slate-700/60">
                    <p className="text-slate-400">Dicatat Oleh:</p>
                    <p className="text-slate-200">{viewDetailTx.created_by || 'Admin'}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider block">
                    Rekening Kas Terkait
                  </span>
                  <div>
                    <p className="text-slate-400">Bank &amp; Pemilik Rekening:</p>
                    <p className="text-white font-bold text-sm">{acc?.bank_name} - {acc?.account_holder}</p>
                  </div>
                  <div className="pt-1 border-t border-slate-700/60">
                    <p className="text-slate-400">Nomor Rekening:</p>
                    <p className="font-mono text-slate-200 font-bold">{acc?.account_number}</p>
                  </div>
                </div>
              </div>

              {/* Breakdown Nominal & Admin Fee */}
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Rincian Perhitungan Kas
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nominal Pokok:</span>
                    <strong className="text-white font-mono">{formatRupiah(viewDetailTx.amount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Biaya Administrasi Bank:</span>
                    <span className="text-amber-400 font-mono">{formatRupiah(viewDetailTx.admin_fee)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-700 font-bold">
                    <span className="text-slate-300">Net Dampak Saldo:</span>
                    <span className={`font-mono ${isMasuk ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatRupiah(viewDetailTx.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Deskripsi Keperluan / Pengeluaran / Penerimaan
                </span>
                <p className="text-slate-200 whitespace-pre-line leading-relaxed">{viewDetailTx.description}</p>
              </div>

              {/* GALLERY DOKUMEN PENDUKUNG (MAX 10) */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                    Dokumen Pendukung Terlampir ({viewDetailTx.documents?.length || 0} dari maks 10 berkas)
                  </span>
                </div>

                {viewDetailTx.documents && viewDetailTx.documents.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {viewDetailTx.documents.map((doc, i) => {
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
                                title: `Bukti Kas #${i + 1}: ${viewDetailTx.party_name}`,
                                fileUrlOrBase64: doc,
                                fileName: `Dokumen_Kas_${viewDetailTx.transaction_id}_${i + 1}`,
                                driveUrl: isDocDrive ? doc : undefined,
                                categoryLabel: `Bukti Transaksi ${viewDetailTx.type}`
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
                                <span className="text-[11px] font-bold text-amber-300">Dokumen Kas</span>
                                <span className="text-[10px] text-slate-400 truncate max-w-full font-mono">Berkas #{i + 1}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons: Unduh & Lihat */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => downloadDocument(doc, `Dokumen-${viewDetailTx.transaction_id}-${i + 1}`)}
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
                                  title: `Bukti Kas #${i + 1}: ${viewDetailTx.party_name}`,
                                  fileUrlOrBase64: doc,
                                  fileName: `Dokumen_Kas_${viewDetailTx.transaction_id}_${i + 1}`,
                                  driveUrl: isDocDrive ? doc : undefined,
                                  categoryLabel: `Bukti Transaksi ${viewDetailTx.type}`
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
                    Belum ada dokumen pendukung (faktur, bukti transfer, nota) yang dilampirkan.
                  </div>
                )}
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setViewDetailTx(null);
                    handleOpenEdit(viewDetailTx);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Transaksi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewDetailTx(null)}
                  className="px-5 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL INPUT / EDIT TRANSAKSI (DANA KELUAR / DANA MASUK) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  formType === 'MASUK'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {formType === 'MASUK' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingTx ? 'Edit Transaksi Kas' : formType === 'MASUK' ? 'Input Transaksi Dana Masuk' : 'Input Transaksi Dana Keluar'}
                </h3>
              </div>
              <button onClick={onCloseAddModal} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormType('KELUAR')}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    formType === 'KELUAR' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>DANA KELUAR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('MASUK')}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    formType === 'MASUK' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>DANA MASUK</span>
                </button>
              </div>

              {/* Rekening & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rekening Kas Terkait <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.account_id} value={b.account_id}>
                        {b.bank_name} ({b.account_number}) - Saldo: {formatRupiah(calculateAccountBalance(b.account_id))}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Transaksi <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Data Penerima / Pengirim */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {formType === 'MASUK' ? 'Data Pengirim Dana (Klien / Holding / Pihak Ketiga)' : 'Data Penerima Dana (Vendor / Supplier / Personil)'} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formPartyName}
                  onChange={(e) => setFormPartyName(e.target.value)}
                  placeholder={formType === 'MASUK' ? 'Contoh: PT Bukit Asam Tbk / Holding KSO' : 'Contoh: PT Pertamina Patra Niaga / Toko Sumber Jaya'}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Nominal & Admin Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nominal Pokok (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="Contoh: 15000000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Biaya Administrasi Bank (Rp)
                  </label>
                  <input
                    type="number"
                    value={formAdminFee}
                    onChange={(e) => setFormAdminFee(e.target.value)}
                    placeholder="Contoh: 2500 atau 6500 (0 jika gratis)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi Keperluan / Keterangan Transaksi <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Rincian peruntukan dana, nomor invoice, termyn pekerjaan, dll."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Upload Dokumen Pendukung (Max 10) */}
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-200">
                    Upload Dokumen Pendukung (Maksimal 10 Berkas)
                  </label>
                  <span className="text-[11px] text-amber-400 font-bold">
                    {formDocuments.length}/10 Berkas
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  disabled={formDocuments.length >= 10}
                  onChange={handleDocumentUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-amber-400 hover:file:bg-slate-600 cursor-pointer disabled:opacity-50"
                />

                {/* Previews */}
                {formDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
                    {formDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shrink-0"
                      >
                        {doc.startsWith('data:image') || doc.includes('images.unsplash.com') ? (
                          <img src={doc} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-amber-400 p-1">
                            <FileText className="w-5 h-5" />
                            <span className="text-[8px] text-slate-400 truncate max-w-full">File</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(idx)}
                          className="absolute top-0 right-0 bg-rose-600 text-white w-4 h-4 text-[10px] flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-slate-950 text-xs font-bold rounded-xl shadow-lg cursor-pointer ${
                    formType === 'MASUK'
                      ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                      : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  }`}
                >
                  {editingTx ? 'Simpan Perubahan' : formType === 'MASUK' ? 'Simpan Dana Masuk' : 'Simpan Dana Keluar'}
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
