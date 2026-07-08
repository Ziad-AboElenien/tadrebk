import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/features/student/types';

interface UserState {
  currentUser: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  status: 'idle',
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.status = 'succeeded';
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    clearUser(state) {
      state.currentUser = null;
      state.status = 'idle';
      state.error = null;
    },
    setUserStatus(state, action: PayloadAction<UserState['status']>) {
      state.status = action.payload;
    },
    setUserError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setUser, updateUser, clearUser, setUserStatus, setUserError } =
  userSlice.actions;
export default userSlice.reducer;
