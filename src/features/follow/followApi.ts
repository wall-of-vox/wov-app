import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SERVICES } from "@/utils/constants";
import type { RootState } from "@/lib/redux/store";
import { userApi } from "@/features/user/userApi";

export const followApi = createApi({
  reducerPath: "followApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${SERVICES.FOLLOW_BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("accept", "application/json");
      headers.set("content-type", "application/json; charset=utf-8");
      return headers;
    },
  }),
  tagTypes: ["Follow", "User"],
  endpoints: (builder) => ({
    getFollowers: builder.query<any, { userId?: string; limit?: number; cursor?: string; loggedInUserId?: string } | void>({
      query: (params) => ({
        url: `follows/followers/${params?.userId}`,
        method: "GET",
        params: {
          limit: params?.limit ?? 20,
          cursor: params?.cursor,
          loggedInUserId: params?.loggedInUserId,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["Follow"],
    }),
    getFollowing: builder.query<any, { userId?: string; limit?: number; cursor?: string; loggedInUserId?: string } | void>({
      query: (params) => ({
        url: `follows/following/${params?.userId}`,
        method: "GET",
        params: {
          limit: params?.limit ?? 20,
          cursor: params?.cursor,
          loggedInUserId: params?.loggedInUserId,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["Follow"],
    }),
    getFollowRequests: builder.query<any, { limit?: number; cursor?: string; loggedInUserId?: string } | void>({
      query: (params) => ({
        url: `follows/pending`,
        method: "GET",
        params: {
          limit: params?.limit ?? 20,
          cursor: params?.cursor,
          loggedInUserId: params?.loggedInUserId,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["Follow"],
    }),
    getFollowStatus: builder.query<any, { userId?: string; loggedInUserId?: string } | void>({
      query: (params) => ({
        url: `follows/status/${params?.userId}`,
        method: "GET",
        params: {
          loggedInUserId: params?.loggedInUserId,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["Follow"],
    }),
    followUser: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({ url: `follows/${userId}`, method: "POST" }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["Follow"],
      async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userApi.endpoints.refreshSuggestions.initiate());
        } catch {}
      },
    }),
    unfollowUser: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({ url: `follows/${userId}`, method: "DELETE" }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["Follow"],
      async onQueryStarted({ userId }, { dispatch, getState, queryFulfilled }) {
        try {
          await queryFulfilled;
          const state: any = getState();
          const queries = state?.followApi?.queries ?? {};
          Object.values(queries).forEach((entry: any) => {
            const endpointName = entry?.endpointName;
            const originalArgs = entry?.originalArgs;
            if (!endpointName || !originalArgs) return;
            if (endpointName === "getFollowers" || endpointName === "getFollowing") {
              dispatch(
                followApi.util.updateQueryData(endpointName as any, originalArgs, (draft: any) => {
                  if (draft?.data && Array.isArray(draft.data)) {
                    draft.data = draft.data.map((edge: any) => {
                      const otherUserId = edge?.user_data?.userId || edge?.followeeId || edge?.followerId;
                      if (otherUserId === userId) {
                        return { ...edge, followingStatus: "UNFOLLOWED" };
                      }
                      return edge;
                    });
                  }
                })
              );
            }
            if (endpointName === "getFollowStatus" && originalArgs?.userId === userId) {
              dispatch(
                followApi.util.updateQueryData("getFollowStatus", originalArgs, (draft: any) => {
                  if (draft) {
                    draft.isFollowing = false;
                    draft.followingStatus = "UNFOLLOWED";
                    draft.isMutual = !!draft.isFollowed && draft.followedStatus === "ACCEPTED" && draft.followingStatus === "ACCEPTED";
                  }
                })
              );
            }
          });
        } catch {}
        finally {
          dispatch(userApi.endpoints.refreshSuggestions.initiate());
        }
      },
    }),
    acceptFollowRequest: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({ url: `follows/${userId}/accept`, method: "PUT" }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["Follow"],
    }),
    rejectFollowRequest: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({ url: `follows/${userId}/reject`, method: "PUT" }),
      transformResponse: (response: any) => response,
      invalidatesTags: ["Follow"],
    }),
    getFollowersGraph: builder.query<any, { range?: string; start?: string; end?: string } | void>({
      query: (params) => ({
        url: `follows/followers/graph`,
        method: "GET",
        params: {
          range: params?.range ?? "7d",
          start: params?.start,
          end: params?.end,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["Follow"],
    }),
    getMutualConnections: builder.query<any, { userId?: string; limit?: number; cursor?: string } | void>({
      query: (params) => ({
        url: `follows/mutual/${params?.userId}`,
        method: "GET",
        params: {
          limit: params?.limit ?? 20,
          cursor: params?.cursor,
        },
      }),
      transformResponse: (response: any) => response,
      providesTags: ["Follow"],
    }),
  }),
});

export const {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetFollowRequestsQuery,
  useGetFollowStatusQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useAcceptFollowRequestMutation,
  useRejectFollowRequestMutation,
  useGetFollowersGraphQuery,
  useGetMutualConnectionsQuery,
} = followApi;
