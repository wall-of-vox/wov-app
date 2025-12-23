import { View, Text } from "react-native";

type ReviewItem = { id?: string; title?: string; comment?: string; text?: string };

export default function ReviewsList({ reviews = [] as ReviewItem[] }: { reviews?: ReviewItem[] }) {
  return (
    <View className="w-full">
      <Text className="text-base font-semibold">Reviews</Text>
      <View className="mt-3 gap-3">
        {reviews.length === 0 ? (
          <View className="p-3 border border-gray-200 rounded-xl">
            <Text className="text-gray-600">No reviews yet</Text>
          </View>
        ) : (
          reviews.map((r, idx) => (
            <View key={r.id ?? idx} className="p-3 border border-gray-200 rounded-xl">
              <Text className="font-medium">{r.title ?? "Review"}</Text>
              <Text className="text-gray-700 mt-1">{r.comment ?? r.text ?? ""}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
