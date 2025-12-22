import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "@/utils/constants";
import type { RootState } from "./store";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.AUTH_BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      const reauthToken = (state as any)?.auth?.reauthToken ?? null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      if (reauthToken) {
        headers.set("X-Reauth-Token", String(reauthToken));
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Follow", "Auth"],
  endpoints: () => ({}),
});
