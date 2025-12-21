import { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from "@/components/ui/button";
import { router } from 'expo-router';

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
    const [authError] = useState<string | undefined>(undefined);

    const handleInputChange = (name: "usernameOrMobileOrEmail" | "password", value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 600);
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

                            <View className="gap-2">
                                <Text className="text-gray-700">Username, Mobile, or Email</Text>
                                <TextInput
                                    value={formData.usernameOrMobileOrEmail}
                                    onChangeText={(t) => handleInputChange("usernameOrMobileOrEmail", t)}
                                    placeholder="Enter your username, mobile, or email"
                                    editable={!isSubmitting}
                                    className={`border rounded-md p-3 ${errors.usernameOrMobileOrEmail ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.usernameOrMobileOrEmail && (
                                    <Text className="text-sm text-red-600">{errors.usernameOrMobileOrEmail}</Text>
                                )}
                            </View>

                            <View className="gap-2">
                                <Text className="text-gray-700">Password</Text>
                                <View className="relative">
                                    <TextInput
                                        value={formData.password}
                                        onChangeText={(t) => handleInputChange("password", t)}
                                        placeholder="Enter your password"
                                        secureTextEntry={!showPassword}
                                        editable={!isSubmitting}
                                        className={`border rounded-md p-3 pr-10 ${errors.password ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    <Pressable
                                        className="absolute right-0 top-0 h-full px-3 py-2 items-center justify-center"
                                        onPress={() => setShowPassword((s) => !s)}
                                        disabled={isSubmitting}
                                    >
                                        <Text className="text-gray-600">{showPassword ? "Hide" : "Show"}</Text>
                                    </Pressable>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    <View>
                                        {errors.password && (
                                            <Text className="text-sm text-red-600">{errors.password}</Text>
                                        )}
                                    </View>
                                    <Pressable onPress={() => { }}>
                                        <Text className="text-sm font-medium text-red-600">Forgot Password?</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <Button
                                title={isSubmitting ? "Signing In..." : "Sign In"}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            />
                        </View>

                        <View className="items-center">
                            <Text className="text-sm text-gray-500">
                                Don't have an account?{" "}
                                <Text className="text-blue-600 font-medium" onPress={() => router.replace('/auth/register')}>Sign up</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
