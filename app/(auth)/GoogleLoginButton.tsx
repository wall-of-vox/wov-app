import { useState } from "react";
import { View, Text } from "react-native";
import Button from "@/components/ui/button";
import { useGoogleLoginMutation } from "@/features/auth/authApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setTwoFAState, setToken } from "@/features/auth/authSlice";
import { router } from "expo-router";
import { saveAuthSession } from "@/lib/secureStore";
import { useGoogleOAuth } from "@/utils/useGoogleOAuth";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
  disabled?: boolean;
  getAccessToken?: () => Promise<string | null>;
}

export default function GoogleLoginButton({
  onSuccess,
  redirectTo = "/home/feed",
  className = "",
  disabled = false,
  getAccessToken,
}: GoogleLoginButtonProps) {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | undefined>(undefined);
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();
  const oauth = useGoogleOAuth();

  const handlePress = async () => {
    if (disabled || isLoading) return;
    setError(undefined);
    try {
      let accessTokenFromOAuth: string | null = null;
      if (getAccessToken) {
        accessTokenFromOAuth = await getAccessToken();
      } else {
        accessTokenFromOAuth = await oauth.getAccessToken();
      }
      if (!accessTokenFromOAuth) {
        setError("Google login cancelled");
        return;
      }
      const result = await googleLogin({ accessToken: accessTokenFromOAuth }).unwrap();
      const requires2FA = (result as any)?.requires2FA ?? (result as any)?.data?.requires2FA;
      if (requires2FA) {
        const tempToken = (result as any)?.tempToken ?? (result as any)?.data?.tempToken;
        dispatch(setTwoFAState({ requires2FA: true, tempToken }));
        router.push("/(auth)/verify2FAForm");
        return;
      }
      const accessToken = (result as any)?.accessToken ?? (result as any)?.data?.accessToken ?? (result as any)?.token;
      const refreshToken = (result as any)?.refreshToken ?? (result as any)?.data?.refreshToken;
      const expiresIn = (result as any)?.expiresIn ?? (result as any)?.data?.expiresIn;
      if (accessToken) {
        await saveAuthSession({ accessToken, refreshToken, expiresIn });
        dispatch(setToken(accessToken));
      }
      if (onSuccess) onSuccess();
      else router.replace(redirectTo);
    } catch (e: any) {
      const message = e?.data?.message || e?.error || "Google login failed";
      setError(message);
    }
  };

  return (
    <View className={`w-full ${className}`}>
      <Button title={isLoading ? "Signing in..." : "Continue with Google"} onPress={handlePress} disabled={disabled || isLoading} />
      {error ? <Text className="text-red-600 mt-2 text-sm">{error}</Text> : null}
    </View>
  );
}

