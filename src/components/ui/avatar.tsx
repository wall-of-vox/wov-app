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
      className={`aspect-square h-full w-full ${!bgColor ? bgRef.current : ""} ${className}`}
      style={[style, bgColor ? { backgroundColor: bgColor } : undefined]}
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

