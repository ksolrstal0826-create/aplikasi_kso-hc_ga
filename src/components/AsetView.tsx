import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  MapPin,
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Grid,
  List,
  Download,
  ExternalLink,
  HardDrive
} from 'lucide-react';
import { Asset, Category, Location, Employee, AssetAssignment, AssetStatus } from '../types';
import { formatRupiah, formatShortDate } from '../utils/formatters';
import { getAccessToken, uploadFileToDrive } from '../utils/googleWorkspace';
import { downloadDocument, isGoogleDriveUrl } from '../utils/fileDownloader';

interface AsetViewProps {
  assets: Asset[];
  categories: Category[];
  locations: Location[];
  assignments: AssetAssignment[];
  employees: Employee[];
  onSaveAsset: (asset: Asset) => void;
  onDeleteAsset: (id: number | string) => void;
  onViewAsset: (asset: Asset) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

const ASSET_STATUSES: AssetStatus[] = ['Aktif', 'Diperbaiki', 'Rusak', 'Dihapuskan'];

export const AsetView: React.FC<AsetViewProps> = ({
  assets,
  categories,
  locations,
  assignments,
  employees,
  onSaveAsset,
  onDeleteAsset,
  onViewAsset,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterLoc, setFilterLoc] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Edit State
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCatId, setFormCatId] = useState<string | number>(categories[0]?.category_id || 1);
  const [formLocId, setFormLocId] = useState<string | number>(locations[0]?.location_id || 1);
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formPurchaseCost, setFormPurchaseCost] = useState<number | string>('');
  const [formStatus, setFormStatus] = useState<AssetStatus>('Aktif');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');

  // Helper to generate code based on category
  const generateAssetCode = (categoryId: string | number, currentAssets: Asset[], catList: Category[]) => {
    const cat = catList.find((c) => String(c.category_id) === String(categoryId));
    let prefix = 'AST';
    if (cat?.code_prefix) {
      prefix = `AST-${cat.code_prefix.toUpperCase()}`;
    } else if (cat) {
      const n = cat.category_name.toLowerCase();
      if (n.includes('berat') || n.includes('mesin')) prefix = 'AST-AB';
      else if (n.includes('lv') || n.includes('kendaraan')) prefix = 'AST-LV';
      else if (n.includes('survey')) prefix = 'AST-SRV';
      else if (n.includes('it') || n.includes('elektronik') || n.includes('komunikasi')) prefix = 'AST-IT';
      else if (n.includes('hse') || n.includes('safety')) prefix = 'AST-HSE';
      else prefix = `AST-${cat.category_name.substring(0, 3).toUpperCase()}`;
    }

    const sameCatAssets = currentAssets.filter((a) => {
      return String(a.category_id) === String(categoryId) || a.asset_code.startsWith(prefix);
    });

    let nextNum = sameCatAssets.length + 1;
    let code = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    while (currentAssets.some((a) => a.asset_code.toUpperCase() === code.toUpperCase())) {
      nextNum += 1;
      code = `${prefix}-${String(nextNum).padStart(3, '0')}`;
    }

    return code;
  };

  const handleOpenEdit = (ast: Asset) => {
    setEditingAsset(ast);
    setFormCode(ast.asset_code || '');
    setFormName(ast.asset_name || '');
    setFormCatId(ast.category_id || categories[0]?.category_id);
    setFormLocId(ast.location_id || locations[0]?.location_id);
    setFormBrand(ast.brand || '');
    setFormModel(ast.model_number || '');
    setFormSerial(ast.serial_number || '');
    setFormPurchaseDate(ast.purchase_date || '');
    setFormPurchaseCost(ast.purchase_cost || '');
    setFormStatus(ast.status || 'Aktif');
    setFormPhotos(ast.photos || []);
    setFormNotes(ast.notes || '');
    onOpenAddModal();
  };

  const handleOpenNew = () => {
    setEditingAsset(null);
    const initialCatId = categories[0]?.category_id || 1;
    const generated = generateAssetCode(initialCatId, assets, categories);
    setFormCode(generated);
    setFormName('');
    setFormCatId(initialCatId);
    setFormLocId(locations[0]?.location_id || 1);
    setFormBrand('');
    setFormModel('');
    setFormSerial('');
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    setFormPurchaseCost('');
    setFormStatus('Aktif');
    setFormPhotos([]);
    setFormNotes('');
    onOpenAddModal();
  };

  const handleCategoryChange = (newCatId: string | number) => {
    setFormCatId(newCatId);
    // Auto-update asset code for new asset
    if (!editingAsset) {
      setFormCode(generateAssetCode(newCatId, assets, categories));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (formPhotos.length + files.length > 5) {
      alert('Maksimal 5 foto per aset.');
      return;
    }

    Array.from(files).forEach((file) => {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const base64Data = ev.target.result as string;
          setFormPhotos((prev) => [...prev, base64Data]);

          // Upload to Google Drive if connected
          try {
            const token = await getAccessToken();
            if (token) {
              const driveRes = await uploadFileToDrive(
                token,
                base64Data,
                `Aset-${Date.now()}-${fileName}`,
                'KSO LRS-TAL - Foto Aset Unit'
              );
              if (driveRes.webViewLink) {
                setFormPhotos((prev) => {
                  const idx = prev.indexOf(base64Data);
                  if (idx >= 0) {
                    const copy = [...prev];
                    copy[idx] = driveRes.webViewLink;
                    return copy;
                  }
                  return prev;
                });
              }
            }
          } catch (err) {
            console.warn('Google Drive direct upload skipped/failed for asset photo:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (idx: number) => {
    setFormPhotos(formPhotos.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) return;

    const payload: Asset = {
      asset_id: editingAsset ? editingAsset.asset_id : Date.now(),
      asset_code: formCode.trim(),
      asset_name: formName.trim(),
      category_id: formCatId,
      location_id: formLocId,
      brand: formBrand.trim(),
      model_number: formModel.trim(),
      serial_number: formSerial.trim(),
      purchase_date: formPurchaseDate,
      purchase_cost: Number(formPurchaseCost) || 0,
      status: formStatus,
      photos: formPhotos,
      notes: formNotes.trim()
    };

    onSaveAsset(payload);
    onCloseAddModal();
  };

  // Helper to get active holder
  const getAssetHolder = (assetId: number | string) => {
    const activeAssign = assignments.find((a) => String(a.asset_id) === String(assetId) && !a.returned_date);
    if (!activeAssign) return null;
    return employees.find((e) => String(e.employee_id) === String(activeAssign.employee_id)) || null;
  };

  // Filter
  const filteredAssets = assets.filter((ast) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      (ast.asset_name && ast.asset_name.toLowerCase().includes(q)) ||
      (ast.asset_code && ast.asset_code.toLowerCase().includes(q)) ||
      (ast.brand && ast.brand.toLowerCase().includes(q)) ||
      (ast.model_number && ast.model_number.toLowerCase().includes(q)) ||
      (ast.serial_number && ast.serial_number.toLowerCase().includes(q));

    const matchCat = filterCat === 'all' || String(ast.category_id) === String(filterCat);
    const matchLoc = filterLoc === 'all' || String(ast.location_id) === String(filterLoc);
    const matchStatus = filterStatus === 'all' || ast.status === filterStatus;

    return matchQuery && matchCat && matchLoc && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Database Inventaris Aset (GA)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Pencatatan alat berat, armada transportasi site, instrumen survey, IT workstation, dan sarana operasional.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Aset Baru</span>
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
              placeholder="Cari nama, kode aset, merek, S/N..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>

            <select
              value={filterLoc}
              onChange={(e) => setFilterLoc(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Semua Lokasi / Site</option>
              {locations.map((l) => (
                <option key={l.location_id} value={l.location_id}>
                  {l.location_name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              {ASSET_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Toggle View Mode */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Galeri Kartu"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW: TABLE */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Kode &amp; Nama Aset</th>
                  <th className="py-3.5 px-4 font-bold">Kategori &amp; Lokasi</th>
                  <th className="py-3.5 px-4 font-bold">Merek / Model / S/N</th>
                  <th className="py-3.5 px-4 text-center font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Penanggung Jawab</th>
                  <th className="py-3.5 px-4 text-right font-bold">Harga Beli</th>
                  <th className="py-3.5 px-4 text-center font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((ast) => {
                    const cat = categories.find((c) => String(c.category_id) === String(ast.category_id));
                    const loc = locations.find((l) => String(l.location_id) === String(ast.location_id));
                    const holder = getAssetHolder(ast.asset_id);

                    return (
                      <tr key={ast.asset_id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white leading-snug">{ast.asset_name}</div>
                          <span className="font-mono text-xs text-amber-400">{ast.asset_code}</span>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <div className="text-slate-200 font-medium">{cat?.category_name || '-'}</div>
                          <div className="text-slate-400">{loc?.location_name || '-'}</div>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <div className="text-slate-200">{ast.brand} {ast.model_number}</div>
                          <div className="font-mono text-[11px] text-slate-400">S/N: {ast.serial_number || '-'}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              ast.status === 'Aktif'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : ast.status === 'Diperbaiki'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {ast.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {holder ? (
                            <div>
                              <strong className="text-amber-400">{holder.nama}</strong>
                              <p className="text-[10px] text-slate-400">{holder.jabatan}</p>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Tersedia di Gudang</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs text-slate-200">
                          {formatRupiah(ast.purchase_cost)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onViewAsset(ast)}
                              className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-slate-700 transition cursor-pointer"
                              title="Lihat Kartu Kendali A4"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(ast)}
                              className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-slate-700 transition cursor-pointer"
                              title="Edit Aset"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus data aset "${ast.asset_name}"?`)) {
                                  onDeleteAsset(ast.asset_id);
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-slate-700 transition cursor-pointer"
                              title="Hapus Aset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                      Tidak ada data aset yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW: GRID / CARD GALLERY */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((ast) => {
            const cat = categories.find((c) => String(c.category_id) === String(ast.category_id));
            const loc = locations.find((l) => String(l.location_id) === String(ast.location_id));
            const holder = getAssetHolder(ast.asset_id);
            const coverPhoto = ast.photos && ast.photos.length > 0 ? ast.photos[0] : null;

            return (
              <div
                key={ast.asset_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* Photo or placeholder */}
                  <div className="h-44 w-full bg-slate-950 relative overflow-hidden">
                    {coverPhoto ? (
                      <img src={coverPhoto} alt={ast.asset_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1">
                        <Boxes className="w-8 h-8 stroke-1" />
                        <span className="text-xs">Foto belum diunggah</span>
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                        ast.status === 'Aktif'
                          ? 'bg-emerald-500/90 text-white'
                          : ast.status === 'Diperbaiki'
                          ? 'bg-amber-500/90 text-slate-950'
                          : 'bg-rose-500/90 text-white'
                      }`}
                    >
                      {ast.status}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-sm text-amber-400 font-mono text-[10px] font-bold">
                        {ast.asset_code}
                      </span>
                      {coverPhoto && (
                        <div className="flex items-center gap-1">
                          {isGoogleDriveUrl(coverPhoto) && (
                            <span className="p-1 rounded bg-slate-950/80 text-emerald-400 text-[10px]" title="Tersimpan di Google Drive">
                              <HardDrive className="w-3 h-3" />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadDocument(coverPhoto, `${ast.asset_code}-${ast.asset_name}.jpg`);
                            }}
                            className="p-1 rounded bg-slate-950/80 hover:bg-slate-900 text-amber-400 text-[10px] cursor-pointer flex items-center gap-1"
                            title="Unduh Foto Aset"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{ast.asset_name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{ast.brand} {ast.model_number}</p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Kategori:</span>
                        <span className="font-medium text-slate-200">{cat?.category_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Lokasi:</span>
                        <span className="font-medium text-slate-200 truncate max-w-[170px]">{loc?.location_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">S/N:</span>
                        <span className="font-mono text-slate-300">{ast.serial_number || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Pengguna:</span>
                        <span className="font-bold text-amber-400">{holder ? holder.nama : 'Gudang'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Harga Perolehan:</span>
                        <span className="font-bold text-emerald-400">{formatRupiah(ast.purchase_cost)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onViewAsset(ast)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Kartu A4</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(ast)}
                      className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-lg cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus data aset "${ast.asset_name}"?`)) {
                          onDeleteAsset(ast.asset_id);
                        }
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL FORM ASET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {editingAsset ? 'Edit Data Aset' : 'Tambah Aset Baru'}
                </h3>
              </div>
              <button onClick={onCloseAddModal} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Aset <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formCatId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.category_name} ({c.code_prefix || 'AST'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Kode Aset <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormCode(generateAssetCode(formCatId, assets, categories))}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                      title="Generate ulang kode aset sesuai kategori"
                    >
                      ↻ Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Contoh: AST-AB-001"
                    className="w-full px-3 py-2 bg-slate-800 border border-amber-500/40 rounded-xl text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Kode otomatis terisi sesuai kategori (dapat disesuaikan jika perlu)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Aset <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Excavator Komatsu PC200-8"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lokasi Fisik / Site</label>
                  <select
                    value={formLocId}
                    onChange={(e) => setFormLocId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {locations.map((l) => (
                      <option key={l.location_id} value={l.location_id}>
                        {l.location_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Merek Pabrikan</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Komatsu / Toyota / dsb."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model / Seri</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="PC200-8 / Hilux DC"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Serial Number (S/N)</label>
                  <input
                    type="text"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    placeholder="Nomor Seri Fisik"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Beli</label>
                  <input
                    type="date"
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    value={formPurchaseCost}
                    onChange={(e) => setFormPurchaseCost(e.target.value)}
                    placeholder="Contoh: 1250000000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Kondisi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    {ASSET_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photos Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Upload Foto Aset (Maksimal 5 Foto)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                />

                {/* Previews */}
                {formPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formPhotos.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-700 overflow-hidden bg-slate-800">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-0 right-0 bg-rose-600 text-white w-4 h-4 text-[11px] flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Kelengkapan surat, APAR, spesifikasi khusus, dll."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

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
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingAsset ? 'Simpan Perubahan' : 'Simpan Aset Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
