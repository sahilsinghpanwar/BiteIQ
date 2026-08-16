import { Colors } from "@/constants/Colors";
import React, { memo } from "react";
import {
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

// Types

export type CardVariant = "default" | "subtle" | "highlighted" | "elevated";

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  padding?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

// Variant Presets (Design Token Aligned)

const variantStyles: Record<CardVariant, ViewStyle> = {
  default: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  subtle: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  highlighted: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.borderFocus,
    borderWidth: 1,
  },
  elevated: {
    backgroundColor: Colors.surface,
    borderColor: "transparent",
    borderWidth: 0,
  },
};

// Component

function Card({
  children,
  variant = "default",
  onPress,
  padding = 16,
  borderRadius = 16,
  style,
  disabled = false,
}: CardProps) {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.base,
    variantStyles[variant],
    { padding, borderRadius },
    variant === "elevated" && styles.elevatedShadow,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

// Base Styles

const styles = StyleSheet.create({
  base: {
    width: "100%",
    overflow: "hidden",
  },
  elevatedShadow: {
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default memo(Card);
