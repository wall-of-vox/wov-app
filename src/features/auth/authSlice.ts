import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  tempToken?: string | null;
  requires2FA?: boolean;
  reauthToken?: string | null;
}

const initialState: AuthState = {
  token: null,
  isLoggedIn: false,
  tempToken: null,
  requires2FA: false,
  reauthToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.token = null;
      state.isLoggedIn = false;
      state.tempToken = null;
      state.requires2FA = false;
      state.reauthToken = null;
    },
    setTwoFAState(state, action: PayloadAction<{ tempToken?: string | null; requires2FA?: boolean }>) {
      state.tempToken = action.payload.tempToken ?? null;
      state.requires2FA = !!action.payload.requires2FA;
    },
    setReauthToken(state, action: PayloadAction<string | null>) {
      state.reauthToken = action.payload ?? null;
    },
  },
});

export const { setToken, logout, setTwoFAState, setReauthToken } = authSlice.actions;
export default authSlice.reducer;
