import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BillingState {
  credits: number;
  creditsLoading: boolean;
}

const initialState: BillingState = {
  credits: 0,
  creditsLoading: false,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setCredits(state, action: PayloadAction<number>) {
      state.credits = action.payload;
      state.creditsLoading = false;
    },
    setCreditsLoading(state, action: PayloadAction<boolean>) {
      state.creditsLoading = action.payload;
    },
    clearBilling(state) {
      state.credits = 0;
      state.creditsLoading = false;
    },
  },
});

export const { setCredits, setCreditsLoading, clearBilling } = billingSlice.actions;
export default billingSlice.reducer;
