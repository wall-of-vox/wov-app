import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image as RNImage,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import {
  useUpdateUserProfileMutation,
  useDeleteUserAvatarMutation,
  useGetCurrentUserQuery,
  useUpdateUserAvatarMutation,
} from "@/features/user/userApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { FramedAvatar } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { socialPlatforms } from "@/data/socialPlatforms";
import { UserPreferenceKey } from "@/types";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import SocialLinksModal from "@/components/modals/socialLinksModal";
import { ArrowLeft, Pencil, Trash2, Plus, CircleAlert } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { SvgUri } from "react-native-svg";

const toDateInputValue = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

type SelectedPlatform = {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
  isValid: boolean;
};

export default function EditProfileScreen() {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMax = isTablet ? 820 : 480;
  const navigation = useNavigation();

  const { data: user, isLoading: loadingUser } = useGetCurrentUserQuery();
  const isProfessional = (user as any)?.type === "professional";

  const [updateUserProfile, { isLoading: saving }] = useUpdateUserProfileMutation();
  const [deleteUserAvatar, { isLoading: deletingAvatar }] = useDeleteUserAvatarMutation();
  const [updateUserAvatar, { isLoading: uploadingAvatar }] = useUpdateUserAvatarMutation();

  const [mounted, setMounted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [maxDob, setMaxDob] = useState<string | undefined>(undefined);
  const lastScrollY = useRef(0);
  const [isNavbarHidden, setIsNavbarHidden] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    username: "",
    bio: "",
    gender: "",
    dateOfBirth: "",
    isPrivate: false,
    socialLinks: {},
    userPreferences: {},
    website: "",
    brandName: "",
    keywords: [] as string[],
    address: { city: "", state: "", country: "", pincode: "" },
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<SelectedPlatform[]>([]);
  const availablePlatforms = useMemo(
    () => socialPlatforms.filter((p) => !selectedPlatforms.find((s) => s.id === p.id)),
    [selectedPlatforms]
  );

  useEffect(() => setMounted(true), []);
  useEffect(() => setMaxDob(new Date().toISOString().slice(0, 10)), []);

  useEffect(() => {
    if (!user) return;
    setFormData((prev: any) => ({
      ...prev,
      brandName: (user as any)?.brandName || "",
      name: (user as any)?.name || "",
      username: (user as any)?.username || "",
      bio: (user as any)?.bio || "",
      gender: (user as any)?.gender || "",
      dateOfBirth: toDateInputValue((user as any)?.dateOfBirth),
      isPrivate: !!(user as any)?.isPrivate,
      website: (user as any)?.website || "",
      socialLinks: (user as any)?.socialLinks || {},
      userPreferences: (user as any)?.userPreferences || {},
      keywords: ((user as any)?.keywords as string[]) || [],
      address: {
        city: (user as any)?.address?.city || "",
        state: (user as any)?.address?.state || "",
        country: (user as any)?.address?.country || "",
        pincode: (user as any)?.address?.pincode || "",
      },
    }));
    const profileImage = isProfessional ? (user as any)?.logo : (user as any)?.profilePhoto;
    setAvatarUrl(profileImage || null);

    if ((user as any)?.socialLinks && typeof (user as any).socialLinks === "object") {
      const next: SelectedPlatform[] = Object.entries((user as any).socialLinks as Record<string, string>)
        .map(([id, url]) => {
          const base = socialPlatforms.find((p: any) => p.id === id);
          if (!base) return null as any;
          const valid = base.urlPattern.test(url);
          return {
            id,
            name: base.name,
            icon: base.icon,
            url,
            color: base.color,
            isValid: valid,
          } as SelectedPlatform;
        })
        .filter(Boolean) as SelectedPlatform[];
      setSelectedPlatforms(next);
    }
  }, [user, isProfessional]);

  useEffect(() => {
    const onScroll = (y: number) => {
      if (y <= 0) setIsNavbarHidden(false);
      else if (y > lastScrollY.current + 2) setIsNavbarHidden(true);
      else if (y < lastScrollY.current) setIsNavbarHidden(false);
      lastScrollY.current = y;
    };
    // ScrollView onScroll handler updates via event; we simulate via content offset
  }, []);
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e: any) => {
      if (!isDirty) return;
      e.preventDefault();
      Alert.alert(
        "Unsaved changes",
        "Are you sure you want to leave this page without saving details? All details will be lost.",
        [
          { text: "Stay", style: "cancel", onPress: () => {} },
          { text: "Leave", style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });
    return sub;
  }, [navigation, isDirty]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };
  const handlePreferenceChange = (key: UserPreferenceKey, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      userPreferences: { ...(prev.userPreferences || {}), [key]: value },
    }));
    setIsDirty(true);
  };
  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      address: { ...(prev.address || {}), [field]: value },
    }));
    setIsDirty(true);
  };

  const addKeyword = () => {
    const k = String(formData._keywordInput ?? "").trim();
    if (!k) return;
    setFormData((prev: any) => {
      const current = prev.keywords || [];
      if (current.includes(k) || current.length >= 5) return prev;
      return { ...prev, keywords: [...current, k], _keywordInput: "" };
    });
    setIsDirty(true);
  };
  const removeKeyword = (k: string) => {
    setFormData((prev: any) => ({
      ...prev,
      keywords: (prev.keywords || []).filter((x: string) => x !== k),
    }));
    setIsDirty(true);
  };

  const addSocialPlatform = (platformId: string) => {
    const platform = socialPlatforms.find((p: any) => p.id === platformId);
    if (platform && !selectedPlatforms.find((p) => p.id === platformId)) {
      const newPlatform: SelectedPlatform = {
        id: platform.id,
        name: platform.name,
        icon: platform.icon,
        url: "",
        color: platform.color,
        isValid: false,
      };
      setSelectedPlatforms((prev) => [...prev, newPlatform]);
      setIsDirty(true);
    }
  };
  const removeSocialPlatform = (platformId: string) => {
    setSelectedPlatforms((prev) => prev.filter((p) => p.id !== platformId));
    setIsDirty(true);
  };
  const updatePlatformUrl = (platformId: string, url: string) => {
    const platform = socialPlatforms.find((p: any) => p.id === platformId);
    const isValid = platform ? platform.urlPattern.test(url) : false;
    setSelectedPlatforms((prev) =>
      prev.map((p) => (p.id === platformId ? { ...p, url, isValid: url === "" || isValid } : p))
    );
    setIsDirty(true);
  };

  const resolveIcon = (platformId: string) => {
    const localIcon =
      platformId === "linkedin" ? require("../../../../assets/social-icons/linkedin.svg") :
      platformId === "instagram" ? require("../../../../assets/social-icons/instagram.svg") :
      platformId === "twitter" || platformId === "x" ? require("../../../../assets/social-icons/x.svg") :
      platformId === "facebook" ? require("../../../../assets/social-icons/facebook.svg") :
      platformId === "youtube" ? require("../../../../assets/social-icons/youtube.svg") :
      platformId === "github" ? require("../../../../assets/social-icons/github.svg") :
      platformId === "dribbble" ? require("../../../../assets/social-icons/dribbble.svg") :
      undefined;
    return localIcon ? RNImage.resolveAssetSource(localIcon)?.uri : undefined;
  };

  useEffect(() => {
    const links: Record<string, string> = {};
    selectedPlatforms.forEach((p) => {
      const trimmed = (p.url || "").trim();
      if (trimmed) links[p.id] = trimmed;
    });
    setFormData((prev: any) => ({ ...prev, socialLinks: links }));
  }, [selectedPlatforms]);

  const fetchPincodeData = async () => {
    const pincode = formData.address?.pincode;
    if (!pincode || !/^\d{6}$/.test(String(pincode))) {
      setPincodeError("Please enter a valid 6-digit pincode.");
      return;
    }
    setPincodeLoading(true);
    setPincodeError(null);
    try {
      const resp = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await resp.json();
      if (data[0]?.Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setFormData((prev: any) => ({
          ...prev,
          address: {
            ...prev.address,
            city: postOffice.Region,
            state: postOffice.State,
            country: postOffice.Country,
          },
        }));
        setIsDirty(true);
      } else {
        setPincodeError(data[0]?.Message || "Invalid pincode or no details found.");
        setFormData((prev: any) => ({
          ...prev,
          address: { ...prev.address, city: "", state: "", country: "" },
        }));
      }
    } catch (e) {
      setPincodeError("Failed to fetch pincode details. Please try again.");
    } finally {
      setPincodeLoading(false);
    }
  };

  const saveProfile = async () => {
    const payload: any = {};
    if (!isProfessional) {
      if (formData.name) payload.name = formData.name;
    } else {
      if (formData.brandName) payload.brandName = formData.brandName;
      if (formData.website === "" || (() => { try { new URL(formData.website); return true; } catch { return false; } })()) {
        payload.website = formData.website;
      } else {
        Alert.alert("Invalid website URL", "Please enter a valid website URL (e.g., https://example.com).");
        return;
      }
    }
    if (formData.username) payload.username = formData.username;
    if (formData.bio) payload.bio = formData.bio;
    if (formData.gender) payload.gender = formData.gender;
    if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
    if (formData.isPrivate !== undefined) payload.isPrivate = formData.isPrivate;
    if (formData.socialLinks) payload.socialLinks = formData.socialLinks;
    if (formData.userPreferences && Object.keys(formData.userPreferences).length > 0) {
      payload.userPreferences = formData.userPreferences;
    }
    if (isProfessional) {
      if ((formData.keywords || []).length > 0) payload.keywords = formData.keywords;
      const addr = formData.address || {};
      if (addr.city || addr.state || addr.country || addr.pincode) payload.address = addr;
    }
    try {
      await updateUserProfile(payload).unwrap();
      setIsDirty(false);
      router.push("(dashboard)/(tabs)/profile");
    } catch (err: any) {
      const apiError = err?.data?.error;
      const detailsStr =
        Array.isArray(apiError?.details) && apiError.details.length ? ` (${apiError.details.join("; ")})` : "";
      const codeStr = apiError?.statusCode ? ` [${apiError.statusCode}]` : "";
      const message = apiError?.message
        ? `${apiError.message}${detailsStr}${codeStr}`
        : err?.data?.message
        ? err.data.message
        : err?.error
        ? String(err.error)
        : "Failed to save profile";
      Alert.alert("Profile update failed", message);
    }
  };

  if (loadingUser || !mounted) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" contentContainerClassName="px-4 py-6">
          <View className="w-full self-center gap-6" style={{ maxWidth: isTablet ? 820 : 480, alignSelf: "center" }}>
            <View className="rounded-xl border border-gray-200 p-4">
              <View className="items-center gap-4">
                <View className="bg-gray-200 h-6 w-2/3 rounded" />
                <View className="bg-gray-200 rounded-full" style={{ width: isTablet ? 200 : 160, height: isTablet ? 200 : 160 }} />
                <View className="bg-gray-200 h-8 w-full rounded" />
              </View>
            </View>
            <View className="rounded-xl border border-gray-200 p-4">
              <View className="gap-3">
                <View className="bg-gray-200 h-6 w-1/3 rounded" />
                <View className="bg-gray-200 h-10 w-full rounded" />
                <View className="bg-gray-200 h-24 w-full rounded" />
                <View className="flex-row gap-3">
                  <View className="bg-gray-200 h-10 flex-1 rounded" />
                  <View className="bg-gray-200 h-10 flex-1 rounded" />
                </View>
                <View className="flex-row gap-3">
                  <View className="bg-gray-200 h-10 flex-1 rounded" />
                  <View className="bg-gray-200 h-10 flex-1 rounded" />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const frameShape = (formData.userPreferences?.[UserPreferenceKey.PROFILE_FRAME] ||
    (isProfessional ? "circle" : "oval")) as string;
  const frameBgColor = formData.userPreferences?.[UserPreferenceKey.FRAME_BG_COLOR] as string;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-32"
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
          <View className={`flex-row items-center justify-between mb-2 ${isNavbarHidden ? "mt-2" : "mt-6"}`} style={{ maxWidth: contentMax, alignSelf: "center", width: "100%" }}>
            <Pressable
              className="flex-row items-center gap-2 px-2 py-1"
              accessibilityRole="button"
              onPress={() => {
                if (!isDirty) router.push("(dashboard)/(tabs)/profile");
                else {
                  Alert.alert(
                    "Unsaved changes",
                    "Are you sure you want to leave without saving details? All details will be lost.",
                    [
                      { text: "Stay", style: "cancel" },
                      { text: "Leave", style: "destructive", onPress: () => router.push("(dashboard)/(tabs)/profile") },
                    ]
                  );
                }
              }}
            >
              <ArrowLeft size={20} color="#111827" />
              <Text className="text-base text-gray-800">Back</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900">Edit Profile</Text>
          </View>

          <View className="w-full self-center" style={{ maxWidth: contentMax, alignSelf: "center" }}>
            <View className={`${isTablet ? "flex-row items-start gap-6" : "gap-6"}`}>
              {/* Left Column: Avatar + Preferences */}
              <View className={`${isTablet ? "flex-1" : ""} gap-5`}>
                <View className="rounded-xl border border-gray-200 p-4">
                  <View className="items-center">
                    <Text className="text-xl font-medium mb-4">
                      {isProfessional ? formData.brandName || "Your Brand Name" : formData.name || "Your Name"}
                    </Text>
                  <View className="mb-4">
                    <FramedAvatar
                      frameType={frameShape as any}
                      isTablet={isTablet}
                      bgColor={frameBgColor}
                      source={avatarUrl ? { uri: avatarUrl } : undefined}
                      initials={(isProfessional ? formData.brandName ?? "" : formData.name ?? "").slice(0, 2).toUpperCase() || "KM"}
                      className="border-4 border-white"
                    />
                    <View className="absolute right-0 bottom-0 flex-row gap-2">
                      <Pressable
                        className="bg-primary rounded-full w-10 h-10 items-center justify-center"
                        accessibilityRole="button"
                        disabled={uploadingAvatar}
                        onPress={async () => {
                          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                          if (status !== "granted") {
                            Alert.alert("Permissions required", "Please grant media permissions to continue.");
                            return;
                          }
                          const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            quality: 1,
                            allowsEditing: true,
                            aspect: [1, 1],
                          });
                          if (!result.canceled && result.assets?.[0]?.uri) {
                            const src = result.assets[0].uri;
                            const manipulated = await ImageManipulator.manipulateAsync(
                              src,
                              [],
                              { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
                            );
                            const file = { uri: manipulated.uri, name: "avatar.jpg", type: "image/jpeg" } as any;
                            try {
                              await updateUserAvatar({ avatar: file }).unwrap();
                              setAvatarUrl(manipulated.uri);
                              setIsDirty(true);
                            } catch (e) {
                              Alert.alert("Upload failed", "Unable to update avatar, please try again.");
                            }
                          }
                        }}
                      >
                        <Pencil size={18} color="#ffffff" />
                      </Pressable>
                      {avatarUrl ? (
                        <Pressable
                          className="bg-destructive rounded-full w-10 h-10 items-center justify-center"
                          disabled={deletingAvatar}
                          onPress={async () => {
                            try {
                              const response = await deleteUserAvatar().unwrap();
                              Alert.alert("Success", response.message || "Your avatar has been successfully removed.");
                              setAvatarUrl(null);
                            } catch (e) {
                              Alert.alert("Error", "Failed to delete avatar. Please try again.");
                            }
                          }}
                        >
                          <Trash2 size={18} color="#ffffff" />
                        </Pressable>
                      ) : null}
                    </View>
                  </View>

                  {/* Preferences */}
                  <View className="w-full">
                    <Text className="text-lg font-medium mb-3">Preferences</Text>
                    <View className="gap-4">
                      <View>
                        <Text className="text-sm text-gray-700 mb-2">Photo frame shape</Text>
                        <RadioGroup
                          value={frameShape}
                          onValueChange={(v) => handlePreferenceChange(UserPreferenceKey.PROFILE_FRAME, v)}
                          className="flex-row flex-wrap gap-4"
                        >
                          <View className="flex-row items-center gap-2">
                            <RadioGroupItem value="circle" />
                            <Text>Circle</Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <RadioGroupItem value="oval" />
                            <Text>Oval</Text>
                          </View>
                          {!isProfessional ? (
                            <View className="flex-row items-center gap-2">
                              <RadioGroupItem value="no-frame" />
                              <Text>No frame</Text>
                            </View>
                          ) : null}
                        </RadioGroup>
                      </View>

                      {frameShape === "no-frame" && (
                        <View className="flex-row items-center gap-3">
                          <Text className="text-sm text-gray-700">Frame Background Color:</Text>
                          <View style={{ borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, width: 160, height: 40, justifyContent: "center" }}>
                            <Picker
                              selectedValue={formData.userPreferences?.[UserPreferenceKey.FRAME_BG_COLOR] || "#ffffff"}
                              onValueChange={(v) => handlePreferenceChange(UserPreferenceKey.FRAME_BG_COLOR, String(v))}
                            >
                              <Picker.Item label="White" value="#ffffff" />
                              <Picker.Item label="Black" value="#000000" />
                              <Picker.Item label="Gray" value="#9ca3af" />
                              <Picker.Item label="Amber" value="#f59e0b" />
                              <Picker.Item label="Emerald" value="#10b981" />
                              <Picker.Item label="Blue" value="#3b82f6" />
                              <Picker.Item label="Violet" value="#8b5cf6" />
                              <Picker.Item label="Red" value="#ef4444" />
                              <Picker.Item label="Pink" value="#f472b6" />
                              <Picker.Item label="Dark" value="#181818" />
                            </Picker>
                          </View>
                          <View
                            className="border rounded-md"
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor: formData.userPreferences?.[UserPreferenceKey.FRAME_BG_COLOR] || "#ffffff",
                            }}
                          />
                        </View>
                      )}

                      {isProfessional ? (
                        <View>
                          <Text className="text-sm text-gray-700 mb-2">Default section for visitors</Text>
                          <RadioGroup
                            value={formData.userPreferences?.[UserPreferenceKey.GALLERY_OR_REVIEWS] || "gallery"}
                            onValueChange={(v) => handlePreferenceChange(UserPreferenceKey.GALLERY_OR_REVIEWS, v)}
                            className="flex-row flex-wrap gap-4"
                          >
                            <View className="flex-row items-center gap-2">
                              <RadioGroupItem value="gallery" />
                              <Text>Gallery</Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                              <RadioGroupItem value="reviews" />
                              <Text>Reviews</Text>
                            </View>
                          </RadioGroup>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
                </View>

                {isProfessional ? (
                  <View className="rounded-xl border border-gray-200 p-4">
                    <Text className="text-sm text-gray-700 mb-2">
                      Keywords (max 5) <Text className="text-xs text-gray-500">this keywords help others find you</Text>
                    </Text>
                    <View className="flex-row flex-wrap gap-2 my-3">
                      {(formData.keywords || []).map((k: string) => (
                        <View key={k} className="bg-gray-200 rounded-full px-3 py-1 flex-row items-center gap-2">
                          <Text className="text-base">{k}</Text>
                          <Pressable onPress={() => removeKeyword(k)} accessibilityLabel={`Remove ${k}`}>
                            <Text className="text-gray-600">×</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                    <View className="flex-row gap-2">
                      <TextInput
                        placeholder="Add a keyword"
                        value={formData._keywordInput ?? ""}
                        onChangeText={(v) => setFormData((prev: any) => ({ ...prev, _keywordInput: v }))}
                        onSubmitEditing={addKeyword}
                        maxLength={35}
                        className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                      />
                      <Button
                        title="Add"
                        variant="outline"
                        disabled={(formData.keywords?.length ?? 0) >= 5 || String(formData._keywordInput ?? "").trim() === ""}
                        onPress={addKeyword}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 text-right">max {(String(formData._keywordInput ?? "").length)}/35</Text>
                    {(formData.keywords || []).length >= 5 ? (
                      <View className="flex-row items-center gap-1 mt-1">
                        <CircleAlert size={14} color="#f59e0b" />
                        <Text className="text-xs text-accent">You have reached the maximum of 5 keywords.</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>

              {/* Right Column: Form */}
              <View className={`${isTablet ? "flex-1" : ""} gap-5`}>
                <View className="rounded-xl border border-gray-200 p-4">
                  <Text className="text-lg font-medium text-gray-800 mb-4">Identity & Bio</Text>
                  <View className="gap-4">
                    <View>
                      {!isProfessional ? (
                        <View>
                          <Text className="text-sm text-gray-700 mb-1">Your name</Text>
                          <TextInput
                            placeholder="Enter your name"
                            value={formData.name}
                            onChangeText={(v) => handleInputChange("name", v)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </View>
                      ) : (
                        <View>
                          <Text className="text-sm text-gray-700 mb-1">Brand name</Text>
                          <TextInput
                            placeholder="Enter your brand name"
                            value={formData.brandName}
                            onChangeText={(v) => handleInputChange("brandName", v)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </View>
                      )}
                    </View>
                    <View>
                      <Text className="text-sm text-gray-700 mb-1">Bio</Text>
                      <TextInput
                        placeholder="Bio"
                        value={formData.bio}
                        onChangeText={(v) => handleInputChange("bio", v)}
                        className="border border-gray-300 rounded-md px-3 py-2"
                        multiline
                        maxLength={150}
                      />
                      <Text className="text-xs text-gray-500 text-right">max 150</Text>
                    </View>
                    {!isProfessional ? (
                      <View>
                        <Text className="text-sm text-gray-700 mb-1">Gender</Text>
                        <RadioGroup
                          value={formData.gender}
                          onValueChange={(v) => handleInputChange("gender", v)}
                          className="flex-row gap-4"
                        >
                          <View className="flex-row items-center gap-2">
                            <RadioGroupItem value="male" />
                            <Text>Male</Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <RadioGroupItem value="female" />
                            <Text>Female</Text>
                          </View>
                        </RadioGroup>
                      </View>
                    ) : null}
                    <View>
                      <Text className="text-sm text-gray-700 mb-1">
                        {!isProfessional ? "Date Of Birth" : "Starting Business Date"}
                      </Text>
                      <Pressable
                        className="border border-gray-300 rounded-md px-3 py-2"
                        onPress={() => setShowDobPicker(true)}
                      >
                        <Text>{formData.dateOfBirth || "YYYY-MM-DD"}</Text>
                      </Pressable>
                      {showDobPicker ? (
                        <DateTimePicker
                          value={new Date(formData.dateOfBirth || maxDob || new Date().toISOString().slice(0, 10))}
                          mode="date"
                          display={Platform.OS === "ios" ? "spinner" : "default"}
                          maximumDate={maxDob ? new Date(maxDob) : new Date()}
                          onChange={(_, selectedDate) => {
                            setShowDobPicker(false);
                            if (!selectedDate) return;
                            let val = selectedDate.toISOString().slice(0, 10);
                            if (maxDob && val > maxDob) val = maxDob;
                            handleInputChange("dateOfBirth", val);
                          }}
                        />
                      ) : null}
                    </View>
                    {isProfessional ? (
                      <View>
                        <Text className="text-sm text-gray-700 mb-1">Website</Text>
                        <TextInput
                          placeholder="Enter your website Link"
                          value={formData.website}
                          onChangeText={(v) => handleInputChange("website", v)}
                          className="border border-gray-300 rounded-md px-3 py-2"
                        />
                      </View>
                    ) : null}
                  </View>
                </View>

                <View className="rounded-xl border border-gray-200 p-4">
                  <Text className="text-lg font-medium text-gray-800 mb-4">Privacy & Social</Text>
                  <View className="gap-4">
                    <View className="flex-row items-center justify-between px-4 bg-gray-100 rounded-lg">
                      <Text className="text-sm text-gray-700">
                        {isProfessional ? "Under Maintenance" : "Private Account"}
                      </Text>
                      <Switch
                        value={!!formData.isPrivate}
                        onValueChange={(v) => handleInputChange("isPrivate", v)}
                      />
                    </View>
                    <View className="gap-2">
                      <Text className="text-sm text-gray-700">Social media</Text>
                      <Pressable
                        className="flex-row items-center justify-between border border-gray-300 rounded-md px-3 py-2"
                        onPress={() => setSocialModalOpen(true)}
                      >
                        <View className="flex-row items-center gap-2 flex-1">
                          {selectedPlatforms.length > 0 ? (
                            selectedPlatforms.map((platform) => {
                              const iconUri = resolveIcon(platform.id);
                              return (
                                <View key={platform.id}>
                                  {iconUri ? (
                                    <SvgUri width={20} height={20} uri={iconUri} />
                                  ) : (
                                    <Text className="text-xs text-gray-800">{platform.name}</Text>
                                  )}
                                </View>
                              );
                            })
                          ) : (
                            <Text className="text-gray-500">Add social media</Text>
                          )}
                        </View>
                        <Plus size={16} color="#111827" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                {isProfessional ? (
                  <View className="rounded-xl border border-gray-200 p-4">
                    <Text className="text-lg font-medium text-gray-800 mb-4">Business Address</Text>
                    <View className="gap-3">
                      <View>
                        <Text className="text-xs text-gray-700 mb-1">Pincode</Text>
                        <View className="flex-row items-center">
                          <TextInput
                            placeholder="Enter 6-digit pincode"
                            value={formData.address?.pincode || ""}
                            onChangeText={(v) => {
                              handleAddressChange("pincode", v);
                              setPincodeError(null);
                            }}
                            maxLength={6}
                            className="border border-gray-300 rounded-md px-3 py-2 flex-1"
                          />
                          <Button
                            title={pincodeLoading ? "Searching..." : "Search"}
                            variant="outline"
                            className="ml-2"
                            disabled={
                              pincodeLoading ||
                              !/^\d{6}$/.test(String(formData.address?.pincode || "")) ||
                              formData.address?.pincode === (user as any)?.address?.pincode
                            }
                            onPress={fetchPincodeData}
                          />
                        </View>
                        {pincodeError ? <Text className="text-sm text-red-500 mt-1">{pincodeError}</Text> : null}
                      </View>
                      <View className={`${isTablet ? "flex-row flex-wrap gap-3" : "gap-3"}`}>
                        <View style={isTablet ? { width: "48%" } : undefined}>
                          <Text className="text-xs text-gray-700 mb-1">City</Text>
                          <TextInput
                            placeholder="Auto-filled from pincode"
                            value={formData.address?.city || ""}
                            onChangeText={(v) => handleAddressChange("city", v)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </View>
                        <View style={isTablet ? { width: "48%" } : undefined}>
                          <Text className="text-xs text-gray-700 mb-1">State</Text>
                          <TextInput
                            placeholder="Auto-filled from pincode"
                            value={formData.address?.state || ""}
                            onChangeText={(v) => handleAddressChange("state", v)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </View>
                        <View style={isTablet ? { width: "48%" } : undefined}>
                          <Text className="text-xs text-gray-700 mb-1">Country</Text>
                          <TextInput
                            placeholder="Auto-filled from pincode"
                            value={formData.address?.country || ""}
                            onChangeText={(v) => handleAddressChange("country", v)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View className="absolute left-0 right-0 bottom-0 border-t border-gray-200 bg-white p-4">
          <View style={{ maxWidth: contentMax, alignSelf: "center", width: "100%" }} className="flex-row justify-end gap-3">
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                if (!isDirty) router.push("(dashboard)/(tabs)/profile");
                else {
                  Alert.alert(
                    "Unsaved changes",
                    "Are you sure you want to leave this page without saving details? All details will be lost.",
                    [
                      { text: "Stay", style: "cancel" },
                      { text: "Leave", style: "destructive", onPress: () => router.push("(dashboard)/(tabs)/profile") },
                    ]
                  );
                }
              }}
            />
            <Button title={saving ? "Saving..." : "Save"} variant="primary" disabled={saving || !isDirty} onPress={saveProfile} />
          </View>
      </View>

      {/* Social Links Modal */}
      <SocialLinksModal
        open={socialModalOpen}
        onOpenChange={setSocialModalOpen}
        availablePlatforms={availablePlatforms}
        selectedPlatforms={selectedPlatforms}
        addSocialPlatform={addSocialPlatform}
        removeSocialPlatform={removeSocialPlatform}
        updatePlatformUrl={updatePlatformUrl}
        getPlaceholder={(id) => socialPlatforms.find((p: any) => p.id === id)?.placeholder || "Enter URL"}
      />

    </SafeAreaView>
  );
}
