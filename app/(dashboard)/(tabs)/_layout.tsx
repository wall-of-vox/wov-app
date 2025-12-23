import { Tabs } from "expo-router";
import { User, Search, Heart, House } from "lucide-react-native";
import { useGetCurrentUserQuery } from "@/features/user/userApi";
import { useAppSelector } from "@/lib/redux/hooks";
import { Image as RNImage } from "react-native";

export default function TabsLayout() {
  const token = useAppSelector((s) => s.auth.token);
  const { data } = useGetCurrentUserQuery(undefined, { skip: !token });
  const isProfessional = (data as any)?.type === "professional";
  const ProfileImage = isProfessional ? data?.logo : data?.profilePhoto;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { paddingTop: 6 },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => <House color={color} size={size + 4} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => <Search color={color} size={size + 4} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size + 4} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) =>
            ProfileImage ? (
              <RNImage
                source={{ uri: ProfileImage }}
                style={{ width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 }}
                className="border border-mutedForeground/40"
              />
            ) : (
              <User color={color} size={size + 4} />
            ),
        }}
      />
    </Tabs>
  );
}
