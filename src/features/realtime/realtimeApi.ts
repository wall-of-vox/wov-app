import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SERVICES } from "@/utils/constants";
import type { RootState } from "@/lib/redux/store";

export const realtimeApi = createApi({
  reducerPath: "realtimeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${SERVICES.REALTIME_BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("accept", "application/json");
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<any, { userId?: string; limit?: number; cursor?: string; unreadOnly?: boolean } | void>({
      query: (params) => ({
        url: "notifications",
        method: "GET",
        params: {
          userId: params?.userId,
          limit: params?.limit,
          cursor: params?.cursor,
          unreadOnly: params?.unreadOnly,
        },
      }),
      transformResponse: (response: any) => {
        const normalizeType = (t?: string) => (t ? String(t).replace(/-/g, "_") : "system");
        const normalizeItem = (n: any) => {
          const createdAt = (n?.createdAt as string) || n?.timestamp || new Date().toISOString();
          const isRead = Boolean(n?.is_read ?? n?.isRead ?? false);
          const type = normalizeType(typeof n?.type === "string" ? n?.type : String(n?.type));
          const id = String(n?.id ?? n?._id);
          const content = {
            ...(n?.content ?? {}),
            eventType: n?.content?.eventType ?? n?.event_type,
            followerId: n?.content?.followerId ?? n?.followerId ?? n?.fromUserId,
            message: n?.content?.message ?? n?.message ?? n?.description ?? n?.title,
          };
          return { ...n, id, type, isRead, createdAt, content };
        };
        return {
          ...response,
          data: Array.isArray(response?.data) ? response.data.map((n: any) => normalizeItem(n)) : [],
        };
      },
      providesTags: ["Notifications"],
    }),
    getNotificationsCount: builder.query<any, { userId?: string; unreadOnly?: boolean } | void>({
      query: (params) => ({
        url: "notifications/count",
        method: "GET",
        params: {
          userId: params?.userId,
          unreadOnly: params?.unreadOnly ?? false,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({ url: `notifications/${id}/read`, method: "POST" }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["Notifications"],
    }),
    markNotificationsReadBatch: builder.mutation<any, { ids: string[] }>({
      query: (payload) => ({ url: "notifications/mark-read", method: "POST", body: payload }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useGetNotificationsCountQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationsReadBatchMutation,
} = realtimeApi;

