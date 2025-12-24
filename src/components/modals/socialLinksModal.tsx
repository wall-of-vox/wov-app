import React from "react";
import { Modal, View, Text, Pressable, TextInput, ScrollView, Image as RNImage } from "react-native";
import { SvgUri } from "react-native-svg";

type PlatformMeta = {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  color: string;
  urlPattern: RegExp;
};

type SelectedPlatform = {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
  isValid: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  availablePlatforms: PlatformMeta[];
  selectedPlatforms: SelectedPlatform[];
  addSocialPlatform: (id: string) => void;
  removeSocialPlatform: (id: string) => void;
  updatePlatformUrl: (id: string, url: string) => void;
  getPlaceholder: (id: string) => string;
};

export default function SocialLinksModal({
  open,
  onOpenChange,
  availablePlatforms,
  selectedPlatforms,
  addSocialPlatform,
  removeSocialPlatform,
  updatePlatformUrl,
  getPlaceholder,
}: Props) {
  return (
    <Modal visible={open} animationType="slide" onRequestClose={() => onOpenChange(false)} transparent>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-xl w-full p-4">
          <Text className="text-lg font-medium mb-3">Social Links</Text>

          {/* Selected platforms */}
          <ScrollView style={{ maxHeight: 280 }}>
            {selectedPlatforms.length === 0 ? (
              <Text className="text-gray-500 mb-3">No social platforms selected yet.</Text>
            ) : null}
            {selectedPlatforms.map((p) => {
              return (
                <View key={p.id} className="mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      {p.icon ? <SvgUri width={20} height={20} uri={p.icon} /> : null}
                      <Text className="font-medium">{p.name}</Text>
                    </View>
                    <Pressable className="px-2 py-1" onPress={() => removeSocialPlatform(p.id)}>
                      <Text className="text-destructive">Remove</Text>
                    </Pressable>
                  </View>
                  <TextInput
                    placeholder={getPlaceholder(p.id)}
                    value={p.url}
                    onChangeText={(v) => updatePlatformUrl(p.id, v)}
                    className={`border rounded-md px-3 py-2 mt-2 ${!p.isValid && p.url ? "border-red-500" : "border-gray-300"}`}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {!p.isValid && p.url ? (
                    <Text className="text-xs text-red-500 mt-1">URL does not match the expected format.</Text>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>

          {/* Available platforms */}
          <View className="mt-2">
            <Text className="text-sm text-gray-700 mb-2">Add platform</Text>
            <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
              {availablePlatforms.map((p) => {
                return (
                  <Pressable
                    key={p.id}
                    className="flex-row items-center gap-2 border border-gray-300 rounded-full px-3 py-2"
                    onPress={() => addSocialPlatform(p.id)}
                  >
                    {p.icon ? <SvgUri width={18} height={18} uri={p.icon} /> : null}
                    <Text>{p.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Actions */}
          <View className="flex-row justify-between mt-3">
            <Pressable className="px-3 py-2" onPress={() => onOpenChange(false)}>
              <Text>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

