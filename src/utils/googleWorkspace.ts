import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AppState,
  Employee,
  Asset,
  Category,
  Location,
  AssetAssignment,
  AssetMaintenance,
  CompanySettings,
  BankAccount,
  FinanceTransaction
} from '../types';
import { initialData } from '../data/initialData';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token caching per skill guidelines
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn && onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan access token Google Workspace');
    }
    cachedAccessToken = credential.accessToken;
    currentUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return currentUser;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};

// ================= GOOGLE DRIVE API =================

export async function findOrCreateFolder(accessToken: string, folderName: string): Promise<string> {
  const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  const folderData = await createRes.json();
  return folderData.id;
}

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  webContentLink?: string;
  downloadUrl: string;
}

export async function uploadFileToDrive(
  accessToken: string,
  base64DataUrl: string,
  fileName: string,
  folderName = 'KSO LRS-TAL - Dokumen & Arsip'
): Promise<DriveUploadResult> {
  const folderId = await findOrCreateFolder(accessToken, folderName);

  // Extract mime type and base64 string
  const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = matches ? matches[1] : 'application/octet-stream';
  const base64Content = matches ? matches[2] : base64DataUrl.replace(/^data:[^;]+;base64,/, '');

  const metadata = {
    name: fileName,
    parents: [folderId]
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n` +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  const fileData = await res.json();
  if (!res.ok || !fileData.id) {
    throw new Error(fileData.error?.message || 'Gagal mengunggah file ke Google Drive');
  }

  // Grant read permission to anyone with link for easy team access
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (permErr) {
    console.warn('Note: public link permission skipped/restricted:', permErr);
  }

  const webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileData.id}/view?usp=drivesdk`;
  const downloadUrl = fileData.webContentLink || `https://drive.google.com/uc?export=download&id=${fileData.id}`;

  return {
    fileId: fileData.id,
    fileName,
    webViewLink,
    webContentLink: fileData.webContentLink,
    downloadUrl
  };
}

// ================= GOOGLE SHEETS API =================

const SPREADSHEET_TITLE = 'KSO LRS-TAL - Database HC & GA';

export async function findOrCreateDatabaseSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  // Search for existing spreadsheet in Drive
  const query = encodeURIComponent(`mimeType='application/vnd.google-apps.spreadsheet' and name='${SPREADSHEET_TITLE}' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const file = searchData.files[0];
    return { id: file.id, url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit` };
  }

  // Create new spreadsheet with required sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: SPREADSHEET_TITLE },
      sheets: [
        { properties: { title: 'Karyawan' } },
        { properties: { title: 'Aset' } },
        { properties: { title: 'Penyerahan_Aset' } },
        { properties: { title: 'Riwayat_Servis' } },
        { properties: { title: 'Rekening_Bank' } },
        { properties: { title: 'Transaksi_Finance' } },
        { properties: { title: 'Kategori' } },
        { properties: { title: 'Lokasi' } },
        { properties: { title: 'Pengaturan' } }
      ]
    })
  });

  const sheetData = await createRes.json();
  return {
    id: sheetData.spreadsheetId,
    url: sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${sheetData.spreadsheetId}/edit`
  };
}

export async function syncAllToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  state: AppState
): Promise<void> {
  // Prepare values for each sheet

  // 1. Karyawan
  const karyawanRows: any[][] = [
    [
      'ID Karyawan', 'NIP', 'NIK', 'Nama Lengkap', 'Tempat Lahir', 'Tanggal Lahir',
      'Jenis Kelamin', 'Agama', 'Status Nikah', 'No HP', 'Email', 'Kontak Darurat',
      'Jabatan', 'Departemen', 'Tgl Mulai Kerja', 'Lokasi Kerja', 'Status Kepegawaian',
      'Akhir Kontrak', 'NPWP', 'BPJS Kes', 'BPJS TK', 'Bank', 'No Rekening',
      'Pendidikan Terakhir', 'Instansi', 'Jurusan', 'Sertifikasi JSON'
    ]
  ];
  state.employees.forEach((e) => {
    karyawanRows.push([
      e.employee_id, e.nip, e.nik, e.nama, e.tempat_lahir, e.tanggal_lahir,
      e.jenis_kelamin, e.agama, e.status_nikah, e.no_hp, e.email, e.kontak_darurat,
      e.jabatan, e.departemen, e.tgl_mulai_kerja, e.lokasi_kerja, e.status_kepegawaian,
      e.akhir_kontrak || '', e.npwp || '', e.bpjs_kes || '', e.bpjs_tk || '',
      e.nama_bank || '', e.no_rekening || '', e.pendidikan_terakhir || '',
      e.instansi_pendidikan || '', e.jurusan || '', JSON.stringify(e.sertifikasi || [])
    ]);
  });

  // 2. Aset
  const asetRows: any[][] = [
    [
      'ID Aset', 'Kode Aset', 'Nama Aset', 'Kategori ID', 'Lokasi ID',
      'Merek', 'Model', 'Serial Number', 'Tanggal Beli', 'Harga Beli (Rp)',
      'Status', 'Catatan'
    ]
  ];
  state.assets.forEach((a) => {
    asetRows.push([
      a.asset_id, a.asset_code, a.asset_name, a.category_id, a.location_id,
      a.brand, a.model_number, a.serial_number, a.purchase_date, a.purchase_cost,
      a.status, a.notes || ''
    ]);
  });

  // 3. Penyerahan_Aset
  const penyerahanRows: any[][] = [
    [
      'ID Transaksi BAST', 'ID Aset', 'ID Karyawan', 'Tanggal Penyerahan',
      'Tanggal Pengembalian', 'Catatan Kondisi'
    ]
  ];
  state.assignments.forEach((asg) => {
    penyerahanRows.push([
      asg.assignment_id, asg.asset_id, asg.employee_id, asg.assigned_date,
      asg.returned_date || '', asg.condition_notes || ''
    ]);
  });

  // 4. Riwayat_Servis
  const servisRows: any[][] = [
    [
      'ID Servis', 'ID Aset', 'Tanggal Servis', 'Biaya (Rp)',
      'Bengkel / Vendor', 'Uraian Perbaikan'
    ]
  ];
  state.maintenances.forEach((m) => {
    servisRows.push([
      m.maintenance_id, m.asset_id, m.maintenance_date, m.cost,
      m.vendor_name || '', m.description
    ]);
  });

  // 5. Rekening_Bank (Finance)
  const rekeningRows: any[][] = [
    ['ID Rekening', 'Nama Bank', 'Nomor Rekening', 'Atas Nama', 'Saldo Awal (Rp)', 'Keterangan']
  ];
  (state.bank_accounts || []).forEach((b) => {
    rekeningRows.push([
      b.account_id,
      b.bank_name,
      b.account_number,
      b.account_holder,
      b.initial_balance,
      b.description || ''
    ]);
  });

  // 6. Transaksi_Finance (Finance)
  const transaksiRows: any[][] = [
    [
      'ID Transaksi', 'Tipe Transaksi', 'ID Rekening Bank', 'Nama Bank', 'Tanggal',
      'Pihak Terkait (Pengirim/Penerima)', 'Deskripsi', 'Nominal (Rp)', 'Biaya Admin Bank (Rp)',
      'Jumlah Berkas Dokumen', 'Dibuat Oleh'
    ]
  ];
  (state.finance_transactions || []).forEach((t) => {
    const bank = (state.bank_accounts || []).find((b) => b.account_id === t.account_id);
    transaksiRows.push([
      t.transaction_id,
      t.type,
      t.account_id,
      bank?.bank_name || '',
      t.date,
      t.party_name,
      t.description,
      t.amount,
      t.admin_fee || 0,
      (t.documents || []).length,
      t.created_by || ''
    ]);
  });

  // 7. Kategori
  const kategoriRows: any[][] = [
    ['ID Kategori', 'Nama Kategori', 'Deskripsi']
  ];
  state.categories.forEach((c) => {
    kategoriRows.push([c.category_id, c.category_name, c.description || '']);
  });

  // 8. Lokasi
  const lokasiRows: any[][] = [
    ['ID Lokasi', 'Nama Lokasi', 'Alamat']
  ];
  state.locations.forEach((l) => {
    lokasiRows.push([l.location_id, l.location_name, l.address || '']);
  });

  // 9. Pengaturan
  const pengaturanRows: any[][] = [
    ['Nama Perusahaan', 'NPWP', 'Alamat', 'No Telepon', 'Email', 'Logo URL'],
    [
      state.settings.company_name, state.settings.company_npwp, state.settings.company_address,
      state.settings.company_phone || '', state.settings.company_email || '', state.settings.company_logo || ''
    ]
  ];

  // Batch update all data
  const dataPayload = [
    { range: 'Karyawan!A1:AA' + (karyawanRows.length + 10), values: karyawanRows },
    { range: 'Aset!A1:L' + (asetRows.length + 10), values: asetRows },
    { range: 'Penyerahan_Aset!A1:F' + (penyerahanRows.length + 10), values: penyerahanRows },
    { range: 'Riwayat_Servis!A1:F' + (servisRows.length + 10), values: servisRows },
    { range: 'Rekening_Bank!A1:F' + (rekeningRows.length + 10), values: rekeningRows },
    { range: 'Transaksi_Finance!A1:K' + (transaksiRows.length + 10), values: transaksiRows },
    { range: 'Kategori!A1:C' + (kategoriRows.length + 10), values: kategoriRows },
    { range: 'Lokasi!A1:C' + (lokasiRows.length + 10), values: lokasiRows },
    { range: 'Pengaturan!A1:F3', values: pengaturanRows }
  ];

  // First ensure sheets exist or clear them
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: dataPayload
    })
  });
}

export async function fetchAllFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<AppState | null> {
  const ranges = [
    'Karyawan!A1:AA500',
    'Aset!A1:L500',
    'Penyerahan_Aset!A1:F500',
    'Riwayat_Servis!A1:F500',
    'Rekening_Bank!A1:F100',
    'Transaksi_Finance!A1:K500',
    'Kategori!A1:C100',
    'Lokasi!A1:C100',
    'Pengaturan!A1:F2'
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges.join('&ranges=')}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  const data = await res.json();
  if (!data.valueRanges) return null;

  const [
    karyawanVR,
    asetVR,
    penyerahanVR,
    servisVR,
    rekeningVR,
    transaksiVR,
    kategoriVR,
    lokasiVR,
    pengaturanVR
  ] = data.valueRanges;

  // Parse Karyawan
  const employees: Employee[] = [];
  if (karyawanVR.values && karyawanVR.values.length > 1) {
    karyawanVR.values.slice(1).forEach((r: any[]) => {
      if (r[0] && r[1]) {
        let certs = [];
        try {
          certs = JSON.parse(r[26] || '[]');
        } catch {}
        employees.push({
          employee_id: r[0] || '',
          nip: r[1] || '',
          nik: r[2] || '',
          nama: r[3] || '',
          tempat_lahir: r[4] || '',
          tanggal_lahir: r[5] || '',
          jenis_kelamin: (r[6] as any) || 'Laki-laki',
          agama: r[7] || 'Islam',
          status_nikah: (r[8] as any) || 'Belum Menikah',
          no_hp: r[9] || '',
          email: r[10] || '',
          kontak_darurat: r[11] || '',
          alamat_ktp: '',
          alamat_domisili: '',
          jabatan: r[12] || '',
          departemen: r[13] || '',
          tgl_mulai_kerja: r[14] || '',
          lokasi_kerja: r[15] || '',
          status_kepegawaian: (r[16] as any) || 'Karyawan Tetap',
          akhir_kontrak: r[17] || '',
          no_ktp: r[2] || '',
          npwp: r[18] || '',
          bpjs_kes: r[19] || '',
          bpjs_tk: r[20] || '',
          nama_bank: r[21] || '',
          no_rekening: r[22] || '',
          pendidikan_terakhir: r[23] || 'S1',
          instansi_pendidikan: r[24] || '',
          jurusan: r[25] || '',
          sertifikasi: certs
        });
      }
    });
  }

  // Parse Assets
  const assets: Asset[] = [];
  if (asetVR.values && asetVR.values.length > 1) {
    asetVR.values.slice(1).forEach((r: any[]) => {
      if (r[0] && r[1]) {
        assets.push({
          asset_id: r[0],
          asset_code: r[1],
          asset_name: r[2],
          category_id: r[3],
          location_id: r[4],
          brand: r[5] || '',
          model_number: r[6] || '',
          serial_number: r[7] || '',
          purchase_date: r[8] || '',
          purchase_cost: Number(r[9]) || 0,
          status: (r[10] as any) || 'Aktif',
          photos: [],
          notes: r[11] || ''
        });
      }
    });
  }

  // Parse Assignments
  const assignments: AssetAssignment[] = [];
  if (penyerahanVR.values && penyerahanVR.values.length > 1) {
    penyerahanVR.values.slice(1).forEach((r: any[]) => {
      if (r[0] && r[1]) {
        assignments.push({
          assignment_id: r[0],
          asset_id: r[1],
          employee_id: r[2],
          assigned_date: r[3],
          returned_date: r[4] || '',
          condition_notes: r[5] || '',
          signed_receipt: []
        });
      }
    });
  }

  // Parse Maintenances
  const maintenances: AssetMaintenance[] = [];
  if (servisVR.values && servisVR.values.length > 1) {
    servisVR.values.slice(1).forEach((r: any[]) => {
      if (r[0] && r[1]) {
        maintenances.push({
          maintenance_id: r[0],
          asset_id: r[1],
          maintenance_date: r[2],
          cost: Number(r[3]) || 0,
          vendor_name: r[4] || '',
          description: r[5] || '',
          payment_receipt: []
        });
      }
    });
  }

  // Parse Categories
  const categories: Category[] = [];
  if (kategoriVR.values && kategoriVR.values.length > 1) {
    kategoriVR.values.slice(1).forEach((r: any[]) => {
      if (r[0] && r[1]) {
        categories.push({
          category_id: r[0],
          category_name: r[1],
          description: r[2] || ''
        });
      }
    });
  }

  // Parse Rekening Bank (Finance)
  const bank_accounts: BankAccount[] = [];
  if (rekeningVR?.values && rekeningVR.values.length > 1) {
    rekeningVR.values.slice(1).forEach((r: any[]) => {
      if (r[0] && r[1]) {
        bank_accounts.push({
          account_id: r[0],
          bank_name: r[1],
          account_number: r[2] || '',
          account_holder: r[3] || 'KSO LRS-TAL',
          initial_balance: Number(r[4]) || 0,
          color: r[0].toLowerCase().includes('bca') ? 'amber' : r[0].toLowerCase().includes('bni') ? 'emerald' : 'blue',
          description: r[5] || ''
        });
      }
    });
  }

  // Parse Transaksi Finance
  const finance_transactions: FinanceTransaction[] = [];
  if (transaksiVR?.values && transaksiVR.values.length > 1) {
    transaksiVR.values.slice(1).forEach((r: any[]) => {
      if (r[0] && r[1]) {
        const type = (r[1] as any) === 'KELUAR' ? 'KELUAR' : 'MASUK';
        const amount = Number(r[7]) || 0;
        const adminFee = Number(r[8]) || 0;
        finance_transactions.push({
          transaction_id: r[0],
          type,
          account_id: r[2] || '',
          date: r[4] || new Date().toISOString().split('T')[0],
          party_name: r[5] || '',
          description: r[6] || '',
          amount,
          admin_fee: adminFee,
          total_amount: type === 'MASUK' ? amount - adminFee : amount + adminFee,
          documents: [],
          created_by: r[10] || 'Admin Finance'
        });
      }
    });
  }

  // Parse Locations
  const locations: Location[] = [];
  if (lokasiVR.values && lokasiVR.values.length > 1) {
    lokasiVR.values.slice(1).forEach((r: any[]) => {
      if (r[0] && r[1]) {
        locations.push({
          location_id: r[0],
          location_name: r[1],
          address: r[2] || ''
        });
      }
    });
  }

  // Parse Settings
  let settings: CompanySettings = {
    company_name: 'KSO LRS-TAL',
    company_npwp: '',
    company_address: '',
    company_logo: ''
  };
  if (pengaturanVR.values && pengaturanVR.values.length > 1) {
    const row = pengaturanVR.values[1];
    settings = {
      company_name: row[0] || 'KSO LRS-TAL',
      company_npwp: row[1] || '',
      company_address: row[2] || '',
      company_phone: row[3] || '',
      company_email: row[4] || '',
      company_logo: row[5] || ''
    };
  }

  return {
    employees: employees.length > 0 ? employees : [],
    assets: assets.length > 0 ? assets : [],
    assignments: assignments.length > 0 ? assignments : [],
    maintenances: maintenances.length > 0 ? maintenances : [],
    categories: categories.length > 0 ? categories : [],
    locations: locations.length > 0 ? locations : [],
    bank_accounts: bank_accounts.length > 0 ? bank_accounts : (initialData.bank_accounts || []),
    finance_transactions: finance_transactions.length > 0 ? finance_transactions : (initialData.finance_transactions || []),
    settings
  };
}
