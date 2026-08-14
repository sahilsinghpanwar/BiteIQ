import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-green-500">
        🎉 NativeWind is working!
      </Text>
      <Text className="text-gray-500 mt-2">CalorieLens setup complete</Text>
    </View>
  );
}
