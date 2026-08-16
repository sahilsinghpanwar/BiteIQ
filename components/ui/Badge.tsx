import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import React, { memo } from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

// Types

export type BadgeVariant =
  "primary" | "success" | "warning" | "error" | "info" | "neutral";

export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  emoji?: string;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

// Variant Presets (Design Token Aligned)

const variantStyles: Record<
  BadgeVariant,
  { container: ViewStyle; label: TextStyle }
> = {
  primary: {
    container: {
      backgroundColor: Colors.primaryMuted,
      borderColor: Colors.borderFocus,
    },
    label: { color: Colors.primary },
  },
  success: {
    container: {
      backgroundColor: Colors.status.successMuted,
      borderColor: Colors.status.successBorder,
    },
    label: { color: Colors.status.success },
  },
  warning: {
    container: {
      backgroundColor: Colors.status.warningMuted,
      borderColor: Colors.status.warningBorder,
    },
    label: { color: Colors.status.warning },
  },
  error: {
    container: {
      backgroundColor: Colors.status.errorMuted,
      borderColor: Colors.status.errorBorder,
    },
    label: { color: Colors.status.error },
  },
  info: {
    container: {
      backgroundColor: Colors.status.infoMuted,
      borderColor: Colors.status.infoBorder,
    },
    label: { color: Colors.status.info },
  },
  neutral: {
    container: {
      backgroundColor: Colors.surfaceSubtle,
      borderColor: Colors.border,
    },
    label: { color: Colors.text.secondary },
  },
};

// Size Presets

const sizeStyles: Record<
  BadgeSize,
  { container: ViewStyle; label: TextStyle; emojiSize: number; gap: number }
> = {
  sm: {
    container: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    label: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.medium },
    emojiSize: 10,
    gap: 4,
  },
  md: {
    container: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
    label: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.medium },
    emojiSize: 12,
    gap: 5,
  },
};

// Component

function Badge({
  label,
  variant = "primary",
  size = "sm",
  emoji,
  leftIcon,
  style,
  labelStyle,
}: BadgeProps) {
  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.base,
        currentVariant.container,
        currentSize.container,
        { gap: currentSize.gap },
        style,
      ]}
    >
      {emoji ? (
        <Text style={[styles.emoji, { fontSize: currentSize.emojiSize }]}>
          {emoji}
        </Text>
      ) : null}

      {leftIcon ?? null}

      <Text
        numberOfLines={1}
        style={[
          styles.labelText,
          currentVariant.label,
          currentSize.label,
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// Base Styles

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    overflow: "hidden",
  },
  emoji: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  labelText: {
    fontWeight: Fonts.weight.semibold,
    includeFontPadding: false,
  },
});

export default memo(Badge);
