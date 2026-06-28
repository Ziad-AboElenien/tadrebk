import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Company } from '@/types/company';
import { LS_COMPANY_ID } from '@/lib/constants';

interface CompanyState {
  currentCompany: Company | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CompanyState = {
  currentCompany: null,
  status: 'idle',
  error: null,
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LS_COMPANY_ID);
      }
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
  setCompanyStatus,
  setCompanyError,
} = companySlice.actions;
export default companySlice.reducer;
