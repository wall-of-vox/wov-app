import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SERVICES } from "@/utils/constants";
import type { RootState } from "@/lib/redux/store";

export const followApi = createApi({
  reducerPath: "followApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVICES.FOLLOW_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Follow"],
  endpoints: (builder) => ({
    getFollowers: builder.query<{ count: number }, { userId: string }>({
      query: ({ userId }) => ({ url: `/users/${userId}/followers` }),
      providesTags: ["Follow"],
    }),
  }),
});

export const { useGetFollowersQuery } = followApi;

