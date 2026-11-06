export type UserRole = 'Super Admin' | 'Admin HC' | 'Admin GA' | 'Admin Finance';

export type EmploymentStatus = 'Karyawan Tetap' | 'Karyawan Kontrak (PKWT)' | 'Paruh Waktu' | 'Outsourcing';
export type AssetStatus = 'Aktif' | 'Rusak' | 'Diperbaiki' | 'Dihapuskan';

export interface EmployeeCertification {
  id: string;
  nama: string;
  penerbit?: string;
  tgl_training?: string; // Tanggal Training
  tgl_expired?: string; // Tanggal Expired
  tgl_kadaluarsa?: string; // backward-compatibility
  file?: string; // Upload Sertifikat (base64 or URL)
  file_name?: string;
  drive_url?: string; // Google Drive webViewLink
  drive_file_id?: string; // Google Drive File ID
  drive_download_url?: string; // Google Drive direct download URL
}

export interface Employee {
  employee_id: string;
  nip: string;
  nik: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  agama: string;
  status_nikah: 'Belum Menikah' | 'Menikah' | 'Cerai';
  no_hp: string;
  email: string;
  kontak_darurat: string;
  alamat_ktp: string;
  alamat_domisili: string;
  jabatan: string;
  departemen: string;
  tgl_mulai_kerja: string;
  lokasi_kerja: string;
  status_kepegawaian: EmploymentStatus;
  akhir_kontrak?: string;
  no_ktp: string;
  npwp: string;
  bpjs_kes: string;
  bpjs_tk: string;
  nama_bank: string;
  no_rekening: string;
  pendidikan_terakhir: string;
  instansi_pendidikan: string;
  jurusan: string;
  sertifikasi: EmployeeCertification[];
  doc_ktp?: string;
  doc_kk?: string;
  doc_bpjs_kes?: string;
  doc_bpjs_tk?: string;
  documents?: string[]; // Dokumen pendukung terlampir (maks 10 berkas)
}

export interface Category {
  category_id: number | string;
  category_name: string;
  code_prefix?: string; // e.g. "AB", "LV", "SRV", "IT", "HSE"
  description?: string;
}

export interface Location {
  location_id: number | string;
  location_name: string;
  address?: string;
}

export interface Asset {
  asset_id: number | string;
  asset_code: string;
  asset_name: string;
  category_id: number | string;
  location_id: number | string;
  brand: string;
  model_number: string;
  serial_number: string;
  purchase_date: string;
  purchase_cost: number;
  status: AssetStatus;
  photos: string[];
  notes?: string;
}

export interface AssetAssignment {
  assignment_id: string;
  asset_id: number | string;
  employee_id: string;
  assigned_date: string;
  returned_date?: string;
  condition_notes?: string;
  signed_receipt?: string[];
}

export interface AssetMaintenance {
  maintenance_id: string;
  asset_id: number | string;
  maintenance_date: string;
  cost: number;
  description: string;
  vendor_name?: string;
  payment_receipt?: string[];
}

// ================= FINANCE MODULE TYPES =================
export interface BankAccount {
  account_id: string; // e.g. "ACC-MANDIRI"
  bank_name: string; // e.g. "Bank Mandiri"
  account_number: string; // e.g. "137-00-123456-7"
  account_holder: string; // e.g. "KSO LRS-TAL Operasional Site"
  initial_balance: number; // Saldo awal
  color: string; // 'blue' | 'amber' | 'emerald'
  description?: string;
}

export type FinanceTransactionType = 'MASUK' | 'KELUAR';

export interface FinanceTransaction {
  transaction_id: string; // e.g. "TRX-OUT-2026-001" or "TRX-IN-2026-001"
  type: FinanceTransactionType; // 'MASUK' (Dana Masuk) atau 'KELUAR' (Dana Keluar)
  date: string; // YYYY-MM-DD
  account_id: string; // Rekening Terkait
  party_name: string; // Data Penerima (untuk transaksi keluar) atau Data Pengirim (untuk transaksi masuk)
  description: string; // Deskripsi Pengeluaran / Penerimaan
  amount: number; // Nominal Pokok (Rp)
  admin_fee: number; // Biaya Administrasi Bank (Rp)
  total_amount: number; // Net dampak saldo
  documents: string[]; // Upload dokumen pendukung maksimal 10 berkas
  created_by?: string;
  created_at?: string;
}

export interface CompanySettings {
  company_name: string;
  company_npwp: string;
  company_address: string;
  company_logo: string;
  company_phone?: string;
  company_email?: string;
  company_tagline?: string;
}

export interface AppState {
  employees: Employee[];
  categories: Category[];
  locations: Location[];
  assets: Asset[];
  assignments: AssetAssignment[];
  maintenances: AssetMaintenance[];
  bank_accounts: BankAccount[];
  finance_transactions: FinanceTransaction[];
  settings: CompanySettings;
}

export type ActiveTab =
  | 'dashboard'
  | 'karyawan'
  | 'master'
  | 'aset'
  | 'peminjaman'
  | 'pemeliharaan'
  | 'finance'
  | 'settings';
