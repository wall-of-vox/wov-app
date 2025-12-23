import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Linking } from "react-native";
import ReviewsList from '@/components/ui/ReviewsList';
import FollowersList from '@/components/ui/FollowersList';
import FollowingList from '@/components/ui/FollowingList';
import { useState } from 'react';
import { useGetCurrentUserQuery } from '@/features/user/userApi';
import { useGetFollowersQuery, useGetFollowingQuery } from '@/features/follow/followApi';
import { useGetReviewsByUserIdQuery } from '@/features/review/reviewApi';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Link as LinkIcon } from 'lucide-react-native';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'followers' | 'following'>('reviews');
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = user?.userId;
  const { data: followersResp, isLoading: followersLoading, isFetching: followersFetching } = useGetFollowersQuery({ userId, limit: 20 }, { skip: !userId });
  const { data: followingResp, isLoading: followingLoading, isFetching: followingFetching } = useGetFollowingQuery({ userId, limit: 20 }, { skip: !userId });
  const { data: reviewsResp, isLoading: reviewsLoading, isFetching: reviewsFetching } = useGetReviewsByUserIdQuery({ userId, page: 1, limit: 20 }, { skip: !userId });
  const followers = followersResp?.data ?? [];
  const following = followingResp?.data ?? [];
  const reviews = reviewsResp?.data?.reviews ?? [];
  const followersIsLoading = followersLoading || followersFetching;
  const followingIsLoading = followingLoading || followingFetching;
  const reviewsIsLoading = reviewsLoading || reviewsFetching;
  const reviewsCountList = reviewsResp?.data?.pagination?.total ?? 0;
  const followersCountList = followersResp?.pagination?.totalCount ?? 0;
  const followingCountList = followingResp?.pagination?.totalCount ?? 0;

  const isProfessional = (user as any)?.type === "professional";
  const ProfileImage = isProfessional ? user?.logo : user?.profilePhoto;

  if (userLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-24"
        keyboardShouldPersistTaps="handled"
        scrollEnabled
      >
        <View className="w-full self-center gap-6">

          {/* Profile Card */}
          <View className="w-full rounded-xl border border-gray-200">
            {/* Row 1 */}
            <View className="bg-secondary text-white rounded-t-xl gap-2 p-4">

              {/* Profile Avatar */}
              <View className="w-full items-center justify-center">
                <Avatar size={130}>
                  <AvatarImage source={ProfileImage ? { uri: ProfileImage } : undefined} />
                </Avatar>
              </View>

              <Text className="text-xl font-bold text-white">@{user?.username ?? "user"}</Text>
              <Text className="text-white">{user?.name ?? "User"}</Text>

              {/* Social Links */}
              <View className="flex-row gap-3 mb-3">
                {Object.entries((user as any)?.socialLinks || {}).map(([platform, url]) => (
                  <Pressable
                    key={platform}
                    accessibilityRole="link"
                    accessibilityLabel={platform}
                    onPress={() => (url ? Linking.openURL(String(url)) : undefined)}
                    className="p-1"
                  >
                    <LinkIcon size={24} color="#ffffff" />
                  </Pressable>
                ))}
              </View>

            </View>

            {/* Row 2 */}
            <View className='bg-white rounded-b-xl p-4'>
              <View className="flex-row items-center gap-2">
                <Text className="">{user?.bio ?? "No bio"}</Text>
              </View>
              <View className="flex-row items-center justify-around">
                <Pressable className="py-3" onPress={() => setActiveTab('reviews')}>
                  <Text className={activeTab === 'reviews' ? 'text-black font-semibold' : 'text-gray-600'}>Reviews</Text>
                  <Text className="text-sm text-gray-600">{reviewsCountList}</Text>
                </Pressable>
                <Pressable className="py-3" onPress={() => setActiveTab('followers')}>
                  <Text className={activeTab === 'followers' ? 'text-black font-semibold' : 'text-gray-600'}>Followers</Text>
                  <Text className="text-sm text-gray-600">{followersCountList}</Text>
                </Pressable>
                <Pressable className="py-3" onPress={() => setActiveTab('following')}>
                  <Text className={activeTab === 'following' ? 'text-black font-semibold' : 'text-gray-600'}>Following</Text>
                  <Text className="text-sm text-gray-600">{followingCountList}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Child Components */}
          {activeTab === 'reviews' ? <ReviewsList reviews={reviews} /> : null}
          {activeTab === 'followers' ? <FollowersList followers={followers} /> : null}
          {activeTab === 'following' ? <FollowingList following={following} /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
