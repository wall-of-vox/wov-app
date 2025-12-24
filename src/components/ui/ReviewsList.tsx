import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, FlatList, useWindowDimensions } from "react-native";
import Button from "@/components/ui/button";
import { PlusCircle } from "lucide-react-native";
import { router } from "expo-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserPreferenceKey } from "@/types";
import ReviewCard from "@/components/ui/review-card";

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

type ReviewItem = {
  id?: string;
  status?: "APPROVED" | "PENDING" | "REJECTED" | "REPORTED";
  title?: string;
  comment?: string;
  text?: string;
  rating?: number;
  isRecommended?: boolean | null;
  updatedAt?: string;
  likeCounts?: number;
  dislikeCounts?: number;
  userLike?: { type?: 1 | -1 };
  attachments?: ReviewAttachments;
  user_data?: ReviewUserData;
};

export default function ReviewsList({
  reviews = [] as ReviewItem[],
  isLoading = false,
  showUser = false,
  type,
  userType,
  loggedInUserId,
  highlightReviewId,
}: {
  reviews?: ReviewItem[];
  isLoading?: boolean;
  showUser?: boolean;
  type?: "public" | "explore" | "dashboard" | "saved";
  userType?: "personal" | "professional";
  loggedInUserId?: string;
  highlightReviewId?: string;
}) {
  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 2 : 1;
  const [items, setItems] = useState<ReviewItem[]>(reviews || []);

  useEffect(() => {
    let next = reviews || [];
    if (next.length > 0 && type === "explore") {
      next = next.filter((r) => r.status === "APPROVED");
    }
    setItems(next);
  }, [reviews, type]);

  const heading = useMemo(() => {
    if (type === "dashboard") {
      return userType === "personal" ? "My Feedback" : userType === "professional" ? "Reviews from others" : "";
    }
    if (type === "explore" || type === "public") {
      return userType === "personal" ? "Reviews To" : userType === "professional" ? "Reviews from others" : "";
    }
    return "Reviews";
  }, [type, userType]);

  if (isLoading) {
    return (
      <View className="w-full space-y-6">
        {[...Array(3)].map((_, index) => (
          <View key={index} className="border border-gray-200 rounded-xl p-6">
            <View className="gap-4">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-gray-200 rounded-full" />
                <View className="flex-1 gap-2">
                  <View className="h-4 bg-gray-200 rounded w-3/4" />
                  <View className="h-3 bg-gray-200 rounded w-1/2" />
                </View>
              </View>
              <View className="gap-2">
                <View className="h-4 bg-gray-200 rounded w-full" />
                <View className="h-4 bg-gray-200 rounded w-5/6" />
                <View className="h-4 bg-gray-200 rounded w-4/6" />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (items.length === 0) {
    const content =
      userType === "personal"
        ? "Start sharing your opinions about brands and products!"
        : userType === "professional"
        ? "Share Your Profile to Start Receiving Reviews!"
        : type === "saved"
        ? "No saved reviews available."
        : "No reviews available.";
    return (
      <View className="w-full items-center">
        <View className="bg-transparent border-0 items-center">
          <Image source={require("../../../assets/zero-states/no-reviews.png")} style={{ width: 160, height: 160 }} />
          <Text className="font-semibold mt-3">No reviews yet</Text>
          <Text className="text-gray-600 mt-1 text-center">{content}</Text>
          {userType === "personal" && type === "dashboard" ? (
            <View className="mt-4">
              <Button
                title="Write Your First Review"
                variant="primary"
                onPress={() => router.push("/(dashboard)/explore")}
              />
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: ReviewItem; index: number }) => {
    return (
      <View style={{ marginBottom: 12 }}>
        <ReviewCard
          review={item as any}
          showUser={showUser}
          type={type}
          userType={userType}
          loggedInUserId={loggedInUserId}
          shouldHighlight={highlightReviewId === item.id}
        />
      </View>
    );
  };

  return (
    <View className="w-full">
      <Text className="font-medium text-base my-5">{heading}</Text>
      <FlatList
        data={items}
        key={numColumns}
        keyExtractor={(it, i) => String(it?.id ?? i)}
        renderItem={renderItem}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={numColumns === 2 ? { gap: 12 } : undefined}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
      />
      {items.length > 10 ? (
        <View className="items-center pt-4">
          <Button title="Load More Reviews" variant="outline" />
        </View>
      ) : null}
    </View>
  );
}
