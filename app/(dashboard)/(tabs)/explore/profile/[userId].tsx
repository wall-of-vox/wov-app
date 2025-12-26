import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Linking, Image as RNImage, useWindowDimensions } from "react-native";
import ReviewsList from '@/components/ui/ReviewsList';
import FollowersList from '@/components/ui/FollowersList';
import FollowingList from '@/components/ui/FollowingList';
import { useState } from 'react';
import { useGetCurrentUserQuery, useGetUserProfileByIdQuery } from '@/features/user/userApi';
import { useGetFollowersQuery, useGetFollowingQuery } from '@/features/follow/followApi';
import { useGetReviewsByUserIdQuery } from '@/features/review/reviewApi';
import { FramedAvatar } from '@/components/ui/avatar';
import { Link as LinkIcon, Send, UserPen } from 'lucide-react-native';
import { SvgUri } from 'react-native-svg';
import { getSocialMeta } from '@/data/socialPlatforms';
import Button from '@/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { UserPreferenceKey } from '@/types';

export default function ExploreProfileScreen() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'followers' | 'following'>('reviews');
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const maxContentWidth = isTablet ? 720 : 480;
  const avatarSize = isTablet ? 160 : 120;
  const socialIconSize = isTablet ? 28 : 24;
  const actionButtonSize = isTablet ? 36 : 32;
  const actionIconSize = isTablet ? 22 : 18;
  const params = useLocalSearchParams<{ userId?: string; usarId?: string }>();
  const requestedUserId = (params.userId ?? params.usarId ?? "") as string;

  const { data: loggedUser } = useGetCurrentUserQuery();
  const loggedInUserId = loggedUser?.userId;
  const { data: profileUser, isLoading: profileLoading } = useGetUserProfileByIdQuery(requestedUserId, { skip: !requestedUserId });
  const { data: followersResp, isLoading: followersLoading, isFetching: followersFetching } =
    useGetFollowersQuery({ userId: requestedUserId, limit: 20, loggedInUserId }, { skip: !requestedUserId });
  const { data: followingResp, isLoading: followingLoading, isFetching: followingFetching } =
    useGetFollowingQuery({ userId: requestedUserId, limit: 20, loggedInUserId }, { skip: !requestedUserId });
  const { data: reviewsResp, isLoading: reviewsLoading, isFetching: reviewsFetching } =
    useGetReviewsByUserIdQuery({ userId: requestedUserId, page: 1, limit: 20, loggedInUserId }, { skip: !requestedUserId });

  const followers = followersResp?.data ?? [];
  const following = followingResp?.data ?? [];
  const reviews = reviewsResp?.data?.reviews ?? [];
  const followersIsLoading = followersLoading || followersFetching;
  const followingIsLoading = followingLoading || followingFetching;
  const reviewsIsLoading = reviewsLoading || reviewsFetching;
  const reviewsCountList = reviewsResp?.data?.pagination?.total ?? 0;
  const followersCountList = followersResp?.pagination?.totalCount ?? 0;
  const followingCountList = followingResp?.pagination?.totalCount ?? 0;

  const isProfessional = (profileUser as any)?.type === "professional";
  const ProfileImage = isProfessional ? profileUser?.logo : profileUser?.profilePhoto;
  const frameShape = ((profileUser as any)?.userPreferences?.[UserPreferenceKey.PROFILE_FRAME] || (isProfessional ? "circle" : "oval")) as "circle" | "oval" | "no-frame";
  const frameBgColor = (profileUser as any)?.userPreferences?.[UserPreferenceKey.FRAME_BG_COLOR] as string | undefined;


  if (profileLoading || !profileUser) {
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
        <View className="w-full self-center gap-6" style={{ maxWidth: maxContentWidth, alignSelf: 'center' }}>

          {/* Profile Card */}
          <View className="w-full rounded-xl border border-gray-200">
            {/* Row 1 */}
            <View className="bg-secondary text-white rounded-t-xl gap-2 p-4">

              {/* Profile Avatar */}
              <View className="w-full items-center justify-center">
                <FramedAvatar
                  frameType={frameShape}
                  isTablet={isTablet}
                  bgColor={frameBgColor}
                  source={ProfileImage ? { uri: ProfileImage } : undefined}
                  initials={(isProfessional ? (profileUser as any)?.brandName ?? "" : profileUser?.name ?? "").slice(0, 2).toUpperCase() || ""}
                />
              </View>

              <Text className="text-xl font-bold text-white">@{profileUser?.username ?? "user"}</Text>
              <Text className="text-white">{profileUser?.name ?? "User"}</Text>

              {/* Social Links */}
              <View className="flex-row gap-3 mb-3">
                {Object.entries((profileUser as any)?.socialLinks || {}).map(([platform, url]) => {
                  const meta = getSocialMeta(String(platform));
                  return (
                    <Pressable
                      key={platform}
                      accessibilityRole="link"
                      accessibilityLabel={meta?.name || platform}
                      onPress={() => (url ? Linking.openURL(String(url)) : undefined)}
                      className="p-1"
                    >
                      {meta?.icon ? (
                        <SvgUri width={socialIconSize} height={socialIconSize} uri={meta?.icon} />
                      ) : (
                        <LinkIcon size={socialIconSize} color="#ffffff" />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 justify-end">
                <Pressable
                  className='bg-white text-black rounded-full'
                  style={{ width: actionButtonSize, height: actionButtonSize, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => router.push("(dashboard)/(tabs)/profile/edit-profile")}
                >
                  <UserPen size={actionIconSize} color="#111827" />
                </Pressable>
                <Pressable
                  className='bg-white text-black rounded-full'
                  style={{ width: actionButtonSize, height: actionButtonSize, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Send size={actionIconSize} color="#111827" />
                </Pressable>
              </View>
            </View>

            {/* Row 2 */}
            <View className='bg-white rounded-b-xl p-4'>
              <View className="flex-row items-center gap-2">
                <Text className="">{profileUser?.bio ?? "No bio"}</Text>
              </View>
              <View className="flex-row items-center justify-around">
                <Pressable className="py-3" onPress={() => setActiveTab('reviews')}>
                  <Text className={activeTab === 'reviews' ? 'text-black font-semibold' : 'text-gray-600'}>Reviews</Text>
                  <Text className="text-sm text-gray-600 text-center">{reviewsCountList}</Text>
                </Pressable>
                <Pressable className="py-3" onPress={() => setActiveTab('followers')}>
                  <Text className={activeTab === 'followers' ? 'text-black font-semibold' : 'text-gray-600'}>Followers</Text>
                  <Text className="text-sm text-gray-600 text-center">{followersCountList}</Text>
                </Pressable>
                <Pressable className="py-3" onPress={() => setActiveTab('following')}>
                  <Text className={activeTab === 'following' ? 'text-black font-semibold' : 'text-gray-600'}>Following</Text>
                  <Text className="text-sm text-gray-600 text-center">{followingCountList}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Child Components */}
          {activeTab === 'reviews' ? (
            <ReviewsList
              reviews={reviews}
              isLoading={reviewsIsLoading}
              showUser={true}
              type="dashboard"
              userType={isProfessional ? 'professional' : 'personal'}
              loggedInUserId={loggedInUserId}
            />
          ) : null}
          {activeTab === 'followers' ? (
            <FollowersList
              followers={followers}
              isLoading={followersIsLoading}
              userId={profileUser?.id}
              loggedInUserId={loggedInUserId}
              nextCursor={followersResp?.pagination?.nextCursor}
              hasNext={!!followersResp?.pagination?.hasNext}
            />
          ) : null}
          {activeTab === 'following' ? (
            <FollowingList
              following={following}
              isLoading={followingIsLoading}
              userId={profileUser?.id}
              loggedInUserId={loggedInUserId}
              nextCursor={followingResp?.pagination?.nextCursor}
              hasNext={!!followingResp?.pagination?.hasNext}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
