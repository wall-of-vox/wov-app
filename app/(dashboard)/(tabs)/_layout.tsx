import { Tabs } from "expo-router";
import { User, Search, Heart, LayoutGrid, Image, BarChart3, House } from "lucide-react-native";
import { useGetCurrentUserQuery } from "@/features/user/userApi";
import { useAppSelector } from "@/lib/redux/hooks";

export default function TabsLayout() {
  const token = useAppSelector((s) => s.auth.token);
  const { data } = useGetCurrentUserQuery(undefined, { skip: !token });
  const isProfessional = (data as any)?.type === "professional";

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

