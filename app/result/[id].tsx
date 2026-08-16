import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useAuth } from "@/hooks/useAuth";
import { FoodNutritionResult } from "@/services/geminiVision";
import { supabase } from "@/services/supabase"; // Fix 1: correct import path
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Result Screen

export default function ResultScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const params = useLocalSearchParams<{
    analysis?: string;
    storagePath?: string;
  }>();

  const [isSaving, setIsSaving] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  const storagePath = params.storagePath ?? "";

  // Parse AI Data

  const nutritionData: FoodNutritionResult | null = params.analysis
    ? JSON.parse(params.analysis)
    : null;

  // Generate a short-lived signed URL so the bucket stays private.
  useEffect(() => {
    if (!storagePath) return;
    supabase.storage
      .from("food-images")
      .createSignedUrl(storagePath, 3600) // 1 hour
      .then(({ data }) => {
        if (data?.signedUrl) setSignedImageUrl(data.signedUrl);
      });
  }, [storagePath]);

  // Empty State

  if (!nutritionData) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: Colors.background }}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={Colors.status.error}
        />
        <Text
          className="mt-4 text-center"
          style={{
            color: Colors.text.primary,
            fontSize: Fonts.size.base,
            fontWeight: Fonts.weight.medium,
          }}
        >
          No nutrition data found.
        </Text>
        <TouchableOpacity
          className="mt-6 rounded-xl px-6 py-3"
          style={{ backgroundColor: Colors.primary }}
          onPress={() => router.back()}
        >
          <Text
            style={{
              color: Colors.text.inverse,
              fontWeight: Fonts.weight.bold,
              fontSize: Fonts.size.base,
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Save Meal to Supabase

  const handleSaveMeal = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User session not found.");
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase.from("meals").insert({
        user_id: user.id,
        food_name: nutritionData.foodName,
        calories: nutritionData.calories,
        protein: nutritionData.macros.protein,
        carbs: nutritionData.macros.carbs,
        fat: nutritionData.macros.fat,
        best_for: nutritionData.bestFor,
        avoid_if: nutritionData.avoidIf,
        image_url: storagePath,
        eaten_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("Saved!", "Meal logged successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to log meal.");
    } finally {
      setIsSaving(false);
    }
  };

  // UI

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Food Image Banner ── */}
        <View className="relative w-full" style={{ height: 260 }}>
          {signedImageUrl ? (
            <Image
              source={{ uri: signedImageUrl! }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-full h-full items-center justify-center"
              style={{ backgroundColor: Colors.surface }}
            >
              <Ionicons
                name="fast-food-outline"
                size={48}
                color={Colors.text.tertiary}
              />
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            className="absolute items-center justify-center rounded-full"
            style={{
              top: 50,
              left: 20,
              width: 40,
              height: 40,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-5">
          {/* ── Food Name + Health Score ── */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-3">
              <Text
                style={{
                  color: Colors.text.primary,
                  fontSize: Fonts.size.xl,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                {nutritionData.foodName || "Unknown Food"}
              </Text>
              <Text
                className="mt-1"
                style={{
                  color: Colors.text.secondary,
                  fontSize: Fonts.size.sm,
                  fontWeight: Fonts.weight.regular,
                }}
              >
                Portion: {nutritionData.portionSize || "1 serving"}
              </Text>
            </View>

            {/* Health Score Badge */}
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
                  fontSize: Fonts.size.base,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                {nutritionData.healthScore}/10
              </Text>
              <Text
                style={{
                  color: Colors.text.secondary,
                  fontSize: Fonts.size.xs,
                }}
              >
                Score
              </Text>
            </View>
          </View>

          {/* ── Calorie Card ── */}
          <View
            className="rounded-2xl p-4 items-center mb-5"
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Text
              style={{
                color: Colors.text.secondary,
                fontSize: Fonts.size.xs,
                fontWeight: Fonts.weight.semibold,
              }}
            >
              TOTAL ENERGY
            </Text>
            <Text
              className="my-1"
              style={{
                color: Colors.macros.calories,
                fontSize: Fonts.size.xxl,
                fontWeight: Fonts.weight.heavy,
              }}
            >
              {nutritionData.calories}
            </Text>
            <Text
              style={{
                color: Colors.text.tertiary,
                fontSize: Fonts.size.xs,
              }}
            >
              kcal
            </Text>
          </View>

          {/* ── Macros Grid ── */}
          <Text
            className="mb-3"
            style={{
              color: Colors.text.primary,
              fontSize: Fonts.size.md,
              fontWeight: Fonts.weight.bold,
            }}
          >
            Macronutrients
          </Text>

          <View className="flex-row justify-between mb-6" style={{ gap: 10 }}>
            {/* Protein */}
            <View
              className="flex-1 rounded-xl p-3 items-center"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ color: Colors.macros.protein, fontSize: 18 }}>
                💧
              </Text>
              <Text
                className="mt-1"
                style={{
                  color: Colors.text.primary,
                  fontSize: Fonts.size.md,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                {nutritionData.macros.protein}g
              </Text>
              <Text
                style={{
                  color: Colors.text.secondary,
                  fontSize: Fonts.size.xs,
                }}
              >
                Protein
              </Text>
            </View>

            {/* Carbs */}
            <View
              className="flex-1 rounded-xl p-3 items-center"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 18 }}>⚡</Text>
              <Text
                className="mt-1"
                style={{
                  color: Colors.text.primary,
                  fontSize: Fonts.size.md,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                {nutritionData.macros.carbs}g
              </Text>
              <Text
                style={{
                  color: Colors.text.secondary,
                  fontSize: Fonts.size.xs,
                }}
              >
                Carbs
              </Text>
            </View>

            {/* Fats */}
            <View
              className="flex-1 rounded-xl p-3 items-center"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 18 }}>🔥</Text>
              <Text
                className="mt-1"
                style={{
                  color: Colors.text.primary,
                  fontSize: Fonts.size.md,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                {nutritionData.macros.fat}g
              </Text>
              <Text
                style={{
                  color: Colors.text.secondary,
                  fontSize: Fonts.size.xs,
                }}
              >
                Fats
              </Text>
            </View>
          </View>

          {/* ── Best For ── */}
          {nutritionData.bestFor?.length > 0 && (
            <View
              className="p-4 rounded-xl mb-3 flex-row items-start"
              style={{
                backgroundColor: Colors.primaryMuted,
                borderWidth: 1,
                borderColor: Colors.borderFocus,
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={Colors.primary}
              />
              <View className="ml-3 flex-1">
                <Text
                  style={{
                    color: Colors.primary,
                    fontSize: Fonts.size.xs,
                    fontWeight: Fonts.weight.bold,
                  }}
                >
                  Best For
                </Text>
                {/* Fix 3: array.join so it renders properly */}
                <Text
                  className="mt-1"
                  style={{
                    color: Colors.text.primary,
                    fontSize: Fonts.size.sm,
                    fontWeight: Fonts.weight.regular,
                  }}
                >
                  {nutritionData.bestFor.join(" · ")}
                </Text>
              </View>
            </View>
          )}

          {/* ── Avoid If ── */}
          {nutritionData.avoidIf?.length > 0 && (
            <View
              className="p-4 rounded-xl mb-5 flex-row items-start"
              style={{
                backgroundColor: "rgba(239,68,68,0.08)",
                borderWidth: 1,
                borderColor: "rgba(239,68,68,0.25)",
              }}
            >
              <Ionicons
                name="warning-outline"
                size={18}
                color={Colors.status.error}
              />
              <View className="ml-3 flex-1">
                <Text
                  style={{
                    color: Colors.status.error,
                    fontSize: Fonts.size.xs,
                    fontWeight: Fonts.weight.bold,
                  }}
                >
                  Avoid If
                </Text>
                <Text
                  className="mt-1"
                  style={{
                    color: Colors.text.primary,
                    fontSize: Fonts.size.sm,
                    fontWeight: Fonts.weight.regular,
                  }}
                >
                  {nutritionData.avoidIf.join(" · ")}
                </Text>
              </View>
            </View>
          )}

          {/* ── Health Insights ── */}
          {nutritionData.insights?.length > 0 && (
            <View
              className="rounded-2xl p-4 mb-4"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text
                className="mb-3"
                style={{
                  color: Colors.text.primary,
                  fontSize: Fonts.size.md,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                Health Insights
              </Text>
              {nutritionData.insights.map((insight, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <Text style={{ color: Colors.primary, marginRight: 8 }}>
                    •
                  </Text>
                  <Text
                    className="flex-1"
                    style={{
                      color: Colors.text.secondary,
                      fontSize: Fonts.size.sm,
                      fontWeight: Fonts.weight.regular,
                      lineHeight: Fonts.size.sm * Fonts.lineHeight.relaxed,
                    }}
                  >
                    {insight}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom Save Button ── */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 py-4"
        style={{
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderColor: Colors.border,
        }}
      >
        <TouchableOpacity
          className="items-center justify-center rounded-xl"
          style={{
            height: 52,
            backgroundColor: Colors.primary,
            opacity: isSaving ? 0.6 : 1,
          }}
          onPress={handleSaveMeal}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.text.inverse} />
          ) : (
            <Text
              style={{
                color: Colors.text.inverse,
                fontSize: Fonts.size.base,
                fontWeight: Fonts.weight.bold,
              }}
            >
              Log This Meal
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
