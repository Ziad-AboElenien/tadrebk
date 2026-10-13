import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Company } from '@/features/company/types';
import { LS_COMPANY_ID } from '@/lib/constants';

interface CompanyState {
  currentCompany: Company | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  /** Effective permission keys inside currentCompany (owner = all 26). */
  permissions: string[];
  /** Human role name inside currentCompany (e.g. "Marketing Lead"). */
  staffRoleName: string | null;
  /** Which company the permissions above belong to. */
  permissionsFor: string | null;
  /** True once permissions were resolved (login/hydrate), false while unknown. */
  permissionsReady: boolean;
}

const initialState: CompanyState = {
  currentCompany: null,
  status: 'idle',
  error: null,
  permissions: [],
  staffRoleName: null,
  permissionsFor: null,
  permissionsReady: false,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompany(state, action: PayloadAction<Company>) {
      state.currentCompany = action.payload;
      state.status = 'succeeded';
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_COMPANY_ID, action.payload._id);
      }
    },
    updateCompany(state, action: PayloadAction<Partial<Company>>) {
      if (state.currentCompany) {
        state.currentCompany = { ...state.currentCompany, ...action.payload };
      }
    },
    clearCompany(state) {
      state.currentCompany = null;
      state.status = 'idle';
      state.error = null;
      state.permissions = [];
      state.staffRoleName = null;
      state.permissionsFor = null;
      state.permissionsReady = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LS_COMPANY_ID);
      }
    },
    setPermissions(
      state,
      action: PayloadAction<{ companyId: string; permissions: string[]; roleName?: string | null }>,
    ) {
      state.permissions = action.payload.permissions;
      state.staffRoleName = action.payload.roleName ?? null;
      state.permissionsFor = action.payload.companyId;
      state.permissionsReady = true;
    },
    setCompanyStatus(state, action: PayloadAction<CompanyState['status']>) {
      state.status = action.payload;
    },
    setCompanyError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setCompany,
  updateCompany,
  clearCompany,
  setPermissions,
  setCompanyStatus,
  setCompanyError,
} = companySlice.actions;
export default companySlice.reducer;
