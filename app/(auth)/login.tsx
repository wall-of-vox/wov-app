import { useState } from 'react';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from "@/components/ui/button";
import { router } from 'expo-router';
import Input from "@/components/ui/input";
import { useLoginMutation } from "@/features/auth/authApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setToken, setTwoFAState } from "@/features/auth/authSlice";

export default function LoginScreen() {
    const [formData, setFormData] = useState({
        usernameOrMobileOrEmail: "",
        password: "",
    });
    const [errors, setErrors] = useState<{
        usernameOrMobileOrEmail?: string;
        password?: string;
    }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | undefined>(undefined);
    const dispatch = useAppDispatch();
    const [login, { isLoading, error }] = useLoginMutation();

    const handleInputChange = (name: "usernameOrMobileOrEmail" | "password", value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setAuthError(undefined);
        try {
            const res = await login({
                usernameOrMobileOrEmail: formData.usernameOrMobileOrEmail,
                password: formData.password,
            }).unwrap();
            const token = res.token ?? res.data?.accessToken;
            const requires2FA = !!(res.requires2FA ?? res.data?.requires2FA);
            const tempToken = res.tempToken ?? res.data?.tempToken;
            if (requires2FA && tempToken) {
                dispatch(setTwoFAState({ tempToken, requires2FA }));
                router.push('/auth/verify-2fa');
            } else if (token) {
                dispatch(setToken(token));
                router.push('/home/feed');
            } else {
                setAuthError(res.message ?? 'Unexpected response');
            }
        } catch (e: any) {
            const message =
                e?.data?.message ||
                e?.error ||
                'Login failed';
            setAuthError(message);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerClassName="flex-1 justify-center px-4"
                keyboardShouldPersistTaps="handled"
            >
                <View className="w-full max-w-md self-center">
                    <View className="items-center mb-4">
                        <Image
                            source={require('../../assets/logo.png')}
                            className="w-16 h-16 rounded-xl"
                            resizeMode="contain"
                        />
                        <Text className="text-xl font-medium mt-3">Welcome Back to WOV</Text>
                    </View>

                    <View className="gap-6">
                        <Pressable
                            className="flex-row items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-3"
                            disabled={isSubmitting}
                            onPress={() => { }}
                        >
                            <View className="w-5 h-5 items-center justify-center">
                                <Text className="text-lg font-bold text-blue-600">G</Text>
                            </View>
                            <Text className="text-gray-900 font-medium">Continue with Google</Text>
                        </Pressable>

                        <View className="relative">
                            <View className="flex-row items-center">
                                <View className="flex-1 h-[1px] bg-gray-300" />
                            </View>
                            <View className="absolute inset-0 justify-center items-center">
                                <Text className="text-black">OR</Text>
                            </View>
                        </View>

                        <View className="gap-6">
                            {authError && (
                                <View className="bg-red-50 border border-red-500 rounded-md p-3">
                                    <Text className="text-red-700">{authError}</Text>
                                </View>
                            )}

                            <Input
                                label="Username, Mobile, or Email"
                                value={formData.usernameOrMobileOrEmail}
                                onChangeText={(t) => handleInputChange("usernameOrMobileOrEmail", t)}
                                placeholder="Enter your username, mobile, or email"
                                editable={!isSubmitting}
                                error={errors.usernameOrMobileOrEmail}
                                variant="outline"
                            />

                            <Input
                                label="Password"
                                value={formData.password}
                                onChangeText={(t) => handleInputChange("password", t)}
                                placeholder="Enter your password"
                                secureTextEntry={!showPassword}
                                editable={!isSubmitting}
                                error={errors.password}
                                variant="outline"
                                right={
                                    <Pressable
                                        onPress={() => setShowPassword((s) => !s)}
                                        disabled={isSubmitting}
                                    >
                                        <Text className="text-gray-600">{showPassword ? "Hide" : "Show"}</Text>
                                    </Pressable>
                                }
                            />
                            <View className="flex-row justify-end items-center">
                                <Pressable onPress={() => { }}>
                                    <Text className="text-sm font-medium text-red-600" onPress={() => router.push('/(auth)/accountType')}>Forgot Password?</Text>
                                </Pressable>
                            </View>

                            <Button
                                title={isSubmitting ? "Signing In..." : "Sign In"}
                                onPress={handleSubmit}
                                disabled={isSubmitting || isLoading}
                            />
                        </View>

                        <View className="items-center">
                            <Text className="text-sm text-gray-500">
                                Don't have an account?{" "}
                                <Text className="text-primary font-medium" onPress={() => router.push('/(auth)/register')}>Sign up</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
