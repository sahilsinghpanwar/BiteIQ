// Client shim — Gemini logic runs in the analyze-food Edge Function.
// The API key is stored as a Supabase secret (GEMINI_KEY) and never
// included in the mobile bundle.
import { supabase } from "@/services/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MacroBreakdown {
  protein: number; // gram
  carbs: number;   // gram
  fat: number;     // gram
}

export interface FoodNutritionResult {
  isFood: boolean;
  foodName: string;       // e.g., "Butter Chicken", "Unknown / Not Food"
  calories: number;       // kcal
  macros: MacroBreakdown;
  portionSize: string;    // e.g., "1 cup", "100g"
  confidenceScore: number;
  healthScore: number;
  insights: string[];     // List of insights or recommendations
  bestFor: string[];      // List of best use cases or scenarios
  avoidIf: string[];      // List of scenarios or conditions to avoid
}

// ── Main Function ─────────────────────────────────────────────────────────────

/**
 * Analyzes a food image to extract nutritional data.
 * Delegates to the analyze-food Supabase Edge Function so that the
 * Gemini API key stays server-side.
 *
 * @param base64Data  Base64 string (with or without "data:image/...;base64," prefix)
 * @param mimeType    Image format — default 'image/jpeg'
 */
export const analyzeFoodImage = async (
  base64Data: string,
  mimeType: string = "image/jpeg",
): Promise<FoodNutritionResult> => {
  const { data, error } = await supabase.functions.invoke<FoodNutritionResult>(
    "analyze-food",
    { body: { base64: base64Data, mimeType } },
  );

  if (error) {
    console.error("analyze-food function error:", error);
    throw new Error(error.message || "Food analysis failed. Please try again.");
  }

  if (!data) {
    throw new Error("No data returned from analyze-food function.");
  }

  return data;
};
