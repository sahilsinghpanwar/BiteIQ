// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { isInitialized, session, initializeAuth } = useAuthStore();

  // App start pe ek baar auth check karo
  useEffect(() => {
    initializeAuth();
  }, []);

  // Auth state change hone pe redirect karo
  useEffect(() => {
    if (!isInitialized) return;

    const isAuthenticated = !!session?.user;
    const inAuthGroup = segments[0] === "(auth)";

    if (isAuthenticated && inAuthGroup) {
      // Logged in hai lekin auth screen pe hai → tabs pe bhejo
      router.replace("/(tabs)");
    } else if (!isAuthenticated && !inAuthGroup) {
      // Logged out hai lekin protected screen pe hai → login pe bhejo
      router.replace("/(auth)/login");
    }
  }, [isInitialized, session]);

  // Auth check hone tak loading dikhao
  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
