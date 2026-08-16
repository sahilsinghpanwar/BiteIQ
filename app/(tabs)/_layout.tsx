import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import {
  ColorValue,
  Platform,
  StyleSheet,
  TextStyle,
  View,
} from "react-native";

// Types

type TabBarIconProps = {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: ColorValue;
  size: number;
};

// Components

/** Generic tab icon */
const TabIcon = ({ name, color, size }: TabBarIconProps) => (
  <Ionicons
    name={name}
    size={size}
    color={color}
    style={{ marginBottom: -2 }}
  />
);

/** Elevated floating scan button */
const ScanButton = ({ focused }: { focused: boolean }) => (
  <View style={scanStyles.container}>
    <View
      style={[
        scanStyles.button,
        {
          backgroundColor: Colors.primary,
          shadowColor: Colors.primary,
        },
      ]}
    >
      <Ionicons
        name={focused ? "scan" : "scan-outline"}
        size={26}
        color={Colors.text.inverse}
      />
    </View>
  </View>
);

// Shared label styles

/** Cast needed: Fonts.weight values are string literals, RN expects exact union */
const labelStyle: TextStyle = {
  fontSize: Fonts.size.xs,
  fontWeight: Fonts.weight.medium as TextStyle["fontWeight"],
};

const scanLabelStyle: TextStyle = {
  fontSize: Fonts.size.xs,
  fontWeight: Fonts.weight.bold as TextStyle["fontWeight"],
  marginTop: 4,
};

// Layout

export default function TabsLayout() {
  const { bottom: bottomInset } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.select({
            ios: 52 + bottomInset,
            android: 68 + bottomInset,
            default: 68,
          }),
          paddingTop: 8,
          paddingBottom: Platform.select({
            ios: bottomInset,
            android: 10 + bottomInset,
            default: 10,
          }),
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: labelStyle,
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Scan (Floating) */}
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ focused }) => <ScanButton focused={focused} />,
          tabBarLabelStyle: scanLabelStyle,
        }}
      />

      {/* History */}
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// Styles

const scanStyles = StyleSheet.create({
  container: {
    top: -12,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});
