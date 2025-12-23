import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SERVICES } from "@/utils/constants";
import type { RootState } from "@/lib/redux/store";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${SERVICES.REVIEW_BASE_URL}/api`,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("accept", "application/json");
      if (endpoint !== "uploadReviewAttachments") {
        headers.set("content-type", "application/json");
      } else {
        headers.delete("content-type");
      }
      return headers;
    },
  }),
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    getReviewsByUserId: builder.query<any, { userId?: string; page?: number; limit?: number; loggedInUserId?: string } | void>({
      query: (params) => ({
        url: `reviews/users/${params?.userId}`,
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          loggedInUserId: params?.loggedInUserId,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["Review"],
    }),
    createReview: builder.mutation<any, any>({
      query: (payload) => ({ url: `reviews`, method: "POST", body: payload }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["Review"],
    }),
    updateReview: builder.mutation<any, { id: string; rating?: number; comment?: string; isRecommended?: boolean }>({
      query: ({ id, ...payload }) => ({ url: `reviews/${id}`, method: "PUT", body: payload }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["Review"],
    }),
    deleteReview: builder.mutation<{ success: boolean; message: string }, { id: string }>({
      query: ({ id }) => ({ url: `reviews/${id}`, method: "DELETE" }),
      transformResponse: (response: { success: boolean; message: string }) => response,
      invalidatesTags: ["Review"],
    }),
    likeReview: builder.mutation<any, { reviewId: string; type: 1 | -1 }>({
      query: ({ reviewId, type }) => ({ url: `reviews/${reviewId}/like`, method: "POST", body: { type } }),
      transformResponse: (response: any) => response,
    }),
    removeReviewLike: builder.mutation<any, { reviewId: string }>({
      query: ({ reviewId }) => ({ url: `reviews/${reviewId}/like`, method: "DELETE" }),
      transformResponse: (response: any) => response,
    }),
    reportReview: builder.mutation<{ success: boolean; message: string }, { reviewId: string; reason: string }>({
      query: ({ reviewId, reason }) => ({ url: `reviews/${reviewId}/report`, method: "POST", body: { reason } }),
      transformResponse: (response: { success: boolean; message: string }) => response,
      invalidatesTags: ["Review"],
    }),
    modifyReportedReview: builder.mutation<{ success: boolean; message: string }, { reviewId: string; action: "edit" | "cancel"; reason?: string }>({
      query: ({ reviewId, action, reason }) => ({
        url: `reviews/${reviewId}/report`,
        method: "PUT",
        body: action === "edit" ? { action, reason: reason ?? "" } : { action },
      }),
      transformResponse: (response: { success: boolean; message: string }) => response,
      invalidatesTags: ["Review"],
    }),
    uploadReviewAttachments: builder.mutation<any, { files: any[]; reviewId?: string }>({
      query: ({ files, reviewId }) => {
        const formData = new FormData();
        (files ?? []).forEach((file: any) => formData.append("files", file as any));
        if (reviewId) formData.append("reviewId", reviewId);
        return { url: `reviews/upload`, method: "POST", body: formData } as any;
      },
      transformResponse: (response: any) => response,
    }),
    deleteReviewAttachment: builder.mutation<any, { reviewId: string; urls: string[] }>({
      query: ({ reviewId, urls }) => ({ url: `reviews/${reviewId}/attachments`, method: "DELETE", body: { urls } }),
      transformResponse: (response: any) => response,
    }),
    getReviewsBatch: builder.query<any, string[] | void>({
      query: (ids) => ({ url: `reviews/batch`, method: "POST", body: { reviewIds: ids ?? [] } }),
      transformResponse: (response: any) => response,
      providesTags: ["Review"],
    }),
  }),
});

export const {
  useGetReviewsByUserIdQuery,
  useLazyGetReviewsByUserIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useUploadReviewAttachmentsMutation,
  useDeleteReviewAttachmentMutation,
  useDeleteReviewMutation,
  useLikeReviewMutation,
  useRemoveReviewLikeMutation,
  useReportReviewMutation,
  useModifyReportedReviewMutation,
  useGetReviewsBatchQuery,
} = reviewApi;
