import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";

export default function NotFound() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Page not found</Text>
      <Link href="/" asChild>
        <Pressable style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, backgroundColor: "#2563eb" }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go to Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
