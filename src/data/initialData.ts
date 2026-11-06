import { AppState } from '../types';

export const initialData: AppState = {
  settings: {
    company_name: 'KSO LRS-TAL',
    company_npwp: '01.234.567.8-901.000',
    company_address: 'Kawasan Operasional Tambang & Kantor Pusat, Jl. Lintas Sumatera Km. 18, Lahat - Sumatera Selatan',
    company_logo: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=160&q=80',
    company_phone: '+62 731 321889',
    company_email: 'office@kso-lrstal.co.id',
    company_tagline: 'Solusi Terpadu Pertambangan & Logistik Energi'
  },
  categories: [
    { category_id: 1, category_name: 'Alat Berat & Mesin Tambang', code_prefix: 'AB', description: 'Excavator, Bulldozer, Dump Truck, Wheel Loader' },
    { category_id: 2, category_name: 'Kendaraan Operasional (LV)', code_prefix: 'LV', description: '4x4 Double Cabin, Minibus Operasional Site' },
    { category_id: 3, category_name: 'Peralatan Survey & Engineering', code_prefix: 'SRV', description: 'Total Station, GPS Geodetic, Drone Pemetaan' },
    { category_id: 4, category_name: 'Elektronik, IT & Komunikasi', code_prefix: 'IT', description: 'Laptop Engineering, Server, Handy Talky, Radio Rig' },
    { category_id: 5, category_name: 'Peralatan HSE & Fasilitas Site', code_prefix: 'HSE', description: 'Gas Detector, Sound Level Meter, Generator Listrik' }
  ],
  locations: [
    { location_id: 1, location_name: 'Pit Area - Site Lahat Barat', address: 'Blok Tambang Utama Km. 12, Lahat' },
    { location_id: 2, location_name: 'Workshop & Maintenance Yard', address: 'Jl. Workshop Utama KSO, Lahat' },
    { location_id: 3, location_name: 'Basecamp & Kantor Site', address: 'Mess Karyawan & Main Office Site Lahat' },
    { location_id: 4, location_name: 'Head Office (HO) Jakarta', address: 'Gedung Menara Sudirman Lt. 14, Jakarta Selatan' },
    { location_id: 5, location_name: 'Port & Stockpile Tanjung Enim', address: 'Fasilitas Dermaga & Timbangan Batubara' }
  ],
  employees: [
    {
      employee_id: 'EMP-1001',
      nip: 'LRS-001',
      nik: '1604121205880001',
      nama: 'Budi Santoso, S.T.',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '1988-05-12',
      jenis_kelamin: 'Laki-laki',
      agama: 'Islam',
      status_nikah: 'Menikah',
      no_hp: '081298765432',
      email: 'budi.santoso@kso-lrstal.co.id',
      kontak_darurat: 'Siti Rahma (Istri) - 081211112222',
      alamat_ktp: 'Jl. Merdeka Raya No. 45, RT 03/04, Jakarta Timur',
      alamat_domisili: 'Basecamp KSO LRS-TAL Site Lahat Mess A-02',
      jabatan: 'Project Site Manager',
      departemen: 'Project Management',
      tgl_mulai_kerja: '2021-02-01',
      lokasi_kerja: 'Site Lahat',
      status_kepegawaian: 'Karyawan Tetap',
      no_ktp: '1604121205880001',
      npwp: '12.345.678.9-012.000',
      bpjs_kes: '000123456789',
      bpjs_tk: '19012345678',
      nama_bank: 'Bank Mandiri',
      no_rekening: '137000123456',
      pendidikan_terakhir: 'S1',
      instansi_pendidikan: 'Universitas Indonesia',
      jurusan: 'Teknik Pertambangan',
      sertifikasi: [
        {
          id: 'cert-1',
          nama: 'Pengawas Operasional Pertama (POP Minerba)',
          penerbit: 'ESDM',
          tgl_training: '2022-05-10',
          tgl_expired: '2027-05-10',
          tgl_kadaluarsa: '2027-05-10',
          file: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
          file_name: 'Sertifikat_POP_Minerba_Budi.pdf'
        },
        {
          id: 'cert-2',
          nama: 'Sertifikasi Ahli K3 Pertambangan Minerba',
          penerbit: 'BNSP - Lembaga Sertifikasi Profesi',
          tgl_training: '2023-11-20',
          tgl_expired: '2026-11-20',
          tgl_kadaluarsa: '2026-11-20',
          file: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80',
          file_name: 'Sertifikat_Ahli_K3_Minerba_Budi.pdf',
          drive_url: 'https://drive.google.com/file/d/1Budi_AhliK3_Minerba_Sample/view',
          drive_download_url: 'https://drive.google.com/uc?export=download&id=1Budi_AhliK3_Minerba_Sample'
        }
      ],
      documents: [
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      employee_id: 'EMP-1002',
      nip: 'LRS-002',
      nik: '1604152008920002',
      nama: 'Dewi Lestari, S.Si.',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '1992-08-20',
      jenis_kelamin: 'Perempuan',
      agama: 'Islam',
      status_nikah: 'Belum Menikah',
      no_hp: '081398765433',
      email: 'dewi.lestari@kso-lrstal.co.id',
      kontak_darurat: 'Andi Kusuma (Ayah) - 081322223333',
      alamat_ktp: 'Jl. Asia Afrika No. 10, Bandung',
      alamat_domisili: 'Apartemen Sudirman Park, HO Jakarta',
      jabatan: 'HSE & Environmental Superintendent',
      departemen: 'HSE & Safety',
      tgl_mulai_kerja: '2022-06-15',
      lokasi_kerja: 'Head Office Jakarta & Site Lahat',
      status_kepegawaian: 'Karyawan Tetap',
      no_ktp: '1604152008920002',
      npwp: '12.345.678.9-013.000',
      bpjs_kes: '000123456790',
      bpjs_tk: '19012345679',
      nama_bank: 'Bank Central Asia (BCA)',
      no_rekening: '128000123456',
      pendidikan_terakhir: 'S1',
      instansi_pendidikan: 'Institut Teknologi Bandung (ITB)',
      jurusan: 'Teknik Lingkungan',
      sertifikasi: [
        {
          id: 'cert-3',
          nama: 'Ahli K3 Umum Kemenaker',
          penerbit: 'Kemenaker RI',
          tgl_training: '2022-08-15',
          tgl_expired: '2027-08-15',
          tgl_kadaluarsa: '2027-08-15',
          file: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
          file_name: 'Sertifikat_AK3U_Dewi.pdf'
        },
        {
          id: 'cert-4',
          nama: 'Auditor SMK3 PP 50/2012',
          penerbit: 'BNSP',
          tgl_training: '2023-02-14',
          tgl_expired: '2028-02-14',
          tgl_kadaluarsa: '2028-02-14',
          file: '',
          file_name: ''
        }
      ],
      documents: [
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      employee_id: 'EMP-1003',
      nip: 'LRS-003',
      nik: '1604081503950003',
      nama: 'Rahmat Hidayat, A.Md.T.',
      tempat_lahir: 'Palembang',
      tanggal_lahir: '1995-03-15',
      jenis_kelamin: 'Laki-laki',
      agama: 'Islam',
      status_nikah: 'Menikah',
      no_hp: '082188764521',
      email: 'rahmat.h@kso-lrstal.co.id',
      kontak_darurat: 'Nurhaliza (Istri) - 082199887711',
      alamat_ktp: 'Jl. Kolonel Atmo No. 88, Palembang',
      alamat_domisili: 'Perumahan Griya Lahat Damai No. 14, Lahat',
      jabatan: 'Chief Heavy Equipment Mechanic',
      departemen: 'Engineering & Maintenance',
      tgl_mulai_kerja: '2023-01-10',
      lokasi_kerja: 'Workshop & Maintenance Yard',
      status_kepegawaian: 'Karyawan Kontrak (PKWT)',
      akhir_kontrak: '2026-12-31',
      no_ktp: '1604081503950003',
      npwp: '12.345.678.9-014.000',
      bpjs_kes: '000123456791',
      bpjs_tk: '19012345680',
      nama_bank: 'Bank Mandiri',
      no_rekening: '137000789012',
      pendidikan_terakhir: 'D3',
      instansi_pendidikan: 'Politeknik Negeri Sriwijaya',
      jurusan: 'Teknik Mesin Alat Berat',
      sertifikasi: [
        {
          id: 'cert-5',
          nama: 'Sertifikasi Mekanik Alat Berat Komatsu Level 2',
          penerbit: 'United Tractors',
          tgl_training: '2023-01-20',
          tgl_expired: '2027-01-20',
          tgl_kadaluarsa: '2027-01-20',
          file: '',
          file_name: ''
        },
        {
          id: 'cert-7',
          nama: 'Lisensi K3 & SIO Rigger Crane Minerba',
          penerbit: 'Kemenaker & Ditjen Minerba',
          tgl_training: '2023-10-15',
          tgl_expired: '2026-10-15',
          tgl_kadaluarsa: '2026-10-15',
          file: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
          file_name: 'SIO_Rigger_Crane_Rahmat.pdf',
          drive_url: 'https://drive.google.com/file/d/1SIO_Rigger_Crane_Sample/view',
          drive_download_url: 'https://drive.google.com/uc?export=download&id=1SIO_Rigger_Crane_Sample'
        },
        {
          id: 'cert-8',
          nama: 'SIMPER Izin Mengemudi Tambang (Unit LV & Hauler)',
          penerbit: 'HSE KSO LRS-TAL Site Lahat',
          tgl_training: '2024-12-10',
          tgl_expired: '2026-12-10',
          tgl_kadaluarsa: '2026-12-10',
          file: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80',
          file_name: 'SIMPER_Tambang_Rahmat.pdf',
          drive_url: 'https://drive.google.com/file/d/1SIMPER_Tambang_Sample/view',
          drive_download_url: 'https://drive.google.com/uc?export=download&id=1SIMPER_Tambang_Sample'
        }
      ],
      documents: [
        'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      employee_id: 'EMP-1004',
      nip: 'LRS-004',
      nik: '1604020911960004',
      nama: 'Rizky Firmansyah, S.Kom.',
      tempat_lahir: 'Lahat',
      tanggal_lahir: '1996-11-09',
      jenis_kelamin: 'Laki-laki',
      agama: 'Islam',
      status_nikah: 'Belum Menikah',
      no_hp: '085277884433',
      email: 'rizky.it@kso-lrstal.co.id',
      kontak_darurat: 'Ibu Maryam (Ibu) - 085277884400',
      alamat_ktp: 'Jl. Mayor Ruslan No. 12, Lahat',
      alamat_domisili: 'Jl. Mayor Ruslan No. 12, Lahat',
      jabatan: 'IT Infrastructure & Fleet Dispatcher',
      departemen: 'HC, Finance & GA',
      tgl_mulai_kerja: '2023-08-01',
      lokasi_kerja: 'Site Lahat',
      status_kepegawaian: 'Karyawan Tetap',
      no_ktp: '1604020911960004',
      npwp: '12.345.678.9-015.000',
      bpjs_kes: '000123456792',
      bpjs_tk: '19012345681',
      nama_bank: 'Bank Central Asia (BCA)',
      no_rekening: '128000554433',
      pendidikan_terakhir: 'S1',
      instansi_pendidikan: 'Universitas Sriwijaya',
      jurusan: 'Teknik Informatika',
      sertifikasi: [
        {
          id: 'cert-6',
          nama: 'MikroTik Certified Network Associate (MTCNA)',
          penerbit: 'MikroTik',
          tgl_training: '2023-03-30',
          tgl_expired: '2027-03-30',
          tgl_kadaluarsa: '2027-03-30',
          file: '',
          file_name: ''
        }
      ]
    }
  ],
  assets: [
    {
      asset_id: 1,
      asset_code: 'AST-AB-001',
      asset_name: 'Excavator Hydraulic PC200-8',
      category_id: 1,
      location_id: 1,
      brand: 'Komatsu',
      model_number: 'PC200-8 Hybrid Advance',
      serial_number: 'KMTPC200-89012A',
      purchase_date: '2023-01-15',
      purchase_cost: 1450000000,
      status: 'Aktif',
      photos: [
        'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
      ],
      notes: 'Unit operasional utama stripping overburden blok A'
    },
    {
      asset_id: 2,
      asset_code: 'AST-AB-002',
      asset_name: 'Bulldozer D85ESS-2',
      category_id: 1,
      location_id: 1,
      brand: 'Komatsu',
      model_number: 'D85ESS-2 Series 5',
      serial_number: 'KMTD85-778219B',
      purchase_date: '2023-03-20',
      purchase_cost: 2100000000,
      status: 'Aktif',
      photos: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80'
      ],
      notes: 'Unit dozing disposal dan perataan jalan angkut tambang'
    },
    {
      asset_id: 3,
      asset_code: 'AST-LV-001',
      asset_name: 'Toyota Hilux 2.8 4x4 Double Cabin (Site 01)',
      category_id: 2,
      location_id: 3,
      brand: 'Toyota',
      model_number: 'Hilux Double Cabin 4x4 MT',
      serial_number: 'MR0FZ22G5N1234567',
      purchase_date: '2023-05-12',
      purchase_cost: 512000000,
      status: 'Aktif',
      photos: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'
      ],
      notes: 'Kendaraan inspeksi Project Site Manager, dilengkapi tiang buggy whip & rotary lamp'
    },
    {
      asset_id: 4,
      asset_code: 'AST-SRV-001',
      asset_name: 'GPS Geodetic RTK GNSS Receiver',
      category_id: 3,
      location_id: 1,
      brand: 'Trimble',
      model_number: 'R12i GNSS System',
      serial_number: 'TRMB-GNSS-88902',
      purchase_date: '2023-09-05',
      purchase_cost: 185000000,
      status: 'Aktif',
      photos: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
      ],
      notes: 'Kalibrasi tahunan valid s.d. September 2027'
    },
    {
      asset_id: 5,
      asset_code: 'AST-IT-001',
      asset_name: 'Laptop Mobile Workstation ThinkPad P16',
      category_id: 4,
      location_id: 4,
      brand: 'Lenovo',
      model_number: 'ThinkPad P16 Gen 2 Core i9 / RTX 4000',
      serial_number: 'PF4X90112A',
      purchase_date: '2024-02-18',
      purchase_cost: 48500000,
      status: 'Aktif',
      photos: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
      ],
      notes: 'Digunakan untuk software tambang Minescape & Surpac'
    },
    {
      asset_id: 6,
      asset_code: 'AST-HSE-001',
      asset_name: 'Genset Silent 150 kVA Cummins',
      category_id: 5,
      location_id: 2,
      brand: 'Cummins',
      model_number: 'C150D5 Silent Enclosure',
      serial_number: 'CUMM-150-554421',
      purchase_date: '2022-11-10',
      purchase_cost: 320000000,
      status: 'Diperbaiki',
      photos: [
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80'
      ],
      notes: 'Sedang penggantian alternator & radiator coolant flush'
    }
  ],
  assignments: [
    {
      assignment_id: 'ASG-2026-001',
      asset_id: 3,
      employee_id: 'EMP-1001',
      assigned_date: '2023-05-15',
      condition_notes: 'Kondisi baru serah terima dealer, surat kelengkapan STNK dan APAR lengkap.',
      signed_receipt: [
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      assignment_id: 'ASG-2026-002',
      asset_id: 5,
      employee_id: 'EMP-1004',
      assigned_date: '2024-02-20',
      condition_notes: 'Laptop terinstal Windows 11 Pro asli, lisensi software fleet monitoring & antivirus.',
      signed_receipt: []
    },
    {
      assignment_id: 'ASG-2025-099',
      asset_id: 4,
      employee_id: 'EMP-1002',
      assigned_date: '2023-10-01',
      returned_date: '2024-01-15',
      condition_notes: 'Digunakan audit boundary konsesi lahan, dikembalikan dalam kondisi bersih & lengkap box pelindung.',
      signed_receipt: []
    }
  ],
  maintenances: [
    {
      maintenance_id: 'MNT-2026-001',
      asset_id: 1,
      maintenance_date: '2024-05-10',
      cost: 14500000,
      description: 'Servis berkala 1000 Hour Meter: Ganti oli engine SAE 15W-40, filter hidrolik, dan penggantian greasing track roller.',
      vendor_name: 'PT United Tractors Tbk',
      payment_receipt: [
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
      ]
    },
    {
      maintenance_id: 'MNT-2026-002',
      asset_id: 3,
      maintenance_date: '2024-06-04',
      cost: 3850000,
      description: 'Ganti kampas rem depan belakang, rotasi 4 ban M/T, tune-up diesel, dan ganti filter solar ganda.',
      vendor_name: 'Auto2000 Lahat',
      payment_receipt: []
    },
    {
      maintenance_id: 'MNT-2026-003',
      asset_id: 6,
      maintenance_date: '2024-06-25',
      cost: 7200000,
      description: 'Penggantian automatic voltage regulator (AVR), overhaul injektor silinder 3, dan cleaning fuel tank.',
      vendor_name: 'Teknik Power Prima',
      payment_receipt: []
    }
  ],
  bank_accounts: [
    {
      account_id: 'ACC-MANDIRI',
      bank_name: 'Bank Mandiri',
      account_number: '137-00-123456-7',
      account_holder: 'KSO LRS-TAL Operasional Site & Heavy Equipments',
      initial_balance: 850000000,
      color: 'amber',
      description: 'Rekening utama untuk biaya solar/BBM, pembelian sparepart, dan logistik lapangan site Lahat'
    },
    {
      account_id: 'ACC-BCA',
      bank_name: 'Bank Central Asia (BCA)',
      account_number: '128-09-87654-3',
      account_holder: 'KSO LRS-TAL Holding & Payroll',
      initial_balance: 1450000000,
      color: 'blue',
      description: 'Rekening utama penggajian karyawan, penerimaan termyn klien, dan perpajakan'
    },
    {
      account_id: 'ACC-BNI',
      bank_name: 'Bank BNI',
      account_number: '089-22-33445-5',
      account_holder: 'KSO LRS-TAL Kas Kecil (Petty Cash)',
      initial_balance: 95000000,
      color: 'emerald',
      description: 'Dana operasional darurat harian, konsumsi basecamp mess, dan keperluan taktis site'
    }
  ],
  finance_transactions: [
    {
      transaction_id: 'TRX-IN-2026-001',
      type: 'MASUK',
      date: '2026-06-01',
      account_id: 'ACC-BCA',
      party_name: 'PT Bukit Asam Tbk (Klien Utama)',
      description: 'Pencairan Pembayaran Invoice Termyn V - Proyek Pengupasan Overburden Bulan Mei 2026',
      amount: 450000000,
      admin_fee: 6500,
      total_amount: 449993500,
      documents: [
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80'
      ],
      created_by: 'Super Admin',
      created_at: '2026-06-01T09:30:00Z'
    },
    {
      transaction_id: 'TRX-OUT-2026-001',
      type: 'KELUAR',
      date: '2026-06-05',
      account_id: 'ACC-MANDIRI',
      party_name: 'PT Pertamina Patra Niaga',
      description: 'Pembelian Bahan Bakar Solar Industri (Biosolar B35) 16.000 Liter untuk Armada Alat Berat',
      amount: 198000000,
      admin_fee: 2500,
      total_amount: 198002500,
      documents: [
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
      ],
      created_by: 'Admin Finance',
      created_at: '2026-06-05T14:15:00Z'
    },
    {
      transaction_id: 'TRX-OUT-2026-002',
      type: 'KELUAR',
      date: '2026-06-12',
      account_id: 'ACC-BNI',
      party_name: 'UD Sumber Berkah Lahat',
      description: 'Belanja Logistik Dapur & Konsumsi Karyawan Basecamp Site Lahat Periode I',
      amount: 14500000,
      admin_fee: 0,
      total_amount: 14500000,
      documents: [
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
      ],
      created_by: 'Admin Finance',
      created_at: '2026-06-12T11:00:00Z'
    },
    {
      transaction_id: 'TRX-IN-2026-002',
      type: 'MASUK',
      date: '2026-06-15',
      account_id: 'ACC-MANDIRI',
      party_name: 'PT Lematang Riau Sinergi (Holding)',
      description: 'Injeksi Modal Kerja Tambahan untuk Peremajaan Sparepart Excavator & Dump Truck',
      amount: 250000000,
      admin_fee: 2500,
      total_amount: 249997500,
      documents: [],
      created_by: 'Super Admin',
      created_at: '2026-06-15T08:45:00Z'
    },
    {
      transaction_id: 'TRX-OUT-2026-003',
      type: 'KELUAR',
      date: '2026-06-20',
      account_id: 'ACC-MANDIRI',
      party_name: 'PT United Tractors Tbk',
      description: 'Pembayaran Servis Berkala 1000 HM Excavator PC200-8 & Penggantian Filter Hidrolik',
      amount: 14500000,
      admin_fee: 6500,
      total_amount: 14506500,
      documents: [
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
      ],
      created_by: 'Admin Finance',
      created_at: '2026-06-20T16:20:00Z'
    }
  ]
};
