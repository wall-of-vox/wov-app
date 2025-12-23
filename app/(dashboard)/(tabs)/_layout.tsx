import { Tabs } from "expo-router";
import { User, Search, Heart, House } from "lucide-react-native";
import { useGetCurrentUserQuery } from "@/features/user/userApi";
import { useAppSelector } from "@/lib/redux/hooks";
import { Image as RNImage, Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const token = useAppSelector((s) => s.auth.token);
  const { data } = useGetCurrentUserQuery(undefined, { skip: !token });
  const isProfessional = (data as any)?.type === "professional";
  const ProfileImage = isProfessional ? data?.logo : data?.profilePhoto;
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const iconScale = isTablet ? 1.25 : 1.0;
  const tabHeight = isTablet ? 70 : 56;
  const tabPaddingTop = isTablet ? 8 : 2;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: tabPaddingTop,
          height: tabHeight + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
          borderTopWidth: Platform.OS === "android" ? 0.5 : 0,
        },
        tabBarItemStyle: {
          paddingVertical: isTablet ? 8 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => <House color={color} size={size * iconScale} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => <Search color={color} size={size * iconScale} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size * iconScale} />,
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
                style={{ width: size * iconScale + 2, height: size * iconScale + 2, borderRadius: (size * iconScale) / 2 }}
                className="border border-mutedForeground/40"
              />
            ) : (
              <User color={color} size={size * iconScale} />
            ),
        }}
      />
    </Tabs>
  );
}
