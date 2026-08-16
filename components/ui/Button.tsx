import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import React, { memo } from "react";
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

// Types

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Variant Presets (Design Token Aligned)

const variantContainerStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.borderFocus,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: Colors.status.errorMuted,
    borderWidth: 1,
    borderColor: Colors.status.errorBorder,
  },
};

const variantLabelStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: Colors.text.inverse },
  secondary: { color: Colors.primary },
  ghost: { color: Colors.text.secondary },
  danger: { color: Colors.status.error },
};

const spinnerColors: Record<ButtonVariant, string> = {
  primary: Colors.text.inverse,
  secondary: Colors.primary,
  ghost: Colors.text.secondary,
  danger: Colors.status.error,
};

// Size Presets

const sizeStyles: Record<
  ButtonSize,
  { container: ViewStyle; label: TextStyle; gap: number }
> = {
  sm: {
    container: { height: 38, borderRadius: 10, paddingHorizontal: 14 },
    label: {
      fontSize: Fonts.size.sm,
      fontWeight: Fonts.weight.semibold,
      fontFamily: Fonts.family.medium,
    },
    gap: 6,
  },
  md: {
    container: { height: 48, borderRadius: 12, paddingHorizontal: 18 },
    label: {
      fontSize: Fonts.size.base,
      fontWeight: Fonts.weight.semibold,
      fontFamily: Fonts.family.medium,
    },
    gap: 8,
  },
  lg: {
    container: { height: 54, borderRadius: 14, paddingHorizontal: 22 },
    label: {
      fontSize: Fonts.size.md,
      fontWeight: Fonts.weight.bold,
      fontFamily: Fonts.family.bold,
    },
    gap: 10,
  },
};

// Component

function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  labelStyle,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        fullWidth ? styles.fullWidth : styles.inline,
        variantContainerStyles[variant],
        currentSize.container,
        { gap: currentSize.gap },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColors[variant]} />
      ) : (
        <>
          {leftIcon}
          <Text
            numberOfLines={1}
            style={[
              styles.baseText,
              variantLabelStyles[variant],
              currentSize.label,
              labelStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

// Base Styles

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fullWidth: {
    width: "100%",
  },
  inline: {
    alignSelf: "flex-start",
  },
  disabled: {
    opacity: 0.5,
  },
  baseText: {
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default memo(Button);
