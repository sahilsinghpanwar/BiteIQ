import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { memo } from "react";
import { Text, View } from "react-native";

// Interfaces

interface StatBoxProps {
  emoji: string;
  value: string | number;
  label: string;
  isActive?: boolean;
}

interface StreakCardProps {
  streak?: number;
  mealCount?: number;
}

// Sub Component

const StatBox = memo(
  ({ emoji, value, label, isActive = false }: StatBoxProps) => (
    <View
      className="flex-1 items-center justify-center rounded-xl py-3"
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: isActive ? Colors.borderFocus : Colors.border,
      }}
    >
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        className="mt-1"
        style={{
          color: Colors.text.primary,
          fontSize: Fonts.size.lg,
          fontWeight: Fonts.weight.bold,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: Colors.text.tertiary,
          fontSize: Fonts.size.xs,
          fontWeight: Fonts.weight.medium,
        }}
      >
        {label}
      </Text>
    </View>
  ),
);

StatBox.displayName = "StatBox";

// Main Component

export default function StreakCard({
  streak = 0,
  mealCount = 0,
}: StreakCardProps) {
  return (
    <View className="flex-row mb-4" style={{ gap: 10 }}>
      <StatBox
        emoji="🔥"
        value={streak}
        label={streak === 1 ? "Day Streak" : "Days Streak"}
        isActive={streak > 0}
      />
      <StatBox
        emoji="🍽️"
        value={mealCount}
        label={mealCount === 1 ? "Meal Today" : "Meals Today"}
        isActive={mealCount > 0}
      />
    </View>
  );
}
