import { supabase } from "@/services/supabase";
import { useAuthStore } from "@/store/authStore";
import type { DailyLog, Meal } from "@/types/food";
import { useCallback, useState } from "react";

export type DailyNutritionSummary = Omit<DailyLog, "id" | "user_id" | "date">;

export const useMeals = () => {
  const { user } = useAuthStore();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyNutritionSummary | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Today's Meals
  const fetchTodayMeals = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Local timezone ke hisab se Start of Day aur End of Day
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      ).toISOString();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      ).toISOString();

      const { data, error: fetchError } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("eaten_at", startOfDay)
        .lte("eaten_at", endOfDay)
        .order("eaten_at", { ascending: false });

      if (fetchError) throw fetchError;

      const fetchedMeals = (data as Meal[]) ?? [];
      setMeals(fetchedMeals);

      // Daily totals calculate karna
      const totals: DailyNutritionSummary = fetchedMeals.reduce(
        (acc, meal) => ({
          total_calories: acc.total_calories + (meal.calories ?? 0),
          total_protein: acc.total_protein + (meal.protein ?? 0),
          total_carbs: acc.total_carbs + (meal.carbs ?? 0),
          total_fat: acc.total_fat + (meal.fat ?? 0),
          meal_count: acc.meal_count + 1,
        }),
        {
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          meal_count: 0,
        },
      );

      setDailyLog(totals);
    } catch (err: any) {
      setError(err.message || "Failed to fetch meals");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 2. Fetch User Streak
  const fetchStreak = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from("meals")
        .select("eaten_at")
        .eq("user_id", user.id)
        .order("eaten_at", { ascending: false });

      if (fetchError || !data || data.length === 0) {
        setStreak(0);
        return;
      }

      // Unique local dates nikalna
      const uniqueDates = Array.from(
        new Set(
          data.map((m) => {
            const d = new Date(m.eaten_at);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          }),
        ),
      );

      let count = 0;
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Agar aaj meal log nahi kiya to check karo kya kal kiya tha (streak continue rehti hai)
      let startIndex = 0;
      if (uniqueDates[0] !== todayStr) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

        if (uniqueDates[0] === yesterdayStr) {
          startIndex = 0; // Kal se streak count start hogi
        } else {
          setStreak(0);
          return;
        }
      }

      // Consecutive days count
      for (let i = startIndex; i < uniqueDates.length; i++) {
        const expected = new Date(today);
        expected.setDate(
          today.getDate() - (uniqueDates[0] === todayStr ? i : i + 1),
        );
        const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}-${String(expected.getDate()).padStart(2, "0")}`;

        if (uniqueDates[i] === expectedStr) {
          count++;
        } else {
          break;
        }
      }

      setStreak(count);
    } catch (err) {
      console.warn("Error fetching streak:", err);
    }
  }, [user?.id]);

  // 3. Delete Meal
  const deleteMeal = useCallback(
    async (mealId: string) => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("meals")
          .delete()
          .eq("id", mealId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        await fetchTodayMeals();
      } catch (err: any) {
        setError(err.message || "Failed to delete meal");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, fetchTodayMeals],
  );

  return {
    meals,
    dailyLog,
    streak,
    isLoading,
    error,
    fetchTodayMeals,
    fetchStreak,
    deleteMeal,
  };
};

export default useMeals;
