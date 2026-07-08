import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/features/student/types';
import { LS_PROFILE_PICTURE, LS_COVER_PICTURE } from '@/lib/constants';

interface UserState {
  currentUser: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

function loadImages(): { profilePicture?: string; coverPicture?: string } {
  if (typeof window === 'undefined') return {};
  const result: { profilePicture?: string; coverPicture?: string } = {};
  const pp = localStorage.getItem(LS_PROFILE_PICTURE);
  const cp = localStorage.getItem(LS_COVER_PICTURE);
  if (pp) result.profilePicture = pp;
  if (cp) result.coverPicture = cp;
  return result;
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
      const user = action.payload;
      const ls = loadImages();
      if (!user.profilePicture && ls.profilePicture) user.profilePicture = ls.profilePicture;
      if (!user.coverPicture && ls.coverPicture) user.coverPicture = ls.coverPicture;
      state.currentUser = user;
      state.status = 'succeeded';
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        if (typeof window !== 'undefined') {
          if (action.payload.profilePicture) localStorage.setItem(LS_PROFILE_PICTURE, action.payload.profilePicture as string);
          if (action.payload.coverPicture) localStorage.setItem(LS_COVER_PICTURE, action.payload.coverPicture as string);
        }
      }
    },
    clearUser(state) {
      state.currentUser = null;
      state.status = 'idle';
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LS_PROFILE_PICTURE);
        localStorage.removeItem(LS_COVER_PICTURE);
      }
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
