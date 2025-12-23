import { View, Text, Pressable } from "react-native";
import { Users, UserPlus } from "lucide-react-native";
import { router } from "expo-router";
import Button from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFollowUserMutation, useUnfollowUserMutation } from "@/features/follow/followApi";
import { UserPreferenceKey } from "@/types";

type Edge = {
  id?: string;
  followeeId?: string;
  followingStatus?: "ACCEPTED" | "UNFOLLOWED" | "PENDING" | "NONE";
  user_data?: {
    userId?: string;
    type?: "personal" | "professional";
    username?: string;
    name?: string;
    brandName?: string;
    logo?: string;
    profilePhoto?: string;
    bio?: string;
    userPreferences?: Record<string, unknown>;
  };
};

export default function FollowingList({
  following = [] as Edge[],
  isLoading = false,
  type = "dashboard",
  loggedInUserId,
}: {
  following?: Edge[];
  isLoading?: boolean;
  type?: string;
  loggedInUserId?: string;
}) {
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  if (isLoading) {
    return (
      <View className="w-full space-y-4">
        {[...Array(3)].map((_, index) => (
          <View key={index} className="p-4 border border-gray-200 rounded-xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-gray-200 rounded-full" />
                <View className="gap-2">
                  <View className="h-4 bg-gray-200 rounded w-32" />
                  <View className="h-3 bg-gray-200 rounded w-24" />
                </View>
              </View>
              <View className="h-8 bg-gray-200 rounded w-20" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (following.length === 0) {
    return (
      <View className="border border-gray-200 rounded-xl p-6 items-center">
        <Users size={48} color="#6B7280" />
        <Text className="font-semibold mt-4 mb-2">Not following anyone</Text>
        <Text className="text-gray-600 mb-4">Start engaging with the community to find people to follow!</Text>
        <Button
          title="Find People to Follow"
          variant="primary"
          onPress={() => router.push("/(dashboard)/explore")}
        />
      </View>
    );
  }

  return (
    <View className="w-full gap-3">
      {following.map((edge) => {
        const targetId = edge.followeeId || edge.user_data?.userId || edge.id || "";
        const href =
          type === "dashboard" || type === "explore"
            ? `/(dashboard)/explore/profile/${edge.followeeId || targetId}`
            : `/explore/profile/${edge.followeeId || targetId}`;
        const displayName =
          edge.user_data?.type === "professional" ? edge.user_data?.brandName : edge.user_data?.name;
        const avatarSrc =
          edge.user_data?.type === "professional" ? edge.user_data?.logo : edge.user_data?.profilePhoto;
        const bgColor =
          (edge.user_data?.userPreferences?.[UserPreferenceKey.FRAME_BG_COLOR as any] as string) || "#181818";

        const isSelf =
          edge?.followeeId === loggedInUserId || edge?.user_data?.userId === loggedInUserId;

        const renderFollowButton = () => {
          if (!(type === "dashboard" || type === "explore")) return null;
          if (isSelf) return null;
          if (edge.followingStatus === "ACCEPTED") {
            return (
              <Button
                title="Following"
                variant="outline"
                onPress={() => unfollowUser({ userId: targetId })}
              />
            );
          }
          if (edge.followingStatus === "UNFOLLOWED") {
            return (
              <Button
                title="Follow Back"
                variant="primary"
                onPress={() => followUser({ userId: targetId })}
              />
            );
          }
          if (edge.followingStatus === "PENDING") {
            return <Button title="Requested" variant="primary" disabled />;
          }
          return (
            <Button
              title="Follow"
              variant="primary"
              onPress={() => followUser({ userId: targetId })}
            />
          );
        };

        return (
          <View key={edge.id ?? targetId} className="p-4 border border-gray-200 rounded-xl">
            <Pressable
              onPress={() => router.push(href as any)}
              className="flex-row items-center justify-between gap-3"
            >
              <View className="flex-row items-center gap-4">
                {avatarSrc ? (
                  <Avatar size={42}>
                    <AvatarImage source={avatarSrc ? { uri: avatarSrc } : undefined} style={{ backgroundColor: bgColor }} />
                    <AvatarFallback>
                      {String(displayName || targetId)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <View className="w-12 h-12 bg-mutedForeground/20 rounded-full flex items-center justify-center">
                    <Text className="text-white text-2xl font-bold">{String(displayName || targetId)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}</Text>
                  </View>
                )}
                <Text className="font-medium">{displayName}</Text>
              </View>
              {renderFollowButton()}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
