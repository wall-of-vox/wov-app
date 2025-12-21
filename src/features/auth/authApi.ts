import { api } from "@/lib/redux/api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      {
        success: boolean;
        message?: string;
        requires2FA?: boolean;
        token?: string;
        tempToken?: string;
        data?: {
          user?: any;
          isGoogleAccount?: boolean;
          accessToken?: string;
          refreshToken?: string;
          expiresIn?: string | number;
          requires2FA?: boolean;
          tempToken?: string;
        };
      },
      { usernameOrMobileOrEmail: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Auth"],
    }),
  }),
});

export const { useLoginMutation } = authApi;
