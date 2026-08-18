import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import type { DailyNutritionSummary } from "@/hooks/useMeals";
import { memo, useMemo } from "react";
import { DimensionValue, Text, View } from "react-native";

// Interfaces

interface MacroItemProps {
  label: string;
  value: number;
  color: string;
  unit?: string;
}

interface DailySummaryProps {
  dailyLog: DailyNutritionSummary | null;
  calorieTarget: number;
}

// Sub Components

const MacroItem = memo(
  ({ label, value, color, unit = "g" }: MacroItemProps) => (
    <View className="items-center flex-1">
      <Text
        style={{
          color,
          fontSize: Fonts.size.md,
          fontWeight: Fonts.weight.bold,
        }}
      >
        {Math.round(value)}
        <Text
          style={{ fontSize: Fonts.size.xs, fontWeight: Fonts.weight.regular }}
        >
          {unit}
        </Text>
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

MacroItem.displayName = "MacroItem";

// Main Component

export default function DailySummary({
  dailyLog,
  calorieTarget = 2000,
}: DailySummaryProps) {
  // Calculations with safe fallbacks
  const { consumed, target, remaining, progress, progressPercent } =
    useMemo(() => {
      const consumedVal = Math.round(dailyLog?.total_calories ?? 0);
      const targetVal = Math.max(calorieTarget, 1);
      const remVal = Math.max(targetVal - consumedVal, 0);
      const progVal = Math.min(Math.max(consumedVal / targetVal, 0), 1);
      const progPercent: DimensionValue = `${Math.round(progVal * 100)}%`;

      return {
        consumed: consumedVal,
        target: targetVal,
        remaining: remVal,
        progress: progVal,
        progressPercent: progPercent,
      };
    }, [dailyLog?.total_calories, calorieTarget]);

  return (
    <View
      className="rounded-2xl p-4 mb-4"
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text
            style={{
              color: Colors.text.secondary,
              fontSize: Fonts.size.xs,
              fontWeight: Fonts.weight.medium,
            }}
          >
            TODAY'S CALORIES
          </Text>
          <View className="flex-row items-end mt-1" style={{ gap: 4 }}>
            <Text
              style={{
                color: Colors.primary,
                fontSize: Fonts.size.hero,
                fontWeight: Fonts.weight.heavy,
                lineHeight: Fonts.size.hero,
              }}
            >
              {consumed.toLocaleString()}
            </Text>
            <Text
              className="mb-1"
              style={{
                color: Colors.text.tertiary,
                fontSize: Fonts.size.sm,
                fontWeight: Fonts.weight.regular,
              }}
            >
              / {target.toLocaleString()} kcal
            </Text>
          </View>
        </View>

        {/* Remaining Badge */}
        <View
          className="items-center justify-center rounded-2xl px-3 py-2"
          style={{
            backgroundColor: Colors.primaryMuted,
            borderWidth: 1,
            borderColor: Colors.borderFocus,
          }}
        >
          <Text
            style={{
              color: Colors.primary,
              fontSize: Fonts.size.md,
              fontWeight: Fonts.weight.bold,
            }}
          >
            {remaining.toLocaleString()}
          </Text>
          <Text
            style={{
              color: Colors.text.secondary,
              fontSize: Fonts.size.xs,
            }}
          >
            left
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        className="rounded-full overflow-hidden mb-4"
        style={{ height: 6, backgroundColor: Colors.surfaceSubtle }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: progressPercent,
            backgroundColor:
              progress >= 1 ? Colors.status.warning : Colors.primary,
          }}
        />
      </View>

      {/* Macro Row */}
      <View
        className="flex-row rounded-xl py-3"
        style={{ backgroundColor: Colors.surfaceSubtle }}
      >
        <MacroItem
          label="Protein"
          value={dailyLog?.total_protein ?? 0}
          color={Colors.macros.protein}
        />
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <MacroItem
          label="Carbs"
          value={dailyLog?.total_carbs ?? 0}
          color={Colors.macros.carbs}
        />
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <MacroItem
          label="Fat"
          value={dailyLog?.total_fat ?? 0}
          color={Colors.macros.fat}
        />
      </View>
    </View>
  );
}
