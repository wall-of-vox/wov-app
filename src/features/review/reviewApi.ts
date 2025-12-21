import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SERVICES } from "@/utils/constants";
import type { RootState } from "@/lib/redux/store";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVICES.REVIEW_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    getReviews: builder.query<{ items: Array<{ id: string; text: string }> }, { userId: string }>({
      query: ({ userId }) => ({ url: `/users/${userId}/reviews` }),
      providesTags: ["Review"],
    }),
  }),
});

export const { useGetReviewsQuery } = reviewApi;

