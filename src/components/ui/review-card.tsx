import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkMinus,
  Heart,
  BadgeCheck,
  BadgeX,
} from "lucide-react-native";
import { useLikeReviewMutation, useRemoveReviewLikeMutation } from "@/features/review/reviewApi";
import { useGetSavedListQuery, useSaveItemMutation, useRemoveSavedItemMutation } from "@/features/user/userApi";
import { UserPreferenceKey } from "@/types";

type ReviewUserData = {
  userId?: string;
  type?: "personal" | "professional";
  name?: string;
  brandName?: string;
  profilePhoto?: string;
  logo?: string;
  userPreferences?: Record<string, unknown>;
};

type ReviewAttachments = {
  images?: string[];
  videos?: string[];
};

export type ReviewItem = {
  id?: string;
  status?: "APPROVED" | "PENDING" | "REJECTED" | "REPORTED";
  title?: string;
  comment?: string;
  rating?: number;
  isRecommended?: boolean | null;
  updatedAt?: string;
  likeCounts?: number;
  dislikeCounts?: number;
  userLike?: { type?: 1 | -1 };
  attachments?: ReviewAttachments;
  user_data?: ReviewUserData;
};

export default function ReviewCard({
  review,
  showUser = true,
  type,
  userType,
  loggedInUserId,
  shouldHighlight,
}: {
  review: ReviewItem;
  showUser?: boolean;
  type?: "public" | "explore" | "dashboard" | "saved";
  userType?: "personal" | "professional";
  loggedInUserId?: string;
  shouldHighlight?: boolean;
}) {
  const [likeReview, { isLoading: isLiking }] = useLikeReviewMutation();
  const [removeReviewLike, { isLoading: isUnliking }] = useRemoveReviewLikeMutation();
  const [saveItem, { isLoading: isSaving }] = useSaveItemMutation();
  const [removeSavedItem, { isLoading: isRemoving }] = useRemoveSavedItemMutation();
  const isPublic = type === "public";
  const { data: savedList, isSuccess: isSavedListSuccess } = useGetSavedListQuery({ type: "review" }, { skip: isPublic });

  const [counts, setCounts] = useState<{ likes: number; dislikes: number }>({
    likes: review.likeCounts ?? 0,
    dislikes: review.dislikeCounts ?? 0,
  });
  const [myAction, setMyAction] = useState<1 | -1 | 0>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    const initialType = review.userLike?.type as 1 | -1 | undefined;
    setMyAction(initialType === 1 || initialType === -1 ? initialType : 0);
    setCounts({
      likes: review.likeCounts ?? 0,
      dislikes: review.dislikeCounts ?? 0,
    });
  }, [review.likeCounts, review.dislikeCounts, review.userLike?.type]);

  useEffect(() => {
    if (isSavedListSuccess) {
      const isInSaved =
        Array.isArray(savedList?.review_ids) && savedList.review_ids.includes(review.id);
      setIsSaved(!!isInSaved);
    }
  }, [isSavedListSuccess, savedList?.review_ids, review.id]);

  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  useEffect(() => {
    if (shouldHighlight) {
      setIsHighlighted(true);
      const t = setTimeout(() => setIsHighlighted(false), 5000);
      return () => clearTimeout(t);
    }
  }, [shouldHighlight]);

  const subjectName =
    review?.user_data?.type === "professional"
      ? review?.user_data?.brandName
      : review?.user_data?.name;
  const avatarSrc =
    review?.user_data?.type === "professional"
      ? review?.user_data?.logo
      : review?.user_data?.profilePhoto;
  const bgColor =
    (review?.user_data?.userPreferences?.[UserPreferenceKey.FRAME_BG_COLOR as any] as string) ||
    "#ffffff";

  const renderStarIcons = (rating?: number) => {
    const r = Number.isFinite(rating as any) ? Number(rating) : 0;
    return (
      <View className="flex-row items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={18} color={r >= i + 1 ? "#ffffff" : "#9CA3AF"} fill={r >= i + 1 ? "#ffffff" : ""} />
        ))}
      </View>
    );
  };

  const owlIndex = Math.min(5, Math.max(1, Math.round(Number.isFinite(review.rating as any) ? Number(review.rating) : 1)));
  const owlSource = (() => {
    try {
      switch (owlIndex) {
        case 1: return "https://www.wallofvox.com/assets/owl-exp/1.png";
        case 2: return "https://www.wallofvox.com/assets/owl-exp/2.png";
        case 3: return "https://www.wallofvox.com/assets/owl-exp/3.png";
        case 4: return "https://www.wallofvox.com/assets/owl-exp/4.png";
        default: return "https://www.wallofvox.com/assets/owl-exp/5.png";
      }
    } catch {
      return "https://www.wallofvox.com/assets/owl-exp/5.png";
    }
  })();

  const canReact =
    !isLiking &&
    !isUnliking &&
    review?.user_data?.userId !== loggedInUserId &&
    !((type === "dashboard" && userType === "personal") || type === "public");

  const handleToggleReaction = async (typeVal: 1 | -1) => {
    if (!canReact) return;
    if (myAction === typeVal) {
      try {
        await removeReviewLike({ reviewId: String(review.id) }).unwrap();
        setCounts((prev) => ({
          likes: typeVal === 1 ? Math.max(0, (prev.likes ?? 0) - 1) : prev.likes ?? 0,
          dislikes: typeVal === -1 ? Math.max(0, (prev.dislikes ?? 0) - 1) : prev.dislikes ?? 0,
        }));
        setMyAction(0);
      } catch { }
      return;
    }
    try {
      await likeReview({ reviewId: String(review.id), type: typeVal }).unwrap();
      setCounts((prev) => {
        let likes = prev.likes ?? 0;
        let dislikes = prev.dislikes ?? 0;
        if (myAction === 1) likes = Math.max(0, likes - 1);
        if (myAction === -1) dislikes = Math.max(0, dislikes - 1);
        if (typeVal === 1) likes = likes + 1;
        else dislikes = dislikes + 1;
        return { likes, dislikes };
      });
      setMyAction(typeVal);
    } catch { }
  };

  const handleSaveItem = async () => {
    try {
      await saveItem({ item_id: String(review.id), item_type: "review" }).unwrap();
      setIsSaved(true);
    } catch { }
  };
  const handleRemoveSavedItem = async () => {
    try {
      await removeSavedItem({ item_id: String(review.id), item_type: "review" }).unwrap();
      setIsSaved(false);
    } catch { }
  };

  return (
    <View
      className={`border bg-white rounded-2xl overflow-hidden ${isHighlighted ? "border-primary" : "border-gray-200"}`}
    >
      <View className="flex-col sm:flex-row">
        <View className="bg-secondary p-4 items-center justify-between gap-7 sm:max-w-[180px] w-full">
          <View className="items-center gap-3">
            {showUser ? (
              avatarSrc ? (
                <Avatar size={64}>
                  <AvatarImage source={avatarSrc ? { uri: avatarSrc } : undefined} style={{ backgroundColor: bgColor }} />
                  <AvatarFallback>{String(subjectName || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : (
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center">
                  <Text className="text-secondary">
                    {String(subjectName || "U").slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )
            ) : null}
            <Text className="text-lg font-medium text-white">{subjectName}</Text>
            {renderStarIcons(review.rating)}
            <Image source={{ uri: owlSource }} style={{ width: 84, height: 84, borderRadius: 12 }} />
          </View>
          <View className="flex-row items-center justify-center gap-3">
            <Pressable
              className="flex-row items-center gap-1 bg-white rounded-full px-4 py-2 disabled:bg-white/60 min-w-14 w-fit"
              disabled={!canReact}
              onPress={() => handleToggleReaction(1)}
            >
              <ThumbsUp size={18} color={myAction === 1 ? "#DC2626" : "#111827"} />
              <Text className="font-medium">{counts.likes ?? 0}</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center gap-1 bg-white rounded-full px-4 py-2 disabled:bg-white/60 min-w-14 w-fit"
              disabled={!canReact}
              onPress={() => handleToggleReaction(-1)}
            >
              <ThumbsDown size={18} color={myAction === -1 ? "#DC2626" : "#111827"} />
              <Text className="font-medium">{counts.dislikes ?? 0}</Text>
            </Pressable>
          </View>
        </View>
        <View className="flex-1 p-5 gap-4">
          <View className="flex-row items-center justify-between">
            <View className={`px-2 py-1 pl-3 w-fit text-white font-medium flex-row items-center ${(review?.isRecommended === true || review?.isRecommended === false) && "bg-secondary border border-secondary rounded-full"} gap-2 whitespace-nowrap`}>
              {review?.isRecommended === true && (
                <>
                  <Text className="font-medium text-white">Recommended</Text>
                  <BadgeCheck size={20} color="#ffffff" />
                </>
              )}
              {review?.isRecommended === false && (
                <>
                  <Text className="font-medium text-destructive">Not Recommended</Text>
                  <BadgeX size={20} color="#ef4444" />
                </>
              )}
            </View>
            <View className="flex-row items-center gap-3">
              {!isSaved ? (
                <Pressable disabled={isSaving} onPress={handleSaveItem} className="flex-row items-center gap-1">
                  <Bookmark size={16} color="#111827" />
                  <Text>Save</Text>
                </Pressable>
              ) : (
                <Pressable disabled={isRemoving} onPress={handleRemoveSavedItem} className="flex-row items-center gap-1">
                  <BookmarkMinus size={16} color="#111827" />
                  <Text>Unsave</Text>
                </Pressable>
              )}
            </View>
          </View>
          <Text className="font-normal text-foreground" numberOfLines={5}>{review.comment ?? ""}</Text>
          <View className="flex-row items-center justify-between">
            {review.attachments &&
              ((review.attachments.images && review.attachments.images.length > 0) ||
                (review.attachments.videos && review.attachments.videos.length > 0)) ? (
              <View className="bg-gray-100 border border-gray-200 p-1 rounded-full flex-row -space-x-2">
                {(review.attachments.images || [])
                  .slice(0, 4)
                  .map((src, idx2) => (
                    <Image
                      key={`img-${idx2}`}
                      source={{ uri: src }}
                      style={{ width: 32, height: 32, borderRadius: 9999 }}
                    />
                  ))}
              </View>
            ) : <View />}
          </View>
        </View>
      </View>
    </View>
  );
}
