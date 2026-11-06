import React, { useState } from 'react';
import { FolderTree, MapPin, Plus, Trash2, Edit2, X, Boxes, Building } from 'lucide-react';
import { Category, Location, Asset } from '../types';

interface MasterDataViewProps {
  categories: Category[];
  locations: Location[];
  assets: Asset[];
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (id: number | string) => void;
  onSaveLocation: (loc: Location) => void;
  onDeleteLocation: (id: number | string) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  categories,
  locations,
  assets,
  onSaveCategory,
  onDeleteCategory,
  onSaveLocation,
  onDeleteLocation
}) => {
  // Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');

  // Category handlers
  const handleOpenCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatName(cat.category_name);
      setCatDesc(cat.description || '');
    } else {
      setEditingCat(null);
      setCatName('');
      setCatDesc('');
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onSaveCategory({
      category_id: editingCat ? editingCat.category_id : Date.now(),
      category_name: catName.trim(),
      description: catDesc.trim()
    });
    setIsCatModalOpen(false);
  };

  // Location handlers
  const handleOpenLocModal = (loc?: Location) => {
    if (loc) {
      setEditingLoc(loc);
      setLocName(loc.location_name);
      setLocAddress(loc.address || '');
    } else {
      setEditingLoc(null);
      setLocName('');
      setLocAddress('');
    }
    setIsLocModalOpen(true);
  };

  const handleSaveLoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;
    onSaveLocation({
      location_id: editingLoc ? editingLoc.location_id : Date.now(),
      location_name: locName.trim(),
      address: locAddress.trim()
    });
    setIsLocModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Master Kategori &amp; Lokasi Fisik
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Klasifikasi aset dan titik lokasi fisik operasional pertambangan, mess, workshop, dan kantor KSO LRS-TAL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CATEGORIES CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Kategori Aset</h3>
                  <p className="text-xs text-slate-400">Tabel referensi `categories`</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenCatModal()}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Nama Kategori</th>
                    <th className="p-3">Deskripsi / Contoh</th>
                    <th className="p-3 text-center">Jumlah Aset</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {categories.map((c) => {
                    const count = assets.filter((a) => String(a.category_id) === String(c.category_id)).length;
                    return (
                      <tr key={c.category_id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{c.category_name}</td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">{c.description || '-'}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold border border-slate-700">
                            {count} unit
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenCatModal(c)}
                            className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-slate-700 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus kategori "${c.category_name}"?`)) {
                                onDeleteCategory(c.category_id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-slate-700 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* LOCATIONS CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Lokasi Fisik / Site</h3>
                  <p className="text-xs text-slate-400">Tabel referensi `locations`</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenLocModal()}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tambah Lokasi</span>
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Nama Lokasi / Site</th>
                    <th className="p-3">Alamat / Wilayah</th>
                    <th className="p-3 text-center">Jumlah Aset</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {locations.map((l) => {
                    const count = assets.filter((a) => String(a.location_id) === String(l.location_id)).length;
                    return (
                      <tr key={l.location_id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{l.location_name}</td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">{l.address || '-'}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                            {count} unit
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenLocModal(l)}
                            className="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-slate-700 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus lokasi "${l.location_name}"?`)) {
                                onDeleteLocation(l.location_id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-slate-700 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL KATEGORI */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-base">
                {editingCat ? 'Edit Kategori Aset' : 'Tambah Kategori Aset Baru'}
              </h4>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCat} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Alat Berat & Mesin Tambang"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deskripsi Tambahan</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Keterangan jenis barang / alat"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOKASI */}
      {isLocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="font-bold text-white text-base">
                {editingLoc ? 'Edit Lokasi Fisik' : 'Tambah Lokasi Fisik / Site'}
              </h4>
              <button
                onClick={() => setIsLocModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lokasi / Site</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="Contoh: Pit Area - Site Lahat"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat / Wilayah</label>
                <textarea
                  rows={2}
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  placeholder="Alamat detail lokasi fisik"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLocModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Simpan Lokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
