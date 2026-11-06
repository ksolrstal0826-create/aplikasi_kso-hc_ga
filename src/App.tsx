import React, { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  ActiveTab,
  UserRole,
  Employee,
  Asset,
  AssetAssignment,
  AssetMaintenance,
  Category,
  Location,
  CompanySettings,
  FinanceTransaction,
  BankAccount
} from './types';
import {
  loadAppState,
  saveAppState,
  resetAppState,
  exportAppStateToFile,
  getSavedRole,
  saveRole,
  clearRole
} from './utils/storage';
import {
  initGoogleAuth,
  signInWithGoogle,
  signOutGoogle,
  getAccessToken,
  findOrCreateDatabaseSpreadsheet,
  syncAllToGoogleSheets,
  fetchAllFromGoogleSheets,
  getCurrentGoogleUser
} from './utils/googleWorkspace';
import { ToastProvider, useToast } from './components/Toast';
import { LoginModal } from './components/LoginModal';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { KaryawanView } from './components/KaryawanView';
import { MasterDataView } from './components/MasterDataView';
import { AsetView } from './components/AsetView';
import { PeminjamanView } from './components/PeminjamanView';
import { PemeliharaanView } from './components/PemeliharaanView';
import { FinanceView } from './components/FinanceView';
import { SettingsView } from './components/SettingsView';
import {
  EmployeePrintModal,
  AssetPrintModal,
  HandoverPrintModal,
  MaintenancePrintModal
} from './components/PrintModals';

function MainApp() {
  const { success, info, warning, error } = useToast();

  // App Data & Session States
  const [data, setData] = useState<AppState>(loadAppState);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(() => {
    const saved = getSavedRole();
    if (saved === 'Super Admin' || saved === 'Admin HC' || saved === 'Admin GA' || saved === 'Admin Finance') {
      return saved;
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Google Workspace States
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string>('');
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<{ id: string; url: string } | null>(() => {
    try {
      const saved = localStorage.getItem('kso_lrstal_sheets_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal Open Triggers
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [isAddFinanceOpen, setIsAddFinanceOpen] = useState(false);

  // Printable Document Modals
  const [printEmployee, setPrintEmployee] = useState<Employee | null>(null);
  const [printAsset, setPrintAsset] = useState<Asset | null>(null);
  const [printAssignment, setPrintAssignment] = useState<AssetAssignment | null>(null);
  const [printMaintenance, setPrintMaintenance] = useState<AssetMaintenance | null>(null);

  // Initialize Google Auth
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setIsGoogleConnected(true);
        setGoogleUserEmail(user.email || '');
      },
      () => {
        setIsGoogleConnected(false);
        setGoogleUserEmail('');
      }
    );
    return () => unsubscribe();
  }, []);

  // Persist data updates to localStorage
  const updateData = (updater: (prev: AppState) => AppState) => {
    setData((prev) => {
      const next = updater(prev);
      saveAppState(next);
      return next;
    });
  };

  // Google Connect & Auto-Sync
  const handleConnectGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res) {
        setIsGoogleConnected(true);
        setGoogleUserEmail(res.user.email || '');
        success('Terhubung ke Google Workspace', `Akun ${res.user.email} aktif.`);

        // Find or create database spreadsheet
        setIsSyncing(true);
        info('Menyiapkan Spreadsheet', 'Membuat atau menghubungkan spreadsheet database...');
        const sheet = await findOrCreateDatabaseSpreadsheet(res.accessToken);
        setSpreadsheetInfo(sheet);
        localStorage.setItem('kso_lrstal_sheets_info', JSON.stringify(sheet));

        // Sync current state to Sheets
        await syncAllToGoogleSheets(res.accessToken, sheet.id, data);
        setIsSyncing(false);
        success('Sinkronisasi Berhasil', 'Database lokal tersinkronisasi ke Google Sheets!');
      }
    } catch (err: any) {
      setIsSyncing(false);
      console.error('Failed to connect Google Workspace:', err);
      error('Koneksi Gagal', err.message || 'Gagal login ke akun Google.');
    }
  };

  const handleDisconnectGoogle = async () => {
    await signOutGoogle();
    setIsGoogleConnected(false);
    setGoogleUserEmail('');
    info('Koneksi Diputus', 'Akun Google Workspace telah diputuskan.');
  };

  const handlePushToSheets = async () => {
    const token = await getAccessToken();
    if (!token) {
      handleConnectGoogle();
      return;
    }

    try {
      setIsSyncing(true);
      info('Mengunggah Data', 'Menyimpan rekaman ke Google Sheets...');
      let sheet = spreadsheetInfo;
      if (!sheet) {
        sheet = await findOrCreateDatabaseSpreadsheet(token);
        setSpreadsheetInfo(sheet);
        localStorage.setItem('kso_lrstal_sheets_info', JSON.stringify(sheet));
      }
      await syncAllToGoogleSheets(token, sheet.id, data);
      setIsSyncing(false);
      success('Sinkronisasi Sukses', 'Seluruh data HC & GA telah tersimpan di Google Sheets!');
    } catch (err: any) {
      setIsSyncing(false);
      console.error('Error syncing to sheets:', err);
      error('Gagal Sinkronisasi', err.message || 'Terjadi kesalahan saat mengunggah data.');
    }
  };

  const handlePullFromSheets = async () => {
    const token = await getAccessToken();
    if (!token) {
      handleConnectGoogle();
      return;
    }

    try {
      setIsSyncing(true);
      info('Mengambil Data', 'Membaca data terbaru dari Google Sheets...');
      let sheet = spreadsheetInfo;
      if (!sheet) {
        sheet = await findOrCreateDatabaseSpreadsheet(token);
        setSpreadsheetInfo(sheet);
        localStorage.setItem('kso_lrstal_sheets_info', JSON.stringify(sheet));
      }
      const remoteState = await fetchAllFromGoogleSheets(token, sheet.id);
      setIsSyncing(false);
      if (remoteState && (remoteState.employees.length > 0 || remoteState.assets.length > 0)) {
        setData(remoteState);
        saveAppState(remoteState);
        success('Data Diperbarui', 'Berhasil memuat data dari Google Sheets!');
      } else {
        info('Sheet Kosong', 'Data di Google Sheets masih kosong atau dalam format awal.');
      }
    } catch (err: any) {
      setIsSyncing(false);
      console.error('Error pulling from sheets:', err);
      error('Gagal Mengambil Data', err.message || 'Terjadi kesalahan saat membaca data.');
    }
  };

  // Login handler
  const handleLogin = (role: UserRole) => {
    setCurrentUserRole(role);
    saveRole(role);
    if (role === 'Admin Finance') {
      setActiveTab('finance');
    } else {
      setActiveTab('dashboard');
    }
    success(`Berhasil Masuk Sistem`, `Selamat datang sebagai ${role}.`);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUserRole(null);
    clearRole();
    info('Sesi Ditutup', 'Anda telah keluar dari sistem.');
  };

  // Switch role handler (demo / simulation)
  const handleChangeRole = (role: UserRole) => {
    setCurrentUserRole(role);
    saveRole(role);

    // If active tab is not allowed for the new role, switch cleanly
    if (role === 'Admin HC' && ['master', 'aset', 'peminjaman', 'pemeliharaan', 'finance', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (role === 'Admin GA' && ['karyawan', 'finance', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (role === 'Admin Finance' && ['karyawan', 'master', 'aset', 'peminjaman', 'pemeliharaan', 'settings'].includes(activeTab)) {
      setActiveTab('finance');
    }

    info('Hak Akses Diperbarui', `Mode akses beralih ke ${role}.`);
  };

  // Employees CRUD
  const handleSaveEmployee = (emp: Employee) => {
    updateData((prev) => {
      const idx = prev.employees.findIndex((e) => e.employee_id === emp.employee_id);
      if (idx >= 0) {
        const updated = [...prev.employees];
        updated[idx] = emp;
        return { ...prev, employees: updated };
      }
      return { ...prev, employees: [emp, ...prev.employees] };
    });
    success('Karyawan Disimpan', `Data untuk ${emp.nama} (${emp.nip}) berhasil disimpan.`);
  };

  const handleDeleteEmployee = (id: string) => {
    updateData((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.employee_id !== id)
    }));
    warning('Karyawan Dihapus', 'Data karyawan telah dihapus dari sistem.');
  };

  // Category CRUD
  const handleSaveCategory = (cat: Category) => {
    updateData((prev) => {
      const idx = prev.categories.findIndex((c) => String(c.category_id) === String(cat.category_id));
      if (idx >= 0) {
        const updated = [...prev.categories];
        updated[idx] = cat;
        return { ...prev, categories: updated };
      }
      return { ...prev, categories: [...prev.categories, cat] };
    });
    success('Kategori Disimpan', `Kategori ${cat.category_name} berhasil disimpan.`);
  };

  const handleDeleteCategory = (id: number | string) => {
    updateData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => String(c.category_id) !== String(id))
    }));
    info('Kategori Dihapus', 'Kategori aset berhasil dihapus.');
  };

  // Location CRUD
  const handleSaveLocation = (loc: Location) => {
    updateData((prev) => {
      const idx = prev.locations.findIndex((l) => String(l.location_id) === String(loc.location_id));
      if (idx >= 0) {
        const updated = [...prev.locations];
        updated[idx] = loc;
        return { ...prev, locations: updated };
      }
      return { ...prev, locations: [...prev.locations, loc] };
    });
    success('Lokasi Disimpan', `Lokasi ${loc.location_name} berhasil disimpan.`);
  };

  const handleDeleteLocation = (id: number | string) => {
    updateData((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => String(l.location_id) !== String(id))
    }));
    info('Lokasi Dihapus', 'Lokasi operasional berhasil dihapus.');
  };

  // Assets CRUD
  const handleSaveAsset = (asset: Asset) => {
    updateData((prev) => {
      const idx = prev.assets.findIndex((a) => String(a.asset_id) === String(asset.asset_id));
      if (idx >= 0) {
        const updated = [...prev.assets];
        updated[idx] = asset;
        return { ...prev, assets: updated };
      }
      return { ...prev, assets: [asset, ...prev.assets] };
    });
    success('Aset Disimpan', `Unit ${asset.asset_name} (${asset.asset_code}) berhasil disimpan.`);
  };

  const handleDeleteAsset = (id: number | string) => {
    updateData((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => String(a.asset_id) !== String(id))
    }));
    warning('Aset Dihapus', 'Catatan aset telah dihapus.');
  };

  // Handover / Assignments CRUD
  const handleSaveAssignment = (asg: AssetAssignment) => {
    updateData((prev) => {
      const idx = prev.assignments.findIndex((a) => a.assignment_id === asg.assignment_id);
      if (idx >= 0) {
        const updated = [...prev.assignments];
        updated[idx] = asg;
        return { ...prev, assignments: updated };
      }
      return { ...prev, assignments: [asg, ...prev.assignments] };
    });
    success('Penyerahan Disimpan', `Berita Acara ${asg.assignment_id} berhasil disimpan.`);
  };

  const handleReturnAssignment = (assignmentId: string, returnedDate: string, notes?: string) => {
    updateData((prev) => {
      const updated = prev.assignments.map((a) => {
        if (a.assignment_id === assignmentId) {
          return {
            ...a,
            returned_date: returnedDate,
            condition_notes: notes ? `${a.condition_notes ? a.condition_notes + ' | ' : ''}Kembali: ${notes}` : a.condition_notes
          };
        }
        return a;
      });
      return { ...prev, assignments: updated };
    });
    success('Pengembalian Diterima', `Aset telah berhasil ditandai kembali ke gudang.`);
  };

  const handleDeleteAssignment = (id: string) => {
    updateData((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.assignment_id !== id)
    }));
    info('Transaksi Dihapus', 'Catatan penyerahan telah dihapus.');
  };

  // Maintenances CRUD
  const handleSaveMaintenance = (m: AssetMaintenance) => {
    updateData((prev) => {
      const idx = prev.maintenances.findIndex((item) => item.maintenance_id === m.maintenance_id);
      if (idx >= 0) {
        const updated = [...prev.maintenances];
        updated[idx] = m;
        return { ...prev, maintenances: updated };
      }
      return { ...prev, maintenances: [m, ...prev.maintenances] };
    });
    success('Servis Disimpan', `Log servis ${m.maintenance_id} berhasil disimpan.`);
  };

  const handleDeleteMaintenance = (id: string) => {
    updateData((prev) => ({
      ...prev,
      maintenances: prev.maintenances.filter((m) => m.maintenance_id !== id)
    }));
    info('Log Servis Dihapus', 'Riwayat perbaikan telah dihapus.');
  };

  // Finance Transactions & Bank Accounts CRUD
  const handleSaveTransaction = (transaction: FinanceTransaction) => {
    updateData((prev) => {
      const txs = prev.finance_transactions || [];
      const idx = txs.findIndex((t) => String(t.transaction_id) === String(transaction.transaction_id));
      let updated: FinanceTransaction[];
      if (idx >= 0) {
        updated = [...txs];
        updated[idx] = transaction;
      } else {
        updated = [transaction, ...txs];
      }
      return {
        ...prev,
        finance_transactions: updated
      };
    });
    success('Transaksi Disimpan', `Transaksi kas ${transaction.type} sebesar Rp ${Number(transaction.amount).toLocaleString('id-ID')} berhasil dicatat.`);
  };

  const handleDeleteTransaction = (id: string) => {
    if (currentUserRole !== 'Super Admin') {
      error('Akses Dibatasi', 'Hanya Super Admin yang berhak menghapus rekaman transaksi.');
      return;
    }
    updateData((prev) => ({
      ...prev,
      finance_transactions: (prev.finance_transactions || []).filter((t) => String(t.transaction_id) !== String(id))
    }));
    warning('Transaksi Dihapus', 'Rekaman transaksi keuangan telah dihapus.');
  };

  const handleSaveBankAccount = (account: BankAccount) => {
    updateData((prev) => {
      const accounts = (prev.bank_accounts || []).map((b) =>
        String(b.account_id) === String(account.account_id) ? account : b
      );
      return {
        ...prev,
        bank_accounts: accounts
      };
    });
    success('Rekening Disimpan', `Informasi rekening ${account.bank_name} telah diperbarui.`);
  };

  // Company Settings
  const handleSaveSettings = (newSettings: CompanySettings) => {
    updateData((prev) => ({
      ...prev,
      settings: newSettings
    }));
    success('Pengaturan Disimpan', 'Profil perusahaan & kop surat diperbarui.');
  };

  // Export & Import & Reset
  const handleExportData = () => {
    exportAppStateToFile(data);
    info('Data Diekspor', 'File JSON cadangan telah diunduh.');
  };

  const handleImportData = (imported: AppState) => {
    setData(imported);
    saveAppState(imported);
    success('Data Dipulihkan', 'Database telah diperbarui dari file cadangan.');
  };

  const handleResetData = () => {
    const defaultData = resetAppState();
    setData(defaultData);
    warning('Database Direset', 'Semua data telah dikembalikan ke pengaturan awal pabrik.');
  };

  // Counts for sidebar badges
  const activeLoans = data.assignments.filter((a) => !a.returned_date).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Login Screen Overlay when unauthenticated */}
      {!currentUserRole && (
        <LoginModal
          onLogin={handleLogin}
          companyName={data.settings.company_name || 'KSO LRS-TAL'}
        />
      )}

      {/* Main Layout */}
      {currentUserRole && (
        <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentUserRole={currentUserRole}
            onLogout={handleLogout}
            companyName={data.settings.company_name}
            isOpenMobile={isSidebarOpenMobile}
            onCloseMobile={() => setIsSidebarOpenMobile(false)}
            employeeCount={data.employees.length}
            assetCount={data.assets.length}
            activeLoanCount={activeLoans}
            maintenanceCount={data.maintenances.length}
          />

          {/* Right Main Body */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Topbar */}
            <Navbar
              onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
              currentUserRole={currentUserRole}
              onChangeRole={handleChangeRole}
              companyName={data.settings.company_name}
              activeTab={activeTab}
              onRefresh={() => {
                setData(loadAppState());
                info('Data Disegarkan', 'Penyimpanan lokal telah dimuat ulang.');
              }}
              onExport={handleExportData}
              isGoogleConnected={isGoogleConnected}
              googleUserEmail={googleUserEmail}
              spreadsheetUrl={spreadsheetInfo?.url}
              isSyncing={isSyncing}
              onConnectGoogle={handleConnectGoogle}
              onSyncGoogleSheets={handlePushToSheets}
            />

            {/* Views Content */}
            <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
              {activeTab === 'dashboard' && (
                <DashboardView
                  data={data}
                  onNavigate={setActiveTab}
                  currentUserRole={currentUserRole}
                  onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
                  onOpenAddAsset={() => setIsAddAssetOpen(true)}
                  onOpenAddAssignment={() => setIsAddAssignmentOpen(true)}
                  onOpenAddMaintenance={() => setIsAddMaintenanceOpen(true)}
                />
              )}

              {activeTab === 'karyawan' && (
                <KaryawanView
                  employees={data.employees}
                  onSaveEmployee={handleSaveEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                  onViewEmployee={(emp) => setPrintEmployee(emp)}
                  isAddModalOpen={isAddEmployeeOpen}
                  onCloseAddModal={() => setIsAddEmployeeOpen(false)}
                  onOpenAddModal={() => setIsAddEmployeeOpen(true)}
                />
              )}

              {activeTab === 'master' && (
                <MasterDataView
                  categories={data.categories}
                  locations={data.locations}
                  assets={data.assets}
                  onSaveCategory={handleSaveCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onSaveLocation={handleSaveLocation}
                  onDeleteLocation={handleDeleteLocation}
                />
              )}

              {activeTab === 'aset' && (
                <AsetView
                  assets={data.assets}
                  categories={data.categories}
                  locations={data.locations}
                  assignments={data.assignments}
                  employees={data.employees}
                  onSaveAsset={handleSaveAsset}
                  onDeleteAsset={handleDeleteAsset}
                  onViewAsset={(ast) => setPrintAsset(ast)}
                  isAddModalOpen={isAddAssetOpen}
                  onCloseAddModal={() => setIsAddAssetOpen(false)}
                  onOpenAddModal={() => setIsAddAssetOpen(true)}
                />
              )}

              {activeTab === 'peminjaman' && (
                <PeminjamanView
                  assignments={data.assignments}
                  assets={data.assets}
                  employees={data.employees}
                  onSaveAssignment={handleSaveAssignment}
                  onReturnAssignment={handleReturnAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                  onPrintReceipt={(asg) => setPrintAssignment(asg)}
                  isAddModalOpen={isAddAssignmentOpen}
                  onCloseAddModal={() => setIsAddAssignmentOpen(false)}
                  onOpenAddModal={() => setIsAddAssignmentOpen(true)}
                />
              )}

              {activeTab === 'pemeliharaan' && (
                <PemeliharaanView
                  maintenances={data.maintenances}
                  assets={data.assets}
                  onSaveMaintenance={handleSaveMaintenance}
                  onDeleteMaintenance={handleDeleteMaintenance}
                  onPrintMaintenance={(m) => setPrintMaintenance(m)}
                  isAddModalOpen={isAddMaintenanceOpen}
                  onCloseAddModal={() => setIsAddMaintenanceOpen(false)}
                  onOpenAddModal={() => setIsAddMaintenanceOpen(true)}
                />
              )}

              {activeTab === 'finance' && (
                <FinanceView
                  bankAccounts={data.bank_accounts || []}
                  transactions={data.finance_transactions || []}
                  currentUserRole={currentUserRole}
                  onSaveTransaction={handleSaveTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onSaveBankAccount={handleSaveBankAccount}
                  isAddModalOpen={isAddFinanceOpen}
                  onCloseAddModal={() => setIsAddFinanceOpen(false)}
                  onOpenAddModal={() => setIsAddFinanceOpen(true)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={data.settings}
                  onSaveSettings={handleSaveSettings}
                  onExportData={handleExportData}
                  onImportData={handleImportData}
                  onResetData={handleResetData}
                  isGoogleConnected={isGoogleConnected}
                  googleUserEmail={googleUserEmail}
                  spreadsheetUrl={spreadsheetInfo?.url}
                  isSyncing={isSyncing}
                  onConnectGoogle={handleConnectGoogle}
                  onDisconnectGoogle={handleDisconnectGoogle}
                  onPushToSheets={handlePushToSheets}
                  onPullFromSheets={handlePullFromSheets}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL MODALS */}
      {printEmployee && (
        <EmployeePrintModal
          employee={printEmployee}
          settings={data.settings}
          onClose={() => setPrintEmployee(null)}
        />
      )}

      {printAsset && (
        <AssetPrintModal
          asset={printAsset}
          category={data.categories.find((c) => String(c.category_id) === String(printAsset.category_id))}
          location={data.locations.find((l) => String(l.location_id) === String(printAsset.location_id))}
          settings={data.settings}
          currentHolder={(() => {
            const activeAsg = data.assignments.find((a) => String(a.asset_id) === String(printAsset.asset_id) && !a.returned_date);
            if (!activeAsg) return null;
            return data.employees.find((e) => String(e.employee_id) === String(activeAsg.employee_id)) || null;
          })()}
          onClose={() => setPrintAsset(null)}
        />
      )}

      {printAssignment && (
        <HandoverPrintModal
          assignment={printAssignment}
          asset={data.assets.find((a) => String(a.asset_id) === String(printAssignment.asset_id)) || null}
          employee={data.employees.find((e) => String(e.employee_id) === String(printAssignment.employee_id)) || null}
          settings={data.settings}
          onClose={() => setPrintAssignment(null)}
        />
      )}

      {printMaintenance && (
        <MaintenancePrintModal
          maintenance={printMaintenance}
          asset={data.assets.find((a) => String(a.asset_id) === String(printMaintenance.asset_id)) || null}
          settings={data.settings}
          onClose={() => setPrintMaintenance(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
