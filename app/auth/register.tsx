import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignUpScreen() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    });
    const [errors, setErrors] = useState<{
        form?: string;
        username?: string;
        email?: string;
        mobile?: string;
        password?: string;
        confirmPassword?: string;
        contact?: string;
        acceptTerms?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | undefined>(undefined);
    const [contactMethod, setContactMethod] = useState<'email' | 'mobile'>('email');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpCode, setOtpCode] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const usernameMessage = useMemo(() => {
        if (usernameStatus === 'available') return { type: 'success' as const, text: 'Username is available' };
        if (usernameStatus === 'taken') return { type: 'error' as const, text: 'Username is taken' };
        return { type: undefined, text: '' };
    }, [usernameStatus]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordRequirements = useMemo(
        () => [
            { text: 'At least 8 characters', valid: formData.password.length >= 8 },
            { text: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
            { text: 'One lowercase letter', valid: /[a-z]/.test(formData.password) },
            { text: 'One number', valid: /\d/.test(formData.password) },
            { text: 'One special character (@$!%*?&)', valid: /[@$!%*?&]/.test(formData.password) },
        ],
        [formData.password]
    );

    useEffect(() => {
        if (!formData.username) {
            setUsernameStatus('idle');
            return;
        }
        setUsernameStatus('checking');
        const t = setTimeout(() => {
            const taken = /[^a-z0-9_]/i.test(formData.username) || formData.username.length < 3;
            setUsernameStatus(taken ? 'taken' : 'available');
        }, 500);
        return () => clearTimeout(t);
    }, [formData.username]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (otpSent && otpTimer > 0) {
            interval = setInterval(() => setOtpTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [otpSent, otpTimer]);

    const resetOTPState = () => {
        setOtpSent(false);
        setOtpVerified(false);
        setOtpTimer(0);
        setOtpCode('');
    };

    const handleSendOTP = () => {
        if (contactMethod === 'email' && !formData.email) {
            setErrors((e) => ({ ...e, email: 'Email is required' }));
            return;
        }
        if (contactMethod === 'mobile' && !formData.mobile) {
            setErrors((e) => ({ ...e, mobile: 'Mobile is required' }));
            return;
        }
        setErrors((e) => ({ ...e, email: '', mobile: '', contact: '' }));
        setOtpSent(true);
        setOtpVerified(false);
        setOtpTimer(60);
    };

    const handleVerifyOTP = () => {
        if (otpCode.length === 6) {
            setOtpVerified(true);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const newErrors: typeof errors = {};
            if (!formData.username) newErrors.username = 'Username is required';
            if (contactMethod === 'email' && !formData.email) newErrors.email = 'Email is required';
            if (contactMethod === 'mobile' && !formData.mobile) newErrors.mobile = 'Mobile is required';
            if (!formData.password) newErrors.password = 'Password is required';
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm your password';
            if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
            if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept terms';
            setErrors(newErrors);
            setAuthError(undefined);
            setIsSubmitting(false);
        }, 600);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-4 py-6 pb-24"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                scrollEnabled
            >
                <View className="w-full max-w-md mx-auto bg-white text-primary shadow-none border-0">
                    <View className="items-center mb-4">
                        <Image
                            source={require('../../assets/logo.png')}
                            className="w-16 h-16 rounded-xl"
                            resizeMode="contain"
                        />
                        <Text className="text-xl font-medium mt-3">Create Account on WOV</Text>
                    </View>

                    <View className="gap-6">
                        <Pressable
                            className="flex-row items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-3"
                            disabled={isSubmitting}
                            onPress={() => { }}
                        >
                            <View className="w-5 h-5 items-center justify-center">
                                <Text className="text-lg font-bold text-primary">G</Text>
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
                            {(errors.form || authError) ? (
                                <View className="bg-red-50 border border-red-500 rounded-md p-3">
                                    {authError ? <Text className="text-red-700">{authError}</Text> : null}
                                    {errors.form ? <Text className="text-red-700">{errors.form}</Text> : null}
                                </View>
                            ) : null}

                            <View>
                                <Input
                                    label="Username *"
                                    value={formData.username}
                                    onChangeText={(t) => setFormData({ ...formData, username: t })}
                                    placeholder="Choose a unique username"
                                    editable={!isSubmitting}
                                    error={errors.username}
                                    variant="outline"
                                    right={
                                        <View>
                                            {usernameStatus === "checking" ? (
                                                <View className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                                            ) : usernameStatus === "available" ? (
                                                <Text className="text-success">✓</Text>
                                            ) : usernameStatus === "taken" ? (
                                                <Text className="text-destructive">✕</Text>
                                            ) : null}
                                        </View>
                                    }
                                />
                                {usernameMessage.type ? (
                                    <Text className={`text-sm mt-2 ${usernameMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {usernameMessage.text}
                                    </Text>
                                ) : null}
                            </View>

                            <View className="gap-3">
                                <Text>Choose your preferred contact method *</Text>
                                <RadioGroup
                                    value={contactMethod}
                                    onValueChange={(v) => {
                                        const next = (v as 'email' | 'mobile');
                                        setContactMethod(next);
                                        setErrors((prev) => ({ ...prev, email: '', mobile: '', contact: '' }));
                                        resetOTPState();
                                    }}
                                    disabled={otpVerified}
                                    className="flex-row items-center gap-6"
                                >
                                    <Pressable
                                        className="flex-row items-center gap-2"
                                        onPress={() => {
                                            setContactMethod('email');
                                            setErrors((prev) => ({ ...prev, email: '', mobile: '', contact: '' }));
                                            resetOTPState();
                                        }}
                                        disabled={otpVerified}
                                    >
                                        <RadioGroupItem value="email" />
                                        <Text>Email Address</Text>
                                    </Pressable>
                                    <Pressable
                                        className="flex-row items-center gap-2"
                                        onPress={() => {
                                            setContactMethod('mobile');
                                            setErrors((prev) => ({ ...prev, email: '', mobile: '', contact: '' }));
                                            resetOTPState();
                                        }}
                                        disabled={otpVerified}
                                    >
                                        <RadioGroupItem value="mobile" />
                                        <Text>Mobile Number</Text>
                                    </Pressable>
                                </RadioGroup>
                            </View>

                            {contactMethod === 'email' ? (
                                <View className="gap-2">
                                    <Input
                                        label="Email Address *"
                                        value={formData.email}
                                        onChangeText={(t) => setFormData({ ...formData, email: t })}
                                        placeholder="your@email.com"
                                        editable={!otpVerified}
                                        error={errors.email}
                                        variant="outline"
                                    />
                                    {formData.email && !otpVerified ? (
                                        <Button
                                            title={otpSent && otpTimer > 0 ? `Resend (${otpTimer}s)` : "Send OTP"}
                                            onPress={handleSendOTP}
                                            disabled={!formData.email || (otpSent && otpTimer > 0)}
                                            className="self-start"
                                        />
                                    ) : null}
                                </View>
                            ) : (
                                <View className="gap-2">
                                    <Text>Mobile Number *</Text>
                                    <View className={`flex-row items-center border border-primary rounded-full bg-white ${errors.mobile ? "border-red-500" : "border-primary"}`}>
                                        <View className="flex-row items-center px-3 py-2 border-r border-primary rounded-l-full">
                                            <Text className="text-lg mr-2">🇮🇳</Text>
                                            <Text className="text-sm font-medium">+91</Text>
                                        </View>
                                        <View className="flex-1 pl-2">
                                            <Input
                                                value={formData.mobile}
                                                onChangeText={(t) => {
                                                    const v = t.replace(/\\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, mobile: v });
                                                }}
                                                placeholder="8651234567"
                                                editable={!otpVerified}
                                                variant="default"
                                            />
                                        </View>
                                    </View>
                                    {formData.mobile && !otpVerified ? (
                                        <Button
                                            title={otpSent && otpTimer > 0 ? `Resend (${otpTimer}s)` : "Send OTP"}
                                            onPress={handleSendOTP}
                                            disabled={!formData.mobile || (otpSent && otpTimer > 0)}
                                            className="self-start"
                                        />
                                    ) : null}
                                    {errors.mobile ? <Text className="text-sm text-red-600">{errors.mobile}</Text> : null}
                                </View>
                            )}

                            {otpSent && !otpVerified ? (
                                <View className="gap-2">
                                    <Input
                                        label="Verification Code"
                                        value={otpCode}
                                        onChangeText={setOtpCode}
                                        placeholder="Enter 6-digit code (123456)"
                                        maxLength={6}
                                        variant="outline"
                                    />
                                    <Button
                                        title="Verify"
                                        onPress={handleVerifyOTP}
                                        disabled={!otpCode}
                                    />
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-gray-500">
                                            {otpTimer > 0 ? `Resend in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, "0")}` : "Code expired"}
                                        </Text>
                                        {otpTimer === 0 ? (
                                            <Button title="Send Again" onPress={handleSendOTP} />
                                        ) : null}
                                    </View>
                                </View>
                            ) : null}

                            {otpVerified ? (
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-green-600">✓</Text>
                                    <Text className="text-sm">
                                        {contactMethod === 'email' ? 'Email' : 'Mobile number'} verified successfully
                                    </Text>
                                </View>
                            ) : null}

                            <View className="gap-2">
                                <Input
                                    label="Password *"
                                    value={formData.password}
                                    onChangeText={(t) => setFormData({ ...formData, password: t })}
                                    placeholder="Create a strong password"
                                    secureTextEntry={!showPassword}
                                    error={errors.password}
                                    variant="outline"
                                    right={
                                        <Pressable onPress={() => setShowPassword((s) => !s)}>
                                            <Text className="text-gray-600">{showPassword ? "Hide" : "Show"}</Text>
                                        </Pressable>
                                    }
                                />
                                {/* Realtime Validation */}
                                <View className="gap-1">
                                    {passwordRequirements.map((req, index) => (
                                        <View key={index} className="flex-row items-center gap-2">
                                            <Text className={req.valid ? 'text-success text-xs' : 'text-muted-foreground text-xs'}>
                                                {req.valid ? '✓' : '✕'}
                                            </Text>
                                            <Text className={req.valid ? 'text-success text-xs' : 'text-muted-foreground text-xs'}>
                                                {req.text}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View className="gap-2">
                                <Input
                                    label="Confirm Password *"
                                    value={formData.confirmPassword}
                                    onChangeText={(t) => setFormData({ ...formData, confirmPassword: t })}
                                    placeholder="Confirm your password"
                                    secureTextEntry={!showConfirmPassword}
                                    error={errors.confirmPassword}
                                    variant="outline"
                                    right={
                                        <Pressable onPress={() => setShowConfirmPassword((s) => !s)}>
                                            <Text className="text-gray-600">{showConfirmPassword ? "Hide" : "Show"}</Text>
                                        </Pressable>
                                    }
                                />
                            </View>

                            <View className="flex-row items-center gap-2">
                                <Checkbox
                                    checked={formData.acceptTerms}
                                    onCheckedChange={(v) => setFormData({ ...formData, acceptTerms: v })}
                                />
                                <View className="flex-1">
                                    <Text className="text-sm">
                                        I accept the{" "}
                                        <Link href="/terms" className="text-primary">Terms of Service</Link>{" "}
                                        and{" "}
                                        <Link href="/privacy" className="text-primary">Privacy Policy</Link>
                                    </Text>
                                </View>
                            </View>
                            {errors.acceptTerms ? <Text className="text-sm text-red-600">{errors.acceptTerms}</Text> : null}

                            <Button
                                title={isSubmitting ? "Creating Account..." : "Create Account"}
                                variant='primary'
                                onPress={handleSubmit}
                                disabled={
                                    isSubmitting ||
                                    !otpVerified ||
                                    !formData.acceptTerms ||
                                    usernameStatus === 'taken' ||
                                    usernameStatus === 'checking'
                                }
                            />
                        </View>

                        <View className="items-center">
                            <Text className="text-sm text-gray-500">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="text-primary">Sign in</Link>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
