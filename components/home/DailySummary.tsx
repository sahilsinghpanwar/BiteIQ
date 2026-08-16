import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { DailyLog } from "@/hooks/useMeals";
import { Text, View } from "react-native";

// Types
interface DailySummaryProps {
  dailyLog: DailyLog | null;
  calorieTarget: number;
}

// Sub Components
const MicroItem = ({
  label,
  value,
  color,
  unit = "g",
}: {
  label: string;
  value: number;
  color: string;
  unit?: string;
}) => {
  <View className="items-center flex-1">
    <Text
      style={{
        color: color,
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
        color: Colors.text.secondary,
        fontSize: Fonts.size.xs,
        fontWeight: Fonts.weight.medium,
      }}
    >
      {label}
    </Text>
  </View>;
};

//  DailySummary

const DailySummary = ({ dailyLog, calorieTarget }: DailySummaryProps) => {
  const consumed = Math.round(dailyLog?.total_calories ?? 0);
  const remaining = Math.max(calorieTarget - consumed, 0);
  const progress = Math.min(consumed / calorieTarget, 1);

  // progress bar fill
  const progressPercent = `${Math.round(progress * 100)}%`;
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
              {consumed}
            </Text>

            <Text
              className="mb-1"
              style={{
                color: Colors.text.tertiary,
                fontSize: Fonts.size.sm,
                fontWeight: Fonts.weight.regular,
              }}
            >
              / {calorieTarget}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DailySummary;
