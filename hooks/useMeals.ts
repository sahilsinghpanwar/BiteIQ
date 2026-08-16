import { View, Text } from 'react-native'
import React from 'react'


// Types
export interface Meal {
    id: string,
    food_name: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    image_url: string,
    meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  eaten_at: string;

} 


export interface DailyLog {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
}


// Hook




const useMeals = () => {
  return (
    
  )
}

export default useMeals