import React, { memo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import type { Meal } from "@/types/food";

// Constants & Helpers

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🥪",
  dinner: "🍝",
  snack: "🍎",
};

const formatTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "--:--";
  }
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Interfaces

interface RecentMealsProps {
  meals?: Meal[];
  maxDisplay?: number;
}

interface MealCardItemProps {
  meal: Meal;
}

// Sub Components

const MealCardItem = memo(({ meal }: MealCardItemProps) => {
  const emoji = MEAL_EMOJIS[meal.meal_type] ?? "🍽️";
  const formattedMealType = capitalizeFirstLetter(meal.meal_type);
  const formattedTime = formatTime(meal.eaten_at);

  return (
    <View
      className="flex-row items-center rounded-2xl p-4"
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 12,
      }}
    >
      {/* Meal Image / Emoji */}
      {meal.image_url ? (
        <Image
          source={{ uri: meal.image_url }}
          style={{ width: 48, height: 48, borderRadius: 12 }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="rounded-xl items-center justify-center"
          style={{
            width: 48,
            height: 48,
            backgroundColor: Colors.surfaceSubtle,
          }}
        >
          <Text style={{ fontSize: 24 }}>{emoji}</Text>
        </View>
      )}

      {/* Meal Info */}
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
          {formattedMealType} • {formattedTime}
        </Text>
      </View>

      {/* Calories */}
      <View className="items-end">
        <Text
          style={{
            color: Colors.text.primary,
            fontSize: Fonts.size.sm,
            fontWeight: Fonts.weight.bold,
          }}
        >
          {Math.round(meal.calories).toLocaleString()}
        </Text>
        <Text
          className="mt-0.5"
          style={{
            color: Colors.text.tertiary,
            fontSize: Fonts.size.xs,
          }}
        >
          kcal
        </Text>
      </View>
    </View>
  );
});

MealCardItem.displayName = "MealCardItem";

// Main Component

export default function RecentMeals({
  meals = [],
  maxDisplay = 5,
}: RecentMealsProps) {
  const router = useRouter();

  // Empty State
  if (meals.length === 0) {
    return (
      <View
        className="rounded-2xl p-6 items-center justify-center"
        style={{
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
        }}
      >
        <Text
          style={{
            color: Colors.text.secondary,
            fontSize: Fonts.size.sm,
            fontWeight: Fonts.weight.medium,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          No meals logged yet today.{"\n"}Scan your first meal!
        </Text>
      </View>
    );
  }

  // Display only recent items up to maxDisplay limit
  const displayedMeals = meals.slice(0, maxDisplay);

  return (
    <View className="flex-col" style={{ gap: 10 }}>
      {displayedMeals.map((meal) => (
        <MealCardItem key={meal.id} meal={meal} />
      ))}

      {/* See all button if meals exceed maxDisplay */}
      {meals.length > maxDisplay && (
        <TouchableOpacity
          className="items-center py-3 rounded-xl mt-1"
          style={{
            backgroundColor: Colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
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
            See all {meals.length} meals
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}