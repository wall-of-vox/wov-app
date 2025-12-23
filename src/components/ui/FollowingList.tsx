import { View, Text } from "react-native";

type Edge = { id?: string; user_data?: { username?: string; name?: string } };

export default function FollowingList({ following = [] as Edge[] }: { following?: Edge[] }) {
  return (
    <View className="w-full">
      <Text className="text-base font-semibold">Following</Text>
      <View className="mt-3 gap-3">
        {following.length === 0 ? (
          <View className="p-3 border border-gray-200 rounded-xl">
            <Text className="text-gray-600">Not following anyone</Text>
          </View>
        ) : (
          following.map((f, idx) => (
            <View key={f.id ?? idx} className="p-3 border border-gray-200 rounded-xl">
              <Text>@{f.user_data?.username ?? f.user_data?.name ?? "user"}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
