import { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { defaultCategories } from '@/data/categories';
import { useSetUserProfileMutation } from '@/features/user/userApi';

export default function Preferences() {
    const params = useLocalSearchParams<{ type?: string }>();
    const initialType = (params?.type as 'personal' | 'professional' | undefined) ?? undefined;
    const [accountType, setAccountType] = useState<'personal' | 'professional' | undefined>(initialType);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [setUserProfile, { isLoading: isSaving }] = useSetUserProfileMutation();

    useEffect(() => {
        setAccountType(initialType);
    }, [initialType]);

    const filteredCategories = useMemo(
        () =>
            defaultCategories.filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [searchQuery]
    );

    const toggleCategory = (name: string) => {
        if (accountType === 'professional') {
            setSelectedCategories([name]);
            return;
        }
        setSelectedCategories((prev) =>
            prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
        );
    };

    const handleSubmit = async () => {
        setError(undefined);
        if (!accountType) {
            setError('Please select a user type');
            return;
        }
        if (accountType === 'professional') {
            if (selectedCategories.length < 1) {
                setError('Please select one category that represents your profession.');
                return;
            }
        } else {
            if (selectedCategories.length < 1) {
                setError('Please choose at least one interest category to continue.');
                return;
            }
        }
        setIsLoading(true);
        const payload =
            accountType === 'professional'
                ? { type: 'professional', professionService: selectedCategories[0] }
                : { type: 'personal', preferredCategories: selectedCategories };
        try {
            const result = await setUserProfile(payload as { type: "personal" | "professional"; professionService?: string; preferredCategories?: string[] }).unwrap();
            setIsLoading(false);
            router.push('/(dashboard)/feed');
        } catch (e: any) {
            setIsLoading(false);
            setError(
                e?.data?.error?.message || e?.data?.message || 'Something went wrong'
            );
        }
    };

    const Header = (
        <View className="flex-col px-4 py-6 gap-6">
            <View className="items-center gap-4">
                <Image
                    source={require('../../assets/logo.png')}
                    className="w-16 h-16 rounded-xl"
                    resizeMode="contain"
                />
                <Text className="max-w-md text-center">
                    {accountType === 'professional'
                        ? 'Select one category that best represents your business.'
                        : 'Select categories that interest you to get personalized brand recommendations and discover trusted reviews.'}
                </Text>
            </View>
            <View className="flex-col justify-between gap-2 px-1">
                <Text>
                    Selected {selectedCategories.length} out of{' '}
                    {accountType === 'professional' ? 1 : defaultCategories.length}
                </Text>
                <View className="mb-4">
                    <Input
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search for a category..."
                        variant="outline"
                    />
                </View>
            </View>
            {error ? (
                <View className="bg-red-50 border border-red-500 rounded-md p-3 mt-4">
                    <Text className="text-red-700">{error}</Text>
                </View>
            ) : null}
        </View>
    );

    const Footer = (
        <View className="p-4 gap-4">
            <View className="items-center">
                <Button
                    title={isLoading || isSaving ? 'Saving Preferences...' : 'Continue to Dashboard'}
                    variant="primary"
                    onPress={handleSubmit}
                    disabled={selectedCategories.length === 0 || isLoading || isSaving}
                    className="px-4 py-3 w-full"
                />
            </View>
            <View className="items-center">
                <Text className="text-sm text-gray-500">
                    You can always change your preferences later in your profile settings
                </Text>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: { id: string; name: string; img: any } }) => {
        const selected = selectedCategories.includes(item.name);
        return (
            <TouchableOpacity
                className="w-[48%] rounded-xl"
                onPress={() => toggleCategory(item.name)}
                activeOpacity={0.7}
            >
                <View className="rounded-xl overflow-hidden">
                    <Image
                        source={item.img}
                        className="w-full h-36"
                        resizeMode="cover"
                    />
                </View>
                {selected ? (
                    <View className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full items-center justify-center">
                        <Text className="text-white">✓</Text>
                    </View>
                ) : null}
                <Text className="text-sm mt-2 mb-6">{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FlatList
                data={filteredCategories}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16, rowGap: 16 }}
                renderItem={renderItem}
                ListHeaderComponent={Header}
                ListFooterComponent={Footer}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={5}
                removeClippedSubviews
                updateCellsBatchingPeriod={50}
                contentContainerStyle={{ paddingBottom: 96 }}
                extraData={selectedCategories}
            />
        </SafeAreaView>
    );
}

