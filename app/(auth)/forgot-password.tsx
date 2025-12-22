import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSendMobileOTPMutation, useVerifyMobileOTPMutation, useSendEmailOTPMutation, useVerifyEmailOTPMutation, useResetPasswordMutation } from "@/features/auth/authApi";

export default function ForgotPasswordScreen() {
    const [formData, setFormData] = useState({
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<{
        form?: string;
        email?: string;
        mobile?: string;
        password?: string;
        confirmPassword?: string;
        contact?: string;
    }>({});
    const [contactMethod, setContactMethod] = useState<'email' | 'mobile'>('email');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpCode, setOtpCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const [sendMobileOTP, { isLoading: sendingMobile }] = useSendMobileOTPMutation();
    const [sendEmailOTP, { isLoading: sendingEmail }] = useSendEmailOTPMutation();
    const [verifyMobileOTP, { isLoading: verifyingMobile }] = useVerifyMobileOTPMutation();
    const [verifyEmailOTP, { isLoading: verifyingEmail }] = useVerifyEmailOTPMutation();
    const [resetPassword, { isLoading: resetting, error: resetError }] = useResetPasswordMutation();

    const handleSendOTP = async () => {
        if (contactMethod === 'email' && !formData.email) {
            setErrors((e) => ({ ...e, email: 'Email is required' }));
            return;
        }
        if (contactMethod === 'mobile' && !formData.mobile) {
            setErrors((e) => ({ ...e, mobile: 'Mobile is required' }));
            return;
        }
        setErrors((e) => ({ ...e, email: '', mobile: '', contact: '' }));
        try {
            if (contactMethod === 'email') {
                const res = await sendEmailOTP({ email: formData.email, purpose: "password_reset" }).unwrap();
                if (res.success) {
                    setOtpSent(true);
                    setOtpVerified(false);
                    setOtpTimer(60);
                } else {
                    setErrors((e) => ({ ...e, form: res.message || 'Failed to send OTP' }));
                }
            } else {
                const res = await sendMobileOTP({ mobile: formData.mobile, purpose: "password_reset" }).unwrap();
                if (res.success) {
                    setOtpSent(true);
                    setOtpVerified(false);
                    setOtpTimer(60);
                } else {
                    setErrors((e) => ({ ...e, form: res.message || 'Failed to send OTP' }));
                }
            }
        } catch (e: any) {
            const message = e?.data?.message || e?.error || 'Failed to send OTP';
            setErrors((ee) => ({ ...ee, form: message }));
        }
    };

    const handleVerifyOTP = async () => {
        if (otpCode.length !== 6) return;
        try {
            if (contactMethod === 'email') {
                const res = await verifyEmailOTP({ email: formData.email, otp: otpCode, purpose: "reset-password" }).unwrap();
                if (res.success) {
                    setOtpVerified(true);
                } else {
                    setErrors((e) => ({ ...e, form: res.message || 'Invalid code' }));
                }
            } else {
                const res = await verifyMobileOTP({ mobile: formData.mobile, otp: otpCode }).unwrap();
                if (res.success) {
                    setOtpVerified(true);
                } else {
                    setErrors((e) => ({ ...e, form: res.message || 'Invalid code' }));
                }
            }
        } catch (e: any) {
            const message = e?.data?.message || e?.error || 'Verification failed';
            setErrors((ee) => ({ ...ee, form: message }));
        }
    };

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

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const newErrors: typeof errors = {};
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm your password';
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!otpVerified) newErrors.form = 'Verify the OTP first';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setIsSubmitting(false);
            return;
        }
        try {
            const res = await resetPassword({
                email: contactMethod === 'email' ? formData.email : undefined,
                mobile: contactMethod === 'mobile' ? formData.mobile : undefined,
                otp: otpCode,
                password: formData.password,
            }).unwrap();
            if (res.success) {
                setErrors({});
            } else {
                setErrors((e) => ({ ...e, form: res.message || 'Reset failed' }));
            }
        } catch (e: any) {
            const message = e?.data?.message || e?.error || 'Reset failed';
            setErrors((ee) => ({ ...ee, form: message }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerClassName="flex-1 px-4"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                scrollEnabled
            >
                <View className="w-full max-w-md mx-auto bg-white text-primary shadow-none border-0">
                    <View className="items-center mb-4">
                        <View className="items-center mb-4">
                            <Image
                                source={require('../../assets/logo.png')}
                                className="w-16 h-16 rounded-xl"
                                resizeMode="contain"
                            />
                            <Text className="text-xl font-medium mt-3">Reset Your Password</Text>
                        </View>
                        <Text className="text-mutedForeground text-base text-center mt-1">
                            Enter your verified email or mobile{"\n"}to receive an OTP.
                        </Text>
                    </View>

                    <View className="gap-6">
                        {!otpVerified ? (
                            <View className="gap-4">
                                {errors.form ? (
                                    <View className="bg-red-50 border border-destructive rounded-md p-3">
                                        <Text className="text-red-700">{errors.form}</Text>
                                    </View>
                                ) : null}

                                <View className="gap-3 items-center">
                                    <Text className="text-sm">Choose your preferred contact method</Text>
                                    <RadioGroup
                                        value={contactMethod}
                                        onValueChange={(value) => {
                                            const v = value as 'email' | 'mobile';
                                            setContactMethod(v);
                                            setErrors((prev) => ({ ...prev, email: '', mobile: '', contact: '' }));
                                            resetOTPState();
                                            setOtpCode('');
                                        }}
                                        className="flex flex-row items-center gap-6"
                                        disabled={otpVerified}
                                    >
                                        <Pressable
                                            className="flex-row items-center gap-2"
                                            onPress={() => {
                                                setContactMethod('email');
                                                setErrors((prev) => ({ ...prev, email: '', mobile: '', contact: '' }));
                                                resetOTPState();
                                                setOtpCode('');
                                            }}
                                            disabled={otpVerified}
                                        >
                                            <RadioGroupItem value="email" />
                                            <Text className="text-base">Email Address</Text>
                                        </Pressable>
                                        <Pressable
                                            className="flex-row items-center gap-2"
                                            onPress={() => {
                                                setContactMethod('mobile');
                                                setErrors((prev) => ({ ...prev, email: '', mobile: '', contact: '' }));
                                                resetOTPState();
                                                setOtpCode('');
                                            }}
                                            disabled={otpVerified}
                                        >
                                            <RadioGroupItem value="mobile" />
                                            <Text className="text-base">Mobile Number</Text>
                                        </Pressable>
                                    </RadioGroup>
                                </View>

                                {contactMethod === 'email' ? (
                                    <View className="gap-2">
                                        <Text>Email Address *</Text>
                                        <View className="flex-row items-center gap-2">
                                            <View className="flex-1">
                                                <Input
                                                    value={formData.email}
                                                    onChangeText={(t) => setFormData({ ...formData, email: t })}
                                                    placeholder="your@email.com"
                                                    editable={!otpVerified}
                                                    variant="outline"
                                                />
                                            </View>
                                            <Button
                                                title={sendingEmail ? "Sending..." : (otpSent && otpTimer > 0 ? `Resend (${otpTimer}s)` : "Send OTP")}
                                                onPress={handleSendOTP}
                                                disabled={otpVerified || sendingEmail || !formData.email || (otpSent && otpTimer > 0)}
                                            />
                                        </View>
                                        {errors.email ? <Text className="text-sm text-red-600">{errors.email}</Text> : null}
                                    </View>
                                ) : (
                                    <View className="gap-2">
                                        <Text>Mobile Number *</Text>
                                        <View className={`flex-row items-center border rounded-full bg-white ${errors.mobile ? "border-red-500" : "border-primary"}`}>
                                            <View className="flex-row items-center px-3 py-2 border-r border-primary rounded-l-full">
                                                <Text className="text-lg mr-2">🇮🇳</Text>
                                                <Text className="text-sm font-medium">+91</Text>
                                            </View>
                                            <View className="flex-1 pl-2">
                                                <Input
                                                    value={formData.mobile}
                                                    onChangeText={(t) => {
                                                        const v = t.replace(/\D/g, '').slice(0, 10);
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
                                                title={sendingMobile ? "Sending..." : (otpSent && otpTimer > 0 ? `Resend (${otpTimer}s)` : "Send OTP")}
                                                onPress={handleSendOTP}
                                                disabled={sendingMobile || !formData.mobile || (otpSent && otpTimer > 0)}
                                            />
                                        ) : null}
                                        {errors.mobile ? <Text className="text-sm text-red-600">{errors.mobile}</Text> : null}
                                    </View>
                                )}

                                {otpSent && !otpVerified ? (
                                    <View className="gap-2">
                                        <Text>Verification Code</Text>
                                        <View className="flex-row items-center gap-2">
                                            <Input
                                                value={otpCode}
                                                onChangeText={setOtpCode}
                                                placeholder="Enter 6-digit code (123456)"
                                                maxLength={6}
                                                variant="outline"
                                            />
                                            <Button
                                                title={(verifyingEmail || verifyingMobile) ? "Verifying..." : "Verify"}
                                                onPress={handleVerifyOTP}
                                                disabled={!otpCode || verifyingEmail || verifyingMobile}
                                            />
                                        </View>
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
                            </View>
                        ) : (
                            <View className="gap-4">
                                <View className="gap-2">
                                    <Text>Password *</Text>
                                    <Input
                                        value={formData.password}
                                        onChangeText={(t) => setFormData({ ...formData, password: t })}
                                        placeholder="Create a strong password"
                                        secureTextEntry={!showPassword}
                                        variant="outline"
                                        right={
                                            <Pressable onPress={() => setShowPassword((s) => !s)}>
                                                <Text className="text-gray-600">{showPassword ? "Hide" : "Show"}</Text>
                                            </Pressable>
                                        }
                                    />
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
                                    {errors.password ? <Text className="text-sm text-red-600">{errors.password}</Text> : null}
                                </View>

                                <View className="gap-2">
                                    <Text>Confirm Password *</Text>
                                    <Input
                                        value={formData.confirmPassword}
                                        onChangeText={(t) => setFormData({ ...formData, confirmPassword: t })}
                                        placeholder="Confirm your password"
                                        secureTextEntry={!showConfirmPassword}
                                        variant="outline"
                                        right={
                                            <Pressable onPress={() => setShowConfirmPassword((s) => !s)}>
                                                <Text className="text-gray-600">{showConfirmPassword ? "Hide" : "Show"}</Text>
                                            </Pressable>
                                        }
                                    />
                                    {errors.confirmPassword ? <Text className="text-sm text-red-600">{errors.confirmPassword}</Text> : null}
                                </View>

                                <Button
                                    title={(isSubmitting || resetting) ? "Resetting..." : "Reset Password"}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting || resetting}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

