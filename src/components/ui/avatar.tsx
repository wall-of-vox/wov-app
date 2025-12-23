import React, { useRef } from "react";
import { View, Image, ViewProps, ImageProps, Text } from "react-native";

export const AVATAR_BG_COLORS = ["bg-yellow-500"] as const;

type AvatarProps = ViewProps & {
  className?: string;
  size?: number;
};

export const Avatar = React.forwardRef<View, AvatarProps>(({ className = "", size, style, ...props }, ref) => {
  const radius = size ? size / 2 : undefined;
  return (
    <View
      ref={ref}
      className={`relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 border border-white ${className}`}
      style={[style, size ? { width: size, height: size, borderRadius: radius } : undefined]}
      {...props}
    />
  );
});
Avatar.displayName = "Avatar";

type AvatarImageProps = ImageProps & {
  className?: string;
  bgColor?: string;
};

export const AvatarImage = React.forwardRef<Image, AvatarImageProps>(({ className = "", bgColor, style, ...props }, ref) => {
  const bgRef = useRef<string>(AVATAR_BG_COLORS[Math.floor(Math.random() * AVATAR_BG_COLORS.length)]);
  return (
    <Image
      ref={ref}
      className={`h-full w-full ${!bgColor ? bgRef.current : ""} ${className}`}
      style={[style, bgColor ? { backgroundColor: bgColor } : undefined]}
      resizeMode="cover"
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

type AvatarFallbackProps = ViewProps & {
  className?: string;
  children?: React.ReactNode;
};

export const AvatarFallback = React.forwardRef<View, AvatarFallbackProps>(({ className = "", style, children, ...props }, ref) => {
  return (
    <View ref={ref} className={`flex h-full w-full items-center justify-center bg-muted ${className}`} style={style} {...props}>
      {typeof children === "string" ? <Text>{children}</Text> : children}
    </View>
  );
});
AvatarFallback.displayName = "AvatarFallback";

export type FrameType = "circle" | "oval" | "no-frame";

type FramedAvatarProps = {
  frameType: FrameType;
  source?: AvatarImageProps["source"];
  initials?: string;
  bgColor?: string;
  isTablet?: boolean;
  size?: number;
  tabletSize?: number;
  ovalWidth?: number;
  ovalHeight?: number;
  className?: string;
  imageClassName?: string;
};

export const FramedAvatar = ({
  frameType,
  source,
  initials,
  bgColor,
  isTablet = false,
  size = 160,
  tabletSize = 200,
  ovalWidth = 110,
  ovalHeight = 160,
  className = "",
  imageClassName = "",
}: FramedAvatarProps) => {
  const isOval = frameType === "oval";
  const containerWidth = isOval ? ovalWidth : isTablet ? tabletSize : size;
  const containerHeight = isOval ? ovalHeight : isTablet ? tabletSize : size;
  const roundedClass = frameType === "no-frame" ? "rounded-none" : "rounded-full";
  return (
    <View
      className={`relative flex shrink-0 overflow-hidden ${roundedClass} border border-white ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
    >
      <AvatarImage
        source={source}
        className={`w-full h-full ${imageClassName}`}
        bgColor={bgColor}
      />
      {!source ? (
        <AvatarFallback className={`bg-gray-200`}>
          <Text className="text-2xl">{(initials ?? "").slice(0, 2).toUpperCase() || ""}</Text>
        </AvatarFallback>
      ) : null}
    </View>
  );
};
