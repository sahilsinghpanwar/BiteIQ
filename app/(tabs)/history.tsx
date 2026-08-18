import Loader from "@/components/ui/Loader";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { useMeals } from "@/hooks/useMeals";
import type { Meal } from "@/types/food";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Constants & Helpers

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🥪",
  dinner: "🍝",
  snack: "🍎",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "--:--";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "--:--";
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isoDate = d.toDateString();
    if (isoDate === today.toDateString()) return "Today";
    if (isoDate === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function groupMealsByDate(meals: Meal[]): Record<string, Meal[]> {
  return meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    const key = new Date(meal.eaten_at).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(meal);
    return acc;
  }, {});
}

// Sub Components
function MealRow({
  meal,
  onDelete,
}: {
  meal: Meal;
  onDelete: (id: string) => void;
}) {
  const emoji = MEAL_EMOJIS[meal.meal_type] ?? "🍽️";

  const handleDelete = () => {
    Alert.alert("Delete Meal", `Remove "${meal.food_name}" from your log?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(meal.id),
      },
    ]);
  };

  return (
    <View
      className="flex-row items-center rounded-2xl p-3"
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 12,
      }}
    >
      {/* Image / Emoji */}
      {meal.image_url ? (
        <Image
          source={{ uri: meal.image_url }}
          style={{ width: 46, height: 46, borderRadius: 12 }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="rounded-xl items-center justify-center"
          style={{
            width: 46,
            height: 46,
            backgroundColor: Colors.surfaceSubtle,
          }}
        >
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1">
        <Text
          numberOfLines={1}
          style={{
            color: Colors.text.primary,
            fontSize: Fonts.size.sm,
            fontWeight: Fonts.weight.semibold,
          }}
        >
          {meal.food_name}
        </Text>
        <Text
          className="mt-0.5"
          style={{
            color: Colors.text.tertiary,
            fontSize: Fonts.size.xs,
            fontWeight: Fonts.weight.regular,
          }}
        >
          {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)} ·{" "}
          {formatTime(meal.eaten_at)}
        </Text>
      </View>

      {/* Calories */}
      <View className="items-end">
        <Text
          style={{
            color: Colors.primary,
            fontSize: Fonts.size.sm,
            fontWeight: Fonts.weight.bold,
          }}
        >
          {Math.round(meal.calories).toLocaleString()}
        </Text>
        <Text style={{ color: Colors.text.tertiary, fontSize: Fonts.size.xs }}>
          kcal
        </Text>
      </View>

      {/* Delete */}
      <TouchableOpacity
        onPress={handleDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={16} color={Colors.text.tertiary} />
      </TouchableOpacity>
    </View>
  );
}

// History Screen
export default function HistoryScreen() {
  const { meals, isLoading, fetchTodayMeals, deleteMeal } = useMeals();

  // For history we need all meals, not just today
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTodayMeals();
  }, []);

  // Use today's meals for now — can extend to all meals later
  useEffect(() => {
    setAllMeals(meals);
  }, [meals]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTodayMeals();
    setIsRefreshing(false);
  }, [fetchTodayMeals]);

  const grouped = groupMealsByDate(allMeals);
  const dateGroups = Object.keys(grouped);

  // Weekly bar chart data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    const dayMeals = grouped[key] ?? [];
    const total = dayMeals.reduce((sum, m) => sum + m.calories, 0);
    return {
      day: DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      total,
      isToday: i === 6,
    };
  });

  const maxCalories = Math.max(...weeklyData.map((d) => d.total), 1);

  if (isLoading && allMeals.length === 0) {
    return <Loader message="Loading history..." />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <StatusBar style="light" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View
          className="px-5 pt-14 pb-4"
          style={{ borderBottomWidth: 1, borderColor: Colors.border }}
        >
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: Fonts.size.xl,
              fontWeight: Fonts.weight.bold,
            }}
          >
            Food History
          </Text>
          <Text
            className="mt-1"
            style={{
              color: Colors.text.secondary,
              fontSize: Fonts.size.sm,
              fontWeight: Fonts.weight.regular,
            }}
          >
            {allMeals.length} meals logged
          </Text>
        </View>

        <View className="px-5 pt-5">
          {/* ── Weekly Bar Chart ── */}
          <View
            className="rounded-2xl p-4 mb-5"
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text
              className="mb-4"
              style={{
                color: Colors.text.primary,
                fontSize: Fonts.size.md,
                fontWeight: Fonts.weight.bold,
              }}
            >
              This Week
            </Text>

            {/* Bars */}
            <View
              className="flex-row items-end justify-between"
              style={{ height: 80, gap: 6 }}
            >
              {weeklyData.map((item, index) => {
                const barHeight = Math.max(
                  (item.total / maxCalories) * 64,
                  item.total > 0 ? 8 : 3,
                );
                return (
                  <View
                    key={index}
                    className="flex-1 items-center"
                    style={{ gap: 6 }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: barHeight,
                        backgroundColor: item.isToday
                          ? Colors.primary
                          : item.total > 0
                            ? Colors.primaryMuted
                            : Colors.surfaceSubtle,
                        borderRadius: 4,
                        borderWidth: item.isToday ? 0 : 0,
                      }}
                    />
                    <Text
                      style={{
                        color: item.isToday
                          ? Colors.primary
                          : Colors.text.tertiary,
                        fontSize: Fonts.size.xs,
                        fontWeight: item.isToday
                          ? Fonts.weight.bold
                          : Fonts.weight.regular,
                      }}
                    >
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Meal Groups ── */}
          {allMeals.length === 0 ? (
            <View
              className="rounded-2xl p-8 items-center justify-center"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 36 }}>🍴</Text>
              <Text
                className="mt-3 text-center"
                style={{
                  color: Colors.text.secondary,
                  fontSize: Fonts.size.sm,
                  fontWeight: Fonts.weight.medium,
                  lineHeight: Fonts.size.sm * 1.5,
                }}
              >
                No meals logged yet.{"\n"}Start by scanning your first meal!
              </Text>
            </View>
          ) : (
            <View style={{ gap: 20 }}>
              {dateGroups.map((dateKey) => {
                const dayMeals = grouped[dateKey];
                const dayTotal = dayMeals.reduce(
                  (sum, m) => sum + m.calories,
                  0,
                );

                return (
                  <View key={dateKey}>
                    {/* Date Header */}
                    <View className="flex-row items-center justify-between mb-3">
                      <Text
                        style={{
                          color: Colors.text.primary,
                          fontSize: Fonts.size.sm,
                          fontWeight: Fonts.weight.bold,
                        }}
                      >
                        {formatDate(dayMeals[0].eaten_at)}
                      </Text>
                      <Text
                        style={{
                          color: Colors.text.tertiary,
                          fontSize: Fonts.size.xs,
                          fontWeight: Fonts.weight.medium,
                        }}
                      >
                        {Math.round(dayTotal).toLocaleString()} kcal
                      </Text>
                    </View>

                    {/* Meals */}
                    <View style={{ gap: 8 }}>
                      {dayMeals.map((meal) => (
                        <MealRow
                          key={meal.id}
                          meal={meal}
                          onDelete={deleteMeal}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
