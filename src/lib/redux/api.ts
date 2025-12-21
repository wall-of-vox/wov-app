import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.example.com",
    prepareHeaders: (headers, { getState }) => {
      // Add token later if needed
      return headers;
    },
  }),
  tagTypes: ["User", "Follow", "Auth"],
  endpoints: () => ({}),
});
