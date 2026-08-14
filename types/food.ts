// Food Analysis (AI Response)

export interface FoodAnalysis {
  food_name: string;
  estimated_quantity: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  best_for: string[];
  avoid_if: string[];
  benefits: string[];
  tips: string;
}

// Meal

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  id: string;
  user_id: string;
  image_url: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  best_for: string[];
  avoid_if: string[];
  benefits: string[];
  tip: string;
  meal_type: MealType;
  eaten_at: string; // ISO timestamp
}

// The id and user_id will be optional when inserting a meal.
export type MealInsert = Omit<Meal, "id" | "user_id">;

// Daily Log (Database Row)
export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
}

// Macro Nutrients
export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
