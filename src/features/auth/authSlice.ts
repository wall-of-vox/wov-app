import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  tempToken?: string | null;
  requires2FA?: boolean;
}

const initialState: AuthState = {
  token: null,
  isLoggedIn: false,
  tempToken: null,
  requires2FA: false,
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
    },
    setTwoFAState(state, action: PayloadAction<{ tempToken?: string | null; requires2FA?: boolean }>) {
      state.tempToken = action.payload.tempToken ?? null;
      state.requires2FA = !!action.payload.requires2FA;
    },
  },
});

export const { setToken, logout, setTwoFAState } = authSlice.actions;
export default authSlice.reducer;
