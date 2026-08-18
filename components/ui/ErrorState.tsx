import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import Button from "./Button";

// Types

export interface ErrorStateProps {
  /** The failure message surfaced to the user (usually a hook's `error`). */
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

// Component

function ErrorState({
  message,
  title = "Something went wrong",
  onRetry,
  retryLabel = "Try Again",
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="alert-circle-outline"
        size={32}
        color={Colors.status.error}
      />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Button
          label={retryLabel}
          onPress={onRetry}
          variant="secondary"
          size="sm"
          fullWidth={false}
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

// Base Styles

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.status.errorMuted,
    borderWidth: 1,
    borderColor: Colors.status.errorBorder,
  },
  title: {
    marginTop: 12,
    color: Colors.text.primary,
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.bold,
    fontFamily: Fonts.family.bold,
    textAlign: "center",
    includeFontPadding: false,
  },
  message: {
    marginTop: 4,
    color: Colors.text.secondary,
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.regular,
    fontFamily: Fonts.family.regular,
    lineHeight: Fonts.size.xs * 1.5,
    textAlign: "center",
    includeFontPadding: false,
  },
  retry: {
    marginTop: 16,
    alignSelf: "center",
  },
});

export default memo(ErrorState);
