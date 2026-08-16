import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { memo } from "react";
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

// Types

export type LoaderSize = "sm" | "md" | "lg";
export type LoaderVariant = "default" | "overlay" | "inline";

export interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  message?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
}

// Size Tokens

// React Native ActivityIndicator only supports "small" | "large"
const indicatorSizes: Record<LoaderSize, "small" | "large"> = {
  sm: "small",
  md: "small",
  lg: "large",
};

const sizeTokens: Record<LoaderSize, { fontSize: number; gap: number }> = {
  sm: { fontSize: Fonts.size.sm, gap: 8 },
  md: { fontSize: Fonts.size.base, gap: 12 },
  lg: { fontSize: Fonts.size.md, gap: 16 },
};

// Component

function Loader({
  size = "md",
  variant = "default",
  message,
  color = Colors.primary,
  style,
  messageStyle,
}: LoaderProps) {
  const { fontSize, gap } = sizeTokens[size];

  // Full-screen backdrop (modal / blocking action)
  if (variant === "overlay") {
    return (
      <View style={[styles.overlayContainer, style]}>
        <ActivityIndicator size="large" color={color} />
        {message ? (
          <Text style={[styles.overlayText, { fontSize }, messageStyle]}>
            {message}
          </Text>
        ) : null}
      </View>
    );
  }

  // Compact inline row (inside cards, list items, forms)
  if (variant === "inline") {
    return (
      <View style={[styles.inlineContainer, { gap }, style]}>
        <ActivityIndicator size={indicatorSizes[size]} color={color} />
        {message ? (
          <Text style={[styles.inlineText, { fontSize }, messageStyle]}>
            {message}
          </Text>
        ) : null}
      </View>
    );
  }

  // Default centered full-view (screen transitions / initial fetch)
  return (
    <View style={[styles.defaultContainer, { gap }, style]}>
      <ActivityIndicator size={indicatorSizes[size]} color={color} />
      {message ? (
        <Text style={[styles.defaultText, { fontSize }, messageStyle]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

// Base Styles

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11, 15, 18, 0.85)", // Colors.background at 85% opacity
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    gap: 14,
    paddingHorizontal: 24,
  },
  overlayText: {
    color: Colors.text.primary,
    fontWeight: Fonts.weight.medium,
    fontFamily: Fonts.family.medium,
    textAlign: "center",
    includeFontPadding: false,
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  inlineText: {
    color: Colors.text.secondary,
    fontWeight: Fonts.weight.medium,
    fontFamily: Fonts.family.medium,
    includeFontPadding: false,
  },
  defaultContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  defaultText: {
    color: Colors.text.secondary,
    fontWeight: Fonts.weight.medium,
    fontFamily: Fonts.family.medium,
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default memo(Loader);
