import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Internship, InternshipsFilters } from '@/features/internship/types';

interface InternshipState {
  list: Internship[];
  selectedInternship: Internship | null;
  filters: InternshipsFilters;
  total: number;
  currentPage: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InternshipState = {
  list: [],
  selectedInternship: null,
  filters: { page: 1, limit: 9 },
  total: 0,
  currentPage: 1,
  status: 'idle',
  error: null,
};

const internshipSlice = createSlice({
  name: 'internship',
  initialState,
  reducers: {
    setInternships(
      state,
      action: PayloadAction<{ data: Internship[]; total: number }>,
    ) {
      state.list = action.payload.data;
      state.total = action.payload.total;
      state.status = 'succeeded';
    },
    setSelectedInternship(state, action: PayloadAction<Internship | null>) {
      state.selectedInternship = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<InternshipsFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = { page: 1, limit: 9 };
    },
    setPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
      state.filters.page = action.payload;
    },
    setInternshipStatus(
      state,
      action: PayloadAction<InternshipState['status']>,
    ) {
      state.status = action.payload;
    },
    setInternshipError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setInternships,
  setSelectedInternship,
  setFilters,
  resetFilters,
  setPage,
  setInternshipStatus,
  setInternshipError,
} = internshipSlice.actions;
export default internshipSlice.reducer;
