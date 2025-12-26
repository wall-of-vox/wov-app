import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Linking, Image as RNImage, useWindowDimensions } from "react-native";
import ReviewsList from '@/components/ui/ReviewsList';
import FollowersList from '@/components/ui/FollowersList';
import FollowingList from '@/components/ui/FollowingList';
import { useState } from 'react';
import { useGetCurrentUserQuery, useGetUserProfileByIdQuery } from '@/features/user/userApi';
import { useGetFollowersQuery, useGetFollowingQuery, useGetFollowStatusQuery, useGetMutualConnectionsQuery } from '@/features/follow/followApi';
import { useGetReviewsByUserIdQuery } from '@/features/review/reviewApi';
import { Avatar, AvatarFallback, AvatarImage, FramedAvatar } from '@/components/ui/avatar';
import { ExternalLinkIcon, Link as LinkIcon, Pencil, Send, UserPen } from 'lucide-react-native';
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
  const socialIconSize = isTablet ? 32 : 28;
  const actionButtonSize = isTablet ? 36 : 32;
  const actionIconSize = isTablet ? 22 : 18;
  const params = useLocalSearchParams<{ userId?: string; usarId?: string }>();
  const requestedUserId = (params.userId ?? params.usarId ?? "") as string;

  const { data: loggedUser } = useGetCurrentUserQuery();
  const loggedInUserId = loggedUser?.userId;
  const { data: profileUser, isLoading: profileLoading } = useGetUserProfileByIdQuery(requestedUserId, { skip: !requestedUserId });
  const canFollow = !!(profileUser?.userId && profileUser?.userId !== loggedInUserId);

  // Follow relationship status between current viewer and the profile being viewed
  const { data: followStatusRes } = useGetFollowStatusQuery({ userId: requestedUserId, loggedInUserId }, { skip: !loggedInUserId || !requestedUserId });

  const { data: followersResp, isLoading: followersLoading, isFetching: followersFetching } =
    useGetFollowersQuery({ userId: requestedUserId, limit: 20, loggedInUserId }, { skip: !requestedUserId });
  const { data: followingResp, isLoading: followingLoading, isFetching: followingFetching } =
    useGetFollowingQuery({ userId: requestedUserId, limit: 20, loggedInUserId }, { skip: !requestedUserId });
  const { data: reviewsResp, isLoading: reviewsLoading, isFetching: reviewsFetching } =
    useGetReviewsByUserIdQuery({ userId: requestedUserId, page: 1, limit: 20, loggedInUserId }, { skip: !requestedUserId });
  const { data: mutualConnectionsResp, isLoading: mutualConnectionsLoading, isFetching: mutualConnectionsFetching } =
    useGetMutualConnectionsQuery({ userId: profileUser?.userId, limit: 20 });

  const nameOf = (u?: any) => {
    if (!u) return "";
    if (u.type === "professional") return u.brandName || u.username || u.name || "";
    return u.username || u.name || "";
  };
  const mutualTotal = mutualConnectionsResp?.pagination?.totalCount ?? mutualConnectionsResp?.data?.length ?? 0;
  const mutualNames = (mutualConnectionsResp?.data ?? []).map((mc: any) => nameOf(mc.user)).filter(Boolean);
  const renderNameList = (names: string[]) => (
    <>
      {names.map((n, i) => (
        <Text key={i} className="font-semibold text-white">{i > 0 ? ", " : ""}{n}</Text>
      ))}
    </>
  );

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

              <Text className="text-xl font-bold text-white">@{profileUser?.username}</Text>
              <Text className="text-white">{profileUser?.brandName || profileUser?.name}</Text>

              {/* Social Links */}
              <View className="flex-row gap-2 mt-2">
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

              {/* Mutual Followers */}
              {mutualConnectionsResp?.data?.length ? (
                <View className="flex-row items-center gap-3 my-2">
                  <View className="flex-row">
                    {mutualConnectionsResp.data.slice(0, 3).map((mc: any, index: number) => (
                      <Avatar
                        size={30}
                        key={mc.user?.userId ?? mc.followerId}
                        className="w-6 h-6 border-2 border-white"
                        style={{ marginLeft: index > 0 ? -12 : 0 }}
                      >
                        <AvatarImage src={((mc.user?.type === "professional" ? mc.user?.logo : mc.user?.profilePhoto) || "")} />
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          {nameOf(mc.user).charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </View>
                  <Text className="text-white w-10/12">
                    Followed by {renderNameList(mutualNames.slice(0, 3))}
                    {mutualTotal > 3 ? ` and ${mutualTotal - 3} others` : ""}
                  </Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View className="flex-row gap-3 justify-end items-center">
                {/* Profession Service for Mobile */}
                {isProfessional && (
                  <Text className="bg-white text-secondary rounded-r-md absolute -left-4 px-2 py-1">
                    {profileUser?.professionService}
                  </Text>
                )}

                <Pressable
                  className='bg-white text-black rounded-full'
                  style={{ width: actionButtonSize, height: actionButtonSize, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Send size={actionIconSize} color="#111827" />
                </Pressable>
              </View>
            </View>

            {/* Row 2 */}
            <View className='bg-white rounded-b-xl p-4 gap-4'>
                <View className="flex flex-row gap-3">
                  {isProfessional && <Pressable
                    className="flex-1 flex-row items-center justify-center gap-2 bg-primary py-2 rounded-full"
                  >
                    <Pencil size={20} color="#ffffff" />
                    <Text className="text-white">Write a Review</Text>
                  </Pressable>}

                  {profileUser?.website && (
                    <Pressable
                      className="flex-1"
                    >
                      <ExternalLinkIcon size={20} color="#ffffff" />
                      <Text className="text-white">Visit Website</Text>
                    </Pressable>
                  )}
                </View>
              <Pressable>
                <View className="w-full flex justify-center gap-1">
                  {canFollow &&
                    (followStatusRes?.isFollowing &&
                      followStatusRes?.followingStatus === "ACCEPTED" ? (
                      <Button
                        title='Following'
                        variant="primary"
                        className="w-full"
                      />
                    ) : followStatusRes?.followingStatus === "PENDING" ? (
                      <Button
                        title='Requested'
                        variant="primary"
                        className="w-full"
                      />
                    ) :
                      followStatusRes?.isFollowed &&
                        (followStatusRes?.followedStatus === "ACCEPTED" ||
                          followStatusRes?.followedStatus === "PENDING") &&
                        (followStatusRes?.followingStatus === "UNFOLLOWED" ||
                          followStatusRes?.followingStatus === "NONE") ? (
                        <Button
                          title='Follow Back'
                          variant="primary"
                          className="w-full"
                        />
                      ) : (
                        <Button
                          title='Follow'
                          variant="primary"
                          className="w-full"
                        />
                      ))}
                </View>
              </Pressable>
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
