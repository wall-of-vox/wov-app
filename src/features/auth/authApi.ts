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

    register: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          user: any;
          isGoogleAccount: boolean;
          accessToken: string;
          refreshToken: string;
          expiresIn: number | string;
        };
      },
      { username: string; email?: string; mobile?: string; password: string }
    >({
      query: (userData) => ({
        url: "/auth/signup",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    sendMobileOTP: builder.mutation<{ success: boolean; message: string }, { mobile: string; purpose: string }>({
      query: (data) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: data,
      }),
    }),

    verifyMobileOTP: builder.mutation<{ message: string; success: boolean }, { mobile: string; otp: string }>({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    sendEmailOTP: builder.mutation<{ success: boolean; message: string }, { email: string; purpose: string }>({
      query: (data) => ({
        url: "/auth/send-email-otp",
        method: "POST",
        body: data,
      }),
    }),

    verifyEmailOTP: builder.mutation<{ message: string; success: boolean }, { email: string; otp: string; purpose: string }>({
      query: (data) => ({
        url: "/auth/verify-email-otp",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<{ message: string; success: boolean }, { mobile?: string; email?: string; otp: string; password: string }>({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    googleLogin: builder.mutation<
      {
        success: boolean;
        message: string;
        requires2FA?: boolean;
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
      { accessToken: string }
    >({
      query: (credentials) => ({
        url: "/auth/google/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    googleSignup: builder.mutation<
      {
        success: boolean;
        message: string;
        requires2FA?: boolean;
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
      { accessToken: string }
    >({
      query: (credentials) => ({
        url: "/auth/google/signup",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    verifyLogin2FA: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          user: any;
          accessToken: string;
          refreshToken: string;
          expiresIn: string | number;
        };
      },
      { code: string; tempToken: string }
    >({
      query: (payload) => ({
        url: "/auth/verify-2fa",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "Auth"],
    }),

    getTwoFAStatus: builder.query<{ enabled: boolean }, void>({
      query: () => ({ url: "/auth/2fa/status", method: "GET" }),
      transformResponse: (response: { success: boolean; message: string; data: { enabled: boolean } }) => response.data,
      providesTags: ["Auth"],
    }),

    initiateTwoFA: builder.mutation<{ success: boolean; message: string; data: { qrCodeUrl: string; secret: string } }, void>({
      query: () => ({ url: "/auth/2fa/generate", method: "GET" }),
    }),

    verifyTwoFA: builder.mutation<{ success: boolean; message?: string }, { code: string; secret: string }>({
      query: (payload) => ({ url: "/auth/2fa/enable", method: "POST", body: payload }),
      invalidatesTags: ["Auth"],
    }),

    disableTwoFA: builder.mutation<{ success: boolean; message?: string }, void>({
      query: () => ({ url: "/auth/2fa/disable", method: "DELETE", body: {} as Record<string, unknown> }),
      transformResponse: (response: { success: boolean; message?: string; data?: Record<string, unknown> }) => ({
        success: response.success,
        message: response.message,
      }),
      invalidatesTags: ["Auth"],
    }),

    reauth: builder.mutation<
      { success: boolean; message?: string; data?: { user?: any; reauthToken: string; expiresIn?: string | number } },
      { usernameOrMobileOrEmail: string; password: string; totpCode?: string }
    >({
      query: (payload) => ({ url: "/auth/reauth", method: "POST", body: payload }),
      transformResponse: (response: { success: boolean; message?: string; data?: { user?: any; reauthToken: string; expiresIn?: string | number } }) => response,
    }),

    changePassword: builder.mutation<
      { success: boolean; message?: string; data?: { sessionsInvalidated?: boolean } },
      { currentPassword: string; newPassword: string }
    >({
      query: (payload) => ({ url: "/auth/change-password", method: "POST", body: payload }),
      transformResponse: (response: { success: boolean; message?: string; data?: { sessionsInvalidated?: boolean } }) => response,
      invalidatesTags: ["User", "Auth"],
    }),

    setPassword: builder.mutation<
      { success: boolean; message?: string; hasPassword?: boolean },
      { newPassword: string; confirmPassword: string }
    >({
      query: (payload) => ({ url: "/auth/set-password", method: "POST", body: payload }),
      transformResponse: (response: { success: boolean; message?: string; hasPassword?: boolean }) => response,
      invalidatesTags: ["User", "Auth"],
    }),

    checkUsername: builder.query<
      { success: boolean; message: string; data: { username: string; isAvailable: boolean } },
      string
    >({
      query: (username) => ({
        url: "/auth/check-username",
        method: "GET",
        params: { username },
      }),
      providesTags: ["Auth"],
    }),

    updateUsername: builder.mutation<
      { success: boolean; message?: string; data?: Record<string, unknown> },
      { newUsername: string }
    >({
      query: (payload) => ({ url: "/auth/update-username", method: "POST", body: payload }),
      transformResponse: (response: { success: boolean; message?: string; data?: Record<string, unknown> }) => response,
      invalidatesTags: ["User", "Auth"],
    }),

    updateEmailMobile: builder.mutation<
      { success: boolean; message?: string; data?: Record<string, unknown> },
      { newEmail?: string; newMobile?: string; otp: string }
    >({
      query: (payload) => ({ url: "/auth/update-email-mobile", method: "PUT", body: payload }),
      transformResponse: (response: { success: boolean; message?: string; data?: Record<string, unknown> }) => response,
      invalidatesTags: ["User", "Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendMobileOTPMutation,
  useVerifyMobileOTPMutation,
  useSendEmailOTPMutation,
  useVerifyEmailOTPMutation,
  useResetPasswordMutation,
  useGoogleLoginMutation,
  useGoogleSignupMutation,
  useLogoutMutation,
  useGetTwoFAStatusQuery,
  useInitiateTwoFAMutation,
  useVerifyTwoFAMutation,
  useDisableTwoFAMutation,
  useVerifyLogin2FAMutation,
  useReauthMutation,
  useChangePasswordMutation,
  useSetPasswordMutation,
  useUpdateUsernameMutation,
  useUpdateEmailMobileMutation,
  useCheckUsernameQuery,
  useLazyCheckUsernameQuery,
} = authApi;
