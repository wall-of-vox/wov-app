import { useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/ui/button';
import { router } from 'expo-router';

export default function AccountTypeScreen() {
    const [userType, setUserType] = useState<'' | 'personal' | 'professional'>('');
    const [error, setError] = useState<string | undefined>(undefined);

    const handleNext = () => {
        if (!userType) {
            setError('Please select a user type');
            return;
        }
        setError(undefined);
        router.push(`/(auth)/preferences?type=${userType}`);
    };

    const selectedIsPersonal = userType === 'personal';
    const selectedIsProfessional = userType === 'professional';

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerClassName="flex-1 justify-center"
                keyboardShouldPersistTaps="handled"
            >
                <View className="w-full max-w-sm self-center">
                    <View className="items-center mb-4">
                            <Image
                                source={require('../../assets/logo.png')}
                                className="w-16 h-16 rounded-xl"
                                resizeMode="contain"
                            />
                            <Text className="text-xl font-medium mt-3">Select your profile type</Text>
                        </View>
                    <View className="items-center gap-5">
                        <View className="flex-row justify-between gap-2">
                            <View className="flex-1">
                                <Button
                                    title={`👤  Personal`}
                                    variant={selectedIsPersonal ? 'primary' : 'secondary'}
                                    onPress={() => {
                                        setUserType('personal');
                                        setError(undefined);
                                    }}
                                />
                            </View>
                            <View className="flex-1">
                                <Button
                                    title={`💼  Professional`}
                                    variant={selectedIsProfessional ? 'primary' : 'secondary'}
                                    onPress={() => {
                                        setUserType('professional');
                                        setError(undefined);
                                    }}
                                />
                            </View>
                        </View>

                        <View className="w-full border border-primary p-4 rounded-2xl">
                            {userType === 'personal' ? (
                                <View className="gap-1">
                                    <Text className="text-sm text-secondary">• Share reviews</Text>
                                    <Text className="text-sm text-secondary">• Discover brands</Text>
                                    <Text className="text-sm text-secondary">• Connect with other reviewers</Text>
                                    <Text className="text-sm text-secondary">• Ideal for personal use</Text>
                                </View>
                            ) : userType === 'professional' ? (
                                <View className="gap-1">
                                    <Text className="text-sm text-secondary">• Designed for businesses, brands, and professionals</Text>
                                    <Text className="text-sm text-secondary">• Access advanced features</Text>
                                    <Text className="text-sm text-secondary">• Analytics for insights</Text>
                                    <Text className="text-sm text-secondary">• Tools to manage professional presence</Text>
                                </View>
                            ) : (
                                <Text className="text-sm text-secondary text-center">
                                    Select a profile type to view tailored benefits and connect with the community.
                                </Text>
                            )}
                        </View>

                        {error ? (
                            <View className="bg-red-50 border border-red-500 rounded-md p-3 w-full">
                                <Text className="text-red-700">{error}</Text>
                            </View>
                        ) : null}

                        <Button
                            title="Next"
                            variant="primary"
                            onPress={handleNext}
                            disabled={!userType}
                            className='w-full'
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

