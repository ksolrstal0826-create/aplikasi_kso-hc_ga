import { AppState } from '../types';
import { initialData } from '../data/initialData';

const STORAGE_KEY = 'kso_lrstal_app_state_v4';
const ROLE_KEY = 'kso_lrstal_user_role';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialData;
    const parsed = JSON.parse(raw);
    return {
      employees: Array.isArray(parsed.employees) ? parsed.employees : initialData.employees,
      categories: Array.isArray(parsed.categories) ? parsed.categories : initialData.categories,
      locations: Array.isArray(parsed.locations) ? parsed.locations : initialData.locations,
      assets: Array.isArray(parsed.assets) ? parsed.assets : initialData.assets,
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : initialData.assignments,
      maintenances: Array.isArray(parsed.maintenances) ? parsed.maintenances : initialData.maintenances,
      bank_accounts: Array.isArray(parsed.bank_accounts) && parsed.bank_accounts.length > 0 ? parsed.bank_accounts : initialData.bank_accounts,
      finance_transactions: Array.isArray(parsed.finance_transactions) ? parsed.finance_transactions : initialData.finance_transactions,
      settings: parsed.settings ? { ...initialData.settings, ...parsed.settings } : initialData.settings
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return initialData;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetAppState(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  return initialData;
}

export function exportAppStateToFile(state: AppState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KSO-LRS-TAL-Backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getSavedRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function saveRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function clearRole(): void {
  localStorage.removeItem(ROLE_KEY);
}
