import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DailySummary from "@/components/home/DailySummary";
import RecentMeals from "@/components/home/RecentMeals";
import StreakCard from "@/components/home/StreakCard";
import ErrorState from "@/components/ui/ErrorState";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { useMeals } from "@/hooks/useMeals";
import { useAuthStore } from "@/store/authStore";

// Helper: dynamic greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();

  const {
    meals,
    dailyLog,
    streak,
    isLoading,
    error,
    fetchTodayMeals,
    fetchStreak,
  } = useMeals();

  // Refresh data on initial mount & whenever the user returns to this tab
  useFocusEffect(
    useCallback(() => {
      fetchTodayMeals();
      fetchStreak();
    }, [fetchTodayMeals, fetchStreak]),
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    await Promise.all([fetchTodayMeals(), fetchStreak()]);
  }, [fetchTodayMeals, fetchStreak]);

  const onRetry = useCallback(() => {
    fetchTodayMeals();
  }, [fetchTodayMeals]);

  // Memoized derived data
  const firstName = useMemo(
    () => profile?.name?.trim()?.split(" ")[0] ?? "there",
    [profile?.name],
  );
  const calorieTarget = profile?.daily_calorie_target ?? 2000;
  const greeting = useMemo(() => getGreeting(), []);

  // Initial full-screen loading state
  if (isLoading && meals.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: Colors.background }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <StatusBar style="light" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View
          className="flex-row items-center justify-between px-5 pb-4"
          style={{
            paddingTop: Math.max(insets.top, 16),
            borderBottomWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <View>
            <Text
              style={{
                color: Colors.text.secondary,
                fontSize: Fonts.size.sm,
                fontWeight: Fonts.weight.regular,
              }}
            >
              {greeting} 👋
            </Text>
            <Text
              className="mt-0.5"
              style={{
                color: Colors.text.primary,
                fontSize: Fonts.size.xl,
                fontWeight: Fonts.weight.bold,
              }}
            >
              {firstName}
            </Text>
          </View>

          {/* Profile Button */}
          <TouchableOpacity
            className="items-center justify-center rounded-2xl"
            style={{
              width: 42,
              height: 42,
              backgroundColor: Colors.primaryMuted,
              borderWidth: 1,
              borderColor: Colors.borderFocus,
            }}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-5">
          {/* ── Daily Summary ── */}
          <DailySummary dailyLog={dailyLog} calorieTarget={calorieTarget} />

          {/* ── Streak + Meals Count ── */}
          <StreakCard streak={streak} mealCount={dailyLog?.meal_count ?? 0} />

          {/* ── Scan CTA ── */}
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-2xl mb-6 py-4"
            style={{
              backgroundColor: Colors.primaryMuted,
              borderWidth: 1,
              borderColor: Colors.borderFocus,
              gap: 10,
            }}
            onPress={() => router.push("/(tabs)/scan")}
            activeOpacity={0.8}
          >
            <Ionicons name="scan-outline" size={20} color={Colors.primary} />
            <Text
              style={{
                color: Colors.primary,
                fontSize: Fonts.size.base,
                fontWeight: Fonts.weight.semibold,
              }}
            >
              Scan a Meal
            </Text>
          </TouchableOpacity>

          {/* ── Recent Meals Section ── */}
          <View className="flex-row items-center justify-between mb-3">
            <Text
              style={{
                color: Colors.text.primary,
                fontSize: Fonts.size.md,
                fontWeight: Fonts.weight.bold,
              }}
            >
              Today's Meals
            </Text>
            {meals.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/history")}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    color: Colors.primary,
                    fontSize: Fonts.size.sm,
                    fontWeight: Fonts.weight.semibold,
                  }}
                >
                  See all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {error ? (
            <ErrorState
              title="Couldn't load today's meals"
              message={error}
              onRetry={onRetry}
              style={{ marginBottom: 10 }}
            />
          ) : null}

          {/* Already-loaded meals stay visible when a refresh fails; only the
              "nothing logged yet" state is suppressed behind the error. */}
          {(!error || meals.length > 0) && <RecentMeals meals={meals} />}
        </View>
      </ScrollView>
    </View>
  );
}
