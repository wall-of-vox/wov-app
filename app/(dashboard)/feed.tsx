
import { View, Text, ScrollView, TextBase } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerClassName="flex-1 justify-center px-4"
                keyboardShouldPersistTaps="handled"
            >
                <View className="w-full max-w-md self-center flex justify-center items-center">
                    <Text className='text-2xl font-bold'>
                        User LoggedIn
                    </Text>
                    <Text className='text-xl'>Feed Page</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
