import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-1 justify-center px-4 pb-24"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-md self-center items-center">
          <Text className="text-2xl font-bold">Feed</Text>
          <Text className="text-xl">Watch the latest content and brands</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}