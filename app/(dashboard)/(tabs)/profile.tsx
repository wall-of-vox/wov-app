import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Linking, Image as RNImage, useWindowDimensions } from "react-native";
import ReviewsList from '@/components/ui/ReviewsList';
import FollowersList from '@/components/ui/FollowersList';
import FollowingList from '@/components/ui/FollowingList';
import { useState } from 'react';
import { useGetCurrentUserQuery } from '@/features/user/userApi';
import { useGetFollowersQuery, useGetFollowingQuery } from '@/features/follow/followApi';
import { useGetReviewsByUserIdQuery } from '@/features/review/reviewApi';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Link as LinkIcon, Send, UserPen } from 'lucide-react-native';
import { SvgUri } from 'react-native-svg';
import { getSocialMeta } from '@/data/socialPlatforms';
import Button from '@/components/ui/button';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'followers' | 'following'>('reviews');
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const maxContentWidth = isTablet ? 720 : 480;
  const avatarSize = isTablet ? 160 : 120;
  const socialIconSize = isTablet ? 28 : 24;
  const actionButtonSize = isTablet ? 36 : 32;
  const actionIconSize = isTablet ? 22 : 18;
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const userId = user?.userId;
  const { data: followersResp, isLoading: followersLoading, isFetching: followersFetching } = useGetFollowersQuery({ userId, limit: 20, loggedInUserId: userId }, { skip: !userId });
  const { data: followingResp, isLoading: followingLoading, isFetching: followingFetching } = useGetFollowingQuery({ userId, limit: 20, loggedInUserId: userId }, { skip: !userId });
  const { data: reviewsResp, isLoading: reviewsLoading, isFetching: reviewsFetching } = useGetReviewsByUserIdQuery({ userId, page: 1, limit: 20, loggedInUserId: userId }, { skip: !userId });
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
        <View className="w-full self-center gap-6" style={{ maxWidth: maxContentWidth, alignSelf: 'center' }}>

          {/* Profile Card */}
          <View className="w-full rounded-xl border border-gray-200">
            {/* Row 1 */}
            <View className="bg-secondary text-white rounded-t-xl gap-2 p-4">

              {/* Profile Avatar */}
              <View className="w-full items-center justify-center">
                <Avatar size={avatarSize}>
                  <AvatarImage source={ProfileImage ? { uri: ProfileImage } : undefined} />
                </Avatar>
              </View>

              <Text className="text-xl font-bold text-white">@{user?.username ?? "user"}</Text>
              <Text className="text-white">{user?.name ?? "User"}</Text>

              {/* Social Links */}
              <View className="flex-row gap-3 mb-3">
                {Object.entries((user as any)?.socialLinks || {}).map(([platform, url]) => {
                  const meta = getSocialMeta(String(platform));
                  const localIcon =
                    meta?.id === "linkedin" ? require("../../../assets/social-icons/linkedin.svg") :
                      meta?.id === "instagram" ? require("../../../assets/social-icons/instagram.svg") :
                        meta?.id === "twitter" || meta?.id === "x" ? require("../../../assets/social-icons/x.svg") :
                          meta?.id === "facebook" ? require("../../../assets/social-icons/facebook.svg") :
                            meta?.id === "youtube" ? require("../../../assets/social-icons/youtube.svg") :
                              meta?.id === "github" ? require("../../../assets/social-icons/github.svg") :
                                meta?.id === "dribbble" ? require("../../../assets/social-icons/dribbble.svg") :
                                  undefined;
                  const uri = localIcon ? RNImage.resolveAssetSource(localIcon)?.uri : undefined;
                  return (
                    <Pressable
                      key={platform}
                      accessibilityRole="link"
                      accessibilityLabel={meta?.name || platform}
                      onPress={() => (url ? Linking.openURL(String(url)) : undefined)}
                      className="p-1"
                    >
                      {uri ? (
                        <SvgUri width={socialIconSize} height={socialIconSize} uri={uri} />
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
                  onPress={() => router.replace("/dashboard/edit-profile")}
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
                <Text className="">{user?.bio ?? "No bio"}</Text>
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
          {activeTab === 'reviews' ? <ReviewsList reviews={reviews} /> : null}
          {activeTab === 'followers' ? <FollowersList followers={followers} /> : null}
          {activeTab === 'following' ? <FollowingList following={following} /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
