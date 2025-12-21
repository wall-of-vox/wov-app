import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SERVICES } from "@/utils/constants";
import type { RootState } from "@/lib/redux/store";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${SERVICES.USER_BASE_URL}/api`,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("accept", "application/json");
      const multipartEndpoints = ["updateUserAvatar", "updateUserGallery"];
      if (multipartEndpoints.includes(endpoint)) {
        headers.delete("content-type");
      } else {
        headers.set("content-type", "application/json; charset=utf-8");
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Suggestions"],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<any, void>({
      query: () => ({ url: "profiles/me", method: "GET" }),
      transformResponse: (response: { success: boolean; message: string; data: any }) => response.data,
      providesTags: ["User"],
    }),

    getUserProfileById: builder.query<any, string>({
      query: (userId) => ({ url: `profiles/${userId}`, method: "GET" }),
      transformResponse: (response: { success: boolean; message: string; data: any }) => response.data,
      providesTags: ["User"],
    }),

    setUserProfile: builder.mutation<
      any,
      { type: "personal" | "professional"; professionService?: string; preferredCategories?: string[] }
    >({
      query: ({ type, professionService, preferredCategories }) => ({
        url: "profiles",
        method: "POST",
        body: type === "professional" ? { type, professionService } : { type, preferredCategories },
      }),
      transformResponse: (response: { success: boolean; message: string; data: any }) => response.data,
      invalidatesTags: ["User"],
    }),

    updateUserProfile: builder.mutation<any, any>({
      query: (payload) => ({ url: "profiles/me", method: "PUT", body: payload }),
      transformResponse: (response: { success: boolean; message: string; data: any }) => response.data,
      invalidatesTags: ["User"],
    }),

    updateUserAvatar: builder.mutation<any, { avatar: any }>({
      query: ({ avatar }) => {
        const form = new FormData();
        form.append("avatar", avatar as any);
        return { url: "profiles/me/avatar", method: "POST", body: form };
      },
      transformResponse: (response: { success: boolean; message: string; data: any }) => response.data,
    }),

    deleteUserAvatar: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({ url: "profiles/me/avatar", method: "DELETE" }),
      transformResponse: (response: { success: boolean; message: string }) => response,
      invalidatesTags: ["User"],
    }),

    searchProfiles: builder.query<any, { page?: number; limit?: number; sortBy?: string; sortOrder?: "asc" | "desc"; type?: string; query?: string; category?: string }>({
      query: (params) => ({
        url: "profiles/search",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          sortBy: params?.sortBy ?? "createdAt",
          sortOrder: params?.sortOrder ?? "desc",
          ...(params?.type ? { type: params.type } : {}),
          ...(params?.query ? { q: params.query } : {}),
          ...(params?.category ? { category: params.category } : {}),
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["User"],
    }),

    getRecentSearches: builder.query<any, void>({
      query: () => ({ url: "recent-search", method: "GET" }),
      transformResponse: (response: any) => response,
    }),

    getRecommendedBrands: builder.query<any, { page?: number; limit?: number; sortBy?: string; sortOrder?: "asc" | "desc"; includeRatings?: boolean } | void>({
      query: (params) => ({
        url: "profiles/professional/brands",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          sortBy: params?.sortBy ?? "createdAt",
          sortOrder: params?.sortOrder ?? "desc",
          includeRatings: params?.includeRatings ?? true,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["User"],
    }),

    addToFavourites: builder.mutation<any, { targetUserId: string }>({
      query: ({ targetUserId }) => ({ url: "profiles/me/favourites", method: "POST", body: { targetUserId } }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["User"],
    }),

    removeFromFavourites: builder.mutation<any, { targetUserId: string }>({
      query: ({ targetUserId }) => ({ url: "profiles/me/favourites", method: "DELETE", body: { targetUserId } }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["User"],
    }),

    getFavourites: builder.query<any, void>({
      query: () => ({ url: "profiles/me/favourites", method: "GET" }),
      transformResponse: (response: any) => response,
      providesTags: ["User"],
    }),

    saveItem: builder.mutation<{ message: string }, { item_id: string; item_type: "review" | "post" | "product" }>({
      query: ({ item_id, item_type }) => ({ url: "saved", method: "POST", body: { item_id, item_type } }),
      transformResponse: (response: { message: string }) => response,
      invalidatesTags: ["User"],
    }),

    removeSavedItem: builder.mutation<{ message: string }, { item_id: string; item_type: "review" | "post" | "product" }>({
      query: ({ item_id, item_type }) => ({ url: "saved/remove", method: "DELETE", body: { item_id, item_type } }),
      transformResponse: (response: { message: string }) => response,
      invalidatesTags: ["User"],
    }),

    getSavedList: builder.query<any, { type?: "review" | "post" | "product" } | void>({
      query: (params) => ({ url: "saved/list", method: "GET", params: params?.type ? { type: params.type } : undefined }),
      transformResponse: (response: any) => response,
      providesTags: ["User"],
    }),

    updateUserGallery: builder.mutation<any, { media: any[] }>({
      query: ({ media }) => {
        const form = new FormData();
        media.slice(0, 10).forEach((file) => form.append("media", file as any));
        return { url: "profiles/me/gallery", method: "PUT", body: form };
      },
      transformResponse: (response: { success: boolean; message: string; data: any }) => response.data,
      invalidatesTags: ["User"],
    }),

    deleteUserGalleryMedia: builder.mutation<any, { urls: string[] }>({
      query: ({ urls }) => ({ url: "profiles/me/gallery", method: "DELETE", body: { urls } }),
      transformResponse: (response: { success: boolean; message: string; data: any }) => response.data,
      invalidatesTags: ["User"],
    }),

    getAnalytics: builder.query<any, void>({
      query: () => ({ url: "analytics/me", method: "GET" }),
      transformResponse: (response: any) => response,
      providesTags: ["User"],
    }),

    recordAnalyticsView: builder.mutation<any, { professionalId: string; isFollower: boolean }>({
      query: ({ professionalId, isFollower }) => ({ url: `analytics/${professionalId}/view`, method: "POST", body: { isFollower } }),
      transformResponse: (response: any) => response,
    }),

    recordAnalyticsShare: builder.mutation<any, { professionalId: string; isFollower: boolean }>({
      query: ({ professionalId, isFollower }) => ({ url: `analytics/${professionalId}/share`, method: "POST", body: { isFollower } }),
      transformResponse: (response: any) => response,
    }),

    getSuggestions: builder.query<any[], void>({
      query: () => ({ url: "suggestions", method: "GET" }),
      transformResponse: (response: any) => response?.data?.suggestions ?? [],
    }),

    refreshSuggestions: builder.mutation<any[], void>({
      query: () => ({ url: "suggestions/refresh", method: "POST", body: {} }),
      transformResponse: (response: any) => response?.data?.suggestions ?? [],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData("getSuggestions", undefined, (draft: any[]) => {
              draft.splice(0, draft.length);
              draft.push(...(data ?? []));
            })
          );
        } catch {}
      },
    }),

    hideSuggestion: builder.mutation<{ success: boolean; message: string }, { targetUserId: string }>({
      query: ({ targetUserId }) => ({
        url: "suggestions/hide",
        method: "POST",
        body: { targetUserId },
      }),
      transformResponse: (response: { success: boolean; message: string }) => response,
      async onQueryStarted({ targetUserId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData("getSuggestions", undefined, (draft: any[]) => {
              const idx = draft.findIndex((s: any) => s?.user?.userId === targetUserId);
              if (idx >= 0) draft.splice(idx, 1);
            })
          );
        } catch {}
      },
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useSetUserProfileMutation,
  useUpdateUserProfileMutation,
  useUpdateUserAvatarMutation,
  useDeleteUserAvatarMutation,
  useGetUserProfileByIdQuery,
  useSearchProfilesQuery,
  useGetRecentSearchesQuery,
  useGetRecommendedBrandsQuery,
  useAddToFavouritesMutation,
  useRemoveFromFavouritesMutation,
  useGetFavouritesQuery,
  useUpdateUserGalleryMutation,
  useDeleteUserGalleryMediaMutation,
  useGetAnalyticsQuery,
  useRecordAnalyticsViewMutation,
  useRecordAnalyticsShareMutation,
  useGetSuggestionsQuery,
  useRefreshSuggestionsMutation,
  useHideSuggestionMutation,
  useSaveItemMutation,
  useRemoveSavedItemMutation,
  useGetSavedListQuery,
} = userApi;
