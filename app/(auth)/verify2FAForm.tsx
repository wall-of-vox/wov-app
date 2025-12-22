import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useVerifyLogin2FAMutation } from "@/features/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setToken, setTwoFAState } from "@/features/auth/authSlice";
import { router } from "expo-router";
import { saveAuthSession } from "@/lib/secureStore";

interface Props {
  redirectTo?: string;
}

export default function Verify2FAForm({ redirectTo = "/home/feed" }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const dispatch = useAppDispatch();
  const tempToken = useAppSelector((s) => s.auth.tempToken);
  const [verifyLogin2FA, { isLoading: isVerifying }] = useVerifyLogin2FAMutation();

  useEffect(() => {
    if (!tempToken) {
      setError("Session expired. Please sign in again to verify 2FA.");
    }
  }, [tempToken]);

  const handleSubmit = async () => {
    if (!tempToken) {
      router.push("/(auth)/login");
      return;
    }
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    setError(undefined);
    try {
      const result = await verifyLogin2FA({ code, tempToken }).unwrap();
      const accessToken = (result as any)?.data?.accessToken ?? (result as any)?.token;
      const refreshToken = (result as any)?.data?.refreshToken;
      const expiresIn = (result as any)?.data?.expiresIn;
      if (accessToken) {
        await saveAuthSession({ accessToken, refreshToken, expiresIn });
        dispatch(setToken(accessToken));
      }
      dispatch(setTwoFAState({ tempToken: null, requires2FA: false }));
      router.push(redirectTo);
    } catch (e: any) {
      const message = e?.data?.message || e?.error || "Verification failed";
      setError(message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="flex-1 justify-center px-4" keyboardShouldPersistTaps="handled">
        <View className="w-full max-w-md self-center">
          <View className="items-center mb-4">
            <View className="w-12 h-12 bg-black rounded-xl items-center justify-center">
              <Text className="text-white font-bold">P</Text>
            </View>
            <Text className="text-xl font-bold mt-3">Verify Two-factor Authentication</Text>
            <Text className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your authenticator app</Text>
          </View>
          <View className="gap-6">
            {!tempToken && (
              <View className="bg-red-50 border border-red-500 rounded-md p-3">
                <Text className="text-red-700">No verification session found. Please sign in again.</Text>
              </View>
            )}
            {error && (
              <View className="bg-red-50 border border-red-500 rounded-md p-3">
                <Text className="text-red-700">{error}</Text>
              </View>
            )}
            <View className="gap-4">
              <Input
                label="6-digit Code"
                value={code}
                onChangeText={(t) => setCode(t.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="Enter your 6-digit code"
                editable={!isVerifying}
                variant="outline"
              />
              <Button title={isVerifying ? "Verifying..." : "Verify"} onPress={handleSubmit} disabled={isVerifying || !tempToken} />
            </View>
            <View className="items-center">
              <Text className="text-sm text-gray-500">
                Back to{" "}
                <Text className="text-primary font-medium" onPress={() => router.push("/(auth)/login")}>
                  Sign in
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

