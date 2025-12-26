import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image as RNImage,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import Button from "@/components/ui/button";
import { Picker } from "@react-native-picker/picker";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowLeft,
} from "lucide-react-native";
import {
  useSearchProfilesQuery,
  useGetRecentSearchesQuery,
  useGetRecommendedBrandsQuery,
} from "@/features/user/userApi";
import { defaultCategories } from "@/data/categories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPreferenceKey } from "@/types";

type SearchQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: string;
  query?: string;
  category?: string;
};
type BrandsQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeRatings?: boolean;
};

type ExploreSearchProps = {
  onSearch?: (query: string) => void;
};

const ExploreScreen: React.FC<{ type: "dashboard" | "public" } & ExploreSearchProps> = ({
  type,
  onSearch,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMax = isTablet ? 820 : 480;

  const inputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useState<SearchQueryParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [brandsParams, setBrandsParams] = useState<BrandsQueryParams>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    includeRatings: true,
  });
  const [shouldSearch, setShouldSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const lastScrollY = useRef(0);

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useSearchProfilesQuery(searchParams, { skip: !shouldSearch });
  const { data: recentSearches } = useGetRecentSearchesQuery(undefined, {
    skip: type !== "dashboard",
  });
  const {
    data: recommendedBrands,
    isLoading: isBrandsLoading,
    error: brandsError,
    refetch: refetchBrands,
  } = useGetRecommendedBrandsQuery(brandsParams, {
    skip: type !== "dashboard",
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchParams((prev) => ({
        ...prev,
        query: searchQuery.trim(),
        page: 1,
      }));
      setShouldSearch(true);
      onSearch?.(searchQuery.trim());
    }
  };
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
    if (searchQuery.trim()) setShouldSearch(true);
  };
  const handleRecentSearchClick = (searchValue: string) => {
    setSearchQuery(searchValue);
    setSearchParams((prev) => ({ ...prev, query: searchValue, page: 1 }));
    setShouldSearch(true);
  };
  const handleBrandsPageChange = (newPage: number) => {
    setBrandsParams((prev) => ({ ...prev, page: newPage }));
  };
  useEffect(() => {
    lastScrollY.current = 0;
  }, []);

  const numColumnsResults = isTablet ? 2 : 1;
  const numColumnsCategories = isTablet ? 3 : 2;

  const ProfileSkeleton = () => (
    <View className="rounded-xl border border-gray-200 p-4">
      <View className="flex-row items-start gap-4">
        <View className="bg-gray-200 h-12 w-12 rounded-full" />
        <View className="flex-1 gap-2">
          <View className="bg-gray-200 h-4 w-1/3 rounded" />
          <View className="bg-gray-200 h-3 w-1/4 rounded" />
          <View className="bg-gray-200 h-3 w-full rounded" />
          <View className="bg-gray-200 h-3 w-2/3 rounded" />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-6"
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (y <= 0) setIsNavbarHidden(false);
          else if (y > lastScrollY.current + 2) setIsNavbarHidden(true);
          else if (y < lastScrollY.current) setIsNavbarHidden(false);
          lastScrollY.current = y;
        }}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className={`gap-4 ${isNavbarHidden ? "mt-2" : "mt-6"} pb-2`}
          style={{ maxWidth: contentMax, alignSelf: "center", width: "100%" }}
        >
          {/* Search Header */}
          <View className="flex-row gap-3 items-center">
            {/* Back Button */}
            {shouldSearch && (searchQuery.trim()) ? (
              <Pressable
                className="px-2 py-1"
                accessibilityRole="button"
                onPress={() => {
                  if (searchQuery.trim()) {
                    setSearchQuery("");
                    setShouldSearch(false);
                  } else {
                    router.back();
                  }
                }}
              >
                <ArrowLeft size={18} color="#6b7280" />
              </Pressable>
            ) : null}

            {/* Search Bar */}
            <View className="flex-1 flex-row items-center gap-2 bg-white rounded-full border border-primary px-3">
              <Search size={20} color="black" />
              <TextInput
                ref={inputRef}
                placeholder="Search profiles, professionals, or users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                className="w-full"
              />
            </View>
          </View>

          {/* Search Results */}
          {shouldSearch && (searchQuery.trim()) ? (
            <Pressable
              className="px-2 py-1"
              accessibilityRole="button"
              onPress={() => {
                setShouldSearch(false);
                setSearchQuery("");
              }}
            >
              {searchResults?.data?.pagination?.totalCount !== undefined && (
                <Text className="text-muted-foreground ml-2">
                  ({searchResults?.data?.pagination?.totalCount} found)
                </Text>
              )}
              {searchResults?.data?.profiles.map((edge: any, index: number) => {
                const userId = edge?.userId;
                const displayName =
                  edge?.type === "professional" ? edge?.brandName : edge?.name;
                const avatarSrc =
                  edge?.type === "professional" ? edge?.logo : edge?.profilePhoto;
                const bgColor =
                  (edge?.userPreferences?.[UserPreferenceKey.FRAME_BG_COLOR as any] as string) || "#181818";
                return (
                  <View key={index} className="py-2">
                    <Pressable
                      onPress={() => router.push(`/(dashboard)/explore/profile/${userId}`)}
                      className="flex-row items-center gap-3"
                    >
                      <View className="flex-row items-center gap-4">
                        {avatarSrc ? (
                          <Avatar size={48}>
                            <AvatarImage source={avatarSrc ? { uri: avatarSrc } : undefined} style={{ backgroundColor: bgColor }} />
                            <AvatarFallback>
                              {String(displayName || userId)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <View className="w-14 h-14 bg-mutedForeground/20 rounded-full flex items-center justify-center">
                            <Text className="text-white text-2xl font-bold">{String(displayName || userId)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}</Text>
                          </View>
                        )}
                      </View>
                      <View className="gap-1">
                        <Text className="font-medium text-lg">{displayName}</Text>
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </Pressable>
          ) : null}

          {/* Explor Feed */}


        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreScreen;
