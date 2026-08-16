// app/(tabs)/history.tsx
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Text, View } from "react-native";

export default function HistoryScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.background,
      }}
    >
      <Text
        style={{
          color: Colors.text.primary,
          fontSize: Fonts.size.lg,
          fontWeight: Fonts.weight.semibold,
        }}
      >
        History
      </Text>
    </View>
  );
}
